import React, { useEffect, useRef } from 'react'

export default function FloatingSearch({
  open,
  onClose,
  value,
  onChange,
}: {
  open: boolean
  onClose: () => void
  value: string
  onChange: (v: string) => void
}) {
  const panelId = 'floating-search-panel'
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) ref.current?.focus()
  }, [open])

  return (
    <>
      <button
        aria-label="검색 열기"
        className="fixed z-40 bottom-36 right-4 md:bottom-24 md:right-8 rounded-full h-12 w-12 flex items-center justify-center bg-blue-600 text-white shadow-lg hover:bg-blue-500 active:scale-95"
        onClick={()=>document.getElementById(panelId)?.classList.toggle('hidden')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
        </svg>
      </button>

      <div id={panelId} className="hidden fixed z-50 bottom-24 right-4 md:right-8 w-[min(92vw,520px)] bg-white border border-slate-200 rounded-xl shadow-xl p-3 flex items-center gap-2">
        <input
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
          placeholder="키워드 검색…"
          className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-500" onClick={()=>document.getElementById(panelId)?.classList.add('hidden')}>
          닫기
        </button>
      </div>
    </>
  )
}
