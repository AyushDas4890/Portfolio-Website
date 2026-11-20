import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'

const at = (path) => render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>)

describe('routes', () => {
  it('renders a case study with its live link', () => {
    at('/work/relay')
    expect(screen.getByRole('heading', { level: 1, name: 'Relay' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /live site/i })[0]).toHaveAttribute('href', 'https://relay-landing-page-five.vercel.app')
  })
  it('shows a not-found page for an unknown slug', () => {
    at('/work/xyz')
    expect(screen.getByText(/never built/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back to the portfolio/i })).toHaveAttribute('href', '/')
  })
  it('lists all eight certifications on the home page', () => {
    at('/')
    const heading = screen.getByRole('heading', { name: 'Certifications' })
    const list = heading.parentElement.querySelector('.cert-list')
    expect(within(list).getAllByRole('link')).toHaveLength(8)
  })
  it('never shows the coding showdown', () => {
    at('/')
    expect(document.body.textContent).not.toMatch(/Coding Showdown/i)
  })
})

describe('work index', () => {
  it('lists every project and filters them', async () => {
    const { getAllByRole, getByRole } = render(<MemoryRouter initialEntries={['/work']}><App /></MemoryRouter>)
    expect(getAllByRole('link', { name: /case study$/ })).toHaveLength(6)
    getByRole('button', { name: 'Desktop' }).click()
    await new Promise((r) => setTimeout(r, 0))
    expect(getAllByRole('link', { name: /case study$/ })).toHaveLength(1)
  })
})
