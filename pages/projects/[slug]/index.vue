<script setup lang="ts">
import { projects, getProject } from '~/data'

const route = useRoute()
const project = computed(() => getProject(String(route.params.slug)))
if (!project.value) throw createError({ statusCode: 404, statusMessage: 'Project not found', fatal: true })
const p = project.value!

useHead({ title: `${p.title} — Ayush Das`, meta: [{ name: 'description', content: p.summary }] })

const i = projects.findIndex((x) => x.slug === p.slug)
usePageScene({ dark: 0, relief: 0.7, ink: false })
const prev = projects[(i - 1 + projects.length) % projects.length]
const next = projects[(i + 1) % projects.length]
// Screens laid out like a magazine spread: alternating offsets and widths.
const spots = ['s1', 's2', 's3', 's4', 's5', 's6']
const heroMedia = p.media.loop || p.media.poster
const appLabel = (p as any).appLabel || 'Open app'
const liveLabel = (p as any).liveLabel || 'Launch website'

// Scroll choreography: the headline drifts up and dims as the lead film grows
// into the frame; the screens drift at their own depths.
const root = useMotion(({ root, gsap }) => {
  parallax(root)
  const hero = root.querySelector('.case__hero')
  const film = root.querySelector('.case__lead')
  if (hero) gsap.to(hero.querySelectorAll('.case__headline, .case__ctas'), { yPercent: -60, opacity: 0.15, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } })
  if (film) gsap.fromTo(film, { scale: 0.8 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: film, start: 'top bottom', end: 'center center', scrub: 0.8 } })
})
</script>

<template>
  <main id="main" ref="root" class="page case">
    <header class="case__top">
      <NuxtLink v-magnetic to="/projects" class="ui"><RollText text="Back" /></NuxtLink>
    </header>

    <section class="case__hero">
      <TextReveal as="h1" mode="blur" class="case__headline serif" :text="p.headline" immediate :delay="300" />
      <div class="case__ctas ui">
        <a :href="p.live" target="_blank" rel="noreferrer" class="line-link">{{ liveLabel }}</a>
        <a v-if="p.app" :href="p.app" target="_blank" rel="noreferrer" class="line-link is-quiet">{{ appLabel }}</a>
        <a :href="p.repo" target="_blank" rel="noreferrer" class="line-link is-quiet">Source</a>
      </div>
      <NuxtLink v-magnetic="0.3" :to="`/projects/${p.slug}/backstage`" class="case__backstage ui" data-cursor="Watch the process">
        <RollText text="See backstage" />
        <svg class="case__arrow" viewBox="0 0 10 10" width="9" height="9" aria-hidden="true"><path d="M1 9 L9 1 M3 1 H9 V7" fill="none" stroke="currentColor" stroke-width="1" /></svg>
      </NuxtLink>
    </section>

    <section class="case__lead">
      <MediaPlane :src="heroMedia" :poster="p.media.poster" :alt="`${p.title}`" ratio="16 / 9" eager />
    </section>

    <section class="case__intro">
      <TextReveal class="case__summary serif" :text="p.summary" />
      <div class="case__detail">
        <TextReveal class="case__body" :text="p.problem" />
        <TextReveal class="case__body" :text="p.why" :delay="120" />
        <ul class="case__services serif" aria-label="Services">
          <li v-for="s in p.services" :key="s">{{ s }}</li>
        </ul>
        <p class="ui muted">{{ p.role }} · {{ p.tags.join(', ') }}</p>
      </div>
    </section>

    <section class="case__spread" aria-label="Screens">
      <figure v-for="(s, k) in p.media.screens.slice(0, 6)" :key="s.src" class="shot" :class="spots[k]" :data-speed="[0.1, -0.3, 0.2, 0.35, -0.15, 0.25][k]">
        <MediaPlane :src="s.src" :alt="s.caption" :ratio="k % 3 === 1 ? '4 / 5' : '16 / 10'" />
        <figcaption class="ui muted">{{ s.caption }}</figcaption>
      </figure>
    </section>

    <section class="case__features">
      <article v-for="(f, k) in p.features" :key="f.title" class="feat" :class="{ 'is-flip': k % 2 }">
        <div class="feat__media"><MediaPlane :src="f.screen" :alt="f.title" ratio="16 / 10" /></div>
        <div class="feat__text">
          <p class="ui muted">{{ String(k + 1).padStart(2, '0') }}</p>
          <TextReveal as="h3" class="feat__title serif" :text="f.title" />
          <TextReveal class="feat__body" :text="f.body" :delay="100" />
        </div>
      </article>
    </section>

    <section class="case__metrics" aria-label="Results">
      <div v-for="m in p.metrics" :key="m.label" class="metric">
        <p class="metric__value serif"><CountUp :value="m.value" /></p>
        <p class="ui muted">{{ m.label }}</p>
      </div>
    </section>

    <section class="case__arch">
      <p class="ui muted">How it works</p>
      <TextReveal class="case__archcap serif" :text="p.architecture.caption" />
      <ol class="flow">
        <li v-for="(s, k) in p.architecture.steps" :key="s.label" class="flow__step">
          <span class="ui muted">{{ String(k + 1).padStart(2, '0') }}</span>
          <span class="serif flow__label">{{ s.label }}</span>
          <span class="ui">{{ s.detail }}</span>
        </li>
      </ol>
    </section>

    <section class="case__next">
      <p class="ui muted">Next</p>
      <ul class="serif">
        <li v-for="n in p.next" :key="n">{{ n }}</li>
      </ul>
    </section>

    <nav class="case__nav ui" aria-label="More projects">
      <NuxtLink v-magnetic="0.15" :to="`/projects/${next.slug}`" class="case__nextlink" data-cursor="Next project">
        <span class="muted">See next project</span>
        <span class="serif case__nexttitle"><RollText :text="next.title" /></span>
      </NuxtLink>
      <div class="case__navrow">
        <NuxtLink :to="`/projects/${prev.slug}`" class="line-link is-quiet">Previous · {{ prev.title }}</NuxtLink>
        <NuxtLink to="/projects" class="line-link is-quiet">All projects</NuxtLink>
      </div>
    </nav>
  </main>
