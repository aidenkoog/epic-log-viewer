export function Header({ onAnalyze, canAnalyze, onClear, onOpenSettings }: { onAnalyze: () => void, canAnalyze: boolean, onClear: () => void, onOpenSettings: () => void }) {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        <h1 className="text-lg sm:text-xl font-bold tracking-tight">Aiden LogViewer</h1>
        <div className="ml-auto flex gap-2">
          <button className="btn btn-secondary" onClick={onOpenSettings}>설정</button>
          <button className="btn btn-secondary" onClick={onClear}>초기화</button>
          <button className="btn btn-primary disabled:opacity-50" disabled={!canAnalyze} onClick={onAnalyze}>분석</button>
        </div>
      </div>
    </header>
  )
}
