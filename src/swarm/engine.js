// The agent swarm: coloured cursors that select blocks as they enter the viewport.
// Purely decorative. Content visibility never depends on it (see <Reveal>).
// All per-frame work is transforms on one fixed layer; React is not involved per frame.

export const AGENTS = [
  { name: 'PLANNER', color: '#FF5A36' },
  { name: 'SEARCHER', color: '#22B573' },
  { name: 'CRITIC', color: '#F5A400' },
  { name: 'WRITER', color: '#5B7CFF' },
]

const CURSOR_PATH = 'M1 1 L1 17 L5.5 13 L8.5 19.5 L11 18.4 L8 12 L14 12 Z'
const STIFF = 170 // spring stiffness
const DAMP = 24 // spring damping
const DRAG_MS = 620
const HOLD_MS = 260
const FADE_MS = 320
const MAX_QUEUE = 3

function el(tag, cls, parent) {
  const n = document.createElement(tag)
  if (cls) n.className = cls
  if (parent) parent.appendChild(n)
  return n
}

export class SwarmEngine {
  constructor(layer, { onStatus } = {}) {
    this.layer = layer
    this.onStatus = onStatus || (() => {})
    this.queue = []
    this.jobs = new Set()
    this.registered = new Map()
    this.order = 0
    this.last = performance.now()
    this.raf = 0
    this.running = false
    this.compact = window.innerWidth < 720
    const count = this.compact ? 2 : AGENTS.length
    this.agents = AGENTS.slice(0, count).map((a, i) => this.makeAgent(a, i, count))

    this.io = new IntersectionObserver((entries) => this.onIntersect(entries), {
      threshold: 0.2,
    })
    this.onVisibility = () => (document.hidden ? this.stop() : this.start())
    document.addEventListener('visibilitychange', this.onVisibility)
    this.onResize = () => this.agents.forEach((a, i) => this.rest(a, i))
    window.addEventListener('resize', this.onResize)
    this.start()
  }

  makeAgent(agent, i, count) {
    const node = el('div', 'agent', this.layer)
    node.style.setProperty('--agent', agent.color)
    node.innerHTML = `<svg width="15" height="21" viewBox="0 0 15 21" aria-hidden="true"><path d="${CURSOR_PATH}" fill="${agent.color}" stroke="#0b0b0b" stroke-width="1.1" stroke-linejoin="round"/></svg><span class="agent-tag">${agent.name}</span>`
    const a = { ...agent, node, x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, busy: false }
    // Agents enter from off-screen, then settle at their resting spots.
    a.x = window.innerWidth * (0.2 + 0.6 * (i / Math.max(1, count - 1)))
    a.y = window.innerHeight + 40
    this.rest(a, i)
    return a
  }

  rest(a, i) {
    if (a.busy) return
    const w = window.innerWidth
    const h = window.innerHeight
    // Resting spots sit in the page gutters so idle agents never cover text.
    const spots = [
      [w - 22, h * 0.24],
      [w - 22, h * 0.56],
      [4, h * 0.38],
      [4, h * 0.72],
    ]
    const [x, y] = spots[i % spots.length]
    a.tx = x
    a.ty = y
  }

  register(target, label) {
    const id = ++this.order
    this.registered.set(target, { id, label, done: false })
    this.io.observe(target)
    return () => {
      this.io.unobserve(target)
      this.registered.delete(target)
    }
  }

  onIntersect(entries) {
    for (const e of entries) {
      const meta = this.registered.get(e.target)
      if (!meta || meta.done || !e.isIntersecting) continue
      meta.done = true
      this.io.unobserve(e.target)
      this.queue.push({ target: e.target, label: meta.label, id: meta.id })
      // A fast jump floods the queue; keep only the newest few.
      while (this.queue.length > MAX_QUEUE) this.queue.shift()
    }
  }

  start() {
    if (this.running) return
    this.running = true
    this.last = performance.now()
    const loop = (now) => {
      if (!this.running) return
      this.tick(now)
      this.raf = requestAnimationFrame(loop)
    }
    this.raf = requestAnimationFrame(loop)
  }

