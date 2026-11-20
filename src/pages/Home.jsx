import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { profile } from '../content/profile'
import { projects } from '../content/projects'
import { Nav } from '../components/Nav'
import { Footer } from '../components/Footer'
import { Section } from '../components/Section'
import { Reveal } from '../components/Reveal'
import { Cover } from '../components/Cover'
import { FitText } from '../components/FitText'
import { SplitText } from '../components/SplitText'
import { scrollToId } from '../components/SmoothScroll'
import { WorkGallery } from '../components/WorkGallery'
import { useReducedMotion } from '../hooks/useReducedMotion'

const ROTATE = ['ship.', 'explain themselves.', 'remember.', 'talk back.', 'see.']

function RotatingWord() {
  const [i, setI] = useState(0)
  const reduced = useReducedMotion()
  useEffect(() => {
    if (reduced) return undefined
    const t = setInterval(() => setI((v) => (v + 1) % ROTATE.length), 2400)
    return () => clearInterval(t)
  }, [reduced])
  return (
    <span className="rotator" aria-live="off">
      {ROTATE.map((w, k) => (
        <span key={w} className={`rotator-word ${k === i ? 'is-on' : ''} ${k === (i + ROTATE.length - 1) % ROTATE.length ? 'is-out' : ''}`}>
          {w}
        </span>
      ))}
      <span className="sr-only">{ROTATE.join(', ')}</span>
    </span>
  )
}

