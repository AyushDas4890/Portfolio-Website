import * as THREE from 'three'
import { noise, fullscreenVert } from './glsl'

/**
 * Ink creatures for the projects index: three "token streams" with a head and a
 * tapering body. Drawn into a feedback buffer that bleeds like ink in water.
 */
const SEGMENTS = 30
const CREATURES = 3

const fadeFrag = /* glsl */ `
${noise}
uniform sampler2D tPrev;
uniform float uTime;
uniform vec2 uRes;
varying vec2 vUv;
void main(){
  vec2 drift = vec2(snoise(vUv * 3.0 + uTime * 0.05), snoise(vUv * 3.0 - uTime * 0.05 + 4.0)) / uRes * 1.4;
  vec4 c = texture2D(tPrev, vUv + drift);
  vec2 px = 1.0 / uRes;
  c += texture2D(tPrev, vUv + drift + vec2(px.x, 0.0));
  c += texture2D(tPrev, vUv + drift - vec2(px.x, 0.0));
  c += texture2D(tPrev, vUv + drift + vec2(0.0, px.y));
  c += texture2D(tPrev, vUv + drift - vec2(0.0, px.y));
  c /= 5.0;
  gl_FragColor = vec4(c.rgb, c.a * 0.955);
}
`

const pointVert = /* glsl */ `
attribute float aSize;
attribute float aAlpha;
uniform vec2 uRes;
varying float vAlpha;
void main(){
  vAlpha = aAlpha;
  vec2 clip = (position.xy / uRes) * 2.0 - 1.0;
  clip.y *= -1.0;
  gl_Position = vec4(clip, 0.0, 1.0);
  gl_PointSize = aSize;
}
`
const pointFrag = /* glsl */ `
varying float vAlpha;
void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(vec3(0.02), a * a * vAlpha);
}
`
const compositeFrag = /* glsl */ `
uniform sampler2D tInk;
uniform float uAlpha;
varying vec2 vUv;
void main(){
  vec4 c = texture2D(tInk, vUv);
  // Verdigris smoke on the dark wall.
  gl_FragColor = vec4(vec3(0.5, 0.64, 0.61), clamp(c.a, 0.0, 0.85) * 0.32 * uAlpha);
}
`

type Creature = { head: THREE.Vector2; vel: THREE.Vector2; body: THREE.Vector2[]; phase: number; size: number }

export class InkSwarm {
  targets: THREE.WebGLRenderTarget[]
  index = 0
  fadeScene = new THREE.Scene()
  pointScene = new THREE.Scene()
  camera = new THREE.Camera()
  fadeMat: THREE.ShaderMaterial
  pointMat: THREE.ShaderMaterial
  points: THREE.Points
  mesh: THREE.Mesh
  creatures: Creature[] = []
  w = 1
  h = 1
  alpha = 0
  enabled = false
  mouse = new THREE.Vector2(-9999, -9999)

