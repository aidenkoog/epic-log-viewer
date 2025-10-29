import React, { useEffect, useState } from 'react'

export default function ScrollToTopFab({
  threshold = 400,
  bottomClass = 'bottom-5 md:bottom-8',
  rightClass = 'right-4 md:right-8',
}: {
  threshold?: number
  bottomClass?: string
  rightClass?: string
}) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        setVisible(window.scrollY > threshold)
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  const scrollTop = () => {
    try { window.scrollTo({ top: 0, behavior: 'smooth' }) } catch { window.scrollTo(0, 0) }
  }

  return (
    <button
      type="button"
      aria-label="맨 위로 이동"
      onClick={scrollTop}
      className={[
        'fixed z-50', bottomClass, rightClass,
        'transition-opacity duration-200',
        visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        'rounded-full shadow-lg border border-blue-500 bg-white text-blue-600 font-semibold',
        'h-12 w-12 md:h-14 md:w-14 flex items-center justify-center',
        'hover:bg-blue-50 hover:shadow-xl active:scale-95',
      ].join(' ')}
    >
      <span className="text-xs md:text-sm font-semibold tracking-wide">TOP</span>
    </button>
  )
}
