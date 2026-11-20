# Ayush Das Portfolio — Design

Date: 2026-11-19. Content source: `portfolio-info.md`.

## Intent

Rebuild Ayush Das's portfolio (AI/ML Engineer, LPU B.Tech CSE) so it reads like a design studio site, not a template. Recruiters and collaborators should understand each project in depth: what it is, who it is for, why it is needed, how it works, and what the real UI looks like.

Inspirations (user's words): "overall the portfolio shall be like instrument, but shall have the cursor building design like the video". "Smooth and anti slop."

## Goals

- Instrument-grade editorial layout and motion: giant wordmark, pill nav, serif statement lines, filterable work list, full case-study pages.
- The multi-agent cursor swarm from the reference video: coloured cursor arrows that move across the page and "build" sections as they reveal.
- One full case study per project, with live demo video loops and real UI screens.
- Smooth: 60fps scroll and motion, no layout jank, fast first load.

## Non-goals

- No CMS, blog, or "Latest" section.
- No portrait photo.
- No backend; static site.

## Anti-goals (fail even if it works)

- AI-slop tells: purple gradients, glows, gradient text, emoji labels, glassy blobs, idle wobble, generic "Hi I'm X 👋" hero.
- Cursor swarm that becomes noise, blocks reading, or tanks performance.
- Case studies that are a bullet list with a screenshot.
- Showing "7th University Coding Showdown".

## Content decisions (user)

- Featured projects, in order: Relay, Carbon Footprint Generator (C4Future), AI Research Assistant Pipeline, Cancer TF Discovery Atlas.
- All 5 certifications kept exactly, with links.
- Phone: +91 98956 912390. No coding-showdown stat. No photo.
- Experience (VanillaCart), education (LPU, CGPA 8.08), skills, contacts from `portfolio-info.md`.

## Approaches considered

- **A: Instrument layout + video's cursor swarm + per-project colour (chosen by user).**
- B: same, dark only. Rejected: loses Instrument's section colour shifts.
- C: one-page copy of the video's look. Rejected: drops Instrument's structure and case studies.

## Visual system

- Base: black and white. Sections alternate between paper white (#F2F1EE) and ink black (#0B0B0B), and the background colour transitions on scroll as on instrument.com.
- Type: one heavy condensed grotesk for the wordmark and outlined display text (e.g. Anton or Archivo Black); one editorial serif for statement lines (e.g. Instrument Serif or Fraunces); one mono for small uppercase labels (JetBrains Mono). Builder's call on exact faces, all free/Google Fonts.
- Each project page takes its colour from that project's own product (user's instruction):
  - Relay: from its landing page — amber #F5A400, deep navy #10233F, mint #3CCF7C; dark variant #1A0B07 / #F0B07A.
  - C4Future: from its landing page — sage #EBEEE7, forest #2B3A30, rust #B4502A; Fraunces + Inter.
  - AI Research Assistant: builder derives from its live Streamlit demo; else a cool blue on ink.
  - Cancer TF Atlas: builder derives from its live dashboard.
- Light and dark handled by section, not a global theme toggle.

## Signature motion: the cursor swarm

- 4–6 coloured cursor arrows, each labelled with a short agent role in mono (e.g. PLANNER, SEARCHER, CRITIC, WRITER), echoing the AI Research Assistant's agents.
- On load, cursors fly in and "build" the hero: they appear to drag in the wordmark letters, type the role line, and draw the outlined headline.
- On scroll, when a section enters, 1–2 cursors move to it and "place" its heading and cards (reveal is tied to the cursor's arrival).
- Idle: cursors rest at screen edges. No idle wobble.
- The visitor's own cursor stays the system cursor (accessible); swarm cursors avoid it.
- A small status bar fixed at the bottom (from the video): "4 agents · building section 03/07", updating with scroll. It can be collapsed.
- `prefers-reduced-motion`: swarm hidden, content shown at once.
- Mobile: swarm reduced to 2 cursors on the hero only.

## Site map

1. **Home**
   - Top bar: pill nav (Work, About, Contact) + "Available for work" pill + résumé link.
   - Hero: full-width wordmark "AYUSH DAS", outlined display line ("PORTFOLIO" style from the video), role "AI/ML Engineer — LLMs, RAG, multi-agent systems", built by the swarm.
   - Showreel: big rounded video panel cycling the four project loops, with a pause button.
   - Serif statement: one sentence about what he builds.
   - Selected work: filter chips (All / AI Agents / ML / Full-stack) and a Stack/Grid toggle; rounded cards that autoplay muted demo loops on hover (poster frame otherwise), project colour on hover.
   - Stats row: 8.08 CGPA, 5+ end-to-end AI systems, >85% legal NLP accuracy, plus one more real figure.
   - About / philosophy: serif headline, short bio, education.
   - Capabilities: skills grouped (from the resume).
   - Experience: VanillaCart.
   - Certifications: all 5, each linked.
   - Contact: big serif "Let's build something." + email, phone, GitHub, LinkedIn.
   - Footer: Instrument-style simple columns.
2. **Case study page** (one per project, `/work/<slug>`), in the project's colours:
   - Centred serif title, breadcrumb (Home / Work / Project), tags, one-line summary.
   - Full-width demo video (autoplay muted loop, play/pause).
   - Overview facts: role, period, stack, links (live demo, GitHub).
   - **The problem / why it is needed**: who has this problem and what it costs them.
   - **Use cases**: 2–4 concrete scenarios.
   - **What it does**: feature walkthrough, each feature paired with a real UI screen or clip.
   - **Website UI detail**: swipeable carousel of the real screens (landing, sign-in, app views, mobile), with captions.
   - **How it works**: architecture diagram (inline SVG) and pipeline explanation.
   - **Results / numbers**: real metrics only (e.g. C4Future 91.2% interval coverage, 14k+ rows; Cancer TF 98.76%).
   - **What I'd do next.**
   - Next-project link.

## Media plan

- Relay: convert repo GIFs (intro, transition, scroll) to MP4/WebM loops; use repo screenshots (hero, signin, app-*, tour-*).
- Other three: record 8–15 s loops of the live demos with a headless browser (Playwright), plus full-page screenshots for the UI carousel.
- If a demo is asleep or needs an API key: record what loads; for the AI Research Assistant, build a motion-graphic of the 5-agent pipeline instead.
- Encode H.264 MP4 + WebM, ≤ 2 MB each loop, with poster JPGs. Lazy-load below the fold.

## Stack (builder's call, stated)

React 18 + Vite, React Router (case-study routes), Framer Motion for UI motion, Lenis for smooth scroll, plain CSS with tokens. Content in one `data.js`. Deploy target Vercel (SPA rewrite).

## Quality bar

- Lighthouse performance ≥ 90 on desktop, no CLS from media (fixed aspect ratios).
- Keyboard and screen-reader usable; swarm is `aria-hidden`.
- Works at 375 px wide with no horizontal scroll.
- Check against the "anti-slop" list above before calling it done.

## Left to the builder

Exact fonts, AI Research Assistant and Cancer TF colours (from their demos), copy wording for case studies (from repo READMEs and resume, no invented metrics), filter category names.

## Risks

- Live demos asleep (Render, HF Space, Streamlit): recording may need retries; fallback is screenshots or motion graphics.
- Cursor swarm cost: must run on transforms only (no layout), capped at 6 cursors, paused off-screen.
- Phone number has 11 digits after +91; user confirmed it, but worth a final check.