  constructor() {
    const opts = { type: THREE.HalfFloatType, depthBuffer: false }
    this.targets = [new THREE.WebGLRenderTarget(2, 2, opts), new THREE.WebGLRenderTarget(2, 2, opts)]
    this.fadeMat = new THREE.ShaderMaterial({
      vertexShader: fullscreenVert,
      fragmentShader: fadeFrag,
      uniforms: { tPrev: { value: null }, uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) } },
      depthTest: false,
    })
    this.fadeScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.fadeMat))

    const count = SEGMENTS * CREATURES * 3
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
    geo.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array(count), 1))
    geo.setAttribute('aAlpha', new THREE.BufferAttribute(new Float32Array(count), 1))
    this.pointMat = new THREE.ShaderMaterial({
      vertexShader: pointVert,
      fragmentShader: pointFrag,
      uniforms: { uRes: { value: new THREE.Vector2(1, 1) } },
      transparent: true,
      depthTest: false,
      blending: THREE.CustomBlending,
      blendEquation: THREE.MaxEquation,
    })
    this.points = new THREE.Points(geo, this.pointMat)
    this.points.frustumCulled = false
    this.pointScene.add(this.points)

    this.mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({
        vertexShader: fullscreenVert,
        fragmentShader: compositeFrag,
        uniforms: { tInk: { value: null }, uAlpha: { value: 0 } },
        transparent: true,
        depthTest: false,
      }),
    )
    this.mesh.frustumCulled = false
    this.mesh.renderOrder = -5
    this.mesh.visible = false

    for (let i = 0; i < CREATURES; i++) {
      const head = new THREE.Vector2(Math.random() * 800, Math.random() * 600)
      this.creatures.push({
        head,
        vel: new THREE.Vector2(1, 0).rotateAround(new THREE.Vector2(), Math.random() * 6.28),
        body: Array.from({ length: SEGMENTS }, () => head.clone()),
        phase: Math.random() * 10,
        size: 0.8 + i * 0.25,
      })
    }
  }

  resize(w: number, h: number) {
    this.w = w
    this.h = h
    const rw = Math.round(w / 2)
    const rh = Math.round(h / 2)
    this.targets.forEach((t) => t.setSize(rw, rh))
    this.fadeMat.uniforms.uRes.value.set(rw, rh)
    this.pointMat.uniforms.uRes.value.set(w, h)
  }

  update(renderer: THREE.WebGLRenderer, time: number) {
    this.alpha += ((this.enabled ? 1 : 0) - this.alpha) * 0.05
    this.mesh.visible = this.alpha > 0.01
    if (!this.mesh.visible) return
    const pos = this.points.geometry.attributes.position.array as Float32Array
    const size = this.points.geometry.attributes.aSize.array as Float32Array
    const alpha = this.points.geometry.attributes.aAlpha.array as Float32Array
    let k = 0
    const tmp = new THREE.Vector2()
    for (const c of this.creatures) {
      // Wander, keep inside the screen, and get curious about the cursor.
      const t = time * 0.4 + c.phase
      c.vel.rotateAround(new THREE.Vector2(), Math.sin(t * 1.3) * 0.02 + Math.sin(t * 0.37) * 0.015)
      const toMouse = tmp.copy(this.mouse).sub(c.head)
      const dm = toMouse.length()
      if (dm < 420 && dm > 40) c.vel.lerp(toMouse.normalize(), 0.025)
      const margin = 120
      if (c.head.x < margin) c.vel.x += 0.04
      if (c.head.x > this.w - margin) c.vel.x -= 0.04
      if (c.head.y < margin) c.vel.y += 0.04
      if (c.head.y > this.h - margin) c.vel.y -= 0.04
      c.vel.normalize()
      const speed = 1.4 + Math.sin(t * 2.1) * 0.5 + (dm < 200 ? 1.2 : 0)
      c.head.addScaledVector(c.vel, speed)
      c.body[0].copy(c.head)
      const spacing = 7 * c.size
      for (let i = 1; i < SEGMENTS; i++) {
        const prev = c.body[i - 1]
        const cur = c.body[i]
        const dir = tmp.copy(cur).sub(prev)
        const sway = Math.sin(t * 6 - i * 0.45) * 0.08
        dir.rotateAround(new THREE.Vector2(), sway).setLength(spacing)
        cur.copy(prev).add(dir)
      }
      for (let i = 0; i < SEGMENTS; i++) {
        const p = c.body[i]
        const u = i / (SEGMENTS - 1)
        const girth = Math.sin(Math.min(1, u * 1.6 + 0.12) * Math.PI) * (1 - u * 0.75)
        const s = (10 + 46 * girth) * c.size
        pos[k * 3] = p.x
        pos[k * 3 + 1] = p.y
        size[k] = s
        alpha[k] = 0.55
        k++
        // Fins: two softer dots near the front third.
        const fin = i === 7 || i === 8 ? 1 : 0
        const next = c.body[Math.min(i + 1, SEGMENTS - 1)]
        const n = tmp.copy(next).sub(p).normalize()
        const side = new THREE.Vector2(-n.y, n.x).multiplyScalar(s * 0.55)
        const flap = 1 + Math.sin(t * 5 + i) * 0.25
        for (const sign of [-1, 1]) {
          pos[k * 3] = p.x + side.x * sign * flap
          pos[k * 3 + 1] = p.y + side.y * sign * flap
          size[k] = fin * s * 0.9
          alpha[k] = fin * 0.32
          k++
        }
      }
    }
    this.points.geometry.attributes.position.needsUpdate = true
    this.points.geometry.attributes.aSize.needsUpdate = true
    this.points.geometry.attributes.aAlpha.needsUpdate = true

    const read = this.targets[this.index]
    const write = this.targets[1 - this.index]
    this.fadeMat.uniforms.tPrev.value = read.texture
    this.fadeMat.uniforms.uTime.value = time
    renderer.setRenderTarget(write)
    renderer.render(this.fadeScene, this.camera)
    renderer.autoClear = false
    renderer.render(this.pointScene, this.camera)
    renderer.autoClear = true
    renderer.setRenderTarget(null)
    this.index = 1 - this.index
    const m = this.mesh.material as THREE.ShaderMaterial
    m.uniforms.tInk.value = write.texture
    m.uniforms.uAlpha.value = this.alpha
  }
}
