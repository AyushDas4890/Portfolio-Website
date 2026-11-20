import { Fragment, useRef } from 'react'
import { useRevealed } from '../hooks/useRevealed'
import { useSwarmTarget } from '../swarm/Swarm'
import { useReducedMotion } from '../hooks/useReducedMotion'

/**
 * Instrument-style text reveal: every word rises out of its own mask, staggered.
 * Pass plain text in `text`; wrap words in *asterisks* to set them in italic.
 */
export function SplitText({ as: Tag = 'p', text, className = '', swarm, stagger = 0.035, ...rest }) {
  const ref = useRef(null)
  const swarmRef = useSwarmTarget(swarm || '')
  const reduced = useReducedMotion()
  const shown = useRevealed(ref) || reduced
  const words = text.split(' ')
  let italic = false
  return (
    <Tag
      ref={(n) => {
        ref.current = n
        if (swarm) swarmRef.current = n
      }}
      className={`split ${shown ? 'is-in' : ''} ${className}`}
      aria-label={text.replace(/\*/g, '')}
      {...rest}
    >
      {words.map((raw, i) => {
        const opens = raw.startsWith('*')
        const closes = raw.endsWith('*') || raw.endsWith('*.') || raw.endsWith('*,')
        if (opens) italic = true
        const word = raw.replace(/\*/g, '')
        const isItalic = italic
        if (closes) italic = false
        return (
          <Fragment key={i}>
            <span className="split-mask" aria-hidden="true">
              <span className={`split-word ${isItalic ? 'is-italic' : ''}`} style={{ '--i': i * stagger + 's' }}>
                {word}
              </span>
            </span>
            {i < words.length - 1 ? ' ' : null}
          </Fragment>
        )
      })}
    </Tag>
  )
}
