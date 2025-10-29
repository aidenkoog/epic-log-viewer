export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL' | 'UNKNOWN'

export interface LogEntry {
  ts: number
  tsText: string
  source: string
  level: LogLevel
  message: string
  raw: string
}

export interface MinuteBucket { t: number; count: number }

export interface Stats {
  byLevel: Record<LogLevel, number>
  byMinute: MinuteBucket[]
}

export interface AlertEntry {
  entry: LogEntry
  reasons: string[]
  score: number
  severity: number
  primary?: string
}

export interface Cluster {
  key: string
  startTs: number
  endTs: number
  count: number
  alerts: AlertEntry[]
}

export interface AnalyzeResult {
  entries: LogEntry[]
  stats: Stats
  alerts: AlertEntry[]
  clusters: Cluster[]
}
