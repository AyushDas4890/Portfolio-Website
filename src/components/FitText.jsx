import { useLayoutEffect, useRef } from 'react'

/**
 * Sizes a single line of display text to exactly fill its container's width,
 * like Instrument's wordmark. Re-fits on resize and once web fonts load.
 */
export function FitText({ as: Tag = 'span', className = '', children, ...rest }) {
  const outer = useRef(null)
  const inner = useRef(null)
  useLayoutEffect(() => {
    const o = outer.current
    const i = inner.current
    if (!o || !i) return undefined
    const fit = () => {
      i.style.fontSize = '100px'
      const natural = i.scrollWidth
      if (!natural) return
      i.style.fontSize = `${(100 * o.clientWidth) / natural}px`
    }
    fit()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null
    ro?.observe(o)
    document.fonts?.ready.then(fit)
    return () => ro?.disconnect()
  }, [children])
  return (
    <Tag ref={outer} className={`fit ${className}`} {...rest}>
      <span ref={inner} className="fit-inner">{children}</span>
    </Tag>
  )
}
