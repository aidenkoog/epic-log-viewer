import React, { useCallback, useState } from 'react'

type FileVM = { name: string; size: number }

export function Uploader({ onFiles }: { onFiles: (files: FileList | File[]) => void }) {
  const [hover, setHover] = useState(false)
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setHover(false)
    if (e.dataTransfer?.files?.length) onFiles(e.dataTransfer.files)
  }, [onFiles])
  const onChoose = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.files?.length) onFiles(e.currentTarget.files)
  }
  return (
    <div
      className={'rounded-xl border border-dashed p-6 text-center transition ' + (hover ? 'border-sky-400 bg-sky-50' : 'border-slate-300')}
      onDragOver={(e) => { e.preventDefault(); setHover(true) }}
      onDragLeave={() => setHover(false)}
      onDrop={onDrop}
    >
      <input id="file" type="file" multiple className="hidden" onChange={onChoose} />
      <label htmlFor="file" className="btn btn-primary">파일 선택 / 드래그</label>
      <div className="text-xs text-slate-500 mt-2">여러 파일을 한 번에 업로드하세요.</div>
    </div>
  )
}

export function FileList({
  files, onRemove, onClear,
}: {
  files: FileVM[]
  onRemove: (index: number) => void
  onClear: () => void
}) {
  if (files.length === 0) return null
  return (
    <div className="mt-3 rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-3 py-2 text-xs text-slate-600 bg-slate-50 flex items-center">
        업로드된 파일 <span className="ml-1 text-slate-400">({files.length})</span>
        <button className="ml-auto btn btn-secondary btn-xs" onClick={onClear}>전체 비우기</button>
      </div>
      <ul className="max-h-48 overflow-auto divide-y divide-slate-100">
        {files.map((f, i) => (
          <li key={`${f.name}-${f.size}-${i}`} className="px-3 py-2 text-sm flex items-center gap-2">
            <span className="truncate max-w-[70%]" title={f.name}>{f.name}</span>
            <span className="text-xs text-slate-500">{(f.size / 1024).toFixed(1)} KB</span>
            <button className="ml-auto btn btn-secondary btn-xs" onClick={() => onRemove(i)}>삭제</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
