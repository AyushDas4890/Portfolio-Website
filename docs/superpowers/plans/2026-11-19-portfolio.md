# Ayush Das Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Instrument-style portfolio with a multi-agent cursor swarm and four full case-study pages.

**Architecture:** Static React SPA. All copy lives in `src/content/`; pages render from it. Motion is Framer Motion + Lenis; the swarm is one fixed overlay driven by a small scheduler that sections register with.

**Tech Stack:** React 18.3, Vite 5, React Router 6, Framer Motion 11, Lenis 1, Vitest + Testing Library, Playwright (media capture + smoke tests).

**Spec:** `docs/2026-11-19-portfolio-design.md`; content: `portfolio-info.md`.

## Global Constraints

- Phone `+91 98956 912390`; email `das.ayush4890@gmail.com`; GitHub `AyushDas4890`; LinkedIn `ayushdas4890`.
- Never render "7th University Coding Showdown". No portrait photo.
- Featured order: relay, c4future, research-assistant, cancer-tf. All 5 certifications with their exact links.
- Base palette: paper `#F2F1EE`, ink `#0B0B0B`. Project palettes:
  - relay: `#F5A400` / `#10233F` / `#3CCF7C`
  - c4future: `#EBEEE7` / `#2B3A30` / `#B4502A`, heading font Fraunces
  - research-assistant: ink + `#7AA2FF`
  - cancer-tf: `#0A2540` + gold `#FFD700`
- Metrics only from repo READMEs or resume. C4Future model is XGBoost + SHAP + conformal (README), not Random Forest.
- Anti-slop: no gradient text, glows, emoji, purple gradients, idle wobble.
- `prefers-reduced-motion`: swarm off, reveals instant.
- 375px wide: no horizontal scroll.
- Media: each loop ≤ 2 MB, with a poster image and a fixed aspect ratio.

## Review Focus

1. Unknown slug at `/work/xyz`: show a not-found page with a link home, not a blank screen. Test is in Task 4.
2. Video fails to load or autoplay is blocked: the poster image stays visible and the layout does not shift. Test is in Task 3 (`MediaLoop`).
3. Reduced motion: the swarm is not rendered. Test is in Task 3.
4. Deep link or refresh on `/work/relay` on Vercel: it must work. Covered by the rewrite in Task 1 `vercel.json` and the smoke test in Task 5.
5. Keyboard-only user: every card and link is reachable, with a visible focus ring. Smoke test in Task 5.

---

### Task 1: Scaffold, tokens, content

**Files:** `package.json`, `vite.config.js`, `vercel.json`, `index.html`, `src/main.jsx`, `src/styles/tokens.css`, `src/styles/base.css`, `src/content/profile.js`, `src/content/projects.js`, `src/content/content.test.js`

**Produces:**
- `profile` with fields: `name, role, email, phone, github, linkedin, location, summary, stats[], skills[], experience[], certifications[], education`
- `projects` (an array). Each project has: `slug, title, period, tags[], palette{bg,fg,accent,alt}, headingFont?, summary, live, repo, media{loop, poster, screens[{src,caption}]}, problem, useCases[], features[{title,body,screen}], architecture{steps[]}, metrics[{value,label}], next[]`
- `getProject(slug) -> project | undefined`

Steps:
- [ ] Test: `content.test.js` asserts the following:
  - `projects.map(p=>p.slug)` equals `['relay','c4future','research-assistant','cancer-tf']`
  - `profile.certifications.length === 5`
  - `profile.phone === '+91 98956 912390'`
  - no `JSON.stringify` of any content contains `'Coding Showdown'`
  - every project has at least 3 `useCases`, at least 3 `features`, and at least 3 `screens`
- [ ] Run `npx vitest run`. It fails because there are no modules yet.
- [ ] Write the content from the READMEs and `portfolio-info.md`.
- [ ] Run `npx vitest run`. It passes.

### Task 2: Media capture

**Files:** `scripts/capture.mjs`, `public/media/<slug>/{loop.mp4,loop.webm,poster.jpg,screen-*.jpg}`

- Relay: convert repo GIFs (scroll, intro, transition) with ffmpeg to MP4/WebM; copy repo JPGs as screens.
- The other three: use Playwright to open the live URL at 1440x900 and wait for the app to be ready. Then record video of a scripted scroll or interaction for 10–14 s, take viewport screenshots at 3–5 scroll points, and encode to the size limits.
- AI Research Assistant: if the Streamlit app needs a key or is asleep, use the repo's `docs/pipeline.png` and `docs/report.png` as screens. Its loop is then the in-page `AgentPipeline` animation (Task 4), so no file is needed.
- [ ] Verify: `ls -la public/media/*` shows every file referenced in `projects.js`, and each loop is ≤ 2 MB.

### Task 3: Shell + motion primitives + swarm

**Files:** `src/App.jsx`, `src/components/{Nav,Footer,MediaLoop,Reveal,SmoothScroll,SectionTheme}.jsx`, `src/swarm/{Swarm.jsx,useSwarm.js,agents.js}`, `src/components/components.test.jsx`

**Produces:**
- `<MediaLoop loop poster ratio alt />`: lazy-loads; plays when in view and on hover; the poster stays visible if playback fails.
- `useSwarmTarget(ref, label)`: a section registers itself. When it enters the viewport, the swarm sends 1–2 agents to it and resolves `built=true`, and `<Reveal>` uses `built` to animate in.
- `<SectionTheme tone="ink|paper|project">`: the body background transitions as each section passes the middle of the viewport.

Swarm details:
- `agents.js` defines 4 agents: PLANNER `#FF5A36`, SEARCHER `#3CCF7C`, CRITIC `#F5A400`, WRITER `#7AA2FF`.
- Animate with transform only, using a spring.
- A status bar at the bottom reads "4 agents · building 03/07".
- The swarm overlay is `aria-hidden`, `pointer-events:none`, and pauses when the tab is hidden.

Steps:
- [ ] Tests:
  - `MediaLoop` renders the `<img>` poster before play.
  - Swarm returns `null` when `matchMedia('(prefers-reduced-motion: reduce)')` matches.
- [ ] Implement until the tests pass.

### Task 4: Pages

**Files:** `src/pages/{Home,CaseStudy,NotFound}.jsx`, `src/sections/*.jsx`, `src/components/AgentPipeline.jsx`, `src/pages/pages.test.jsx`

- Home, in order: hero (wordmark built by the swarm + outlined "PORTFOLIO" line), showreel, statement, work (filters + stack/grid), stats, about, capabilities, experience, certifications, contact.
- CaseStudy, in order: title, breadcrumb, summary, hero media, facts, problem, use cases, features with screens, UI carousel (scroll-snap), architecture, metrics, next steps, next project.
- [ ] Tests:
  - `/work/relay` renders "Relay" and the Relay live link.
  - `/work/xyz` renders the not-found page.
  - The certifications section shows 5 links.
- [ ] Implement until the tests pass.

### Task 5: Verify

- [ ] Run `npm run build`; it succeeds.
- [ ] Playwright smoke test (`scripts/smoke.mjs`) against `vite preview`:
  - every route loads with no console errors
  - at 375px wide, `scrollWidth <= innerWidth`
  - pressing Tab reaches the first work card
- [ ] Check visually in the browser pane: the hero, one case study, mobile view and dark sections.
- [ ] Check against the anti-slop list.
