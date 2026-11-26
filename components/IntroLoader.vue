<script setup lang="ts">
import gsap from 'gsap'
import { animate, createDrawable, stagger } from 'animejs'

/**
 * First-visit loader, laid out as the home hero row itself: the monogram draws,
 * the name types in, the tagline words surface from grey, and a counter runs to
 * 100 where "Scroll down" will sit. On the home page the loader's background
 * then dissolves and the identical hero row underneath takes over in place.
 */
const done = useIntroDone()
const route = useRoute()
const root = ref<HTMLElement | null>(null)
const count = ref(0)
const name = 'Ayush Das'
const tagline = 'AI/ML engineer turning noise into models'.split(' ')

onMounted(async () => {
  const reduced = useReducedMotion()
  const el = root.value!
  const isHome = (route.path.replace(/\/+$/, '') || '/') === '/'
  const letters = el.querySelectorAll('.loader__ch')
  const words = el.querySelectorAll('.loader__w')
  if (!reduced) {
    animate(createDrawable(el.querySelectorAll('.monogram path')), { draw: ['0 0', '0 1'], duration: 1500, delay: stagger(160), ease: 'inOutSine' })
    animate(letters, { opacity: [0, 1], duration: 10, delay: stagger(70, { start: 250 }), ease: 'linear' })
    animate(words, { opacity: [0.12, 1], filter: ['blur(4px)', 'blur(0px)'], duration: 900, delay: stagger(140, { start: 500 }), ease: 'outQuad' })
  } else {
    gsap.set([letters, words], { opacity: 1 })
  }
  const progress = { v: 0 }
  const counter = gsap.to(progress, { v: 88, duration: 1.8, ease: 'power1.out', onUpdate: () => (count.value = Math.round(progress.v)) })
  await Promise.all([document.fonts?.ready, new Promise((r) => setTimeout(r, reduced ? 200 : 1900))])
  counter.kill()
  await gsap.to(progress, { v: 100, duration: 0.45, ease: 'power2.out', onUpdate: () => (count.value = Math.round(progress.v)) })
  gsap.to(el.querySelector('.loader__count'), { opacity: 0, y: -10, duration: 0.5, ease: 'power2.in' })
  gsap.to(el.querySelector('.loader__line'), { scaleX: 0, transformOrigin: 'right', duration: 0.7, ease: 'power3.inOut' })
  if (isHome) {
    // Same row underneath: only the backdrop goes.
    await gsap.to(el.querySelector('.loader__bg'), { opacity: 0, duration: 1.2, delay: 0.25, ease: 'power2.inOut' })
  } else {
    await gsap.to(el.querySelectorAll('.loader__row > *'), { opacity: 0, y: -14, filter: 'blur(6px)', duration: 0.7, stagger: 0.06, ease: 'power2.in' })
    await gsap.to(el.querySelector('.loader__bg'), { opacity: 0, duration: 0.9, ease: 'power2.inOut' })
  }
  done.value = true
  useGl()?.sweep(2.8)
})
</script>

<template>
  <div v-if="!done" ref="root" class="loader" role="status" aria-live="polite">
    <div class="loader__bg" />
    <div class="loader__row">
      <p class="loader__brand ui">
        <Monogram />
        <span :aria-label="name"><span v-for="(ch, i) in name" :key="i" class="loader__ch" aria-hidden="true">{{ ch === ' ' ? ' ' : ch }}</span></span>
      </p>
      <p class="loader__tag serif">
        <template v-for="(w, i) in tagline" :key="i"><span class="loader__w">{{ w }}</span>{{ ' ' }}</template>
        <span class="loader__line" aria-hidden="true" :style="{ transform: `scaleX(${count / 100})` }" />
      </p>
      <p class="loader__count ui">{{ count }}</p>
    </div>
  </div>
</template>

<style scoped>
.loader {
  position: fixed;
  inset: 0;
  z-index: 300;
  color: var(--fg);
  display: flex;
  align-items: center;
  padding: 0 var(--gutter);
}
.loader__bg {
  position: absolute;
  inset: 0;
  background: var(--bg);
}
/* Mirrors .hero__row on the home page so the hand-off is seamless. */
.loader__row {
  position: relative;
  width: 100%;
  display: grid;
  grid-template-columns: 2fr 5fr 2fr;
  align-items: center;
  gap: 24px;
}
.loader__brand {
  display: flex;
  align-items: center;
  gap: 12px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}
.loader__ch {
  opacity: 0;
}
.loader__tag {
  position: relative;
  font-size: clamp(22px, 1.667vw, 30px);
}
.loader__w {
  display: inline-block;
  opacity: 0.12;
}
.loader__line {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -14px;
  height: 1px;
  background: var(--accent);
  transform-origin: left;
  opacity: 0.6;
}
.loader__count {
  justify-self: end;
  font-variant-numeric: tabular-nums;
}
@media (max-width: 860px) {
  .loader__row {
    grid-template-columns: 1fr;
  }
  .loader__count {
    justify-self: start;
  }
}
</style>
