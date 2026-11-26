<script setup lang="ts">
import { chapters, getChapter, profile } from '~/data'

const route = useRoute()
const index = getChapter(String(route.params.chapter))
if (index < 0) throw createError({ statusCode: 404, statusMessage: 'Chapter not found', fatal: true })
const c = chapters[index]
const prev = chapters[index - 1]
const next = chapters[index + 1]

usePageScene({ dark: 1, relief: 0.3, ink: false })
useHead({ title: `${c.numeral}. ${c.title} — Ayush Das` })

const numeral = ref<HTMLElement | null>(null)
onMounted(async () => {
  await document.fonts?.ready
  useGl()?.bloom.setGlyph(numeral.value)
})
onBeforeUnmount(() => useGl()?.bloom.setGlyph(null))

// Scroll choreography: the numeral stays behind the reading and dims, each
// block slides in from its own side, and reaching the end loads the next chapter.
const router = useRouter()
const nextTo = next ? `/studio/${next.slug}` : '/projects'
const nextName = next ? next.numeral : 'the projects'
const loading = ref(0)
const root = useMotion(({ root, gsap, ScrollTrigger }) => {
  const wrap = root.querySelector('.numeral-wrap')
  const blocks = root.querySelector('.blocks')
  if (wrap && blocks) {
    gsap.to(wrap, { opacity: 0.16, scale: 0.86, ease: 'none', scrollTrigger: { trigger: blocks, start: 'top 90%', end: 'top 20%', scrub: true } })
  }
  root.querySelectorAll<HTMLElement>('.blocks > *').forEach((el, k) => {
    gsap.from(el, { x: k % 2 ? 120 : -120, opacity: 0, filter: 'blur(8px)', duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } })
  })
  // Auto-advance: once the end is fully in view and the scroll has settled, a
  // bar fills and the next chapter opens. Scrolling back cancels it.
  const foot = root.querySelector('.chapter__foot')
  if (!foot) return
  const o = { v: 0 }
  let run: gsap.core.Tween | null = null
  const start = () => {
    const lenis = useLenis()
    if (lenis && Math.abs(lenis.velocity) > 1) return void gsap.delayedCall(0.25, start)
    run?.kill()
    run = gsap.to(o, { v: 1, duration: 2.6, ease: 'none', onUpdate: () => (loading.value = o.v), onComplete: () => router.push(nextTo) })
  }
  const stop = () => {
    run?.kill()
    gsap.killTweensOf(start)
    gsap.to(o, { v: 0, duration: 0.5, onUpdate: () => (loading.value = o.v) })
  }
  ScrollTrigger.create({ trigger: foot, start: 'bottom bottom+=2', onEnter: start, onLeaveBack: stop })
})

const x = profile.experience[0]
const practices = [
  { title: 'Measure before claiming', body: 'Every model ships with a baseline beside it: a zero-shot model, a softmax head, a held-out split. A number without a comparison is a claim, not a result.' },
  { title: 'Fail softly', body: 'Agents retry with limits, pipelines skip a bad source instead of dying, and a run that breaks leaves a trace explaining why.' },
  { title: 'Show the uncertainty', body: 'Conformal intervals, Grad-CAM and SHAP turn a prediction into something you can argue with.' },
  { title: 'Write it down', body: 'Documentation good enough that someone else can run, reproduce and extend the system without asking me.' },
]
</script>

