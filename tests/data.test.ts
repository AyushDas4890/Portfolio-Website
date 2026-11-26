import { describe, expect, it } from 'vitest'
import { existsSync } from 'node:fs'
import { projects, profile, chapters, categories, getProject, getChapter } from '~/data'

const pub = (p: string) => existsSync(new URL(`../public${p}`, import.meta.url))

describe('projects', () => {
  it('has unique slugs and the presentation fields', () => {
    expect(new Set(projects.map((p) => p.slug)).size).toBe(projects.length)
    for (const p of projects) {
      expect(p.headline, p.slug).toBeTruthy()
      expect(p.home, p.slug).toBeTruthy()
      expect(p.services.length, p.slug).toBeGreaterThan(2)
      expect(p.backstage.length, p.slug).toBeGreaterThan(2)
    }
  })
  it('only points at media that exists', () => {
    for (const p of projects) {
      const files = [p.media.loop, p.media.poster, ...p.media.screens.map((s) => s.src), ...p.media.reels.map((r) => r.src), ...p.features.map((f) => f.screen)].filter(Boolean) as string[]
      for (const f of files) expect(pub(f), `${p.slug}: ${f}`).toBe(true)
    }
  })
  it('looks projects up by slug', () => {
    expect(getProject('relay')?.title).toBe('Relay')
    expect(getProject('nope')).toBeUndefined()
    expect(categories[0]).toBe('All')
  })
})

describe('profile', () => {
  it('keeps the internship, certificates and achievements', () => {
    expect(profile.experience[0].company).toBe('VanillaCart')
    expect(profile.certifications.length).toBeGreaterThanOrEqual(8)
    expect(profile.achievements.length).toBeGreaterThanOrEqual(2)
    expect(pub(profile.resume)).toBe(true)
  })
})

describe('chapters', () => {
  it('runs I to V', () => {
    expect(chapters.map((c) => c.numeral)).toEqual(['I', 'II', 'III', 'IV', 'V'])
    expect(getChapter('skills')).toBe(2)
    expect(getChapter('nope')).toBe(-1)
  })
})
