<script setup lang="ts">
/**
 * The page-change curtain: a dark panel with a soft, bulging leading edge rises
 * over the old page (a brass seam glowing on that edge), the destination's name
 * surfaces through blur, then the panel lifts away off the top. app.vue drives
 * it through usePageCurtain(). Moving the panel with transforms keeps the seam
 * glued to the edge the whole way.
 */
const curtain = usePageCurtain()
</script>

<template>
  <div class="curtain" :class="curtain.state" aria-hidden="true">
    <div class="curtain__panel">
      <span class="curtain__seam curtain__seam--top" />
      <span class="curtain__seam curtain__seam--bottom" />
      <div class="curtain__copy">
        <p class="curtain__kicker ui">Loading</p>
        <p class="curtain__label serif">{{ curtain.label }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.curtain {
  position: fixed;
  inset: 0;
  z-index: 150;
  pointer-events: none;
  overflow: hidden;
}
.curtain__panel {
  position: absolute;
  left: -2vw;
  right: -2vw;
  top: 0;
  height: 100%;
  background: var(--abyss);
  transform: translate3d(0, 112%, 0);
  border-radius: 50% 50% 0 0 / 22vh 22vh 0 0;
  display: grid;
  place-items: center;
}
.curtain__seam {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--accent);
  box-shadow: 0 0 28px 3px rgba(201, 162, 107, 0.55);
  opacity: 0;
  transition: opacity 0.4s;
}
.curtain__seam--top {
  top: 0;
  border-radius: inherit;
}
.curtain__seam--bottom {
  bottom: 0;
}
.curtain__copy {
  display: grid;
  justify-items: center;
  gap: 14px;
}
.curtain__kicker {
  color: var(--muted);
  opacity: 0;
  transform: translateY(12px);
}
.curtain__label {
  font-size: clamp(40px, 6vw, 110px);
  font-style: italic;
  line-height: 1;
  color: var(--fg);
  opacity: 0;
  transform: translateY(40%) scale(1.08);
  filter: blur(14px);
}
/* in: the panel rises from below, its bulge flattening as it covers the page */
.curtain.is-in .curtain__panel {
  transform: translate3d(0, 0, 0);
  border-radius: 0;
  transition:
    transform 0.8s cubic-bezier(0.77, 0, 0.175, 1),
    border-radius 0.8s cubic-bezier(0.77, 0, 0.175, 1);
}
.curtain.is-in .curtain__seam--top {
  opacity: 1;
}
.curtain.is-in .curtain__kicker {
  opacity: 1;
  transform: none;
  transition: opacity 0.5s 0.35s, transform 0.8s 0.35s var(--ease-out);
}
.curtain.is-in .curtain__label {
  opacity: 1;
  transform: none;
  filter: blur(0);
  transition:
    opacity 0.6s 0.4s,
    transform 1s 0.35s var(--ease-out),
    filter 0.9s 0.35s;
}
/* out: it lifts off the top, the trailing edge bulging the other way */
.curtain.is-out .curtain__panel {
  transform: translate3d(0, -112%, 0);
  border-radius: 0 0 50% 50% / 0 0 22vh 22vh;
  transition:
    transform 1s cubic-bezier(0.77, 0, 0.175, 1) 0.1s,
    border-radius 1s cubic-bezier(0.77, 0, 0.175, 1) 0.1s;
}
.curtain.is-out .curtain__seam--bottom {
  opacity: 1;
}
.curtain.is-out .curtain__kicker,
.curtain.is-out .curtain__label {
  opacity: 0;
  transform: translateY(-60%);
  filter: blur(10px);
  transition: all 0.55s var(--ease-out);
}
@media (prefers-reduced-motion: reduce) {
  .curtain {
    display: none;
  }
}
</style>
