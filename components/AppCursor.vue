<script setup lang="ts">
import { createAnimatable } from 'animejs'
import gsap from 'gsap'

/** Dot that follows the pointer, a slower ring, and a contextual label from [data-cursor]. */
const dot = ref<HTMLElement | null>(null)
const ring = ref<HTMLElement | null>(null)
const blob = ref<HTMLElement | null>(null)
const label = ref('')
const active = ref(false)
const pressed = ref(false)
const moved = ref(false)
// After the intro, the cursor offers sound until the first click (which turns it on).
const intro = useIntroDone()
const { on: soundOn, toggle: toggleSound } = useSound()
const hint = ref(false)
watch(intro, (v) => (hint.value = v && !soundOn.value))
watch(soundOn, (v) => v && (hint.value = false))
const shown = computed(() => label.value || (hint.value ? 'Click to enable sound' : ''))

onMounted(() => {
  if (!window.matchMedia('(pointer: fine)').matches) return
  document.documentElement.classList.add('has-cursor')
  const d = createAnimatable(dot.value!, { x: 90, y: 90, ease: 'out(3)' })
  const r = createAnimatable(ring.value!, { x: 420, y: 420, ease: 'out(4)' })
  // Squash and stretch: the ring smears along the direction it travels.
  const v = { x: 0, y: 0, px: 0, py: 0, s: 0, a: 0 }
  const stretch = () => {
    const dx = v.x - v.px
    const dy = v.y - v.py
    v.px += dx * 0.18
    v.py += dy * 0.18
    const speed = Math.min(Math.hypot(dx, dy) / 140, 0.65)
    v.s += (speed - v.s) * 0.2
    if (speed > 0.02) v.a = Math.atan2(dy, dx)
    if (blob.value) blob.value.style.transform = `rotate(${v.a}rad) scale(${1 + v.s}, ${1 - v.s * 0.45})`
  }
  gsap.ticker.add(stretch)
  onBeforeUnmount(() => gsap.ticker.remove(stretch))
  const move = (e: PointerEvent) => {
    moved.value = true
    v.x = e.clientX
    v.y = e.clientY
    d.x(e.clientX)
    d.y(e.clientY)
    r.x(e.clientX)
    r.y(e.clientY)
    const t = (e.target as HTMLElement)?.closest?.('[data-cursor], a, button') as HTMLElement | null
    active.value = !!t
    label.value = t?.dataset.cursor || ''
  }
  const down = (e: PointerEvent) => {
    pressed.value = true
    if (!hint.value) return
    hint.value = false
    const onControl = (e.target as HTMLElement)?.closest?.('a, button, input, [data-cursor]')
    if (!onControl && !soundOn.value) toggleSound()
  }
  const up = () => (pressed.value = false)
  window.addEventListener('pointermove', move, { passive: true })
  window.addEventListener('pointerdown', down)
  window.addEventListener('pointerup', up)
  onBeforeUnmount(() => {
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerdown', down)
    window.removeEventListener('pointerup', up)
    document.documentElement.classList.remove('has-cursor')
  })
})
</script>

<template>
  <div class="cursor" :class="{ 'is-ready': moved }" aria-hidden="true">
    <div ref="ring" class="cursor__ring" :class="{ 'is-active': active, 'is-pressed': pressed }">
      <div ref="blob" class="cursor__blob" />
      <span class="cursor__label ui" :class="{ 'is-on': shown }">{{ shown }}</span>
    </div>
    <div ref="dot" class="cursor__dot" />
  </div>
</template>

<style scoped>
.cursor {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 200;
  color: var(--fg);
}
html:not(.has-cursor) .cursor {
  display: none;
}
.cursor {
  opacity: 0;
  transition: opacity 0.4s;
}
.cursor.is-ready {
  opacity: 1;
}
.cursor__dot,
.cursor__ring {
  position: absolute;
  left: 0;
  top: 0;
}
.cursor__dot {
  width: 6px;
  height: 6px;
  margin: -3px 0 0 -3px;
  border-radius: 50%;
  background: var(--fg);
}
.cursor__ring {
  width: 34px;
  height: 34px;
  margin: -17px 0 0 -17px;
}
.cursor__blob {
  position: absolute;
  inset: 0;
}
.cursor__blob::before {
  content: '';
  position: absolute;
  inset: 0;
  border: 1px solid var(--accent);
  border-radius: 50%;
  transform: scale(0.55);
  opacity: 0.45;
  transition: transform 0.6s var(--ease-out), opacity 0.4s, background-color 0.4s;
}
.cursor__ring.is-active .cursor__blob::before {
  transform: scale(1.5);
  opacity: 1;
  background: rgba(201, 162, 107, 0.08);
}
.cursor__ring.is-pressed .cursor__blob::before {
  transform: scale(0.9);
}
.cursor__label {
  position: absolute;
  left: 44px;
  top: 50%;
  transform: translate(-6px, -50%);
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s, transform 0.5s var(--ease-out);
}
.cursor__label.is-on {
  opacity: 1;
  transform: translate(0, -50%);
}
</style>
