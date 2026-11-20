import { useEffect, useState } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'
import './island-demo.css'

const M = '/media/dynamic-island/'
// Each state is a real screenshot of the island, shown at its own aspect ratio.
const STATES = [
  { id: 'rest', w: 40, h: 12.7, src: M + 'island-spider.svg', label: 'Resting · Spider companion' },
  { id: 'music', w: 60, h: 39.2, src: M + 'now-playing.png', label: 'Now Playing' },
  { id: 'rest2', w: 40, h: 12.7, src: M + 'island-spider.svg', label: 'Back to rest' },
  { id: 'note', w: 70, h: 24.5, src: M + 'notification.png', label: 'Notification' },
  { id: 'rest3', w: 40, h: 12.7, src: M + 'island-spider.svg', label: 'Resting · Spider companion' },
  { id: 'timer', w: 66, h: 25.5, src: M + 'timer.png', label: 'Clock and timers' },
]
const HOLD = 2300

/**
 * A live re-creation of the island morphing between its states on a desktop,
 * driven by spring-like CSS transitions. Used where a screen recording would be.
 */
export function IslandDemo({ ratio = '16 / 10', className = '', paused = false }) {
  const [i, setI] = useState(0)
  const reduced = useReducedMotion()
  useEffect(() => {
    if (paused || reduced) return undefined
    const t = setInterval(() => setI((v) => (v + 1) % STATES.length), HOLD)
    return () => clearInterval(t)
  }, [paused, reduced])
  const s = STATES[i]
  return (
    <div
      className={`media island-demo ${className}`}
      style={{ aspectRatio: ratio }}
      role="img"
      aria-label="Animated demo: the Dynamic Island morphs from a thin sliver into music, notification, timer and Claude Code panels."
    >
      <div className="id-wall" />
      <div className="id-island" style={{ '--w': `${s.w}%`, '--h': `${s.h}%` }}>
        {STATES.map((x, k) => (
          <img key={x.id} src={x.src} alt="" className={k === i ? 'is-on' : ''} loading="lazy" />
        ))}
      </div>
      <p className="id-label mono">{s.label}</p>
    </div>
  )
}
