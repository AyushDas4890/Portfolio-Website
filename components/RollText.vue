<script setup lang="ts">
/**
 * Hover text roll: letters slide up out of view while a second copy rises in,
 * one after another. Purely CSS, triggered by hovering the nearest link/button.
 */
const props = defineProps<{ text: string }>()
const chars = computed(() => [...props.text])
</script>

<template>
  <span class="roll">
    <span class="sr-only">{{ text }}</span>
    <span class="roll__line" aria-hidden="true">
      <span v-for="(c, i) in chars" :key="i" class="roll__c" :style="{ '--i': i }">{{ c === ' ' ? ' ' : c }}</span>
    </span>
    <span class="roll__line roll__line--b" aria-hidden="true">
      <span v-for="(c, i) in chars" :key="i" class="roll__c" :style="{ '--i': i }">{{ c === ' ' ? ' ' : c }}</span>
    </span>
  </span>
</template>

<style scoped>
.roll {
  position: relative;
  display: inline-block;
  overflow: hidden;
  vertical-align: bottom;
  line-height: 1.15;
}
.roll__line {
  display: block;
  white-space: nowrap;
}
.roll__line--b {
  position: absolute;
  inset: 0;
}
.roll__c {
  display: inline-block;
  transition: transform 0.7s var(--ease-out);
  transition-delay: calc(var(--i) * 18ms);
}
.roll__line--b .roll__c {
  transform: translateY(110%);
  color: var(--accent);
}
:is(a, button):hover .roll__line:not(.roll__line--b) .roll__c,
.roll:hover .roll__line:not(.roll__line--b) .roll__c {
  transform: translateY(-110%);
}
:is(a, button):hover .roll__line--b .roll__c,
.roll:hover .roll__line--b .roll__c {
  transform: translateY(0);
}
@media (prefers-reduced-motion: reduce) {
  .roll__c {
    transition: none;
  }
}
</style>
