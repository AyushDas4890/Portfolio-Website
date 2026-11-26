<script setup lang="ts">
import { animate, splitText, stagger, cubicBezier } from 'animejs'

/**
 * Text that reveals itself with anime.js when it enters the viewport.
 * lines: each line rises out of a clip · blur: letters resolve out of blur ·
 * type: letters appear one by one, like a narration.
 */
const props = withDefaults(defineProps<{ text: string; as?: string; mode?: 'lines' | 'blur' | 'type'; delay?: number; immediate?: boolean }>(), {
  as: 'p',
  mode: 'lines',
  delay: 0,
  immediate: false,
})

const el = ref<HTMLElement | null>(null)
const ease = cubicBezier(0.165, 0.84, 0.44, 1)
let split: ReturnType<typeof splitText> | null = null
let io: IntersectionObserver | null = null

function play() {
  const node = el.value
  if (!node) return
  if (useReducedMotion()) {
    node.style.visibility = 'visible'
    return
  }
  if (props.mode === 'lines') {
    // Lines are measured once fonts load, so the animation lives in an effect
    // that anime re-runs (keeping its time) whenever the lines are re-split.
    split = splitText(node, { lines: { wrap: 'clip' } }).addEffect((s) => {
      node.style.visibility = 'visible'
      return animate(s.lines, { y: ['105%', '0%'], duration: 1400, delay: stagger(90, { start: props.delay }), ease })
    })
    return
  }
  node.style.visibility = 'visible'
  if (props.mode === 'blur') {
    split = splitText(el.value, { words: { wrap: false }, chars: true })
    animate(split.chars, {
      opacity: [0, 1],
      filter: ['blur(14px)', 'blur(0px)'],
      duration: 1600,
      delay: stagger(22, { start: props.delay, from: 'random' }),
      ease,
    })
  } else {
    split = splitText(el.value, { chars: true })
    animate(split.chars, { opacity: [0, 1], duration: 60, delay: stagger(24, { start: props.delay }), ease: 'linear' })
  }
}

// Nothing plays behind the intro loader: wait for it to lift first.
const intro = useIntroDone()
function whenReady(fn: () => void) {
  if (intro.value) return fn()
  const stop = watch(intro, (v) => {
    if (!v) return
    stop()
    fn()
  })
}

onMounted(() => {
  if (!el.value) return
  el.value.style.visibility = 'hidden'
  if (props.immediate) return whenReady(play)
  io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io?.disconnect()
        whenReady(play)
      }
    },
    { rootMargin: '0px 0px -12% 0px' },
  )
  io.observe(el.value)
})

onBeforeUnmount(() => {
  io?.disconnect()
  split?.revert()
})
</script>

<template>
  <component :is="as" ref="el">{{ text }}</component>
</template>
