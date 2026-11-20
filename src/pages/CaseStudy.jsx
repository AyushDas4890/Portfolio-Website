import { useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProject, projects } from '../content/projects'
import { Nav } from '../components/Nav'
import { Footer } from '../components/Footer'
import { Section } from '../components/Section'
import { Reveal } from '../components/Reveal'
import { SplitText } from '../components/SplitText'
import { ProjectMedia } from '../components/ProjectMedia'
import { MediaLoop } from '../components/MediaLoop'
import { AgentPipeline } from '../components/AgentPipeline'
import NotFound from './NotFound'

/** Pushes the project's palette into the page tokens while the page is open. */
function useProjectTheme(project) {
  useEffect(() => {
    if (!project) return undefined
    const root = document.documentElement
    const { bg, fg, accent, alt } = project.palette
    root.style.setProperty('--p-bg', bg)
    root.style.setProperty('--p-fg', fg)
    root.style.setProperty('--p-accent', accent)
    root.style.setProperty('--p-alt', alt)
    root.style.setProperty('--p-heading', project.headingFont)
    root.dataset.tone = 'project'
    document.title = `${project.title} — Ayush Das`
    return () => {
      ;['--p-bg', '--p-fg', '--p-accent', '--p-alt', '--p-heading'].forEach((k) => root.style.removeProperty(k))
      document.title = 'Ayush Das — AI/ML Engineer'
    }
  }, [project])
}

