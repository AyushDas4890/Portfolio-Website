import { useEffect, useState } from 'react'

/**
 * True once the element has entered the viewport, or if it is already above it
 * (deep links and fast jumps must never leave content hidden).
 */
export function useRevealed(ref, { margin = '0px 0px -12% 0px' } = {}) {
  const [revealed, setRevealed] = useState(false)
  useEffect(() => {
    const node = ref.current
    if (!node || revealed) return undefined
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting || e.boundingClientRect.bottom < 0) {
          setRevealed(true)
          io.disconnect()
        }
      },
      { rootMargin: margin, threshold: 0 },
    )
    io.observe(node)
    return () => io.disconnect()
  }, [ref, margin, revealed])
  return revealed
}
