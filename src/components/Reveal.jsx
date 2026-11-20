import { useCallback, useRef } from 'react'
import { useRevealed } from '../hooks/useRevealed'
import { useSwarmTarget } from '../swarm/Swarm'
import { useReducedMotion } from '../hooks/useReducedMotion'

/**
 * Fades and lifts a block in when it enters the viewport. If `swarm` is set,
 * an agent also selects the block. The reveal never waits for the agent.
 */
export function Reveal({ as: Tag = 'div', swarm, delay = 0, className = '', style, children, ...rest }) {
  const local = useRef(null)
  const swarmRef = useSwarmTarget(swarm || '')
  const reduced = useReducedMotion()
  const setRef = useCallback(
    (node) => {
      local.current = node
      if (swarm) swarmRef.current = node
    },
    [swarm, swarmRef],
  )
  const shown = useRevealed(local) || reduced
  return (
    <Tag
      ref={setRef}
      className={`reveal ${shown ? 'is-in' : ''} ${className}`}
      style={{ ...style, '--d': `${Math.min(delay, 0.4)}s` }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
