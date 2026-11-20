import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Nav } from '../components/Nav'

export default function NotFound() {
  useEffect(() => {
    document.documentElement.dataset.tone = 'ink'
    document.title = 'Not found — Ayush Das'
  }, [])
  return (
    <main id="main" className="notfound">
      <Nav compact />
      <div className="notfound-body">
        <p className="mono muted">404 · No agent could find this page</p>
        <h1 className="serif-head">This page was <em>never built.</em></h1>
        <Link to="/" className="button">Back to the portfolio <span aria-hidden="true">→</span></Link>
      </div>
    </main>
  )
}
