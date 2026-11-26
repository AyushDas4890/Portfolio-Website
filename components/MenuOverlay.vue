<script setup lang="ts">
import gsap from 'gsap'
import { animate, stagger, cubicBezier } from 'animejs'
import { chapters, profile } from '~/data'

/**
 * Dark relief menu. Opening spills ink from the Menu button across the screen,
 * then the ink thins to show the dark wall. Hovering an item lengthens it into a
 * fuller phrase (the added words in grey), with "Click to explore" beside it and
 * its numeral at the far edge.
 */
const open = useMenuOpen()
const route = useRoute()
const root = ref<HTMLElement | null>(null)
const ink = ref<HTMLElement | null>(null)
const hovered = ref(-1)
const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI']
const items = [
  ...chapters.map((c) => ({ to: `/studio/${c.slug}`, label: c.title, more: c.alt })),
  { to: '/projects', label: 'Projects', more: 'six models, shipped' },
].map((it, i) => ({ ...it, numeral: numerals[i] }))
const ease = cubicBezier(0.165, 0.84, 0.44, 1)

/** Ink grows from the Menu button (top right), so measure where that is. */
function origin() {
  const b = document.querySelector('.chrome__menu')?.getBoundingClientRect()
  return b ? `${b.left + b.width / 2}px ${b.top + b.height / 2}px` : '95% 4%'
}

watch(open, async (v) => {
  const gl = useGl()
  const scene = useState<any>('page-scene')
  if (v) {
    gl?.setScene({ dark: 1, relief: 1, ink: false, reveal: 0.3 })
    useLenis()?.stop()
    await nextTick()
    if (useReducedMotion()) return
    const at = origin()
    gsap.fromTo(ink.value, { clipPath: `circle(0% at ${at})`, opacity: 1 }, { clipPath: `circle(150% at ${at})`, duration: 1.1, ease: 'power3.inOut' })
    gsap.to(ink.value, { opacity: 0.25, duration: 1.2, delay: 0.9, ease: 'power2.out' })
    const links = root.value?.querySelectorAll('.menu__item')
    if (links) animate(links, { opacity: [0, 1], y: ['60%', '0%'], rotateX: [-70, 0], filter: ['blur(12px)', 'blur(0px)'], duration: 1400, delay: stagger(80, { start: 420 }), ease })
    animate(root.value!.querySelectorAll('.menu__foot > *'), { opacity: [0, 1], y: [20, 0], duration: 1000, delay: stagger(90, { start: 900 }), ease })
  } else {
    if (scene.value) gl?.setScene(scene.value)
    useLenis()?.start()
  }
})

watch(() => route.fullPath, () => (open.value = false))

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') open.value = false
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

const { play } = useSound()
const enter = (i: number) => {
  if (hovered.value !== i) play()
  hovered.value = i
}
const fade = (el: Element, done: () => void) => gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.3, onComplete: done })
const fadeOut = (el: Element, done: () => void) => {
  if (useReducedMotion() || !ink.value) return gsap.to(el, { opacity: 0, duration: 0.4, onComplete: done })
  const at = origin()
  gsap.to(el.querySelectorAll('.menu__item, .menu__foot > *'), { opacity: 0, y: '-30%', filter: 'blur(8px)', duration: 0.5, stagger: 0.03, ease: 'power2.in' })
  gsap.to(ink.value, { opacity: 1, duration: 0.3 })
  gsap.to(ink.value, { clipPath: `circle(0% at ${at})`, duration: 0.8, delay: 0.25, ease: 'power3.inOut', onComplete: done })
}
</script>

<template>
  <Transition :css="false" @enter="fade" @leave="fadeOut">
    <nav v-if="open" id="menu" ref="root" class="menu" aria-label="Site">
      <div ref="ink" class="menu__ink" aria-hidden="true" />
      <ul class="menu__list" :class="{ 'has-hover': hovered > -1 }" @pointerleave="hovered = -1">
        <li v-for="(item, i) in items" :key="item.to" class="menu__item" :class="{ 'is-hover': hovered === i }">
          <NuxtLink :to="item.to" class="menu__link" data-cursor="" @pointerenter="enter(i)" @focus="enter(i)" @blur="hovered = -1">
            <span class="menu__label serif">{{ item.label }}</span>
            <span class="menu__more serif" aria-hidden="true"><span>, {{ item.more.toLowerCase() }}</span></span>
            <span class="menu__explore ui" aria-hidden="true">Click to explore</span>
          </NuxtLink>
          <span class="menu__num serif" aria-hidden="true">{{ item.numeral }}</span>
        </li>
      </ul>
      <div class="menu__foot">
        <a :href="`mailto:${profile.email}`" class="menu__contact ui">
          <span class="menu__streaks" aria-hidden="true"><i /><i /><i /></span>
          <span class="menu__contact-txt">Contact me<span class="menu__now">&nbsp;now</span></span>
        </a>
      </div>
    </nav>
  </Transition>