function Carousel({ screens, title }) {
  const track = useRef(null)
  const step = (dir) => {
    const t = track.current
    if (!t) return
    t.scrollBy({ left: dir * t.clientWidth * 0.8, behavior: 'smooth' })
  }
  return (
    <div className="carousel">
      <div className="carousel-head">
        <p className="mono muted">{screens.length} screens · scroll or use the arrows</p>
        <div className="carousel-btns">
          <button type="button" className="round" onClick={() => step(-1)} aria-label="Previous screen">←</button>
          <button type="button" className="round" onClick={() => step(1)} aria-label="Next screen">→</button>
        </div>
      </div>
      <ul ref={track} className="carousel-track" tabIndex={0} aria-label={`${title} interface screens`}>
        {screens.map((s, i) => (
          <li key={s.src} className="carousel-item">
            <figure>
              <div className="shot">
                <img src={s.src} alt={s.caption} loading="lazy" decoding="async" />
              </div>
              <figcaption><span className="mono">{String(i + 1).padStart(2, '0')}</span> {s.caption}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Architecture({ architecture }) {
  return (
    <div className="arch">
      <ol className="arch-steps">
        {architecture.steps.map((s, i) => (
          <li key={s.label} className="arch-step">
            <span className="mono arch-n">{String(i + 1).padStart(2, '0')}</span>
            <span className="arch-label">{s.label}</span>
            <span className="arch-detail">{s.detail}</span>
          </li>
        ))}
      </ol>
      <p className="arch-caption">{architecture.caption}</p>
    </div>
  )
}

export default function CaseStudy() {
  const { slug } = useParams()
  const project = getProject(slug)
  useProjectTheme(project)
  if (!project) return <NotFound />

  const i = projects.indexOf(project)
  const next = projects[(i + 1) % projects.length]
  const links = [
    { href: project.live, label: project.liveLabel || 'Live site' },
    project.app && { href: project.app, label: project.appLabel || 'Open the app' },
    { href: project.repo, label: 'GitHub' },
    project.repo2 && { href: project.repo2, label: 'Landing repo' },
  ].filter(Boolean)

  return (
    <main id="main" className="case" style={{ '--heading': project.headingFont }}>
      <Section tone="project" className="case-hero">
        <Nav compact />
        <Reveal swarm="Title" as="h1" className="case-title">
          {project.cover?.logo && (
            <span className="case-logo" aria-hidden="true" style={{ WebkitMaskImage: `url(${project.cover.logo})`, maskImage: `url(${project.cover.logo})` }} />
          )}
          {project.title}
        </Reveal>
        <div className="case-crumbs">
          <nav aria-label="Breadcrumb" className="mono">
            <Link to="/">Home</Link> <span aria-hidden="true">/</span> <Link to="/work">Work</Link>{' '}
            <span aria-hidden="true">/</span> <span aria-current="page">{project.title}</span>
          </nav>
          <span className="mono">{project.tags.map((t) => `#${t.toLowerCase().replace(/\s+/g, '-')}`).join(' ')}</span>
        </div>
        <Reveal swarm="Summary" className="case-summary">{project.summary}</Reveal>
        <Reveal swarm="Demo" className="case-media">
          <ProjectMedia project={project} variant="hero" />
        </Reveal>
        <Reveal className="case-facts">
          <dl>
            <div><dt>Role</dt><dd>{project.role}</dd></div>
            <div><dt>When</dt><dd>{project.period}</dd></div>
            <div><dt>Stack</dt><dd>{project.tags.join(', ')}</dd></div>
            <div>
              <dt>Links</dt>
              <dd className="case-links">
                {links.map((l) => (
                  <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="pill">{l.label} <span aria-hidden="true">↗</span></a>
                ))}
              </dd>
            </div>
          </dl>
        </Reveal>
      </Section>

      <Section tone="project" className="case-block">
        <div className="case-cols">
          <SplitText as="h2" swarm="The problem" className="case-h" text="The problem" />
          <Reveal className="case-prose"><p>{project.problem}</p></Reveal>
        </div>
        <div className="case-cols">
          <SplitText as="h2" swarm="Why it is needed" className="case-h" text="Why it is needed" />
          <Reveal className="case-prose"><p>{project.why}</p></Reveal>
        </div>
      </Section>

      <Section tone="project" className="case-block">
        <SplitText as="h2" swarm="Use cases" className="case-h big" text="Use cases" />
        <ol className="usecases">
          {project.useCases.map((u, k) => (
            <Reveal as="li" key={u.title} delay={k * 0.06} className="usecase">
              <span className="mono">{String(k + 1).padStart(2, '0')}</span>
              <h3>{u.title}</h3>
              <p>{u.body}</p>
            </Reveal>
          ))}
        </ol>
      </Section>

      <Section tone="project" className="case-block">
        <SplitText as="h2" swarm="What it does" className="case-h big" text="What it does" />
        <div className="features">
          {project.features.map((f, k) => (
            <Reveal key={f.title} swarm={f.title} className={`feature ${k % 2 ? 'is-flip' : ''}`}>
              <div className="feature-shot">
                {project.slug === 'research-assistant' && k === 1 ? (
                  <AgentPipeline ratio="16 / 10" />
                ) : (
                  <div className="shot"><img src={f.screen} alt={`${project.title}: ${f.title}`} loading="lazy" decoding="async" /></div>
                )}
              </div>
              <div className="feature-copy">
                <span className="mono">{String(k + 1).padStart(2, '0')}</span>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {project.media.reels.length > 0 && (
        <Section tone="project" className="case-block">
          <SplitText as="h2" swarm="In motion" className="case-h big" text="In motion" />
          <div className="reels">
            {project.media.reels.map((r) => (
              <Reveal key={r.src} className="reel-item">
                <MediaLoop src={r.src} poster={r.poster} alt={r.caption} ratio="16 / 10" />
                <p className="caption">{r.caption}</p>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      <Section tone="project" className="case-block">
        <SplitText as="h2" swarm="Interface" className="case-h big" text="The interface, screen by screen" />
        <Reveal><Carousel screens={project.media.screens} title={project.title} /></Reveal>
      </Section>

      <Section tone="project" className="case-block">
        <SplitText as="h2" swarm="How it works" className="case-h big" text="How it works" />
        <Reveal><Architecture architecture={project.architecture} /></Reveal>
      </Section>

      <Section tone="project" className="case-block">
        <SplitText as="h2" swarm="Results" className="case-h big" text="Results" />
        <Reveal as="dl" className="spec">
          {project.metrics.map((m) => (
            <div key={m.label} className="spec-row">
              <dt>{m.label}</dt>
              <dd>{m.value}</dd>
            </div>
          ))}
        </Reveal>
        <div className="case-cols next-steps">
          <SplitText as="h2" className="case-h" text="What I'd do next" />
          <Reveal as="ul" className="bullets">
            {project.next.map((n) => <li key={n}>{n}</li>)}
          </Reveal>
        </div>
      </Section>

      <Section tone="ink" className="case-next">
        <Link to={`/work/${next.slug}`} className="next-link">
          <span className="mono muted">Next project</span>
          <span className="next-title">{next.title}</span>
          <span className="muted">{next.kicker} <span aria-hidden="true">→</span></span>
        </Link>
        <Footer />
      </Section>
    </main>
  )
}