<template>
  <main id="main" ref="root" class="page chapter">
    <nav class="chapter__nav ui" aria-label="Chapters">
      <NuxtLink v-magnetic :to="prev ? `/studio/${prev.slug}` : '/'"><RollText text="Back" /></NuxtLink>
    </nav>

    <div class="numeral-pin" aria-hidden="true">
      <div class="numeral-wrap">
        <span ref="numeral" class="numeral serif">{{ c.numeral }}</span>
        <span class="numeral numeral--reflection serif">{{ c.numeral }}</span>
      </div>
    </div>

    <section class="chapter__hero">
      <div class="chapter__intro">
        <TextReveal as="h1" class="chapter__title serif" :text="c.title" immediate :delay="400" />
        <p class="ui muted">Chapter {{ c.numeral }} of V · Scroll down</p>
      </div>
    </section>

    <!-- I · The engineer -->
    <section v-if="c.slug === 'engineer'" class="blocks">
      <TextReveal class="block__lead serif" :text="profile.bio[0]" />
      <TextReveal class="block__body" :text="profile.bio[1]" />
      <dl class="facts ui">
        <div><dt class="muted">Education</dt><dd>{{ profile.education.degree }}, {{ profile.education.school }}</dd></div>
        <div><dt class="muted">Period</dt><dd>{{ profile.education.period }} · {{ profile.education.detail }}</dd></div>
        <div><dt class="muted">Focus</dt><dd>{{ profile.focus }}</dd></div>
        <div><dt class="muted">Based in</dt><dd>{{ profile.location }}</dd></div>
      </dl>
      <div class="figures">
        <div v-for="s in profile.stats" :key="s.label"><p class="serif figures__v">{{ s.value }}</p><p class="ui muted">{{ s.label }}</p></div>
      </div>
    </section>

    <!-- II · Approach -->
    <section v-else-if="c.slug === 'approach'" class="blocks">
      <TextReveal class="block__lead serif" text="My process begins with the question a model has to answer, and the number that would prove it answered well." />
      <article v-for="(pr, k) in practices" :key="pr.title" class="practice">
        <span class="ui muted">{{ String(k + 1).padStart(2, '0') }}</span>
        <TextReveal as="h2" class="practice__title serif" :text="pr.title" />
        <TextReveal class="block__body" :text="pr.body" :delay="100" />
      </article>
    </section>

    <!-- III · Skills -->
    <section v-else-if="c.slug === 'skills'" class="blocks">
      <TextReveal class="block__lead serif" text="Python first, then the whole path from data to a product someone can use." />
      <div v-for="g in profile.skills" :key="g.group" class="skill">
        <p class="ui muted">{{ g.group }}</p>
        <ul class="serif">
          <li v-for="s in g.items" :key="s">{{ s }}</li>
        </ul>
      </div>
    </section>

    <!-- IV · Recognition -->
    <section v-else-if="c.slug === 'recognition'" class="blocks">
      <TextReveal class="block__lead serif" text="Merged upstream, certified along the way." />
      <div class="awards">
        <p class="ui muted awards__head">Shipped</p>
        <ul>
          <li v-for="a in profile.achievements" :key="a.name" class="award">
            <a :href="a.link" target="_blank" rel="noreferrer" class="serif award__name line-link is-quiet">{{ a.name }}</a>
            <p class="ui muted">{{ a.meta }}</p>
            <p class="award__body">{{ a.body }}</p>
          </li>
        </ul>
      </div>
      <div class="awards">
        <p class="ui muted awards__head">Certifications</p>
        <ul>
          <li v-for="cert in profile.certifications" :key="cert.name" class="cert">
            <span class="ui muted cert__issuer">{{ cert.issuer }}</span>
            <a :href="cert.link" target="_blank" rel="noreferrer" class="serif cert__name line-link is-quiet">{{ cert.name }}</a>
            <span class="ui muted">{{ cert.date }}</span>
          </li>
        </ul>
      </div>
    </section>

    <!-- V · Experience -->
    <section v-else class="blocks">
      <p class="ui muted">{{ x.period }}</p>
      <TextReveal as="h2" class="block__lead serif" :text="`${x.role} at ${x.company}`" />
      <ol class="points">
        <li v-for="(pt, k) in x.points" :key="pt"><span class="ui muted">{{ String(k + 1).padStart(2, '0') }}</span><TextReveal :text="pt" :delay="k * 80" /></li>
      </ol>
      <div class="ui chapter__links">
        <a :href="x.cert" target="_blank" rel="noreferrer" class="line-link">Internship certificate</a>
        <a :href="profile.resume" target="_blank" rel="noreferrer" class="line-link is-quiet">Download résumé</a>
      </div>
    </section>

    <nav class="chapter__foot ui" aria-label="Next chapter">
      <NuxtLink v-magnetic="0.15" :to="nextTo" class="chapter__next" :data-cursor="next ? 'Next chapter' : 'See the work'">
        <span class="muted">Next</span>
        <span class="serif"><RollText :text="next ? next.title : 'See the projects'" /></span>
      </NuxtLink>
      <div class="chapter__loading" :class="{ 'is-on': loading > 0 }" aria-hidden="true">
        <span>Loading {{ nextName }}</span>
        <i><b :style="{ transform: `scaleX(${loading})` }" /></i>
      </div>
    </nav>
  </main>
</template>

