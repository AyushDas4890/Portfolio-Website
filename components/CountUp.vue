<script setup lang="ts">
import gsap from 'gsap'

/**
 * A figure that counts up when it scrolls into view, then lands on its exact
 * text ("85%", "15+", "4.9"). Non-numeric values are shown as they are.
 */
const props = defineProps<{ value: string }>()
const el = ref<HTMLElement | null>(null)
const match = computed(() => props.value.match(/^(\D*)([\d.,]+)(.*)$/))

const root = useMotion(({ root }) => {
  const m = match.value
  if (!m || !el.value) return
  const target = parseFloat(m[2].replace(/,/g, ''))
  const decimals = (m[2].split('.')[1] || '').length
  const o = { v: 0 }
  el.value.textContent = `${m[1]}${(0).toFixed(decimals)}${m[3]}`
  gsap.to(o, {
    v: target,
    duration: 2.2,
    ease: 'expo.out',
    scrollTrigger: { trigger: root, start: 'top 85%', once: true },
    onUpdate: () => {
      el.value!.textContent = `${m[1]}${o.v.toFixed(decimals)}${m[3]}`
    },
    onComplete: () => {
      el.value!.textContent = props.value
    },
  })
})
</script>

<template>
  <span ref="root" class="count"><span ref="el">{{ value }}</span></span>
</template>

<style scoped>
.count {
  font-variant-numeric: tabular-nums;
}
</style>
