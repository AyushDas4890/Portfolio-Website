import { useEffect } from 'react'
import Lenis from 'lenis'
import { useReducedMotion } from '../hooks/useReducedMotion'

let lenis = null
export const scrollToTop = () => (lenis ? lenis.scrollTo(0, { immediate: true }) : window.scrollTo(0, 0))
export const scrollToId = (id) => {
  const node = document.getElementById(id)
  if (!node) return
  if (lenis) lenis.scrollTo(node, { offset: -16 })
  else node.scrollIntoView()
}

export function SmoothScroll() {
  const reduced = useReducedMotion()
  useEffect(() => {
    if (reduced) return undefined
    lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1 })
    let raf = requestAnimationFrame(function loop(t) {
      lenis.raf(t)
      raf = requestAnimationFrame(loop)
    })
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
      lenis = null
    }
  }, [reduced])
  return null
}
