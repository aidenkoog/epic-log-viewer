import { useEffect, useRef, useState } from 'react'

export function useDebounced<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value)
  const tRef = useRef<number | null>(null)

  useEffect(() => {
    if (tRef.current) window.clearTimeout(tRef.current)
    tRef.current = window.setTimeout(() => setDebounced(value), delay)
    return () => { if (tRef.current) window.clearTimeout(tRef.current) }
  }, [value, delay])

  return debounced
}
