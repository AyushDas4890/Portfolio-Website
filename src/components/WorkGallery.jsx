import { Link } from 'react-router-dom'
import { Reveal } from './Reveal'
import { Cover } from './Cover'

export const FILTERS = ['All', 'AI Agents', 'ML', 'Full-stack', 'Desktop']
// Instrument-style mosaic: each row is a pair of card sizes.
const ROWS = [['big', 'small'], ['small', 'big'], ['half', 'half']]

export function WorkCard({ project, size, index }) {
  return (
    <Reveal as="article" swarm={project.title} className={`wcard is-${size}`}>
      <Link to={`/work/${project.slug}`} className="wcard-link" aria-label={`${project.title} case study`}>
        <Cover project={project} size={size} />
      </Link>
      <div className="wcard-cap">
        <p className="wcard-name">
          {index !== undefined && <span className="mono wcard-n">{String(index + 1).padStart(2, '0')}</span>}
          {project.title}
          <span className="wcard-year">{project.period}</span>
        </p>
        <p className="wcard-kicker">{project.kicker}</p>
        <ul className="tags">
          {project.tags.slice(0, 4).map((t) => <li key={t}>#{t.toLowerCase().replace(/\s+/g, '-')}</li>)}
        </ul>
      </div>
    </Reveal>
  )
}

/** Filter and display chips, as on Instrument's work page. */
export function WorkControls({ filter, setFilter, layout, setLayout, count }) {
  return (
    <div className="work-controls">
      <div className="chips" role="group" aria-label="Filter projects">
        <span className="mono muted">Filter:</span>
        {FILTERS.map((f) => (
          <button key={f} type="button" className={`chip ${filter === f ? 'is-on' : ''}`} aria-pressed={filter === f} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>
      <div className="chips" role="group" aria-label="Display">
        {count !== undefined && <span className="mono muted work-count">{String(count).padStart(2, '0')} projects</span>}
        <span className="mono muted">Display:</span>
        {['stack', 'grid'].map((l) => (
          <button key={l} type="button" className={`chip ${layout === l ? 'is-on' : ''}`} aria-pressed={layout === l} onClick={() => setLayout(l)}>
            {l === 'stack' ? (
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><rect x="1" y="1" width="10" height="10" rx="1.5" fill="none" stroke="currentColor" /></svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M1 1h4v4H1zM7 1h4v4H7zM1 7h4v4H1zM7 7h4v4H7z" fill="none" stroke="currentColor" /></svg>
            )}
            {l}
          </button>
        ))}
      </div>
    </div>
  )
}

/** Stack (mosaic of big/small pairs) or grid of squares. */
export function WorkGallery({ items, layout, numbered = false, all = items }) {
  if (layout === 'grid') {
    return (
      <div className="work-grid">
        {items.map((p) => <WorkCard key={p.slug} project={p} size="square" index={numbered ? all.indexOf(p) : undefined} />)}
      </div>
    )
  }
  const rows = []
  for (let i = 0, r = 0; i < items.length; r++) {
    const pattern = items.length - i === 1 ? ['full'] : ROWS[r % ROWS.length]
    rows.push(pattern.map((size, k) => ({ p: items[i + k], size })).filter((x) => x.p))
    i += pattern.length
  }
  return (
    <div className="mosaic">
      {rows.map((row, r) => (
        <div key={r} className="mosaic-row">
          {row.map(({ p, size }) => <WorkCard key={p.slug} project={p} size={size} index={numbered ? all.indexOf(p) : undefined} />)}
        </div>
      ))}
    </div>
  )
}
