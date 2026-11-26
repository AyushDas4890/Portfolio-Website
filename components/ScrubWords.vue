<script setup lang="ts">
import gsap from 'gsap'

/**
 * A sentence that is read by scrolling: each word lifts out of shadow, blur
 * and depth as the line passes through the viewport, tied to the scrollbar.
 */
const props = withDefaults(defineProps<{ text: string; as?: string; accent?: string[] }>(), { as: 'p', accent: () => [] })
const words = computed(() => props.text.split(/\s+/))
const isAccent = (w: string) => props.accent.includes(w.replace(/[.,:;!?’']/g, ''))

const root = useMotion(({ root }) => {
  const els = root.querySelectorAll('.sw__w')
  gsap.fromTo(
    els,
    { opacity: 0.12, filter: 'blur(6px)', yPercent: 40, rotateX: -50 },
    {
      opacity: 1,
      filter: 'blur(0px)',
      yPercent: 0,
      rotateX: 0,
      ease: 'none',
      stagger: 0.08,
      scrollTrigger: { trigger: root, start: 'top 85%', end: 'bottom 45%', scrub: 0.8 },
    },
  )
})
</script>

<template>
  <component :is="as" ref="root" class="sw" :aria-label="text">
    <template v-for="(w, i) in words" :key="i"><span class="sw__w" :class="{ 'is-accent': isAccent(w) }" aria-hidden="true">{{ w }}</span>{{ ' ' }}</template>
  </component>
</template>

<style scoped>
.sw {
  perspective: 800px;
}
.sw__w {
  display: inline-block;
  transform-origin: 50% 100%;
  will-change: transform, opacity, filter;
}
.sw__w.is-accent {
  color: var(--accent);
  font-style: italic;
}
</style>
