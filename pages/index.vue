<script setup lang="ts">
import { projects, profile } from '~/data'

usePageScene({ dark: 0, relief: 1, ink: false })
useHead({ title: 'Ayush Das — AI/ML Engineer' })

const ready = useIntroDone()
const lead = projects.find((p) => p.slug === 'c4future') ?? projects[0]

/**
 * Each project is told as a small collage: one moving piece and two stills at
 * different sizes and depths, plus a serif caption. Positions are in percent of
 * the collage box; speed drives the parallax drift (negative rushes past).
 */
type Spot = { l: number; t: number; w: number; s: number; r: string }
const layouts: { pieces: Spot[]; cap: { l: number; t: number } }[] = [
  {
    pieces: [
      { l: 8, t: 10, w: 44, s: 0.08, r: '16 / 10' },
      { l: 60, t: 0, w: 19, s: -0.3, r: '4 / 5' },
      { l: 70, t: 56, w: 15, s: 0.35, r: '16 / 10' },
    ],
    cap: { l: 8, t: 74 },
  },
  {
    pieces: [
      { l: 44, t: 8, w: 46, s: 0.08, r: '16 / 10' },
      { l: 8, t: 0, w: 22, s: 0.3, r: '4 / 5' },
      { l: 22, t: 60, w: 15, s: -0.25, r: '16 / 10' },
    ],
    cap: { l: 52, t: 72 },
  },
  {
    pieces: [
      { l: 24, t: 14, w: 40, s: 0.06, r: '16 / 10' },
      { l: 70, t: 2, w: 17, s: -0.35, r: '4 / 5' },
      { l: 4, t: 58, w: 14, s: 0.4, r: '16 / 10' },
    ],
    cap: { l: 68, t: 64 },
  },
]

const collages = projects.map((p, i) => {
  const stills = [...p.media.screens.map((s) => s.src), ...p.features.map((f) => f.screen)].filter((s) => s !== p.media.poster)
  const sources = [
    { src: p.media.loop || p.media.poster, poster: p.media.poster },
    { src: stills[0] ?? p.media.poster, poster: null },
    { src: stills[1] ?? stills[0] ?? p.media.poster, poster: null },
  ]
  const L = layouts[i % layouts.length]
  return { p, cap: L.cap, pieces: L.pieces.map((spot, k) => ({ ...spot, ...sources[k] })) }
})

// Scroll choreography: depth drift on every [data-speed], the lead film opening up.
const root = useMotion(({ root, gsap }) => {
  parallax(root)
  const film = root.querySelector<HTMLElement>('.lead__frame')
  if (film) {
    gsap.fromTo(film, { scale: 0.72 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: film, start: 'top bottom', end: 'center center', scrub: 0.8 } })
  }
  root.querySelectorAll<HTMLElement>('.collage').forEach((c) => {
    const main = c.querySelector('.piece--0')
    if (main) gsap.fromTo(main, { scale: 0.86 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: c, start: 'top bottom', end: 'center center', scrub: 0.8 } })
  })
})
</script>

<template>
  <main id="main" ref="root" class="page home">
    <section class="hero">
      <div class="hero__row">
        <p class="hero__brand ui"><Monogram /><span>Ayush Das</span></p>
        <h1 class="hero__title serif">AI/ML engineer turning noise into models</h1>
        <p class="hero__hint ui" :class="{ 'is-on': ready }"><span class="hint--fine">Move</span><span class="hint--touch">Touch</span> to reveal · Scroll down</p>
      </div>
    </section>

    <section class="statement">
      <ScrubWords as="h2" class="statement__text serif" :text="profile.statement" :accent="['real', 'trust']" />
    </section>

    <section class="lead" aria-label="Showreel">
      <NuxtLink :to="`/projects/${lead.slug}`" class="lead__frame" data-cursor="Discover project" :aria-label="`${lead.title} case study`">
        <MediaPlane :src="lead.media.loop || lead.media.poster" :poster="lead.media.poster" :alt="`${lead.title} film`" ratio="16 / 9" />
      </NuxtLink>
    </section>

    <section class="approach">
      <p class="ui muted approach__label">My approach</p>
      <ScrubWords
        as="h2"
        class="approach__text serif"
        text="I measure before I claim. Honest metrics, failure handling that keeps a run alive, and interfaces that make a model easy to trust."
        :accent="['measure', 'trust']"
      />
      <NuxtLink v-magnetic="0.3" to="/studio/approach" class="ui approach__cta"><RollText text="Read the approach" /></NuxtLink>
    </section>

    <section class="collages" aria-label="Selected projects">
      <article v-for="c in collages" :key="c.p.slug" class="collage">
        <NuxtLink
          v-for="(pc, k) in c.pieces"
          :key="k"
          :to="`/projects/${c.p.slug}`"
          class="piece"
          :class="`piece--${k}`"
          :data-speed="pc.s"
          data-cursor="Discover project"
          :tabindex="k ? -1 : 0"
          :aria-label="k ? undefined : `${c.p.title} case study`"
          :aria-hidden="k ? 'true' : undefined"
          :style="{ left: `${pc.l}%`, top: `${pc.t}%`, width: `${pc.w}vw` }"
        >
          <MediaPlane :src="pc.src" :poster="pc.poster" :alt="k ? '' : `${c.p.title} preview`" :ratio="pc.r" />
        </NuxtLink>
        <TextReveal class="collage__caption serif" :text="c.p.home" :style="{ left: `${c.cap.l}%`, top: `${c.cap.t}%` }" />
      </article>
    </section>

    <section class="stats" aria-label="In numbers">
      <div v-for="s in profile.stats" :key="s.label" class="stat">
        <p class="stat__value serif"><CountUp :value="s.value" /></p>
        <p class="ui muted">{{ s.label }}</p>
      </div>
    </section>

    <SiteFooter />
  </main>
