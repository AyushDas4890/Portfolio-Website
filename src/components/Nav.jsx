import { Link, useLocation } from 'react-router-dom'
import { profile } from '../content/profile'
import { scrollToId } from './SmoothScroll'

function Pill({ to, children, active }) {
  const { pathname } = useLocation()
  const onHome = pathname === '/'
  const hash = to.startsWith('#') ? to.slice(1) : null
  if (hash && onHome) {
    return (
      <a href={to} className={`pill ${active ? 'is-active' : ''}`} onClick={(e) => { e.preventDefault(); scrollToId(hash) }}>
        {children}
      </a>
    )
  }
  return (
    <Link to={hash ? `/${to}` : to} className={`pill ${active ? 'is-active' : ''}`}>
      {children}
    </Link>
  )
}

export function Nav({ compact = false }) {
  const { pathname } = useLocation()
  return (
    <header className={`nav ${compact ? 'is-compact' : ''}`}>
      <nav aria-label="Main" className="nav-group">
        <Link to="/work" className={`pill ${pathname.startsWith('/work') ? 'is-active' : ''}`}>Work</Link>
        <Pill to="#about">About</Pill>
        <Pill to="#contact">Contact</Pill>
      </nav>
      {compact ? (
        <Link to="/" className="nav-mark" aria-label="Ayush Das, home">AYUSH DAS</Link>
      ) : (
        <span />
      )}
      <div className="nav-group">
        <a className="pill" href={profile.resume} target="_blank" rel="noreferrer">Résumé</a>
        <a className="pill hide-sm" href={profile.github} target="_blank" rel="noreferrer">GitHub</a>
        <a className="pill hide-sm" href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
      </div>
    </header>
  )
}
