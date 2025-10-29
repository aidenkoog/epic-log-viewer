import type { LogLevel } from '../../domain/types'

export function FiltersBar({
  levels,
  levelFilter,
  setLevelFilter,
  sources,
  sourceFilter,
  setSourceFilter,
  keyword,
  setKeyword
}: {
  levels: LogLevel[],
  levelFilter: Record<string, boolean>,
  setLevelFilter: (f: any) => void,
  sources: string[],
  sourceFilter: Record<string, boolean>,
  setSourceFilter: (f: any) => void,
  keyword: string,
  setKeyword: (s: string) => void
}) {
  return (
    <section className="max-w-7xl mx-auto px-4 pt-4 grid gap-3">
      <div className="rounded-xl border border-slate-200 p-3 grid sm:grid-cols-3 gap-3">
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-sm text-slate-600">레벨</span>
          {levels.map(l => (
            <label key={l} className="text-sm flex items-center gap-1">
              <input
                type="checkbox"
                checked={!!levelFilter[l]}
                onChange={(e) => { const checked = e.currentTarget.checked; setLevelFilter((prev: any) => ({ ...prev, [l]: checked })) }}
              />
              {l}
            </label>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-sm text-slate-600">소스</span>
          <div className="flex flex-wrap gap-2">
            {sources.map(src => (
              <label key={src} className="text-xs flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={!!sourceFilter[src]}
                  onChange={(e) => { const checked = e.currentTarget.checked; setSourceFilter((prev: any) => ({ ...prev, [src]: checked })) }}
                />
                <span className="truncate max-w-[140px]" title={src}>{src}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input className="flex-1 border rounded px-3 py-2 text-sm" placeholder="키워드 검색" value={keyword} onChange={(e) => setKeyword(e.currentTarget.value)} />
        </div>
      </div>
    </section>
  )
}
