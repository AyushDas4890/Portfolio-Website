# Ayush Das — Portfolio

An Instrument-style portfolio with a multi-agent cursor swarm. React 18 + Vite.

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # content, component and route tests
npm run build
```

- Content lives in `src/content/profile.js` and `src/content/projects.js`.
- Project media is in `public/media/<slug>/`. `node scripts/capture.mjs [slug]` re-records a live demo (needs `npx playwright install chromium`), then encode `scripts/.raw/<slug>/raw.webm` to MP4 with ffmpeg.
- The swarm (`src/swarm/engine.js`) is decorative: content reveals on its own, and the swarm is off for `prefers-reduced-motion`.
- Deploy on Vercel as a static site; `vercel.json` rewrites all routes to `index.html`.
