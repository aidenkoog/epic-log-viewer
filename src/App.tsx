import { useEffect, useMemo, useState } from 'react'
import { AnalyzeResult, LogLevel } from './domain/types';
import { AlertsPanel } from './presentation/components/Alerts';
import { Charts } from './presentation/components/Charts';
import { FiltersBar } from './presentation/components/FiltersBar';
import FloatingSearch from './presentation/components/FloatingSearch';
import { Header } from './presentation/components/Header';
import { LogTable } from './presentation/components/LogTable';
import ScrollToTopFab from './presentation/components/ScrollToTopFab';
import { SettingsModal } from './presentation/components/SettingsModal';
import { Uploader } from './presentation/components/Uploader';
import { useDebounced } from './presentation/hooks/useDebounced';
import { useSettings } from './presentation/hooks/useSettings';
import { FileList as UploadedFileList } from './presentation/components/Uploader'

type FileItem = { file: File; text: string }

export default function App() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalyzeResult | null>(null)
  const [settings, updateSettings] = useSettings()
  const [showSettings, setShowSettings] = useState(false)

  const [levelFilter, setLevelFilter] = useState<Record<string, boolean>>({
    DEBUG: true, INFO: true, WARN: true, ERROR: true, FATAL: true, UNKNOWN: true,
  })
  const [sourceFilter, setSourceFilter] = useState<Record<string, boolean>>({})
  const [keyword, setKeyword] = useState('')
  const debouncedKeyword = useDebounced(keyword, 400)

  useEffect(() => {
    if (!result) return
    const sf: Record<string, boolean> = {}
    for (const e of result.entries) sf[e.source] = true
    setSourceFilter(sf)
  }, [result])

  const onFiles = async (fl: FileList | File[] | null) => {
    if (!fl) return
    const picked = Array.from(fl as any as File[])
    const read = await Promise.all(picked.map(async (f) => ({ file: f, text: await f.text() })))
    setFiles(prev => {
      const map = new Map<string, FileItem>()
      const acc = (x: FileItem) => map.set(`${x.file.name}-${x.file.size}-${x.file.lastModified}`, x)
      prev.forEach(acc); read.forEach(acc); return Array.from(map.values())
    })
  }
  const removeFile = (i: number) => setFiles(prev => prev.filter((_, idx) => idx !== i))
  const clearFiles = () => { setFiles([]); setResult(null); setKeyword('') }

  const onAnalyze = async () => {
    if (files.length === 0) return
    setLoading(true)
    setResult(null)
    try {
      const worker = new Worker(new URL('./infrastructure/worker.ts', import.meta.url), { type: 'module' })
      const msg = { files: files.map(f => ({ name: f.file.name, text: f.text })), settings }
      const res: AnalyzeResult = await new Promise((resolve, reject) => {
        const fail = (e: any) => { console.error('Worker error', e); reject(e) }
        worker.onmessage = (e) => { worker.terminate(); resolve(e.data as AnalyzeResult) }
        worker.onerror = fail; worker.onmessageerror = fail; worker.postMessage(msg)
      })
      setResult(res)
    } catch (e) {
      console.error(e)
      alert('분석 중 오류가 발생했습니다. 콘솔을 확인해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    if (!result) return { entries: [], alerts: [] as any[] }
    const kw = debouncedKeyword.trim().toLowerCase()
    const matchKw = (s: string) => (kw ? s.toLowerCase().includes(kw) : true)
    const entries = result.entries.filter(e =>
      !!levelFilter[e.level] && !!sourceFilter[e.source] && (matchKw(e.message) || matchKw(e.raw))
    )
    const alerts = result.alerts.filter(a =>
      !!sourceFilter[a.entry.source] && !!levelFilter[a.entry.level] && matchKw(a.entry.raw)
    )
    return { entries, alerts }
  }, [result, levelFilter, sourceFilter, debouncedKeyword])

  const sources = useMemo(() => result ? Array.from(new Set(result.entries.map(e => e.source))) : [], [result])
  const levels: LogLevel[] = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL', 'UNKNOWN']

  return (
    <div className="min-h-screen bg-white">
      <Header onAnalyze={onAnalyze} canAnalyze={files.length > 0 && !loading} onClear={clearFiles} onOpenSettings={() => setShowSettings(true)} />

      <main className="py-4">
        <section className="max-w-7xl mx-auto px-4">
          <Uploader onFiles={(fl) => onFiles(fl as any)} />
          <UploadedFileList
            files={files.map(f => ({ name: f.file.name, size: f.file.size }))}
            onRemove={removeFile}
            onClear={clearFiles}
          />
        </section>

        {loading && (
          <section className="max-w-7xl mx-auto px-4 pt-4">
            <div className="rounded-xl border border-slate-200 p-6 text-center">분석 중...</div>
          </section>
        )}

        {result && (
          <>
            <FiltersBar
              levels={levels}
              levelFilter={levelFilter}
              setLevelFilter={setLevelFilter}
              sources={sources}
              sourceFilter={sourceFilter}
              setSourceFilter={setSourceFilter}
              keyword={keyword}
              setKeyword={setKeyword}
            />
            <Charts result={result} />
            <AlertsPanel alerts={filtered.alerts} />
            <LogTable entries={filtered.entries} />
          </>
        )}
      </main>

      {showSettings && <SettingsModal settings={settings} updateSettings={(fn: any) => updateSettings(fn)} onClose={() => setShowSettings(false)} />}

      <FloatingSearch open={false} onClose={() => { }} value={keyword} onChange={setKeyword} />
      <ScrollToTopFab bottomClass="bottom-20 md:bottom-8" rightClass="right-4 md:right-10" />
    </div>
  )
}
