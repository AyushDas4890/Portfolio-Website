<script setup lang="ts">
import { animate, stagger, cubicBezier } from 'animejs'
import { projects } from '~/data'

usePageScene({ dark: 0.4, relief: 0.6, ink: true })
useHead({ title: 'Projects — Ayush Das' })

/**
 * The index: category | title rows. Hovering a title underlines it, rolls its
 * letters, fades the other categories and shows the work in a fixed slot on the
 * left with its services underneath. Clicking a category filters by it.
 */
const filter = ref<string | null>(null)
const active = ref<string | null>(null)
const list = computed(() => (filter.value ? projects.filter((p) => p.category === filter.value) : projects))
const ease = cubicBezier(0.165, 0.84, 0.44, 1)
const { play } = useSound()

function setFilter(c: string | null) {
  play()
  filter.value = filter.value === c ? null : c
}

const listEl = ref<HTMLElement | null>(null)
function enterRows() {
  if (!listEl.value || useReducedMotion()) return
  animate(listEl.value.querySelectorAll('.plist__in'), { y: ['110%', '0%'], opacity: [0, 1], duration: 1100, delay: stagger(55), ease })
}
onMounted(() => {
  const intro = useIntroDone()
  if (intro.value) setTimeout(enterRows, 350)
  else watch(intro, (v) => v && enterRows(), { once: true })
})
watch(list, async () => {
  await nextTick()
  enterRows()
})
</script>

<template>
  <main id="main" class="page projects">
    <header class="projects__head">
      <NuxtLink v-magnetic to="/" class="ui"><RollText text="Back" /></NuxtLink>
    </header>

    <p class="projects__state ui" :class="{ 'is-on': filter }">
      <span class="muted">Filtered by</span> {{ filter }}
      <button type="button" class="line-link" @click="setFilter(null)">Show all</button>
    </p>

    <ol ref="listEl" class="plist" :class="{ 'has-hover': active }" @pointerleave="active = null">
      <li v-for="p in list" :key="p.slug" class="plist__row" :class="{ 'is-active': active === p.slug }">
        <span class="plist__mask">
          <button type="button" class="plist__cat plist__in ui" data-cursor="Click to filter" @click="setFilter(p.category)">{{ p.category }}</button>
        </span>
        <span class="plist__mask">
          <NuxtLink
            :to="`/projects/${p.slug}`"
            class="plist__title plist__in serif"
            data-cursor="Discover project"
            @pointerenter="active = p.slug"
            @focus="active = p.slug"
          >
            <RollText :text="p.title" />
          </NuxtLink>
        </span>
      </li>
    </ol>

    <div class="preview" aria-hidden="true">
      <div v-for="p in projects" :key="p.slug" class="preview__item" :class="{ 'is-on': active === p.slug }">
        <div class="preview__media"><img :src="p.media.poster" alt="" loading="lazy" /></div>
        <p class="preview__cap ui">{{ p.services.slice(0, 4).join(', ') }}</p>
      </div>
    </div>
  </main>
</template>

<style scoped>
.projects {
  min-height: 100vh;
  padding: 0 var(--gutter) 20vh;
}
.projects__head {
  position: sticky;
  top: 0;
  display: flex;
  justify-content: center;
  padding: var(--gutter) 0;
  z-index: 3;
}
.projects__state {
  margin: 14vh 0 3vh 38vw;
  height: 1.4em;
  display: flex;
  gap: 10px;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.5s, transform 0.6s var(--ease-out);
}
.projects__state.is-on {
  opacity: 1;
  transform: none;
}
.plist {
  margin-left: 38vw;
}
.plist__row {
  display: grid;
  grid-template-columns: 13vw minmax(0, 1fr);
  align-items: baseline;
  gap: var(--gutter);
}
.plist__mask {
  display: block;
  overflow: hidden;
  padding: 2px 0;
}
.plist__in {
  display: inline-block;
}
.plist__cat {
  color: var(--muted);
  transition: opacity 0.5s var(--ease-out), color 0.4s;
}
.plist__cat:hover {
  color: var(--accent);
}
.plist.has-hover .plist__row:not(.is-active) .plist__cat {
  opacity: 0.25;
}
.plist__title {
  position: relative;
  font-size: clamp(22px, 1.667vw, 30px);
  line-height: 1.45;
}
.plist__title::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0.12em;
  height: 1px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.7s var(--ease-out);
}
.plist__row.is-active .plist__title::after {
  transform: scaleX(1);
  transform-origin: left;
}

/* Fixed slot on the left, like a plate beside the index. */
.preview {
  position: fixed;
  left: 6vw;
  top: 50%;
  width: 23vw;
  transform: translateY(-50%);
  pointer-events: none;
  z-index: 4;
}
.preview__item {
  position: absolute;
  inset: 0 0 auto 0;
}
.preview__media {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  clip-path: inset(50% 0 50% 0);
  transition: clip-path 0.9s var(--ease-out);
}
.preview__item.is-on .preview__media {
  clip-path: inset(0 0 0 0);
}
.preview__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.3);
  filter: grayscale(0.6) contrast(1.05);
  transition: transform 1.4s var(--ease-out), filter 1.2s;
}
.preview__item.is-on .preview__media img {
  transform: scale(1);
  filter: none;
}
.preview__cap {
  margin-top: 12px;
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.4s, transform 0.6s var(--ease-out);
}
.preview__item.is-on .preview__cap {
  opacity: 1;
  transform: none;
  transition-delay: 0.2s;
}
html:not(.has-cursor) .preview {
  display: none;
}
@media (max-width: 900px) {
  .plist,
  .projects__state {
    margin-left: 0;
  }
  .plist__row {
    grid-template-columns: 110px minmax(0, 1fr);
  }
}
</style>
