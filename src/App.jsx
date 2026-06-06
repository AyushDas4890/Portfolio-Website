import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useSpring, useInView } from 'framer-motion'
import {
  profile, projects, skills, experience, certifications, education,
  githubUser, githubFallback,
} from './data.js'
import NeuralBackground from './NeuralBackground.jsx'
import { Tilt, CountUp, CommandPalette, Typewriter, CustomCursor, MOD_KEY } from './effects.jsx'

const RESUME_URL = `${import.meta.env.BASE_URL}Ayush_Das_ML_Resume.pdf`

function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark'
    return localStorage.getItem('theme') || 'dark'
  })
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])
  return [theme, () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))]
}

function Reveal({ children, delay = 0, y = 20 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 0.7, 0.25, 1] }}
    >
      {children}
    </motion.div>
  )
}

function Progress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 130, damping: 30, mass: 0.3 })
  return <motion.div className="progress-bar" style={{ scaleX }} />
}

function SectionHead({ eyebrow, title, sub }) {
  return (
    <Reveal>
      <div className="eyebrow">{eyebrow}</div>
      <h2 className="section-title" dangerouslySetInnerHTML={{ __html: title }} />
      {sub && <p className="section-sub">{sub}</p>}
    </Reveal>
  )
}

function Nav({ theme, toggleTheme, commands }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const links = [
    ['About', '#about'], ['Projects', '#work'], ['Code', '#code'],
    ['Skills', '#skills'], ['Experience', '#path'], ['Contact', '#contact'],
  ]
  return (
    <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <a href="#top" className="nav-logo">ayush<b>.das</b></a>
      <div className={`nav-links ${open ? 'open' : ''}`} onClick={() => setOpen(false)}>
        {links.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
        <a className="nav-cta" href={RESUME_URL} download>Resume</a>
      </div>
      <div className="nav-controls">
        <CommandPalette commands={commands} />
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? '☀' : '☾'}
        </button>
        <button className="nav-burger" aria-label="Menu" onClick={() => setOpen(o => !o)}>
          <span /><span /><span />
        </button>
      </div>
    </nav>
  )
}

function Hero() {
  return (
    <header id="top" className="hero wrap">
      <div className="hero-inner">
        <motion.span className="badge"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="dot" /> Available for AI/ML roles · {profile.location}
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.08 }}>
          {profile.name.split(' ')[0]} <span className="accent">{profile.name.split(' ').slice(1).join(' ')}</span>
        </motion.h1>

        <motion.p className="hero-role"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.22 }}>
          <span className="hero-role-static">{profile.role}</span>
          <span className="hero-sep">/</span>
          <Typewriter phrases={[
            'Generative AI systems',
            'NLP & LLM applications',
            'PyTorch · Transformers · FastAPI',
            'Explainable, shipped ML',
          ]} />
        </motion.p>

        <motion.p className="hero-sub"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
          I build end-to-end machine learning, NLP and Generative AI systems &mdash; from legal document
          intelligence to recommendation engines &mdash; that are explainable, measured, and shipped behind
          interfaces people actually use.
        </motion.p>

        <motion.div className="hero-actions"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.38 }}>
          <a className="btn btn-primary" href="#work">View projects</a>
          <a className="btn btn-ghost" href={profile.linkedin} target="_blank" rel="noreferrer">Connect on LinkedIn &rarr;</a>
        </motion.div>

        <motion.div className="hero-links"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }}>
          <a href={profile.github} target="_blank" rel="noreferrer">GitHub &#8599;</a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn &#8599;</a>
          <a href={`mailto:${profile.email}`}>Email &#8599;</a>
          <span className="hero-hint">Press <kbd>{MOD_KEY}</kbd><kbd>K</kbd> for commands</span>
        </motion.div>
      </div>
    </header>
  )
}

