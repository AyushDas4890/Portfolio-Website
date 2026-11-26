import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Scroll-driven motion helpers. Everything is created inside a gsap.context
 * scoped to the component, so it is reverted (tweens and ScrollTriggers) when
 * the component unmounts or the page changes.
 */
export function useMotion(setup: (ctx: { root: HTMLElement; gsap: typeof gsap; ScrollTrigger: typeof ScrollTrigger }) => void) {
  const root = ref<HTMLElement | null>(null)
  let ctx: gsap.Context | null = null
  onMounted(() => {
    if (!root.value || useReducedMotion()) return
    // Wait one frame so layout (fonts, media ratios) has settled before measuring.
    requestAnimationFrame(() => {
      if (!root.value) return
      ctx = gsap.context(() => setup({ root: root.value!, gsap, ScrollTrigger }), root.value)
      ScrollTrigger.refresh()
    })
  })
  onBeforeUnmount(() => ctx?.revert())
  return root
}

/**
 * Depth layers: any [data-speed] inside the root drifts against the scroll.
 * speed 0.2 = slow background, -0.3 = foreground rushing past.
 */
export function parallax(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('[data-speed]').forEach((el) => {
    const speed = parseFloat(el.dataset.speed || '0')
    gsap.fromTo(
      el,
      { yPercent: speed * 60 },
      { yPercent: -speed * 60, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } },
    )
  })
}

/** Media that opens from a slit and settles from an overscale as it scrolls into place. */
export function unveil(el: HTMLElement, inner?: HTMLElement | null) {
  gsap.fromTo(
    el,
    { clipPath: 'inset(18% 12% 18% 12%)' },
    { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 30%', scrub: 0.6 } },
  )
  if (inner) {
    gsap.fromTo(inner, { scale: 1.35 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 } })
  }
}
