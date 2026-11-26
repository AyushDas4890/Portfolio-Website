<script setup lang="ts">
import { getProject } from '~/data'

const route = useRoute()
const p = getProject(String(route.params.slug))
if (!p) throw createError({ statusCode: 404, statusMessage: 'Project not found', fatal: true })

usePageScene({ dark: 1, relief: 0.35, ink: false })
useHead({ title: `${p.title} · Backstage — Ayush Das` })

// Each beat: one narration line and a few floating pieces of the process.
const pool = [
  ...p.media.reels.map((r) => ({ src: r.src, poster: r.poster, alt: r.caption })),
  ...p.media.screens.map((s) => ({ src: s.src, poster: null, alt: s.caption })),
  ...p.features.map((f) => ({ src: f.screen, poster: null, alt: f.title })),
]
const unique = pool.filter((m, k) => pool.findIndex((x) => x.src === m.src) === k)
const lines = [...p.backstage, `${p.next[0]}`]
const layouts = [
  [{ x: 6, y: 12, w: 20, d: 0.6 }, { x: 30, y: 54, w: 15, d: 1.3 }, { x: 72, y: 18, w: 18, d: 0.9 }],
  [{ x: 10, y: 52, w: 16, d: 1.2 }, { x: 40, y: 8, w: 22, d: 0.7 }, { x: 76, y: 58, w: 14, d: 1.5 }],
  [{ x: 4, y: 20, w: 24, d: 0.8 }, { x: 62, y: 10, w: 13, d: 1.4 }, { x: 70, y: 56, w: 20, d: 0.6 }],
]
const beats = lines.map((text, i) => ({
  text,
  items: layouts[i % layouts.length].map((l, k) => ({ ...l, media: unique[(i * 3 + k) % unique.length] })),
}))

const wrap = ref<HTMLElement | null>(null)
const track = ref<HTMLElement | null>(null)
const progress = ref(0)
// The narration line under the timeline follows whichever beat is in front.
const current = computed(() => Math.min(beats.length - 1, Math.floor(progress.value * beats.length * 0.999)))
let raf = 0
onMounted(() => {
  const loop = () => {
    if (wrap.value && track.value) {
      const r = wrap.value.getBoundingClientRect()
      const max = r.height - window.innerHeight
      const t = Math.min(1, Math.max(0, -r.top / Math.max(max, 1)))
      progress.value = t
      const dist = track.value.scrollWidth - window.innerWidth
      track.value.style.transform = `translate3d(${-t * dist}px, 0, 0)`
      const now = performance.now() / 1000
      track.value.querySelectorAll<HTMLElement>('[data-depth]').forEach((el, k) => {
        const d = parseFloat(el.dataset.depth || '1')
        // Depth parallax sideways, plus a slow float so the pieces never sit still.
        const y = Math.sin(now * 0.6 + k * 1.7) * 14 * d + (t - 0.5) * 120 * (d - 1)
        el.style.transform = `translate3d(${-(d - 1) * t * dist * 0.18}px, ${y}px, 0)`
      })
    }
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
})
onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>

<template>
  <main id="main" class="page backstage">
    <NuxtLink v-magnetic :to="`/projects/${p!.slug}`" class="backstage__close ui" data-cursor="Back to the project"><RollText text="Close" /></NuxtLink>
    <p class="backstage__title ui muted">{{ p!.title }} · Backstage</p>

    <div ref="wrap" class="backstage__wrap" :style="{ height: `${beats.length * 110 + 100}vh` }">
      <div class="backstage__sticky">
        <div class="backstage__line" aria-hidden="true"><span :style="{ transform: `scaleX(${progress})` }" /></div>
        <div ref="track" class="backstage__track">
          <section v-for="(b, i) in beats" :key="i" class="beat" :aria-label="`Step ${i + 1}`">
            <figure v-for="(it, k) in b.items" :key="k" class="beat__item" :data-depth="it.d" :style="{ left: `${it.x}%`, top: `${it.y}%`, width: `${it.w}vw` }">
              <MediaPlane :src="it.media.src" :poster="it.media.poster" :alt="it.media.alt" :ratio="k === 1 ? '4 / 5' : '16 / 10'" />
            </figure>
          </section>
        </div>
        <div class="backstage__narr" aria-live="polite">
          <TextReveal :key="current" as="p" mode="type" immediate class="serif" :text="beats[current].text" />
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.backstage {
  color: var(--fg);
}
.backstage__close {
  position: fixed;
  top: 50%;
  right: calc(var(--gutter) * 2);
  translate: 0 -50%;
  z-index: 61;
}
.backstage__narr {
  position: absolute;
  left: 50%;
  bottom: 12vh;
  width: min(40em, 80vw);
  transform: translateX(-50%);
  text-align: center;
  font-size: clamp(16px, 1.25vw, 22px);
  line-height: 1.4;
  z-index: 2;
}
.backstage__title {
  position: fixed;
  top: var(--gutter);
  left: var(--gutter);
  z-index: 5;
}
.backstage__sticky {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
}
.backstage__line {
  position: absolute;
  left: var(--gutter);
  right: var(--gutter);
  top: 50%;
  height: 1px;
  background: var(--line);
}
.backstage__line span {
  display: block;
  height: 100%;
  background: var(--accent);
  transform-origin: left;
}
.backstage__track {
  display: flex;
  height: 100%;
  will-change: transform;
}
.beat {
  position: relative;
  flex: 0 0 auto;
  width: 110vw;
  height: 100%;
}
.beat:first-child {
  margin-left: 20vw;
}
.beat__item {
  position: absolute;
  will-change: transform;
}
@media (max-width: 760px) {
  .beat {
    width: 160vw;
  }
  .beat__item {
    width: 46vw !important;
  }
}
</style>
