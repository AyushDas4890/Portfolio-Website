import { useEffect } from 'react'

/** Sets the page tone (paper, ink or project) while this section crosses mid-viewport. */
export function useTone(ref, tone) {
  useEffect(() => {
    const node = ref.current
    if (!node || !tone) return undefined
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) document.documentElement.dataset.tone = tone
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 },
    )
    io.observe(node)
    return () => io.disconnect()
  }, [ref, tone])
}
