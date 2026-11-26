import * as THREE from 'three'

/**
 * Neural bloom around a giant serif numeral. Points are sampled from the
 * glyph's outline and grow outward like dendrites, then fall back.
 */
const COUNT = 2400

const vert = /* glsl */ `
attribute vec2 aBase;
attribute vec3 aRand;
uniform float uTime;
uniform float uGrow;
uniform vec4 uRect;   // x, y, w, h of the numeral in css px
uniform vec2 uRes;
uniform vec2 uMouse;
varying float vAlpha;
varying float vWarm;
void main(){
  float life = fract(uTime * (0.05 + aRand.x * 0.07) + aRand.y);
  vec2 base = uRect.xy + aBase * uRect.zw;
  float ang = aRand.z * 6.2831 + sin(uTime * 0.3 + aRand.y * 9.0) * 0.6;
  float reach = (18.0 + 110.0 * aRand.x * aRand.x) * uGrow;
  vec2 dir = vec2(cos(ang), sin(ang));
  vec2 bend = vec2(-dir.y, dir.x) * sin(life * 3.0 + aRand.y * 6.0) * 14.0 * life;
  vec2 p = base + dir * reach * life + bend;
  vec2 dm = p - uMouse;
  p += normalize(dm + 0.0001) * 40.0 * smoothstep(160.0, 0.0, length(dm)) * uGrow;
  vec2 clip = (p / uRes) * 2.0 - 1.0; clip.y *= -1.0;
  gl_Position = vec4(clip, 0.0, 1.0);
  gl_PointSize = mix(3.2, 1.0, life) * (0.6 + aRand.z);
  vAlpha = sin(life * 3.14159) * uGrow;
  vWarm = aRand.y;
}
`
const frag = /* glsl */ `
varying float vAlpha;
varying float vWarm;
void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d) * vAlpha;
  vec3 c = mix(vec3(0.95, 0.78, 0.52), vec3(0.55, 0.74, 0.69), vWarm); // brass and verdigris
  gl_FragColor = vec4(c * a, a);
}
`

export class Bloom {
  points: THREE.Points
  material: THREE.ShaderMaterial
  el: HTMLElement | null = null
  grow = 0
  mouse = new THREE.Vector2(-9999, -9999)

  constructor() {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(COUNT * 3), 3))
    geo.setAttribute('aBase', new THREE.BufferAttribute(new Float32Array(COUNT * 2), 2))
    const rand = new Float32Array(COUNT * 3).map(() => Math.random())
    geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 3))
    this.material = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uGrow: { value: 0 },
        uRect: { value: new THREE.Vector4() },
        uRes: { value: new THREE.Vector2(1, 1) },
        uMouse: { value: this.mouse },
      },
    })
    this.points = new THREE.Points(geo, this.material)
    this.points.frustumCulled = false
    this.points.renderOrder = 5
    this.points.visible = false
  }

  /** Sample the glyph outline of `text` rendered in the numeral's font. */
  setGlyph(el: HTMLElement | null) {
    this.el = el
    if (!el) return
    const text = el.textContent?.trim() || 'I'
    const style = getComputedStyle(el)
    const c = document.createElement('canvas')
    const W = 512
    const H = 512
    c.width = W
    c.height = H
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    // Match the DOM glyph: same font size relative to the square it is drawn in.
    const rect = el.getBoundingClientRect()
    const s = Math.max(rect.width, rect.height, 1)
    const size = (parseFloat(style.fontSize) * W) / s
    ctx.font = `${style.fontWeight} ${size}px ${style.fontFamily}`
    const m = ctx.measureText(text)
    const y = H / 2 + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2
    ctx.textBaseline = 'alphabetic'
    ctx.fillText(text, W / 2, y)
    const data = ctx.getImageData(0, 0, W, H).data
    const edge: number[] = []
    const at = (x: number, y: number) => data[(y * W + x) * 4 + 3] > 128
    for (let y = 1; y < H - 1; y += 2) {
      for (let x = 1; x < W - 1; x += 2) {
        if (at(x, y) && (!at(x - 1, y) || !at(x + 1, y) || !at(x, y - 1) || !at(x, y + 1))) edge.push(x / W, y / H)
      }
    }
    const base = this.points.geometry.attributes.aBase.array as Float32Array
    const n = edge.length / 2
    for (let i = 0; i < COUNT; i++) {
      const j = Math.floor(Math.random() * Math.max(n, 1))
      base[i * 2] = edge[j * 2] ?? 0.5
      base[i * 2 + 1] = edge[j * 2 + 1] ?? 0.5
    }
    this.points.geometry.attributes.aBase.needsUpdate = true
  }

  update(vw: number, vh: number, time: number) {
    const on = !!this.el && this.el.isConnected
    this.grow += ((on ? 1 : 0) - this.grow) * 0.03
    this.points.visible = this.grow > 0.01
    if (!this.points.visible || !this.el) return
    const r = this.el.getBoundingClientRect()
    // The glyph was sampled in a square centred on the element.
    const s = Math.max(r.width, r.height)
    const u = this.material.uniforms
    u.uRect.value.set(r.left + r.width / 2 - s / 2, r.top + r.height / 2 - s / 2, s, s)
    u.uRes.value.set(vw, vh)
    u.uTime.value = time
    // Follow the DOM numeral's own fade (the chapter page dims it while you read).
    const dim = this.el.parentElement ? parseFloat(getComputedStyle(this.el.parentElement).opacity) || 0 : 1
    u.uGrow.value = this.grow * dim
  }
}