</template>

<style scoped>
.menu {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  color: var(--fg);
}
.menu__ink {
  position: absolute;
  inset: 0;
  background: var(--abyss);
  opacity: 0.25;
}
html:not(.gl-on) .menu__ink {
  opacity: 1 !important;
}
.menu__list {
  position: relative;
  width: 100%;
  text-align: center;
  perspective: 900px;
}
.menu__item {
  position: relative;
  transform-origin: 50% 100%;
}
.menu__link {
  position: relative;
  display: inline-flex;
  align-items: baseline;
  font-size: clamp(30px, 2.6vw, 46px);
  line-height: 1.24;
  transition: opacity 0.5s var(--ease-out);
}
/* The added words open up from zero width, so the phrase grows from its centre. */
.menu__more {
  display: inline-grid;
  grid-template-columns: 0fr;
  color: var(--muted);
  font-style: italic;
  transition: grid-template-columns 0.8s var(--ease-out);
}
.menu__more > span {
  overflow: hidden;
  white-space: nowrap;
  opacity: 0;
  filter: blur(6px);
  transition: opacity 0.6s var(--ease-out), filter 0.6s var(--ease-out);
}
.menu__explore {
  position: absolute;
  left: calc(100% + 22px);
  top: 50%;
  white-space: nowrap;
  color: var(--accent);
  opacity: 0;
  transform: translate(-8px, -50%);
  transition: opacity 0.4s, transform 0.6s var(--ease-out);
}
.menu__num {
  position: absolute;
  right: calc(var(--gutter) * 2);
  top: 50%;
  font-size: clamp(18px, 1.4vw, 24px);
  color: var(--accent);
  opacity: 0;
  transform: translate(12px, -50%);
  transition: opacity 0.5s, transform 0.7s var(--ease-out);
}
.menu__list.has-hover .menu__item:not(.is-hover) .menu__link {
  opacity: 0.28;
}
.menu__item.is-hover .menu__more {
  grid-template-columns: 1fr;
}
.menu__item.is-hover .menu__more > span {
  opacity: 1;
  filter: blur(0);
}
.menu__item.is-hover .menu__explore,
.menu__item.is-hover .menu__num {
  opacity: 1;
  transform: translate(0, -50%);
}

.menu__foot {
  position: absolute;
  bottom: calc(var(--gutter) * 3);
  left: 50%;
  transform: translateX(-50%);
}
/* Contact: thin beams of light keep running across it, brighter on hover. */
.menu__contact {
  position: relative;
  display: inline-block;
  padding: 10px 26px;
}
.menu__now {
  display: inline-block;
  max-width: 0;
  overflow: hidden;
  vertical-align: bottom;
  white-space: nowrap;
  color: var(--accent);
  transition: max-width 0.7s var(--ease-out);
}
.menu__contact:hover .menu__now,
.menu__contact:focus-visible .menu__now {
  max-width: 3em;
}
.menu__streaks {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}
.menu__streaks i {
  position: absolute;
  left: -60%;
  width: 60%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(201, 162, 107, 0.9), rgba(236, 231, 223, 0.95), transparent);
  filter: drop-shadow(0 0 4px rgba(201, 162, 107, 0.8));
  opacity: 0.45;
  animation: streak 2.6s cubic-bezier(0.6, 0, 0.3, 1) infinite;
}
.menu__streaks i:nth-child(1) {
  top: 0;
}
.menu__streaks i:nth-child(2) {
  top: 50%;
  animation-delay: -0.9s;
  animation-duration: 3.1s;
  opacity: 0.25;
}
.menu__streaks i:nth-child(3) {
  bottom: 0;
  animation-delay: -1.7s;
}
.menu__contact:hover .menu__streaks i {
  opacity: 1;
  animation-duration: 1.2s;
}
@keyframes streak {
  to {
    left: 110%;
  }
}
@media (max-width: 760px) {
  .menu__explore,
  .menu__num {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .menu__streaks i {
    animation: none;
  }
}
</style>
