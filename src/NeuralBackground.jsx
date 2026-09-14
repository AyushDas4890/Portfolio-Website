import { useEffect, useRef } from 'react'

/*
  Reactive neural-network canvas.
  - Drifting nodes link with synapse lines when near each other.
  - Cursor glow: nodes near the pointer grow brighter and larger; a soft link forms to the cursor.
  - Click ripple: a shockwave expands from the click, pushing nodes outward and drawing pulse rings.
  - Scroll parallax: the whole field shifts vertically as the page scrolls.
  - Load-in: nodes fade and ease into place.
  - Theme-aware + honours prefers-reduced-motion.
*/
export default function NeuralBackground({ theme }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const accent = theme === 'light' ? [47, 111, 219] : [77, 159, 255]
    const [cr, cg, cb] = accent
    const rgba = (a) => `rgba(${cr},${cg},${cb},${a})`

    let w = 0, h = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let nodes = []
    let ripples = []
    let scrollY = window.scrollY
    let raf = 0
    let intro = reduce ? 1 : 0
    const mouse = { x: -9999, y: -9999, active: false }

    const MAX_DIST = 132
    const MAX_DIST_SQ = MAX_DIST * MAX_DIST
    const GLOW = 150
    const GLOW_SQ = GLOW * GLOW

    function resize() {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const target = Math.min(Math.round((w * h) / 15000), 120)
      nodes = new Array(target).fill(0).map(() => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        rad: Math.random() * 1.6 + 0.8,
      }))
    }

    const ease = (t) => 1 - Math.pow(1 - t, 3)

    function step() {
      if (intro < 1) intro = Math.min(1, intro + 0.02)
      const k = ease(intro)
      ctx.clearRect(0, 0, w, h)
      const parallax = (scrollY * 0.22) % h

      for (const n of nodes) {
        if (!reduce) { n.x += n.vx; n.y += n.vy }
        // friction so click impulses settle
        n.vx *= 0.985; n.vy *= 0.985
        // gentle baseline drift floor
        if (Math.abs(n.vx) < 0.05) n.vx += (Math.random() - 0.5) * 0.02
        if (Math.abs(n.vy) < 0.05) n.vy += (Math.random() - 0.5) * 0.02
        if (n.x < -20) n.x = w + 20
        if (n.x > w + 20) n.x = -20
        if (n.y < -20) n.y = h + 20
        if (n.y > h + 20) n.y = -20
      }

      const cx = w / 2, cy = h / 2
      const pts = nodes.map(n => {
        let py = n.y - parallax
        py = ((py % h) + h) % h
        // load-in: ease from centre outward
        const dx = (n.x - cx) * k + cx
        const dy = (py - cy) * k + cy
        return { x: dx, y: dy, n }
      })

      // links
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i]
        for (let j = i + 1; j < pts.length; j++) {
          const bp = pts[j]
          const dx = a.x - bp.x, dy = a.y - bp.y
          const d2 = dx * dx + dy * dy
          if (d2 < MAX_DIST_SQ) {
            const alpha = (1 - d2 / MAX_DIST_SQ) * 0.5 * k
            ctx.strokeStyle = rgba(alpha.toFixed(3))
            ctx.lineWidth = 1
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(bp.x, bp.y); ctx.stroke()
          }
        }
      }

      // ripples (click shockwaves)
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i]
        rp.r += rp.speed
        rp.alpha *= 0.96
        if (rp.r > rp.max || rp.alpha < 0.02) { ripples.splice(i, 1); continue }
        ctx.strokeStyle = rgba((rp.alpha * 0.6).toFixed(3))
        ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2); ctx.stroke()
        // push nodes near the wavefront
        if (!reduce) {
          for (const a of pts) {
            const dx = a.x - rp.x, dy = a.y - rp.y
            const d = Math.sqrt(dx * dx + dy * dy)
            if (Math.abs(d - rp.r) < 26 && d > 1) {
              const f = 0.5 * rp.alpha
              a.n.vx += (dx / d) * f
              a.n.vy += (dy / d) * f
            }
          }
        }
      }

      // cursor links
      if (mouse.active) {
        for (const a of pts) {
          const dx = a.x - mouse.x, dy = a.y - mouse.y
          const d2 = dx * dx + dy * dy
          if (d2 < (MAX_DIST * 1.7) ** 2) {
            const alpha = (1 - d2 / ((MAX_DIST * 1.7) ** 2)) * 0.55 * k
            ctx.strokeStyle = rgba(alpha.toFixed(3))
            ctx.lineWidth = 1
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke()
          }
        }
      }

      // velocity clamp
      for (const n of nodes) {
        n.vx = Math.max(-1.4, Math.min(1.4, n.vx))
        n.vy = Math.max(-1.4, Math.min(1.4, n.vy))
      }

      // nodes (with cursor glow)
      for (const a of pts) {
        let rad = a.n.rad, alpha = 0.85 * k
        if (mouse.active) {
          const dx = a.x - mouse.x, dy = a.y - mouse.y
          const d2 = dx * dx + dy * dy
          if (d2 < GLOW_SQ) {
            const g = 1 - d2 / GLOW_SQ
            rad += g * 2.4
            alpha = Math.min(1, alpha + g * 0.5)
          }
        }
        ctx.fillStyle = rgba(alpha.toFixed(3))
        ctx.beginPath(); ctx.arc(a.x, a.y, rad, 0, Math.PI * 2); ctx.fill()
      }

      raf = requestAnimationFrame(step)
    }

    const onScroll = () => { scrollY = window.scrollY }
    const onMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true }
    const onLeave = () => { mouse.active = false; mouse.x = -9999; mouse.y = -9999 }
    const onDown = (e) => {
      if (reduce) return
      ripples.push({ x: e.clientX, y: e.clientY, r: 0, max: Math.max(w, h) * 0.6, speed: 7, alpha: 0.9 })
      if (ripples.length > 6) ripples.shift()
    }

    resize()
    step()
    window.addEventListener('resize', resize)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseout', onLeave)
    window.addEventListener('mousedown', onDown)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseout', onLeave)
      window.removeEventListener('mousedown', onDown)
    }
  }, [theme])

  return <canvas ref={canvasRef} className="neural-canvas" aria-hidden="true" />
}