function Stats() {
  return (
    <section className="wrap stats-wrap">
      <Reveal>
        <div className="stats">
          {profile.stats.map(s => (
            <div className="stat" key={s.label}>
              <div className="v"><CountUp value={s.value} /></div>
              <div className="l">{s.label}</div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  )
}

function About() {
  return (
    <section id="about" className="section wrap snap">
      <SectionHead eyebrow="01 / About" title='Building ML that <span class="muted">ships, not just trains.</span>' />
      <div className="about-grid">
        <Reveal delay={0.05}>
          <div className="about-body">
            <p>{profile.summary}</p>
            <p>
              I&apos;m currently completing my <strong>B.Tech in Computer Science</strong> at {education.school},
              working across the full ML lifecycle: framing the problem, engineering features, fine-tuning
              transformers, and wrapping everything in <strong>FastAPI</strong> or <strong>Streamlit</strong> so
              the work is usable on day one.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.12}>
          <div className="about-card">
            <div className="row"><h4>Focus</h4><p>Generative AI, NLP &amp; LLM applications</p></div>
            <div className="row"><h4>Education</h4><p>{education.degree} · {education.detail}</p></div>
            <div className="row"><h4>Based in</h4><p>{profile.location}</p></div>
            <div className="row"><h4>Email</h4><p>{profile.email}</p></div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function Projects() {
  return (
    <section id="work" className="section wrap snap">
      <SectionHead eyebrow="02 / Selected Work"
        title='Projects I&apos;ve <span class="muted">built &amp; shipped.</span>'
        sub="A few end-to-end systems, each with the model, the metrics, and a working interface." />
      <div className="proj-grid">
        {projects.map((p, i) => (
          <Reveal key={p.id} delay={(i % 2) * 0.06}>
            <Tilt>
              <article className="proj">
                <div className="proj-head">
                  <span className="proj-tag">{p.tag}</span>
                  <span className="proj-period">{p.period}</span>
                </div>
                <h3>{p.title}</h3>
                <p className="proj-blurb">{p.blurb}</p>
                <ul className="proj-points">
                  {p.highlights.slice(0, 3).map(h => <li key={h}>{h}</li>)}
                </ul>
                <div className="proj-foot">
                  <div className="stack">{p.stack.map(s => <span key={s}>{s}</span>)}</div>
                  <div className="proj-links-row">
                    {p.demo && <a className="proj-link demo" href={p.demo} target="_blank" rel="noreferrer">Live demo &#8599;</a>}
                    <a className="proj-link" href={p.link} target="_blank" rel="noreferrer">Code &#8599;</a>
                  </div>
                </div>
              </article>
            </Tilt>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

const LANG_COLORS = {
  Python: '#3572A5', JavaScript: '#f1e05a', TypeScript: '#3178c6',
  'Jupyter Notebook': '#DA5B0B', HTML: '#e34c26', CSS: '#563d7c',
  'C++': '#f34b7d', C: '#555555', Java: '#b07219',
}
const langColor = (l) => LANG_COLORS[l] || 'var(--ink-3)'

function GitHubRepos() {
  const [repos, setRepos] = useState(githubFallback)
  const [state, setState] = useState('loading')

  useEffect(() => {
    let alive = true
    fetch(`https://api.github.com/users/${githubUser}/repos?per_page=100&sort=pushed`)
      .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(data => {
        if (!alive || !Array.isArray(data)) return
        const cleaned = data
          .filter(r => !r.fork && r.name.toLowerCase() !== githubUser.toLowerCase())
          .map(r => ({
            name: r.name,
            display: r.name.replace(/[-_]/g, ' '),
            language: r.language,
            stars: r.stargazers_count,
            updated: r.pushed_at,
            description: r.description,
            url: r.html_url,
          }))
          .sort((a, b) => b.stars - a.stars || new Date(b.updated) - new Date(a.updated))
        if (cleaned.length) { setRepos(cleaned); setState('live') }
      })
      .catch(() => alive && setState('fallback'))
    return () => { alive = false }
  }, [])

  const fmt = (d) => {
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) }
    catch { return '' }
  }
  const langs = [...new Set(repos.map(r => r.language).filter(Boolean))]

  return (
    <section id="code" className="section wrap snap">
      <SectionHead eyebrow="03 / GitHub" title='Straight from the <span class="muted">source.</span>' />
      <div className="gh-meta">
        <span className={`gh-status ${state}`}>
          <span className="dot" />
          {state === 'live' ? 'Live from GitHub API' : state === 'loading' ? 'Fetching repositories...' : 'Latest snapshot'}
        </span>
        <span className="gh-count">{repos.length} repos · {langs.length} languages</span>
      </div>
      <div className="gh-grid">
        {repos.map((r, i) => (
          <Reveal key={r.name} delay={Math.min(i, 5) * 0.04}>
            <Tilt max={7}>
              <a className="gh-card" href={r.url} target="_blank" rel="noreferrer">
                <div className="gh-card-top">
                  <span className="gh-repo-icon" aria-hidden>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 13.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"/></svg>
                  </span>
                  <span className="gh-stars">&#9733; {r.stars}</span>
                </div>
                <h3 className="gh-name">{r.display}</h3>
                {r.description && <p className="gh-desc">{r.description}</p>}
                <div className="gh-card-foot">
                  {r.language && <span className="gh-lang"><i style={{ background: langColor(r.language) }} />{r.language}</span>}
                  <span>{fmt(r.updated)}</span>
                </div>
              </a>
            </Tilt>
          </Reveal>
        ))}
      </div>
      <Reveal>
        <a className="gh-all" href={profile.github} target="_blank" rel="noreferrer">View full GitHub profile &#8599;</a>
      </Reveal>
    </section>
  )
}

function Skills() {
  return (
    <section id="skills" className="section wrap snap">
      <SectionHead eyebrow="04 / Toolbox" title='The <span class="muted">stack</span> I work with.' />
      <div className="skills-grid">
        {skills.map((s, i) => (
          <Reveal key={s.group} delay={(i % 3) * 0.05}>
            <div className="skill-cell">
              <h4>{s.group}</h4>
              <div className="skill-tags">{s.items.map(it => <span key={it}>{it}</span>)}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function Path() {
  return (
    <section id="path" className="section wrap snap">
      <SectionHead eyebrow="05 / Experience" title='The <span class="muted">path</span> so far.' />
      <div className="timeline">
        {experience.map(e => (
          <Reveal key={e.company}>
            <div className="tl-item">
              <div className="tl-when">{e.period}</div>
              <div>
                <div className="tl-role">{e.role}</div>
                <div className="tl-org">{e.company}</div>
                <ul className="tl-points">{e.points.map(pt => <li key={pt}>{pt}</li>)}</ul>
              </div>
            </div>
          </Reveal>
        ))}
        <Reveal>
          <div className="tl-item">
            <div className="tl-when">{education.period}</div>
            <div>
              <div className="tl-role">{education.degree}</div>
              <div className="tl-org">{education.school} · {education.location}</div>
              <ul className="tl-points">
                <li>{education.detail}</li>
                <li>Ranked 7th in University Coding Showdown (Code of Duty), Mar 2024.</li>
              </ul>
            </div>
          </div>
        </Reveal>
      </div>

      <div className="cert-block">
        <Reveal><div className="eyebrow">Certifications</div></Reveal>
        <div className="cert-grid">
          {certifications.map((c, i) => (
            <Reveal key={c.name} delay={(i % 4) * 0.05}>
              <div className="cert">
                <div className="issuer">{c.issuer}</div>
                <div className="name">{c.name}</div>
                <div className="date">{c.date}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="contact" className="section wrap contact snap">
      <Reveal>
        <div className="contact-inner">
          <div className="eyebrow" style={{ justifyContent: 'center', display: 'inline-flex' }}>06 / Contact</div>
          <h2>Let&apos;s build something <span className="accent">intelligent.</span></h2>
          <p>Open to AI/ML engineering roles, internships and collaborations. The fastest way to reach me is email.</p>
          <div className="contact-actions">
            <a className="btn btn-primary" href={`mailto:${profile.email}`}>{profile.email}</a>
            <a className="btn btn-ghost" href={RESUME_URL} download>Download resume &darr;</a>
          </div>
          <div className="contact-socials">
            <a href={profile.github} target="_blank" rel="noreferrer">GitHub &#8599;</a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn &#8599;</a>
            <a href={`tel:${profile.phone.replace(/\s/g, '')}`}>{profile.phone}</a>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <span>Built with React · Vite</span>
      </div>
    </footer>
  )
}

export default function App() {
  const [theme, toggleTheme] = useTheme()

  const go = (id) => () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  const openUrl = (url) => () => window.open(url, '_blank', 'noopener')
  const downloadResume = () => {
    const a = document.createElement('a')
    a.href = RESUME_URL; a.download = 'Ayush_Das_ML_Resume.pdf'; a.click()
  }
  const commands = [
    { label: 'Go to About', hint: 'section', ico: '→', action: go('about') },
    { label: 'Go to Projects', hint: 'section', ico: '→', action: go('work') },
    { label: 'Go to GitHub code', hint: 'section', ico: '→', action: go('code') },
    { label: 'Go to Skills', hint: 'section', ico: '→', action: go('skills') },
    { label: 'Go to Experience', hint: 'section', ico: '→', action: go('path') },
    { label: 'Go to Contact', hint: 'section', ico: '→', action: go('contact') },
    { label: 'Download résumé', hint: 'file', ico: '↓', action: downloadResume },
    { label: 'Open GitHub profile', hint: 'link', ico: '↗', action: openUrl(profile.github) },
    { label: 'Open LinkedIn', hint: 'link', ico: '↗', action: openUrl(profile.linkedin) },
    { label: 'Email Ayush', hint: 'link', ico: '↗', action: () => { window.location.href = `mailto:${profile.email}` } },
    { label: 'Toggle light / dark theme', hint: 'appearance', ico: '◐', action: toggleTheme },
  ]

  return (
    <>
      <CustomCursor />
      <div className="bg" aria-hidden />
      <NeuralBackground theme={theme} />
      <div className="bg-glow" aria-hidden />
      <Progress />
      <Nav theme={theme} toggleTheme={toggleTheme} commands={commands} />
      <main>
        <Hero />
        <Stats />
        <About />
        <Projects />
        <GitHubRepos />
        <Skills />
        <Path />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