<style scoped>
.chapter {
  color: var(--fg);
  padding: 0 var(--gutter);
}
.chapter__nav {
  display: flex;
  justify-content: center;
  padding: var(--gutter) 0;
}
.chapter__hero {
  position: relative;
  min-height: 92vh;
  display: grid;
  place-items: center;
}
/* The numeral stays pinned behind the whole chapter while it is read. */
.numeral-pin {
  position: sticky;
  top: calc(50vh - var(--fs-numeral) * 0.45);
  height: 0;
  display: grid;
  justify-items: center;
  z-index: 0;
}
.numeral-wrap {
  position: relative;
  display: grid;
  justify-items: center;
  will-change: transform, opacity;
}
.numeral {
  font-size: var(--fs-numeral);
  line-height: 0.9;
  font-weight: 300;
  color: var(--bone);
  text-shadow: 0 0 70px rgba(201, 162, 107, 0.3);
}
.numeral--reflection {
  position: absolute;
  top: 100%;
  transform: scaleY(-1);
  opacity: 0.18;
  filter: blur(3px);
  -webkit-mask-image: linear-gradient(to top, #000, transparent 55%);
  mask-image: linear-gradient(to top, #000, transparent 55%);
}
.chapter__intro {
  position: absolute;
  left: 55%;
  bottom: 12vh;
  display: grid;
  gap: 10px;
}
.chapter__title {
  font-size: var(--fs-title);
}

.blocks {
  position: relative;
  z-index: 1;
  margin: 10vh auto 0;
  display: grid;
  gap: 14vh;
}
/* Paragraphs take turns either side of the numeral. */
.blocks > * {
  width: min(100%, 560px);
}
.blocks > :nth-child(odd) {
  justify-self: start;
  margin-left: 6vw;
}
.blocks > :nth-child(even) {
  justify-self: end;
  margin-right: 6vw;
}
.block__lead {
  font-size: var(--fs-lead);
  line-height: 1.22;
}
.block__body {
  max-width: 34em;
  color: rgba(236, 231, 223, 0.75);
}
.facts {
  display: grid;
  gap: 14px;
}
.facts div {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 16px;
}
.figures {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6vh var(--gutter);
}
.figures__v {
  font-size: var(--fs-display);
}
.practice {
  display: grid;
  gap: 12px;
}
.practice__title {
  font-size: var(--fs-title);
}
.skill {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: var(--gutter);
}
.skill ul {
  font-size: clamp(18px, 1.39vw, 24px);
  line-height: 1.35;
}
.awards {
  display: grid;
  gap: 18px;
}
.awards ul {
  display: grid;
  gap: 14px;
}
.award {
  display: grid;
  gap: 6px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--line);
}
.award__name {
  font-size: var(--fs-lead);
  justify-self: start;
}
.award__body {
  color: rgba(236, 231, 223, 0.72);
}
.cert {
  display: grid;
  grid-template-columns: 140px 1fr auto;
  gap: var(--gutter);
  align-items: baseline;
}
.cert__issuer {
  text-align: right;
}
.cert__name {
  font-size: clamp(18px, 1.39vw, 24px);
  justify-self: start;
}
.points {
  display: grid;
  gap: 22px;
}
.points li {
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 12px;
}
.chapter__links {
  display: flex;
  gap: 24px;
}
.chapter__foot {
  display: grid;
  justify-items: center;
  gap: 40px;
  padding: 26vh 0 calc(var(--gutter) * 4.5);
}
.chapter__loading {
  display: grid;
  justify-items: center;
  gap: 10px;
  color: var(--muted);
  opacity: 0;
  transition: opacity 0.4s;
}
.chapter__loading.is-on {
  opacity: 1;
}
.chapter__loading i {
  display: block;
  width: 140px;
  height: 1px;
  background: var(--line);
}
.chapter__loading b {
  display: block;
  height: 100%;
  background: var(--accent);
  transform-origin: left;
}
.chapter__next {
  display: grid;
  justify-items: center;
  gap: 8px;
}
.chapter__next .serif {
  font-size: var(--fs-display);
}
@media (max-width: 760px) {
  .blocks > * {
    margin: 0 !important;
    justify-self: stretch !important;
  }
  .chapter__intro {
    left: 0;
    bottom: 6vh;
  }
  .skill,
  .cert,
  .facts div {
    grid-template-columns: 1fr;
    gap: 4px;
  }
  .cert__issuer {
    text-align: left;
  }
}
</style>
