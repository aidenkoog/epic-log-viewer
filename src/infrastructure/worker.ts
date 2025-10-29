import { parseLog, analyzeWithSettings } from './parser'
import type { AnalyzeResult } from '../domain/types'

self.onmessage = async (e: MessageEvent) => {
  try {
    const { files, settings } = e.data as { files: { name: string, text: string }[], settings: any }
    const all = files.flatMap(f => parseLog({ source: f.name, content: f.text }))
    const res: AnalyzeResult = analyzeWithSettings(all, settings)
      ; (self as any).postMessage(res)
  } catch (err) {
    console.error('worker fatal', err)
      ; (self as any).postMessage({ error: String(err) })
  }
}
