<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { chapters, getProject } from '~/data'

const menuOpen = useMenuOpen()
const theme = useTheme()
useHead({
  htmlAttrs: {
    'data-theme': computed(() => (menuOpen.value ? 'dark' : theme.value)),
    'data-menu': computed(() => (menuOpen.value ? 'open' : null)),
  },
})

/** Name shown on the curtain for the page being opened. */
function labelFor(path: string) {
  const p = path.replace(/\/+$/, '') || '/'
  if (p === '/') return 'Home'
  if (p === '/projects') return 'All projects'
  const study = p.match(/^\/projects\/([^/]+)(\/backstage)?$/)
  if (study) {
    const project = getProject(study[1])
    return project ? (study[2] ? `${project.title}, backstage` : project.title) : ''
  }
  const ch = p.match(/^\/studio\/([^/]+)$/)
  if (ch) {
    const c = chapters.find((x) => x.slug === ch[1])
    return c ? `${c.numeral}. ${c.title}` : ''
  }
  return ''
}

const curtain = usePageCurtain()
const router = useRouter()
let fallback: ReturnType<typeof setTimeout> | undefined
let reset: ReturnType<typeof setTimeout> | undefined
router.beforeEach((to) => {
  curtain.value.label = labelFor(to.path)
})
// A navigation that fails after the curtain closed must not leave the screen black.
router.onError(() => lift())

function lift() {
  clearTimeout(fallback)
  if (curtain.value.state !== 'is-in') return
  curtain.value.state = 'is-out'
  clearTimeout(reset)
  reset = setTimeout(() => (curtain.value.state = ''), 1200)
}

/**
 * Page change: the curtain rises while the old page sinks back and blurs and
 * the relief re-noises; then the curtain lifts and the new page climbs into place.
 */
const transition = {
  mode: 'out-in' as const,
  css: false,
  onLeave(el: Element, done: () => void) {
    useGl()?.renoise(true)
    if (useReducedMotion()) {
      gsap.to(el, { opacity: 0, duration: 0.3, onComplete: done })
      return
    }
    clearTimeout(reset)
    curtain.value.state = 'is-in'
    clearTimeout(fallback)
    fallback = setTimeout(lift, 3000)
    gsap.to(el, { opacity: 0.2, y: -90, scale: 0.94, filter: 'blur(8px)', transformOrigin: '50% 30%', duration: 0.8, ease: 'power3.in', onComplete: done })
  },
  onEnter(el: Element, done: () => void) {
    useLenis()?.scrollTo(0, { immediate: true, force: true })
    useGl()?.renoise(false)
    if (useReducedMotion()) {
      gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.4, clearProps: 'all', onComplete: done })
      return
    }
    // Let the label hold for a beat before the curtain lifts.
    gsap.delayedCall(0.35, lift)
    gsap.fromTo(
      el,
      { opacity: 0, y: 120, scale: 1.04, filter: 'blur(10px)' },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        duration: 1.4,
        delay: 0.45,
        ease: 'expo.out',
        clearProps: 'all',
        // Scroll triggers were measured while the page was still offset; measure again.
        onComplete: () => {
          ScrollTrigger.refresh()
          done()
        },
      },
    )
  },
}
</script>

<template>
  <a href="#main" class="skip-link">Skip to content</a>
  <IntroLoader />
  <SiteChrome />
  <MenuOverlay />
  <div class="view"><NuxtPage :transition="transition" /></div>
  <PageCurtain />
  <ClientOnly><AppCursor /></ClientOnly>
</template>