</template>

<style scoped>
.case {
  padding: 0 var(--gutter);
}
.case__top {
  display: flex;
  justify-content: center;
  padding: var(--gutter) 0;
}
.case__hero {
  position: relative;
  min-height: 78vh;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 28px;
  text-align: center;
}
.case__headline {
  font-size: var(--fs-display);
  max-width: 13em;
  line-height: 1.06;
}
.case__ctas {
  display: flex;
  gap: 22px;
}
.case__backstage {
  position: absolute;
  right: 0;
  top: 50%;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
/* The arrow keeps turning, stepping between headings like a compass needle. */
.case__arrow {
  animation: needle 4.8s cubic-bezier(0.7, 0, 0.2, 1) infinite;
}
@keyframes needle {
  0%, 18% { transform: rotate(0deg); }
  25%, 43% { transform: rotate(135deg); }
  50%, 68% { transform: rotate(-45deg); }
  75%, 93% { transform: rotate(-135deg); }
  100% { transform: rotate(-360deg); }
}
.case__lead {
  width: min(84vw, 1500px);
  margin: 0 auto 26vh;
  will-change: transform;
}
.case__intro {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: var(--gutter);
  margin-bottom: 30vh;
}
.case__summary {
  grid-column: 2 / span 5;
  font-size: var(--fs-lead);
  line-height: 1.2;
}
.case__detail {
  grid-column: 8 / span 4;
  display: grid;
  gap: 20px;
}
.case__services {
  font-size: clamp(17px, 1.25vw, 22px);
  line-height: 1.4;
  margin: 10px 0;
}

.case__spread {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 16vh var(--gutter);
  margin-bottom: 30vh;
}
.shot figcaption {
  margin-top: 12px;
  max-width: 34em;
}
.s1 {
  grid-column: 2 / span 6;
}
.s2 {
  grid-column: 9 / span 3;
  margin-top: 30vh;
}
.s3 {
  grid-column: 4 / span 5;
}
.s4 {
  grid-column: 1 / span 4;
  margin-top: 10vh;
}
.s5 {
  grid-column: 7 / span 6;
}
.s6 {
  grid-column: 3 / span 4;
}

.case__features {
  display: grid;
  gap: 26vh;
  margin-bottom: 30vh;
}
.feat {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: var(--gutter);
  align-items: center;
}
.feat__media {
  grid-column: 2 / span 6;
}
.feat__text {
  grid-column: 9 / span 3;
  display: grid;
  gap: 16px;
}
.feat.is-flip .feat__media {
  grid-column: 6 / span 6;
  grid-row: 1;
}
.feat.is-flip .feat__text {
  grid-column: 2 / span 3;
  grid-row: 1;
}
.feat__title {
  font-size: var(--fs-lead);
}

.case__metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--gutter);
  border-top: 1px solid var(--line);
  padding: 8vh 0 26vh;
}
.metric__value {
  font-size: var(--fs-display);
  margin-bottom: 10px;
}

.case__arch {
  display: grid;
  justify-items: center;
  text-align: center;
  gap: 26px;
  margin-bottom: 30vh;
}
.case__archcap {
  font-size: var(--fs-title);
  max-width: 18em;
}
.flow {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--gutter);
  width: 100%;
  margin-top: 6vh;
  text-align: left;
}
.flow__step {
  display: grid;
  gap: 8px;
  align-content: start;
  padding-top: 16px;
  border-top: 1px solid var(--line);
}
.flow__label {
  font-size: clamp(18px, 1.39vw, 24px);
}

.case__next {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: var(--gutter);
  margin-bottom: 26vh;
}
.case__next > p {
  grid-column: 2 / span 2;
}
.case__next ul {
  grid-column: 5 / span 6;
  display: grid;
  gap: 14px;
  font-size: var(--fs-lead);
  line-height: 1.2;
}

.case__nav {
  display: grid;
  justify-items: center;
  gap: 12vh;
  padding: 14vh 0 calc(var(--gutter) * 4.5);
  border-top: 1px solid var(--line);
}
.case__nextlink {
  display: grid;
  justify-items: center;
  gap: 18px;
  text-align: center;
}
.case__nexttitle {
  font-size: clamp(48px, 7vw, 130px);
  line-height: 1;
}
.case__navrow {
  display: flex;
  gap: 32px;
}

@media (max-width: 860px) {
  .case__backstage {
    position: static;
  }
  .case__lead {
    width: 100%;
  }
  .case__summary,
  .case__detail,
  .shot,
  .feat__media,
  .feat__text,
  .case__next > p,
  .case__next ul {
    grid-column: 1 / -1 !important;
    grid-row: auto !important;
    margin-top: 0 !important;
  }
  .case__metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .flow {
    grid-template-columns: 1fr;
  }
}
</style>
