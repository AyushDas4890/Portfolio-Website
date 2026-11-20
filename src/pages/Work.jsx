import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { projects } from '../content/projects'
import { profile } from '../content/profile'
import { Nav } from '../components/Nav'
import { Footer } from '../components/Footer'
import { Section } from '../components/Section'
import { FitText } from '../components/FitText'
import { SplitText } from '../components/SplitText'
import { Reveal } from '../components/Reveal'
import { WorkControls, WorkGallery } from '../components/WorkGallery'

/** The full work index, modelled on instrument.com/work. */
export default function Work() {
  const [filter, setFilter] = useState('All')
  const [layout, setLayout] = useState('stack')
  const shown = useMemo(() => (filter === 'All' ? projects : projects.filter((p) => p.category === filter)), [filter])

  useEffect(() => {
    document.title = 'Work — Ayush Das'
    document.documentElement.dataset.tone = 'paper'
    return () => { document.title = 'Ayush Das — AI/ML Engineer' }
  }, [])

  return (
    <main id="main" className="workpage">
      <Section tone="paper" className="workpage-top">
        <Nav />
        <h1 className="wordmark-wrap">
          <span className="sr-only">Work by Ayush Das</span>
          <FitText className="wordmark" aria-hidden="true">AYUSH&nbsp;DAS</FitText>
        </h1>
        <div className="workpage-gap" />
        <WorkControls filter={filter} setFilter={setFilter} layout={layout} setLayout={setLayout} count={shown.length} />
        <SplitText
          as="h2"
          swarm="Work"
          className="workpage-head"
          text="I build useful, honest, technology-first products that *take a model all the way to the people who use it.*"
        />
        {shown.length ? (
          <WorkGallery key={`${filter}-${layout}`} items={shown} layout={layout} numbered all={projects} />
        ) : (
          <p className="muted">No projects in this filter yet.</p>
        )}
      </Section>

      <Section tone="ink" className="workpage-cta">
        <Reveal className="workpage-cta-inner">
          <SplitText as="h2" className="contact-head" text="Have something *worth building?*" />
          <div className="hero-ctas">
            <a href={`mailto:${profile.email}`} className="button">Email me <span aria-hidden="true">→</span></a>
            <Link to="/" className="button is-ghost">Back home</Link>
          </div>
        </Reveal>
        <Footer />
      </Section>
    </main>
  )
}
