import { render } from '@testing-library/react'
import { MediaLoop } from './MediaLoop'
import { SwarmProvider } from '../swarm/Swarm'

describe('MediaLoop', () => {
  it('shows the poster image even when playback is blocked', () => {
    const { container } = render(<MediaLoop src="/x.mp4" poster="/p.jpg" alt="demo" />)
    const img = container.querySelector('img')
    expect(img).toHaveAttribute('src', '/p.jpg')
    expect(container.querySelector('.media')).not.toHaveClass('is-playing')
    expect(container.querySelector('.media').style.aspectRatio).toBe('16 / 10')
  })
})

describe('Swarm', () => {
  it('renders no agents when the user prefers reduced motion', () => {
    const original = window.matchMedia
    window.matchMedia = (q) => ({ matches: q.includes('reduce'), media: q, addEventListener() {}, removeEventListener() {} })
    const { container } = render(<SwarmProvider><p>content</p></SwarmProvider>)
    expect(container.querySelector('.swarm-layer')).toBeNull()
    expect(container.querySelector('.swarm-status')).toBeNull()
    window.matchMedia = original
  })
})