/** Project index whose hover preview card follows the cursor. */
function HoverIndex() {
  const wrap = useRef(null)
  const card = useRef(null)
  const [active, setActive] = useState(null)
  const pos = useRef({ x: 0, y: 0, tx: 0, ty: 0 })
  useEffect(() => {
    let raf = 0
    const loop = () => {
      const p = pos.current
      p.x += (p.tx - p.x) * 0.16
      p.y += (p.ty - p.y) * 0.16
      if (card.current) card.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%)`
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])
  const onMove = (e) => {
    const r = wrap.current.getBoundingClientRect()
    pos.current.tx = e.clientX - r.left
    pos.current.ty = e.clientY - r.top
  }
  return (
    <div ref={wrap} className="hindex" onMouseMove={onMove} onMouseLeave={() => setActive(null)}>
      <ol>
        {projects.map((p, i) => (
          <li key={p.slug} style={{ '--pa': p.palette.accent }}>
            <Link to={`/work/${p.slug}`} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} className={active === i ? 'is-on' : ''}>
              <span className="mono hindex-n">{String(i + 1).padStart(2, '0')}</span>
              <span className="hindex-title">{p.title}</span>
              <span className="mono hindex-cat">{p.category}</span>
            </Link>
          </li>
        ))}
      </ol>
      <div ref={card} className={`hindex-card ${active !== null ? 'is-on' : ''}`} aria-hidden="true">
        {projects.map((p, i) => (
          <div key={p.slug} className={`hindex-slide ${active === i ? 'is-on' : ''}`}>
            {active === i && <Cover project={p} size="small" live />}
          </div>
        ))}
      </div>
    </div>
  )
}

function Hero() {
  return (
    <Section tone="paper" className="hero">
      <Nav />
      <h1 className="wordmark-wrap">
        <span className="sr-only">Ayush Das</span>
        <FitText className="wordmark" aria-hidden="true">AYUSH&nbsp;DAS</FitText>
      </h1>
      <div className="hero-row">
        <Reveal swarm="Intro" className="hero-intro">
          <p className="eyebrow">AI/ML Engineer · LLMs, RAG, agents and the products around them</p>
          <p className="hero-lead">
            I build AI systems that <RotatingWord />
          </p>
          <div className="hero-ctas">
            <a href="#work" className="button" onClick={(e) => { e.preventDefault(); scrollToId('work') }}>
              View the work <span aria-hidden="true">→</span>
            </a>
            <a href={profile.resume} className="button is-ghost" target="_blank" rel="noreferrer">Résumé</a>
          </div>
        </Reveal>
        <Reveal swarm="Index" delay={0.1}>
          <HoverIndex />
        </Reveal>
      </div>
    </Section>
  )
}

function Showreel() {
  const video = useRef(null)
  const [paused, setPaused] = useState(false)
  const reduced = useReducedMotion()
  useEffect(() => {
    const v = video.current
    if (!v) return
    if (paused || reduced) v.pause()
    else v.play().catch(() => setPaused(true))
  }, [paused, reduced])
  return (
    <Section tone="paper" className="reel-wrap">
      <Reveal swarm="Showreel" className="reel">
        <video
          ref={video}
          src="/media/reel/reel.mp4"
          poster="/media/reel/reel-poster.jpg"
          muted
          loop
          playsInline
          autoPlay={!reduced}
          preload="auto"
          aria-label="Showreel: Relay, C4Future, Cancer TF Atlas, Ripe or Not, Dynamic Island and ResearchAI"
        />
        <button type="button" className="reel-btn" onClick={() => setPaused((v) => !v)} aria-label={paused ? 'Play showreel' : 'Pause showreel'}>
          {paused ? (
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 1 L11 6 L2 11 Z" fill="currentColor" /></svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 1 H5 V11 H2 Z M7 1 H10 V11 H7 Z" fill="currentColor" /></svg>
          )}
        </button>
        <span className="reel-tag mono">Showreel · 2026</span>
      </Reveal>
    </Section>
  )
}

function Statement() {
  return (
    <Section tone="paper" className="statement">
      <SplitText
        as="h2"
        swarm="Statement"
        className="statement-text"
        text="I make complex models *simple to use:* honest numbers, visible reasoning, and an interface you can read in ten seconds."
      />
    </Section>
  )
}

function Work() {
  // Like Instrument's home page: a short "Recent work" set and a way into the full index.
  const recent = projects.slice(0, 4)
  return (
    <Section tone="paper" id="work" className="work">
      <div className="work-controls">
        <p className="mono muted">Recent work · {String(recent.length).padStart(2, '0')} of {String(projects.length).padStart(2, '0')}</p>
        <Link to="/work" className="pill">All work <span aria-hidden="true">→</span></Link>
      </div>
      <SplitText
        as="h2"
        swarm="Selected work"
        className="work-head"
        text="Six products, end to end: *the model, the interface, and the reason it exists.*"
      />
      <WorkGallery items={recent} layout="stack" />
      <Reveal className="work-more">
        <Link to="/work" className="button">View all work <span aria-hidden="true">→</span></Link>
      </Reveal>
    </Section>
  )
}

function Portrait() {
  const [ok, setOk] = useState(true)
  if (!ok) return null
  return (
    <figure className="portrait">
      <img src="/media/me.png" alt="Ayush Das" loading="lazy" onError={() => setOk(false)} />
    </figure>
  )
}

function About() {
  return (
    <Section tone="ink" id="about" className="about">
      <div className="about-grid">
        <div className="about-left">
          <SplitText as="h2" swarm="About" className="serif-head" text="Models that ship, *not demos that stall.*" />
          <Portrait />
        </div>
        <Reveal delay={0.1} className="about-body">
          {profile.bio.map((b) => <p key={b}>{b}</p>)}
          <dl className="facts">
            <div><dt>Education</dt><dd>{profile.education.degree}, {profile.education.school}</dd></div>
            <div><dt>Period</dt><dd>{profile.education.period} · {profile.education.detail}</dd></div>
            <div><dt>Based in</dt><dd>{profile.location}</dd></div>
          </dl>
        </Reveal>
      </div>
    </Section>
  )
}

function Capabilities() {
  const [open, setOpen] = useState(0)
  return (
    <Section tone="paper" className="caps">
      <ol className="caps-list">
        {profile.skills.map((g, i) => (
          <Reveal
            as="li"
            key={g.group}
            delay={i * 0.04}
            className={`caps-row ${open === i ? 'is-open' : ''}`}
            onMouseEnter={() => setOpen(i)}
          >
            <button type="button" className="caps-head" onClick={() => setOpen(i)} aria-expanded={open === i}>
              <span className="mono caps-n">{String(i + 1).padStart(2, '0')}</span>
              <span className="caps-name">{g.group}</span>
              <span className="mono caps-count">{g.items.length}</span>
            </button>
            <ul className="caps-items">
              {g.items.map((s, k) => <li key={s} style={{ '--k': k }}>{s}</li>)}
            </ul>
          </Reveal>
        ))}
      </ol>
    </Section>
  )
}

const ISSUER = { IBM: '#0F62FE', Udemy: '#A435F0', CipherSchools: '#FF6B00', Google: '#1A73E8', Coursera: '#0056D2', 'DeepLearning.AI': '#E0245E', Microsoft: '#107C10' }

function Path() {
  const x = profile.experience[0]
  return (
    <Section tone="paper" className="path">
      <Reveal swarm="Experience" className="xp">
        <div className="xp-top">
          <p className="mono">Experience · {x.period}</p>
          <a className="pill is-light" href={x.cert} target="_blank" rel="noreferrer">Certificate <span aria-hidden="true">↗</span></a>
        </div>
        <p className="xp-company">{x.company}</p>
        <p className="xp-role">{x.role}</p>
        <ol className="xp-points">
          {x.points.map((p, i) => (
            <li key={p}><span className="mono">{String(i + 1).padStart(2, '0')}</span>{p}</li>
          ))}
        </ol>
      </Reveal>
      <div className="certs">
        <SplitText as="h2" swarm="Achievements" className="certs-head" text="Also *shipped*" />
        <ul className="cert-list ach-list">
          {profile.achievements.map((a, i) => (
            <Reveal as="li" key={a.name} delay={i * 0.05}>
              <a href={a.link} target="_blank" rel="noreferrer" className="cert ach">
                <span className="cert-mark" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <span className="cert-name">{a.name}<small className="ach-body">{a.body}</small></span>
                <span className="mono cert-meta">{a.meta}</span>
                <span aria-hidden="true" className="cert-arrow">↗</span>
              </a>
            </Reveal>
          ))}
        </ul>
      </div>
      <div className="certs">
        <SplitText as="h2" swarm="Certifications" className="certs-head" text="Certifications" />
        <ul className="cert-list">
          {profile.certifications.map((c, i) => (
            <Reveal as="li" key={c.name} delay={i * 0.05}>
              <a href={c.link} target="_blank" rel="noreferrer" className="cert" style={{ '--ic': ISSUER[c.issuer] || 'var(--fg)' }}>
                <span className="cert-mark" aria-hidden="true">{c.issuer.slice(0, 1)}</span>
                <span className="cert-name">{c.name}</span>
                <span className="mono cert-meta">{c.issuer} · {c.date}</span>
                <span aria-hidden="true" className="cert-arrow">↗</span>
              </a>
            </Reveal>
          ))}
        </ul>
      </div>
    </Section>
  )
}

function LocalTime() {
  const fmt = () => new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }).format(new Date())
  const [t, setT] = useState(fmt)
  useEffect(() => {
    const id = setInterval(() => setT(fmt()), 15000)
    return () => clearInterval(id)
  }, [])
  return <span>{t} IST</span>
}

function Contact() {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      window.location.href = `mailto:${profile.email}`
    }
  }
  const links = [
    { label: 'Email', value: profile.email, href: `mailto:${profile.email}` },
    { label: 'Phone', value: profile.phone, href: `tel:${profile.phone.replace(/\s/g, '')}` },
    { label: 'GitHub', value: 'AyushDas4890', href: profile.github },
    { label: 'LinkedIn', value: 'ayushdas4890', href: profile.linkedin },
  ]
  return (
    <Section tone="ink" id="contact" className="contact">
      <SplitText as="h2" swarm="Contact" className="contact-head" text="Let's build something *useful.*" />
      <Reveal className="contact-mailrow">
        <a href={`mailto:${profile.email}`} className="contact-mail">{profile.email}</a>
        <button type="button" className={`pill is-light ${copied ? 'is-active' : ''}`} onClick={copy}>
          {copied ? 'Copied' : 'Copy email'}
        </button>
      </Reveal>
      <div className="contact-meta mono">
        <span>Local time · <LocalTime /></span>
        <span>{profile.location}</span>
      </div>
      <ul className="contact-links">
        {links.map((l, i) => (
          <Reveal as="li" key={l.label} delay={i * 0.05}>
            <a href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="clink">
              <span className="mono">{l.label}</span>
              <span className="clink-value">{l.value}</span>
              <span className="clink-arrow" aria-hidden="true">→</span>
            </a>
          </Reveal>
        ))}
      </ul>
      <Footer />
      <FitText className="footer-word" aria-hidden="true">AYUSH&nbsp;DAS</FitText>
    </Section>
  )
}

export default function Home() {
  return (
    <main id="main">
      <Hero />
      <Showreel />
      <Statement />
      <Work />
      <About />
      <Capabilities />
      <Path />
      <Contact />
    </main>
  )
}