  stop() {
    this.running = false
    cancelAnimationFrame(this.raf)
  }

  dispatch() {
    while (this.queue.length) {
      const free = this.agents.find((a) => !a.busy)
      if (!free) return
      const job = this.queue.shift()
      const r = job.target.getBoundingClientRect()
      // Skip blocks that have already left the viewport.
      if (r.bottom < 0 || r.top > window.innerHeight) continue
      this.begin(free, job)
    }
  }

  begin(agent, job) {
    agent.busy = true
    agent.node.classList.add('is-busy')
    const box = el('div', 'agent-box', this.layer)
    box.style.setProperty('--agent', agent.color)
    el('i', 'h tl', box); el('i', 'h tr', box); el('i', 'h bl', box); el('i', 'h br', box)
    const tag = el('span', 'agent-box-tag', box)
    tag.textContent = `${agent.name} · ${job.label}`
    this.jobs.add({ agent, job, box, phase: 'travel', t: 0 })
    const total = this.registered.size
    this.onStatus({ label: job.label, index: job.id, total, agents: this.agents.length })
  }

  tick(now) {
    const dt = Math.min(0.05, (now - this.last) / 1000)
    this.last = now
    this.dispatch()

    for (const j of this.jobs) {
      const r = j.job.target.getBoundingClientRect()
      const left = Math.max(8, r.left)
      const top = Math.max(8, r.top)
      const right = Math.min(window.innerWidth - 8, r.right)
      const bottom = Math.min(window.innerHeight - 8, r.bottom)
      const w = Math.max(0, right - left)
      const h = Math.max(0, bottom - top)
      const a = j.agent
      j.t += dt * 1000

      if (j.phase === 'travel') {
        a.tx = left
        a.ty = top
        if (Math.hypot(a.x - left, a.y - top) < 14 || j.t > 900) { j.phase = 'drag'; j.t = 0 }
        j.box.style.opacity = '0'
      } else if (j.phase === 'drag') {
        const p = 1 - Math.pow(1 - Math.min(1, j.t / DRAG_MS), 3)
        a.tx = left + w * p
        a.ty = top + h * p
        a.x = a.tx
        a.y = a.ty
        this.place(j.box, left, top, w * p, h * p, 1)
        if (j.t >= DRAG_MS) { j.phase = 'hold'; j.t = 0 }
      } else if (j.phase === 'hold') {
        a.tx = right
        a.ty = bottom
        this.place(j.box, left, top, w, h, 1)
        if (j.t >= HOLD_MS) {
          j.phase = 'fade'
          j.t = 0
          a.busy = false
          a.node.classList.remove('is-busy')
          this.rest(a, this.agents.indexOf(a))
        }
      } else if (j.phase === 'fade') {
        this.place(j.box, left, top, w, h, 1 - Math.min(1, j.t / FADE_MS))
        if (j.t >= FADE_MS) {
          j.box.remove()
          this.jobs.delete(j)
        }
      }
    }

    for (const a of this.agents) {
      const ax = STIFF * (a.tx - a.x) - DAMP * a.vx
      const ay = STIFF * (a.ty - a.y) - DAMP * a.vy
      a.vx += ax * dt
      a.vy += ay * dt
      a.x += a.vx * dt
      a.y += a.vy * dt
      a.node.style.transform = `translate3d(${a.x.toFixed(1)}px, ${a.y.toFixed(1)}px, 0)`
    }
  }

  place(box, x, y, w, h, opacity) {
    box.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
    box.style.width = `${w.toFixed(1)}px`
    box.style.height = `${h.toFixed(1)}px`
    box.style.opacity = String(opacity)
  }

  destroy() {
    this.stop()
    this.io.disconnect()
    document.removeEventListener('visibilitychange', this.onVisibility)
    window.removeEventListener('resize', this.onResize)
    this.layer.innerHTML = ''
  }
}
