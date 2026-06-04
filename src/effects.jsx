import { useState, useEffect, useRef } from 'react'

export const IS_MAC = typeof navigator !== 'undefined' &&
  /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent || '')
export const MOD_KEY = IS_MAC ? '⌘' : 'Ctrl'

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ---------- 3D tilt + cursor glow wrapper ---------- */
export function Tilt({ children, max = 9, className = '' }) {
  const ref = useRef(null)
  const onMove = (e) => {
    if (prefersReduced()) return
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    el.style.setProperty('--rx', ((0.5 - py) * max * 2).toFixed(2) + 'deg')
    el.style.setProperty('--ry', ((px - 0.5) * max * 2).toFixed(2) + 'deg')
    el.style.setProperty('--mx', (px * 100).toFixed(1) + '%')
    el.style.setProperty('--my', (py * 100).toFixed(1) + '%')
    el.style.setProperty('--glow', '1')
  }
  const onLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
    el.style.setProperty('--glow', '0')
  }
  return (
    <div ref={ref} className={`tilt ${className}`} onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
    </div>
  )
}

/* ---------- Count-up number ---------- */
export function CountUp({ value, duration = 1400 }) {
  const ref = useRef(null)
  const [display, setDisplay] = useState(value)
  useEffect(() => {
    const m = String(value).match(/^([^\d-]*)(-?[\d.]+)(.*)$/)
    if (prefersReduced() || !m) { setDisplay(value); return }
    const prefix = m[1], end = parseFloat(m[2]), suffix = m[3]
    const decimals = (m[2].split('.')[1] || '').length
    let started = false
    const el = ref.current
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !started) {
        started = true
        const t0 = performance.now()
        const tick = (now) => {
          const p = Math.min(1, (now - t0) / duration)
          const eased = 1 - Math.pow(1 - p, 3)
          setDisplay(prefix + (end * eased).toFixed(decimals) + suffix)
          if (p < 1) requestAnimationFrame(tick)
          else setDisplay(value)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.4 })
    if (el) io.observe(el)
    return () => io.disconnect()
  }, [value, duration])
  return <span ref={ref}>{display}</span>
}

/* ---------- Rotating typewriter ---------- */
export function Typewriter({ phrases, typeSpeed = 65, deleteSpeed = 32, pause = 1500 }) {
  const [idx, setIdx] = useState(0)
  const [sub, setSub] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const reduce = useRef(prefersReduced())

  useEffect(() => {
    if (reduce.current) return
    const full = phrases[idx]
    let t
    if (!deleting && sub < full.length) t = setTimeout(() => setSub(sub + 1), typeSpeed)
    else if (!deleting && sub === full.length) t = setTimeout(() => setDeleting(true), pause)
    else if (deleting && sub > 0) t = setTimeout(() => setSub(sub - 1), deleteSpeed)
    else if (deleting && sub === 0) { setDeleting(false); setIdx((idx + 1) % phrases.length) }
    return () => clearTimeout(t)
  }, [sub, deleting, idx, phrases, typeSpeed, deleteSpeed, pause])

  if (reduce.current) return <span className="tw">{phrases[0]}</span>
  return (
    <span className="tw">
      {phrases[idx].slice(0, sub)}
      <span className="tw-caret" aria-hidden>_</span>
    </span>
  )
}

/* ---------- Custom cursor (dot + lagging ring) ---------- */
export function CustomCursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches
    if (!fine || prefersReduced()) return
    document.documentElement.classList.add('has-cursor')
    const dot = dotRef.current, ring = ringRef.current
    let mx = window.innerWidth / 2, my = window.innerHeight / 2
    let rx = mx, ry = my
    let raf = 0, visible = false

    const onMove = (e) => {
      mx = e.clientX; my = e.clientY
      if (dot) dot.style.transform = `translate(${mx}px, ${my}px)`
      if (!visible) { visible = true; document.documentElement.classList.add('cursor-on') }
    }
    const onDown = () => ring && ring.classList.add('down')
    const onUp = () => ring && ring.classList.remove('down')
    const onOver = (e) => {
      const interactive = e.target.closest('a, button, input, .tilt, .skill-tags span, .cmdk-item')
      ring && ring.classList.toggle('hover', !!interactive)
    }
    const onLeaveWin = () => {
      visible = false
      document.documentElement.classList.remove('cursor-on')
    }

    const loop = () => {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18
      if (ring) ring.style.transform = `translate(${rx}px, ${ry}px)`
      raf = requestAnimationFrame(loop)
    }
    loop()
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('mouseover', onOver)
    window.addEventListener('mouseout', (e) => { if (!e.relatedTarget) onLeaveWin() })

    return () => {
      cancelAnimationFrame(raf)
      document.documentElement.classList.remove('has-cursor', 'cursor-on')
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('mouseover', onOver)
    }
  }, [])
  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden />
      <div ref={dotRef} className="cursor-dot" aria-hidden />
    </>
  )
}

/* ---------- Command palette ---------- */
export function CommandPalette({ commands }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen(o => !o) }
      else if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (open) { setQ(''); setActive(0); setTimeout(() => inputRef.current?.focus(), 30) }
  }, [open])

  const filtered = commands.filter(c =>
    c.label.toLowerCase().includes(q.toLowerCase()) ||
    (c.hint || '').toLowerCase().includes(q.toLowerCase()))

  const run = (c) => { setOpen(false); if (c) c.action() }
  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); run(filtered[active]) }
  }

  return (
    <>
      <button className="cmdk-trigger" onClick={() => setOpen(true)} aria-label="Open command palette">
        <span className="cmdk-mod">{MOD_KEY}</span><span className="cmdk-k">K</span>
      </button>
      {open && (
        <div className="cmdk-overlay" onMouseDown={() => setOpen(false)}>
          <div className="cmdk-panel" onMouseDown={e => e.stopPropagation()}>
            <div className="cmdk-input-row">
              <span className="cmdk-search">⌕</span>
              <input
                ref={inputRef}
                className="cmdk-input"
                placeholder="Type a command or search…"
                value={q}
                onChange={e => { setQ(e.target.value); setActive(0) }}
                onKeyDown={onKeyDown}
              />
              <kbd className="cmdk-esc">esc</kbd>
            </div>
            <div className="cmdk-list">
              {filtered.length === 0 && <div className="cmdk-empty">No matches</div>}
              {filtered.map((c, i) => (
                <button
                  key={c.label}
                  className={`cmdk-item ${i === active ? 'active' : ''}`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => run(c)}
                >
                  <span className="cmdk-item-ico">{c.ico}</span>
                  <span className="cmdk-item-label">{c.label}</span>
                  {c.hint && <span className="cmdk-item-hint">{c.hint}</span>}
                </button>
              ))}
            </div>
            <div className="cmdk-foot">
              <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
              <span><kbd>↵</kbd> select</span>
              <span><kbd>esc</kbd> close</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
