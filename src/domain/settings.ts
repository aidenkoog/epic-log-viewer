export type GroupBy = 'reason' | 'source_reason'

export interface SmellRuleConfig {
  id: string
  name: string
  enabled: boolean
  weight: number
  severity: number
  pattern: string
  flags?: string
  ci?: boolean
}

export interface ClusterSettings {
  windowSec: number
  groupBy: GroupBy
}

export interface AnalyzerSettings {
  rules: Record<string, SmellRuleConfig>
  cluster: ClusterSettings
  tzOffsetsMinute: Record<string, number>
}

export const defaultRules = [
  { id: 'exception', name: 'Exception', pattern: 'exception|stack ?trace|throw', ci: true },
  { id: 'crash', name: 'Crash/Signal', pattern: 'crash|fatal signal|segmentation|sig(?:abrt|segv)', ci: true },
  { id: 'anr', name: 'ANR/Watchdog', pattern: '\\bANR\\b|watchdog', flags: 'i' },
  { id: 'timeout', name: 'Timeout', pattern: 'timeout|timed out|socket timeout', ci: true },
  { id: 'network', name: 'Network', pattern: 'econn(?:reset|refused)|connection (?:refused|reset|lost)|host unreachable', ci: true },
  { id: 'auth', name: 'Auth', pattern: '\\b401\\b|unauthorized|forbidden|\\b403\\b', flags: 'i' },
  { id: 'http5xx', name: 'HTTP 5xx', pattern: '\\b5\\d\\d\\b|server error', flags: 'i' },
  { id: 'notfound', name: 'Not Found', pattern: '\\b404\\b|not found', flags: 'i' },
  { id: 'permission', name: 'Permission', pattern: 'permission denied|securityexception', ci: true },
  { id: 'memory', name: 'Memory', pattern: 'out of memory|\\boom\\b|oomkiller', flags: 'i' },
  { id: 'database', name: 'Database', pattern: 'sqlite|db locked|deadlock', ci: true },
  { id: 'failure', name: 'Failure Keyword', pattern: '\\bfail(?:ed|ure)?\\b|error|cannot|invalid|broken', flags: 'i' },
  { id: 'disconnect', name: 'Disconnect', pattern: 'disconnect|not responding|unreachable', ci: true }
] as const

export function makeDefaultSettings(): AnalyzerSettings {
  const rules: AnalyzerSettings['rules'] = {}
  for (const r of defaultRules) {
    rules[r.id] = { id: r.id, name: r.name, pattern: r.pattern, enabled: true, weight: 5, severity: 3, flags: (r as any).flags, ci: (r as any).ci }
  }
  return {
    rules,
    cluster: { windowSec: 10, groupBy: 'reason' },
    tzOffsetsMinute: {}
  }
}
