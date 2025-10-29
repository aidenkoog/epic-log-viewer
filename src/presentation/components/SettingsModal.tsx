import { makeDefaultSettings } from '../../domain/settings'

export function SettingsModal({ settings, updateSettings, onClose }: { settings: any, updateSettings: any, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="absolute right-0 top-0 h-full w-full sm:w-[680px] bg-white shadow-2xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-3 flex items-center gap-3">
          <h3 className="font-semibold">분석 설정</h3>
          <div className="ml-auto flex gap-2">
            <button className="btn btn-secondary" onClick={() => updateSettings(() => makeDefaultSettings())}>기본값으로</button>
            <button className="btn btn-primary" onClick={onClose}>닫기</button>
          </div>
        </div>
        <div className="p-5 grid gap-5">
          <div>
            <h4 className="font-semibold mb-2">스멜 규칙</h4>
            <div className="grid md:grid-cols-2 gap-3">
              {Object.values(settings.rules).map((rule: any) => (
                <div key={rule.id} className="rounded-xl border border-slate-200 p-3 flex items-center gap-3">
                  <input type="checkbox" checked={!!rule.enabled} onChange={(e) => {
                    const checked = e.currentTarget.checked
                    updateSettings((s: any) => ({ ...s, rules: { ...s.rules, [rule.id]: { ...s.rules[rule.id], enabled: checked } } }))
                  }} />
                  <div className="flex-1">
                    <div className="font-medium">{rule.name}</div>
                    <div className="text-xs text-slate-500 break-all">{rule.pattern}</div>
                  </div>
                  <div className="text-xs w-28">
                    <label className="block text-slate-500">Weight {rule.weight}</label>
                    <input type="range" min={0} max={10} value={rule.weight} onChange={(e) => {
                      const v = Number(e.currentTarget.value)
                      updateSettings((s: any) => ({ ...s, rules: { ...s.rules, [rule.id]: { ...s.rules[rule.id], weight: v } } }))
                    }} />
                    <label className="block text-slate-500 mt-1">Severity {rule.severity}</label>
                    <input type="range" min={1} max={5} value={rule.severity} onChange={(e) => {
                      const v = Number(e.currentTarget.value)
                      updateSettings((s: any) => ({ ...s, rules: { ...s.rules, [rule.id]: { ...s.rules[rule.id], severity: v } } }))
                    }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2 leading-5">
              <b>Weight</b>: 점수 가중치(우선순위 산정). <b>Severity</b>: 심각도(1~5, 클러스터 요약에 사용).
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-3">
            <div className="font-medium mb-2">클러스터링</div>
            <label className="text-sm text-slate-600">윈도우(초): {settings.cluster.windowSec}</label>
            <input type="range" min={3} max={60} value={settings.cluster.windowSec} onChange={(e) => {
              const v = Number(e.currentTarget.value)
              updateSettings((s: any) => ({ ...s, cluster: { ...s.cluster, windowSec: v } }))
            }} />
            <div className="mt-2 flex gap-3 text-sm">
              <label className="flex items-center gap-1">
                <input type="radio" checked={settings.cluster.groupBy === 'reason'} onChange={() => updateSettings((s: any) => ({ ...s, cluster: { ...s.cluster, groupBy: 'reason' } }))} />
                reason
              </label>
              <label className="flex items-center gap-1">
                <input type="radio" checked={settings.cluster.groupBy === 'source_reason'} onChange={() => updateSettings((s: any) => ({ ...s, cluster: { ...s.cluster, groupBy: 'source_reason' } }))} />
                source+reason
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-3">
            <div className="font-medium mb-2">타임존/오프셋(분)</div>
            <div className="grid gap-2">
              {Object.keys(settings.tzOffsetsMinute).length === 0 && <div className="text-sm text-slate-500">파일 업로드 후 설정 가능</div>}
              {Object.entries(settings.tzOffsetsMinute).map(([src, min]: any) => (
                <div key={src} className="flex items-center gap-2">
                  <div className="text-xs truncate flex-1">{src}</div>
                  <input className="w-24 border rounded px-2 py-1 text-right" type="number" value={min} onChange={(e) => {
                    const v = Number(e.currentTarget.value)
                    updateSettings((s: any) => ({ ...s, tzOffsetsMinute: { ...s.tzOffsetsMinute, [src]: v } }))
                  }} />
                  <span className="text-xs text-slate-500">분</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
