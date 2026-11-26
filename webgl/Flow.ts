import * as THREE from 'three'
import { fullscreenVert } from './glsl'

/**
 * Cursor fluid flowmap, ping-ponged every frame.
 * r,g = velocity · b = fast intensity (the wet push) · a = slow memory (what stays "denoised").
 */
const frag = /* glsl */ `
uniform sampler2D tPrev;
uniform vec2 uMouse;
uniform vec2 uVel;
uniform float uAspect;
uniform float uRadius;
uniform float uActive;
varying vec2 vUv;
void main(){
  vec4 prev = texture2D(tPrev, vUv);
  vec2 d = vUv - uMouse; d.x *= uAspect;
  float speed = clamp(length(uVel) * 6.0, 0.0, 1.0);
  float f = smoothstep(uRadius, 0.0, length(d)) * uActive;
  vec2 vel = prev.rg * 0.93;
  vel = mix(vel, uVel * 8.0, f * speed);
  float b = prev.b * 0.955 + f * (0.08 + speed * 0.5);
  float a = max(prev.a * 0.9968, clamp(b, 0.0, 1.0) * 0.92);
  gl_FragColor = vec4(vel, clamp(b, 0.0, 1.0), a);
}
`

export class Flow {
  size = 192
  targets: THREE.WebGLRenderTarget[]
  index = 0
  scene = new THREE.Scene()
  camera = new THREE.Camera()
  material: THREE.ShaderMaterial
  mouse = new THREE.Vector2(-1, -1)
  last = new THREE.Vector2(-1, -1)
  vel = new THREE.Vector2()
  active = 0

  constructor() {
    const opts = { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false }
    this.targets = [new THREE.WebGLRenderTarget(this.size, this.size, opts), new THREE.WebGLRenderTarget(this.size, this.size, opts)]
    this.material = new THREE.ShaderMaterial({
      vertexShader: fullscreenVert,
      fragmentShader: frag,
      uniforms: {
        tPrev: { value: null },
        uMouse: { value: this.mouse },
        uVel: { value: this.vel },
        uAspect: { value: 1 },
        uRadius: { value: 0.16 },
        uActive: { value: 0 },
      },
      depthTest: false,
      depthWrite: false,
    })
    this.scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material))
  }

  get texture() {
    return this.targets[this.index].texture
  }

  resize(w: number, h: number) {
    this.material.uniforms.uAspect.value = w / h
    const sw = Math.round(this.size * Math.min(w / h, 2.5))
    this.targets.forEach((t) => t.setSize(sw, this.size))
  }

  /** x, y in 0..1 with y up. */
  move(x: number, y: number) {
    this.mouse.set(x, y)
    this.active = 1
  }

  update(renderer: THREE.WebGLRenderer) {
    if (this.last.x < 0) this.last.copy(this.mouse)
    this.vel.set(this.mouse.x - this.last.x, this.mouse.y - this.last.y)
    this.last.copy(this.mouse)
    this.material.uniforms.uActive.value = this.active
    this.active *= 0.9
    const read = this.targets[this.index]
    const write = this.targets[1 - this.index]
    this.material.uniforms.tPrev.value = read.texture
    renderer.setRenderTarget(write)
    renderer.render(this.scene, this.camera)
    renderer.setRenderTarget(null)
    this.index = 1 - this.index
  }
}
