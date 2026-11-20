import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { SwarmEngine } from './engine'
import { useReducedMotion } from '../hooks/useReducedMotion'
import './swarm.css'

const SwarmContext = createContext(null)

export function SwarmProvider({ children, routeKey }) {
  const reduced = useReducedMotion()
  const layerRef = useRef(null)
  const [engine, setEngine] = useState(null)
  const [status, setStatus] = useState(null)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (reduced || !layerRef.current) return undefined
    const e = new SwarmEngine(layerRef.current, { onStatus: setStatus })
    setEngine(e)
    return () => {
      e.destroy()
      setEngine(null)
      setStatus(null)
    }
  }, [reduced, routeKey])

  return (
    <SwarmContext.Provider value={engine}>
      {children}
      {!reduced && (
        <>
          <div ref={layerRef} className="swarm-layer" aria-hidden="true" />
          <div className={`swarm-status${collapsed ? ' is-collapsed' : ''}`} aria-hidden="true">
            <button type="button" tabIndex={-1} onClick={() => setCollapsed((c) => !c)} className="swarm-dots">
              <i style={{ background: '#FF5A36' }} />
              <i style={{ background: '#22B573' }} />
              <i style={{ background: '#F5A400' }} />
              <i style={{ background: '#5B7CFF' }} />
            </button>
            {!collapsed && (
              <span>
                {status
                  ? `${status.agents} agents · building ${String(status.index).padStart(2, '0')}/${String(status.total).padStart(2, '0')} — ${status.label}`
                  : 'agents idle'}
              </span>
            )}
          </div>
        </>
      )}
    </SwarmContext.Provider>
  )
}

/** Registers a block with the swarm. The block shows on its own; the swarm only decorates it. */
export function useSwarmTarget(label) {
  const engine = useContext(SwarmContext)
  const ref = useRef(null)
  useEffect(() => {
    if (!engine || !ref.current) return undefined
    return engine.register(ref.current, label)
  }, [engine, label])
  return ref
}
