import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { WebglApp, supportsWebgl } from '~/webgl/App'

/**
 * Client bootstrap: smooth scroll (Lenis), the shared WebGL renderer and one
 * ticker (GSAP) driving both.
 */
export default defineNuxtPlugin(() => {
  gsap.registerPlugin(ScrollTrigger)
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const lenis = new Lenis({ duration: 1.15, smoothWheel: !reduced, wheelMultiplier: 0.9 })
  lenis.on('scroll', ScrollTrigger.update)

  let gl: WebglApp | null = null
  if (supportsWebgl()) {
    const canvas = document.createElement('canvas')
    canvas.className = 'webgl'
    canvas.setAttribute('aria-hidden', 'true')
    document.body.prepend(canvas)
    try {
      gl = new WebglApp(canvas)
      document.documentElement.classList.add('gl-on')
      if (import.meta.dev) (window as any).__gl = gl
    } catch (e) {
      console.warn('WebGL unavailable, using the static look.', e)
      canvas.remove()
      gl = null
    }
  }

  gsap.ticker.lagSmoothing(0)
  gsap.ticker.add((time, delta) => {
    lenis.raf(time * 1000)
    if (gl) {
      gl.scroll = lenis.scroll
      gl.velocity = lenis.velocity
      gl.tick(Math.min(delta, 50) / 1000)
    }
  })

  return { provide: { lenis, gl, reducedMotion: reduced } }
})
