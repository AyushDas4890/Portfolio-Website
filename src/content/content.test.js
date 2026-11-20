import { profile } from './profile'
import { projects, getProject } from './projects'

describe('content', () => {
  it('features the four chosen projects in order', () => {
    expect(projects.map((p) => p.slug)).toEqual(['relay', 'c4future', 'research-assistant', 'cancer-tf', 'dynamic-island', 'fruit-ripeness'])
  })
  it('keeps all eight CV certifications with links', () => {
    expect(profile.certifications).toHaveLength(8)
    profile.certifications.forEach((c) => expect(c.link).toMatch(/^https:\/\//))
  })
  it('uses the confirmed phone number', () => {
    expect(profile.phone).toBe('+91 98956 12390')
  })
  it('never mentions the coding showdown', () => {
    expect(JSON.stringify({ profile, projects })).not.toMatch(/Coding Showdown/i)
  })
  it('gives every project a full case study', () => {
    projects.forEach((p) => {
      expect(p.useCases.length).toBeGreaterThanOrEqual(3)
      expect(p.features.length).toBeGreaterThanOrEqual(3)
      expect(p.media.screens.length).toBeGreaterThanOrEqual(3)
      expect(p.problem.length).toBeGreaterThan(80)
    })
  })
  it('never repeats a screen within a project', () => {
    projects.forEach((p) => {
      const srcs = p.media.screens.map((s) => s.src)
      expect(new Set(srcs).size).toBe(srcs.length)
      const feats = p.features.map((f) => f.screen)
      expect(new Set(feats).size).toBe(feats.length)
    })
  })
  it('looks up projects by slug', () => {
    expect(getProject('relay').title).toBe('Relay')
    expect(getProject('nope')).toBeUndefined()
  })
})