</template>

<style scoped>
.hero {
  height: 100svh;
  display: flex;
  align-items: center;
  padding: 0 var(--gutter);
}
.hero__row {
  width: 100%;
  display: grid;
  grid-template-columns: 2fr 5fr 2fr;
  align-items: center;
  gap: 24px;
}
.hero__brand {
  display: flex;
  align-items: center;
  gap: 12px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}
.hero__title {
  font-size: clamp(22px, 1.667vw, 30px);
}
.hero__hint {
  justify-self: end;
  color: var(--muted);
  opacity: 0;
  translate: 0 10px;
  transition: opacity 1s var(--ease-out) 0.3s, translate 1.2s var(--ease-out) 0.3s;
}
.hero__hint.is-on {
  opacity: 1;
  translate: 0 0;
}

.statement {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 0 var(--gutter) 0 calc(var(--gutter) + 8.33vw);
}
.statement__text {
  font-size: var(--fs-title);
  line-height: 1.16;
  max-width: 17em;
}

.lead {
  padding: 4vh var(--gutter) 24vh;
  display: flex;
  justify-content: center;
}
.lead__frame {
  display: block;
  width: min(86vw, 1500px);
  overflow: hidden;
  will-change: transform;
}

.approach {
  min-height: 100vh;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 30px;
  text-align: center;
  padding: 0 var(--gutter);
}
.approach__text {
  font-size: var(--fs-title);
  line-height: 1.16;
  max-width: 19em;
}


.collages {
  display: grid;
  gap: 14vh;
  padding: 10vh 0 26vh;
}
.collage {
  position: relative;
  height: max(105vh, 62vw);
}
.piece {
  position: absolute;
  display: block;
  will-change: transform;
}
.piece--0 {
  z-index: 1;
}
.collage__caption {
  position: absolute;
  width: min(30vw, 30em);
  font-size: var(--fs-lead);
  line-height: 1.2;
  z-index: 2;
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--gutter);
  padding: 10vh var(--gutter);
  border-top: 1px solid var(--line);
  margin: 0 var(--gutter);
}
.stat__value {
  font-size: var(--fs-display);
  margin-bottom: 8px;
}

@media (max-width: 860px) {
  .hero__row {
    grid-template-columns: 1fr;
  }
  .hero__hint {
    justify-self: start;
  }
  .statement {
    padding-left: var(--gutter);
    min-height: 80vh;
  }
  .lead__frame {
    width: 100%;
  }
  .collages {
    gap: 18vh;
    padding: 0 var(--gutter) 20vh;
  }
  .collage {
    height: auto;
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 16px;
  }
  .piece,
  .collage__caption {
    position: static;
    width: auto !important;
  }
  .piece--0 {
    grid-column: 1 / -1;
  }
  .piece--1 {
    grid-column: 1 / span 3;
  }
  .piece--2 {
    grid-column: 4 / span 3;
    align-self: end;
  }
  .collage__caption {
    grid-column: 1 / -1;
    margin-top: 12px;
  }
  .stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
.hint--touch {
  display: none;
}
@media (hover: none) {
  .hint--fine {
    display: none;
  }
  .hint--touch {
    display: inline;
  }
}
</style>
