import gsap from 'gsap'
import type { Directive } from 'vue'

/**
 * v-magnetic: the element leans toward the pointer when it comes close and
 * springs back when it leaves. v-magnetic="0.5" sets the pull strength.
 */
const magnetic: Directive<HTMLElement, number | undefined> = {
  mounted(el, binding) {
    if (!window.matchMedia('(pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const strength = binding.value ?? 0.35
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' })
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      const reach = Math.max(r.width, r.height) * 0.9 + 40
      if (Math.hypot(dx, dy) < reach) {
        xTo(dx * strength)
        yTo(dy * strength)
      } else {
        xTo(0)
        yTo(0)
      }
    }
    window.addEventListener('pointermove', move, { passive: true })
    ;(el as any).__magnet = () => window.removeEventListener('pointermove', move)
  },
  beforeUnmount(el) {
    ;(el as any).__magnet?.()
  },
  getSSRProps: () => ({}),
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('magnetic', magnetic)
})
