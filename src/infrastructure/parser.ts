import type { LogEntry, LogLevel, AnalyzeResult, AlertEntry, Cluster } from '../domain/types'
import type { AnalyzerSettings } from '../domain/settings'

const patterns: { re: RegExp, toDate: (m: RegExpMatchArray, baseYear: number) => Date }[] = [
  // YYYYMMDD-HH:mm:ss.SSS
  {
    re: /^(\d{8})-(\d{2}):(\d{2}):(\d{2})\.(\d{3})/,
    toDate: (m) => {
      const y = Number(m[1].slice(0, 4)), mo = Number(m[1].slice(4, 6)) - 1, d = Number(m[1].slice(6, 8))
      return new Date(y, mo, d, Number(m[2]), Number(m[3]), Number(m[4]), Number(m[5]))
    }
  },
  // [MM/DD HH:mm:ss.SSS]
  {
    re: /^\[(\d{2})\/(\d{2}) (\d{2}):(\d{2}):(\d{2})\.(\d{3})\]/,
    toDate: (m, baseYear) => new Date(baseYear, Number(m[1]) - 1, Number(m[2]), Number(m[3]), Number(m[4]), Number(m[5]), Number(m[6]))
  },
  // YYYY/MM/DD HH:mm:ss.SSS
  {
    re: /^(\d{4})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2}):(\d{2})\.(\d{3})/,
    toDate: (m) => new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]), Number(m[6]), Number(m[7]))
  },
  // ISO8601Z
  {
    re: /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(?:\.(\d{3}))?Z/,
    toDate: (m) => new Date(m[1] + (m[2] ? '.' + m[2] : '') + 'Z')
  },
  // Android logcat: MM-DD HH:mm:ss.SSS
  {
    re: /^(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})\.(\d{3})/,
    toDate: (m, baseYear) => new Date(baseYear, Number(m[1]) - 1, Number(m[2]), Number(m[3]), Number(m[4]), Number(m[5]), Number(m[6]))
  }
]

function detectLevel(line: string): LogLevel {
  const s = line.toUpperCase()
  if (s.includes(' FATAL') || s.startsWith('FATAL')) return 'FATAL'
  if (s.includes(' ERROR') || s.startsWith('E ') || s.includes('\tE\t')) return 'ERROR'
  if (s.includes(' WARN') || s.startsWith('W ') || s.includes('\tW\t')) return 'WARN'
  if (s.includes(' INFO') || s.startsWith('I ') || s.includes('\tI\t')) return 'INFO'
  if (s.includes(' DEBUG') || s.startsWith('D ') || s.includes('\tD\t')) return 'DEBUG'
  return 'UNKNOWN'
}

function inferBaseYear(content: string): number {
  const m = content.match(/^(\d{4})(?:[-/])/m) || content.match(/^(\d{8})-/m)
  if (m) return Number(m[1].slice(0, 4))
  return new Date().getFullYear()
}

function extractTimestamp(line: string, baseYear: number): { ts: number, tsText: string } | null {
  for (const p of patterns) {
    const m = line.match(p.re)
    if (m) {
      const d = p.toDate(m, baseYear)
      return { ts: d.getTime(), tsText: m[0] }
    }
  }
  return null
}

export interface ParseOptions { source: string; content: string }

export function parseLog({ source, content }: ParseOptions): LogEntry[] {
  const baseYear = inferBaseYear(content)
  const lines = content.split(/\r?\n/)
  const out: LogEntry[] = []
  for (const raw of lines) {
    if (!raw.trim()) continue
    const tsInfo = extractTimestamp(raw, baseYear)
    if (!tsInfo) continue
    const level = detectLevel(raw)
    const msg = raw.replace(tsInfo.tsText, '').trim()
    out.push({ ts: tsInfo.ts, tsText: tsInfo.tsText, source, level, message: msg, raw })
  }
  return out
}

