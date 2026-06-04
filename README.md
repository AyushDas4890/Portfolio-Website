# Ayush Das — Portfolio

A bold, editorial "aurora" portfolio for an AI/ML Engineer. Built with **React + Vite** and **Framer Motion** for scroll-driven animation.

## Run locally

```bash
npm install
npm run dev      # start dev server (http://localhost:5173)
npm run build    # production build -> dist/
npm run preview  # preview the production build
```

## Features

- **Live GitHub section** — fetches your repos from the GitHub API in the browser on each visit (stars, language, last-updated), so it stays current automatically. If the API rate-limits (60 req/hr unauthenticated), it falls back to the curated snapshot in `src/data.js`.
- **Light / dark theme toggle** — sun/moon button in the nav; preference is remembered via `localStorage`.
- **Résumé download** — buttons in the hero and nav serve `public/Ayush_Das_Resume.docx`. Replace that file to update your résumé.

## Edit your content

All text lives in one place: **`src/data.js`** — name, summary, projects, skills, experience, certifications, education, and the `githubFallback` snapshot. Update that file and the whole site updates.

To add or change a featured project, edit the `projects` array. Each entry has a `title`, `tag`, `accent` color, `blurb`, `highlights`, `stack` and GitHub `link`.

## Deploy (free)

- **GitHub Pages:** push to a repo, run `npm run build`, and publish the `dist/` folder (or use the `gh-pages` package).
- **Vercel / Netlify:** import the repo — build command `npm run build`, output dir `dist`.

## Structure

```
index.html          # entry + Google Fonts
src/main.jsx        # React root
src/App.jsx         # all sections + animations
src/index.css       # aurora design system
src/data.js         # YOUR CONTENT — edit here
favicon.svg
```

Fonts: Fraunces (display), Space Grotesk (body), JetBrains Mono (accents).
