import { useState } from 'react'
import { ProjectMedia } from './ProjectMedia'

/**
 * Instrument-style project card art: the project's own colour, typeface and logo,
 * with its live recording sliding in on hover (or always, when `live`).
 */
export function Cover({ project, size = 'big', live = false }) {
  const [hover, setHover] = useState(false)
  const c = project.cover
  const playing = live || hover
  return (
    <div
      className={`cover is-${size} ${playing ? 'is-playing' : ''}`}
      style={{ '--cbg': c.bg, '--cfg': c.fg, '--cac': c.accent || c.fg, '--cfont': c.font }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="cover-art" aria-hidden="true">
        {c.logo && <span className="cover-logo" style={{ WebkitMaskImage: `url(${c.logo})`, maskImage: `url(${c.logo})` }} />}
        <span className="cover-word">{c.word}</span>
        <span className="cover-note">{c.note}</span>
      </div>
      <div className="cover-media">
        <ProjectMedia project={project} paused={!playing} />
      </div>
      <span className="cover-pill mono">Case study <span aria-hidden="true">→</span></span>
    </div>
  )
}