function analyzeCore(entries: LogEntry[]) {
  const sorted = [...entries].sort((a, b) => a.ts - b.ts)
  const levels = { DEBUG: 0, INFO: 0, WARN: 0, ERROR: 0, FATAL: 0, UNKNOWN: 0 } as Record<any, number>
  for (const e of sorted) levels[e.level] = (levels[e.level] ?? 0) + 1
  const bucket = new Map<number, number>()
  for (const e of sorted) {
    const m = Math.floor(e.ts / 60000) * 60000
    bucket.set(m, (bucket.get(m) ?? 0) + 1)
  }
  const byMinute = [...bucket.entries()].sort((a, b) => a[0] - b[0]).map(([t, count]) => ({ t, count }))
  return { sorted, levels, byMinute }
}

function compileRegex(pattern: string, flags?: string, ci?: boolean): RegExp | null {
  const stripped = pattern.replace(/\(\?[a-z]+\)/gi, (m) => m.toLowerCase() === '(?i)' ? '' : m)
  const f = (flags ?? '') + (ci ? 'i' : '')
  try { return new RegExp(stripped, f ? f.replace(/(.)(?=.*\1)/g, '') : undefined) } catch (_e) {
    return null
  }
}

export function analyzeWithSettings(entries: LogEntry[], settings: AnalyzerSettings): AnalyzeResult {
  const adjusted: LogEntry[] = entries.map(e => {
    const off = settings.tzOffsetsMinute[e.source] ?? 0
    return off ? { ...e, ts: e.ts + off * 60000 } : e
  })

  const { sorted, levels, byMinute } = analyzeCore(adjusted)

  const ruleEntries = Object.values(settings.rules)
  const compiled = ruleEntries.map(r => ({ ...r, re: compileRegex(r.pattern, r.flags, r.ci) })).filter(r => r.re)
  const alerts: AlertEntry[] = []
  for (const e of sorted) {
    const reasons: string[] = []
    let score = 0
    let maxSeverity = 0
    if (e.level === 'ERROR' || e.level === 'FATAL' || e.level === 'WARN') {
      reasons.push(`Level:${e.level}`)
      score += (e.level === 'ERROR' ? 7 : e.level === 'FATAL' ? 9 : 4)
      maxSeverity = Math.max(maxSeverity, e.level === 'FATAL' ? 5 : e.level === 'ERROR' ? 4 : 3)
    }
    for (const r of compiled) {
      if (!(r as any).enabled) continue
      if ((r as any).re.test(e.raw)) {
        reasons.push((r as any).name)
        score += (r as any).weight
        maxSeverity = Math.max(maxSeverity, (r as any).severity)
      }
    }
    if (reasons.length > 0) {
      alerts.push({ entry: e, reasons, score, severity: maxSeverity, primary: reasons[0] })
    }
  }

  const clusters: Cluster[] = []
  const winMs = (settings.cluster.windowSec ?? 10) * 1000
  const keyFn = (a: AlertEntry) => settings.cluster.groupBy === 'source_reason'
    ? `${a.entry.source}::${a.primary ?? 'unknown'}`
    : `${a.primary ?? 'unknown'}`

  const grouped = new Map<string, AlertEntry[]>()
  for (const a of alerts) {
    const k = keyFn(a)
    if (!grouped.has(k)) grouped.set(k, [])
    grouped.get(k)!.push(a)
  }
  for (const [key, list] of grouped) {
    list.sort((a, b) => a.entry.ts - b.entry.ts)
    let cur: Cluster | null = null
    for (const a of list) {
      if (!cur) { cur = { key, startTs: a.entry.ts, endTs: a.entry.ts, count: 1, alerts: [a] }; continue }
      if (a.entry.ts - cur.endTs <= winMs) {
        cur.endTs = a.entry.ts; cur.count += 1; cur.alerts.push(a)
      } else {
        clusters.push(cur); cur = { key, startTs: a.entry.ts, endTs: a.entry.ts, count: 1, alerts: [a] }
      }
    }
    if (cur) clusters.push(cur)
  }
  clusters.sort((a, b) => a.startTs - b.startTs)
  return { entries: sorted, stats: { byLevel: levels as any, byMinute }, alerts, clusters }
}
