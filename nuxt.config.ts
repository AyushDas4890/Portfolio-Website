import { projects, chapters } from './data'

const title = 'Ayush Das — AI/ML Engineer'
const description =
  'Ayush Das builds AI systems that do real work: multi-agent research pipelines, RAG assistants and explainable ML, with the product around them.'

export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  devtools: { enabled: false },
  ssr: true,
  css: [
    '@fontsource-variable/newsreader/opsz.css',
    '@fontsource-variable/newsreader/opsz-italic.css',
    '@fontsource/inter-tight/latin-300.css',
    '@fontsource/inter-tight/latin-400.css',
    '~/assets/css/main.css',
  ],
  typescript: { strict: false, typeCheck: false },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title,
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: description },
        { name: 'theme-color', content: '#e8e8e8' },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
      ],
      link: [
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
      ],
    },
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: [
        '/',
        '/projects',
        ...projects.flatMap((p) => [`/projects/${p.slug}`, `/projects/${p.slug}/backstage`]),
        ...chapters.map((c) => `/studio/${c.slug}`),
      ],
    },
  },
})
