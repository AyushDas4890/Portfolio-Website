import * as THREE from 'three'
import gsap from 'gsap'
import { Flow } from './Flow'
import { Relief } from './Relief'
import { MediaPlane, type PlaneSource } from './MediaPlanes'
import { InkSwarm } from './InkSwarm'
import { Bloom } from './Bloom'

/** dark: 0 graphite wall, 1 near black · relief: how much of the wall shows · reveal: relief shown without the cursor. */
export type Scene = { dark: number; relief: number; ink: boolean; reveal?: number }

// Flat-wall colours (sRGB) the relief shader produces, so the clear colour matches it.
const WALL = [0.094, 0.088, 0.078]
const WALL_DARK = [0.034, 0.032, 0.028]

/** One renderer for the whole site. Pages tell it what to show. */
export class WebglApp {
  renderer: THREE.WebGLRenderer
  scene = new THREE.Scene()
  camera: THREE.OrthographicCamera
  flow = new Flow()
  relief: Relief
  ink = new InkSwarm()
  bloom = new Bloom()
  planes = new Set<MediaPlane>()
  planeGeo = new THREE.PlaneGeometry(1, 1, 24, 24)
  w = 1
  h = 1
  dpr = 1
  time = 0
  scroll = 0
  velocity = 0
  /** Extra reveal while the page is moving: the relief surfaces under fast scrolls. */
  scrollReveal = 0
  /** One-off bloom after the intro: the whole wall surfaces, then sinks back. */
  bloomReveal = { v: 0 }
  state = { dark: 0, relief: 1, reveal: 0, renoise: 0 }
  running = true
  clear = new THREE.Color()

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' })
    this.renderer.setClearColor(0x181714, 1)
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10)
    this.relief = new Relief(this.renderer, this.flow.texture)
    this.scene.add(this.relief.mesh, this.ink.mesh, this.bloom.points)
    this.resize()
    window.addEventListener('resize', this.resize)
    window.addEventListener('pointermove', this.onPointer, { passive: true })
    document.addEventListener('visibilitychange', () => (this.running = !document.hidden))
  }

  resize = () => {
    this.w = window.innerWidth
    this.h = window.innerHeight
    this.dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.renderer.setPixelRatio(this.dpr)
    this.renderer.setSize(this.w, this.h, false)
    Object.assign(this.camera, { left: -this.w / 2, right: this.w / 2, top: this.h / 2, bottom: -this.h / 2 })
    this.camera.updateProjectionMatrix()
    this.flow.resize(this.w, this.h)
    this.relief.resize(this.w, this.h, this.dpr)
    this.ink.resize(this.w, this.h)
  }

  onPointer = (e: PointerEvent) => {
    this.flow.move(e.clientX / this.w, 1 - e.clientY / this.h)
    this.ink.mouse.set(e.clientX, e.clientY)
    this.bloom.mouse.set(e.clientX, e.clientY)
  }

  /** Animate to a page's look. */
  setScene(s: Scene) {
    gsap.to(this.state, { dark: s.dark, relief: s.relief, reveal: s.reveal ?? 0, duration: 1.4, ease: 'power3.inOut' })
    this.ink.enabled = s.ink
  }

  /** The relief sinks back into the wall during a page change. */
  renoise(on: boolean) {
    return gsap.to(this.state, { renoise: on ? 1 : 0, duration: on ? 0.6 : 1.2, ease: on ? 'power2.in' : 'power3.out' })
  }

  addPlane(el: HTMLElement, source: PlaneSource) {
    const p = new MediaPlane(el, source, this.flow.texture, this.planeGeo)
    this.scene.add(p.mesh)
    this.planes.add(p)
    return p
  }

  removePlane(p: MediaPlane) {
    p.dispose()
    this.planes.delete(p)
  }

  /** End of the intro: a scripted hand passes over the wall once, so the relief shows itself. */
  sweep(duration = 2.4) {
    const o = { t: 0 }
    gsap.timeline()
      .to(this.bloomReveal, { v: 0.85, duration: duration * 0.45, ease: 'power2.out' })
      .to(this.bloomReveal, { v: 0, duration: duration * 0.9, ease: 'power2.inOut' })
    return gsap.to(o, {
      t: 1,
      duration,
      ease: 'sine.inOut',
      onUpdate: () => {
        const x = 0.1 + o.t * 0.8
        const y = 0.5 + Math.sin(o.t * Math.PI * 2.2) * 0.22
        this.flow.move(x, y)
      },
    })
  }

  tick(dt: number) {
    if (!this.running) return
    this.time += dt
    this.flow.update(this.renderer)
    const u = this.relief.material.uniforms
    u.uTime.value = this.time
    u.uDark.value = this.state.dark
    u.uAlpha.value = this.state.relief
    const target = Math.min(Math.abs(this.velocity) / 40, 1) * 0.55
    this.scrollReveal += (target - this.scrollReveal) * (target > this.scrollReveal ? 0.08 : 0.025)
    u.uReveal.value = Math.min(1, this.state.reveal + this.scrollReveal + this.bloomReveal.v)
    u.uRenoise.value = this.state.renoise
    u.uScroll.value = (this.scroll / this.h) * 0.12
    const [r, g, b] = WALL.map((v, i) => THREE.MathUtils.lerp(v, WALL_DARK[i], this.state.dark))
    this.renderer.setClearColor(this.clear.setRGB(r, g, b, THREE.SRGBColorSpace), 1)
    for (const p of this.planes) p.update(this.w, this.h, this.dpr, this.velocity, this.time, this.state.dark)
    this.ink.update(this.renderer, this.time)
    this.bloom.update(this.w, this.h, this.time)
    this.renderer.render(this.scene, this.camera)
  }
}

export function supportsWebgl() {
  try {
    const c = document.createElement('canvas')
    return !!c.getContext('webgl2')
  } catch {
    return false
  }
}
