import React from 'react'
import type { AlertEntry } from '../../domain/types'

export function AlertsPanel({ alerts }: { alerts: AlertEntry[] }) {
  return (
    <section className="max-w-7xl mx-auto px-4 pt-4">
      <div className="rounded-xl border border-slate-200 overflow-x-auto">
        <div className="px-4 py-2 border-b bg-slate-50 rounded-t-xl flex items-center">
          <h3 className="font-semibold">경고/에러/스멜</h3>
          <span className="ml-2 text-xs text-slate-500">({alerts.length.toLocaleString()}건)</span>
          <div className="ml-auto text-xs text-slate-500">가로 스크롤</div>
        </div>

        <table className="text-sm" style={{ minWidth: 1200 }}>
          <thead className="bg-slate-50">
            <tr className="text-left">
              <th className="px-3 py-2 w-44 whitespace-nowrap">시간</th>
              <th className="px-3 py-2 w-24 whitespace-nowrap">레벨</th>
              <th className="px-3 py-2 w-56 whitespace-nowrap">소스</th>
              <th className="px-3 py-2 w-48 whitespace-nowrap">사유</th>
              <th className="px-3 py-2 whitespace-nowrap">원문</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {alerts.map((a, i) => (
              <tr key={i} className="align-top">
                <td className="px-3 py-2 text-xs text-slate-600 whitespace-nowrap">{new Date(a.entry.ts).toLocaleString()}</td>
                <td className="px-3 py-2">
                  <span className={
                    "inline-flex items-center px-2 py-0.5 rounded text-xs whitespace-nowrap " +
                    (a.entry.level === 'ERROR' || a.entry.level === 'FATAL' ? "bg-red-100 text-red-700" :
                      a.entry.level === 'WARN' ? "bg-amber-100 text-amber-700" :
                        a.entry.level === 'INFO' ? "bg-emerald-100 text-emerald-700" :
                          "bg-slate-100 text-slate-700")
                  }>{a.entry.level}</span>
                </td>
                <td className="px-3 py-2 text-xs text-slate-600 whitespace-pre">{a.entry.source}</td>
                <td className="px-3 py-2 text-xs text-slate-600 whitespace-pre">{a.primary}</td>
                <td className="px-3 py-2"><div className="whitespace-pre">{a.entry.raw}</div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
