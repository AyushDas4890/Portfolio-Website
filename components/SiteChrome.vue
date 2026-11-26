<script setup lang="ts">
/** Fixed corners: Menu/Close + monogram (top right), See all projects (bottom left), sound + scroll ring (bottom right). */
const open = useMenuOpen()
const route = useRoute()
const { on: soundOn, toggle: toggleSound, play } = useSound()
const progress = ref(0)
// Static hosts may add a trailing slash, so compare without it.
const path = computed(() => route.path.replace(/\/+$/, '') || '/')
const onProjects = computed(() => path.value === '/projects')
// Project pages keep only their own centred "Back", like the list.
const onStudy = computed(() => path.value.startsWith('/projects/'))
const onHome = computed(() => path.value === '/')
const ready = useIntroDone()
const scrolled = ref(false)

let off: (() => void) | null = null
onMounted(() => {
  const lenis = useLenis()
  if (!lenis) return
  const fn = () => {
    progress.value = lenis.progress || 0
    scrolled.value = lenis.scroll > window.innerHeight * 0.5
  }
  lenis.on('scroll', fn)
  off = () => lenis.off('scroll', fn)
})
onBeforeUnmount(() => off?.())

const circ = 2 * Math.PI * 9
const toggle = () => {
  play()
  open.value = !open.value
}
</script>

<template>
  <div class="chrome ui" :class="{ 'is-ready': ready }">
    <div v-if="!onStudy && !onProjects" class="chrome__top">
      <button v-magnetic type="button" class="chrome__menu" :aria-expanded="open" aria-controls="menu" data-cursor="" @click="toggle">
        <span class="chrome__swap" :class="{ 'is-open': open }">
          <span>Menu</span>
          <span>Close</span>
        </span>
      </button>
      <NuxtLink to="/" class="chrome__mark" :class="{ 'is-hidden': onHome && !scrolled && !open }" aria-label="Ayush Das, home" @click="open = false">
        <Monogram />
      </NuxtLink>
    </div>

    <NuxtLink v-if="!onProjects && !onStudy" v-magnetic="0.25" to="/projects" class="chrome__all" @click="open = false">
      <span class="chrome__grid" aria-hidden="true"><i /><i /><i /><i /></span>
      <RollText text="See all projects" />
    </NuxtLink>

    <div class="chrome__br">
      <button type="button" class="chrome__sound" :aria-pressed="soundOn" @click="toggleSound">
        <span class="muted">Sound</span>
        <span class="chrome__bars" :class="{ 'is-on': soundOn }" aria-hidden="true"><i /><i /><i /><i /></span>
        <span class="sr-only">{{ soundOn ? 'on' : 'off' }}</span>
      </button>
      <svg class="chrome__ring" viewBox="0 0 22 22" aria-hidden="true">
        <circle cx="11" cy="11" r="9" class="chrome__track" />
        <circle cx="11" cy="11" r="9" class="chrome__progress" :stroke-dasharray="circ" :stroke-dashoffset="circ * (1 - progress)" />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.chrome {
  position: fixed;
  inset: 0;
  z-index: 60;
  pointer-events: none;
}
.chrome > *,
.chrome__top > * {
  pointer-events: auto;
}
/* Corners arrive once the intro has finished, each from its own edge. */
.chrome__top,
.chrome__all,
.chrome__br {
  opacity: 0;
  transition: opacity 0.9s var(--ease-out), translate 1.2s var(--ease-out);
}
.chrome__top {
  translate: 0 -16px;
}
.chrome__all {
  translate: -16px 0;
  transition-delay: 0.12s;
}
.chrome__br {
  translate: 16px 0;
  transition-delay: 0.24s;
}
.chrome.is-ready .chrome__top,
.chrome.is-ready .chrome__all,
.chrome.is-ready .chrome__br {
  opacity: 1;
  translate: 0 0;
}
.chrome__top {
  position: absolute;
  top: var(--gutter);
  right: var(--gutter);
  display: flex;
  align-items: center;
  gap: 14px;
}
.chrome__menu {
  height: 1.3em;
  overflow: hidden;
}
.chrome__swap {
  display: flex;
  flex-direction: column;
  transition: transform 0.7s var(--ease-out);
}
.chrome__swap.is-open {
  transform: translateY(-50%);
}
.chrome__swap span {
  height: 1.3em;
  line-height: 1.3em;
}
.chrome__mark {
  display: flex;
  font-size: 14px;
  transition: opacity 0.6s var(--ease-out), transform 0.8s var(--ease-out);
}
.chrome__mark.is-hidden {
  opacity: 0;
  transform: translateX(10px) rotate(-30deg);
  pointer-events: none;
}
.chrome__all {
  position: absolute;
  left: var(--gutter);
  bottom: var(--gutter);
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.chrome__all {
  gap: 10px;
}
/* Four tiles that keep shuffling places; they spread apart on hover. */
.chrome__grid {
  position: relative;
  width: 11px;
  height: 11px;
}
.chrome__grid i {
  position: absolute;
  width: 4px;
  height: 4px;
  background: currentColor;
  animation: tiles 3.2s var(--ease-sine) infinite;
  transition: translate 0.5s var(--ease-out);
}
.chrome__grid i:nth-child(1) { left: 0; top: 0; }
.chrome__grid i:nth-child(2) { right: 0; top: 0; animation-delay: -0.8s; background: var(--accent); }
.chrome__grid i:nth-child(3) { right: 0; bottom: 0; animation-delay: -1.6s; }
.chrome__grid i:nth-child(4) { left: 0; bottom: 0; animation-delay: -2.4s; }
@keyframes tiles {
  0%, 100% { transform: scale(1) rotate(0); }
  25% { transform: scale(0.4) rotate(45deg); }
  50% { transform: scale(1) rotate(90deg); }
}
.chrome__all:hover .chrome__grid i:nth-child(1) { translate: -2px -2px; }
.chrome__all:hover .chrome__grid i:nth-child(2) { translate: 2px -2px; }
.chrome__all:hover .chrome__grid i:nth-child(3) { translate: 2px 2px; }
.chrome__all:hover .chrome__grid i:nth-child(4) { translate: -2px 2px; }
.chrome__br {
  position: absolute;
  right: var(--gutter);
  bottom: var(--gutter);
  display: flex;
  align-items: center;
  gap: 18px;
}
.chrome__sound {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.chrome__bars {
  display: inline-flex;
  align-items: flex-end;
  gap: 2px;
  height: 10px;
}
.chrome__bars i {
  width: 1px;
  height: 2px;
  background: currentColor;
  transition: height 0.4s;
}
.chrome__bars.is-on i {
  background: var(--accent);
  animation: bar 1.1s var(--ease-sine) infinite alternate;
}
.chrome__bars.is-on i:nth-child(2) {
  animation-delay: -0.3s;
}
.chrome__bars.is-on i:nth-child(3) {
  animation-delay: -0.6s;
}
.chrome__bars.is-on i:nth-child(4) {
  animation-delay: -0.9s;
}
@keyframes bar {
  from {
    height: 2px;
  }
  to {
    height: 10px;
  }
}
.chrome__ring {
  width: 22px;
  height: 22px;
  transform: rotate(-90deg);
}
.chrome__ring circle {
  fill: none;
  stroke: var(--accent);
  stroke-width: 0.8;
}
.chrome__track {
  opacity: 0.2;
}
@media (max-width: 640px) {
  .chrome__sound .muted {
    display: none;
  }
}
</style>
