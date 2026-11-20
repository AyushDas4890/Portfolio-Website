import { Link } from 'react-router-dom'
import { profile } from '../content/profile'
import { projects } from '../content/projects'

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-cols">
        <div>
          <p className="eyebrow">Get in touch</p>
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
          <a href={`tel:${profile.phone.replace(/\s/g, '')}`}>{profile.phone}</a>
          <span className="muted">{profile.location}</span>
        </div>
        <div>
          <p className="eyebrow">Work</p>
          {projects.map((p) => (
            <Link key={p.slug} to={`/work/${p.slug}`}>{p.title}</Link>
          ))}
        </div>
        <div>
          <p className="eyebrow">Follow along</p>
          <a href={profile.github} target="_blank" rel="noreferrer">GitHub</a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          <a href={profile.resume} target="_blank" rel="noreferrer">Résumé (PDF)</a>
        </div>
      </div>
      <div className="footer-base">
        <span>© 2026 Ayush Das</span>
        <span>Designed and built by Ayush Das.</span>
      </div>
    </footer>
  )
}
