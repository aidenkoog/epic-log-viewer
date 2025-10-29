import React, { useMemo, useRef, useState } from 'react'
import type { LogEntry } from '../../domain/types'

type Widths = { time: number; level: number; source: number; message: number }

export function LogTable({ entries }: { entries: LogEntry[] }) {
  const [w, setW] = useState<Widths>({ time: 210, level: 110, source: 280, message: 900 })
  const dragging = useRef<{ col: keyof Widths, startX: number, startW: number } | null>(null)

  const startDrag = (col: keyof Widths, e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    dragging.current = { col, startX: e.clientX, startW: w[col] }
    window.addEventListener('mousemove', onDrag as any)
    window.addEventListener('mouseup', stopDrag as any, { once: true })
  }
  const onDrag = (e: MouseEvent) => {
    if (!dragging.current) return
    const dx = e.clientX - dragging.current.startX
    const col = dragging.current.col
    const next = Math.max(80, Math.min(2000, dragging.current.startW + dx))
    setW(prev => ({ ...prev, [col]: next }))
  }
  const stopDrag = () => {
    dragging.current = null
    window.removeEventListener('mousemove', onDrag as any)
  }

  const rows = useMemo(() => entries, [entries])

  return (
    <section className="max-w-7xl mx-auto px-4 pt-4">
      <div className="rounded-xl border border-slate-200 overflow-x-auto">
        <div className="px-4 py-2 border-b bg-slate-50 rounded-t-xl flex items-center">
          <h3 className="font-semibold">전체 로그</h3>
          <span className="ml-2 text-xs text-slate-500">({entries.length.toLocaleString()}건)</span>
          <div className="ml-auto text-xs text-slate-500">가로 스크롤 · 열 드래그로 너비 조절</div>
        </div>

        <table className="text-sm" style={{ minWidth: w.time + w.level + w.source + w.message + 40 }}>
          <thead className="bg-slate-50">
            <tr className="text-left select-none">
              <th style={{ width: w.time }} className="px-3 py-2 whitespace-nowrap relative">
                시간
                <div onMouseDown={(e) => startDrag('time', e)} className="absolute top-0 right-0 h-full w-1.5 cursor-col-resize hover:bg-blue-300/40" />
              </th>
              <th style={{ width: w.level }} className="px-3 py-2 whitespace-nowrap relative">
                레벨
                <div onMouseDown={(e) => startDrag('level', e)} className="absolute top-0 right-0 h-full w-1.5 cursor-col-resize hover:bg-blue-300/40" />
              </th>
              <th style={{ width: w.source }} className="px-3 py-2 whitespace-nowrap relative">
                소스
                <div onMouseDown={(e) => startDrag('source', e)} className="absolute top-0 right-0 h-full w-1.5 cursor-col-resize hover:bg-blue-300/40" />
              </th>
              <th style={{ width: w.message }} className="px-3 py-2 whitespace-nowrap relative">
                메시지
                <div onMouseDown={(e) => startDrag('message', e)} className="absolute top-0 right-0 h-full w-1.5 cursor-col-resize hover:bg-blue-300/40" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((e, i) => (
              <tr key={i} className="align-top">
                <td style={{ width: w.time }} className="px-3 py-2 text-xs text-slate-600 whitespace-nowrap">
                  {new Date(e.ts).toLocaleString()}
                </td>
                <td style={{ width: w.level }} className="px-3 py-2">
                  <span className={
                    "inline-flex items-center px-2 py-0.5 rounded text-xs whitespace-nowrap " +
                    (e.level === 'ERROR' || e.level === 'FATAL' ? "bg-red-100 text-red-700" :
                      e.level === 'WARN' ? "bg-amber-100 text-amber-700" :
                        e.level === 'INFO' ? "bg-emerald-100 text-emerald-700" :
                          "bg-slate-100 text-slate-700")
                  }>{e.level}</span>
                </td>
                <td style={{ width: w.source }} className="px-3 py-2 text-xs text-slate-600">
                  <div className="whitespace-pre">{e.source}</div>
                </td>
                <td style={{ width: w.message }} className="px-3 py-2">
                  <div className="whitespace-pre">{e.raw}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
