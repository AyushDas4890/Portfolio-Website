import { useRef } from 'react'
import { useTone } from '../hooks/useTone'

export function Section({ tone = 'paper', id, className = '', children, ...rest }) {
  const ref = useRef(null)
  useTone(ref, tone)
  return (
    <section ref={ref} id={id} data-tone={tone} className={`section ${className}`} {...rest}>
      {children}
    </section>
  )
}
