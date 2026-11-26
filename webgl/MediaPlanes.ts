import * as THREE from 'three'
import { noise } from './glsl'

const vert = /* glsl */ `
uniform float uVelocity;
uniform float uProgress;
varying vec2 vUv;
void main(){
  vUv = uv;
  vec3 p = position;
  // Scroll-velocity bend and a slight lift while the plane is revealing.
  p.y += sin(uv.x * 3.14159) * uVelocity * 0.06;
  p.x += sin(uv.y * 3.14159) * uVelocity * 0.01;
  p.y -= (1.0 - uProgress) * 0.04;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`

const frag = /* glsl */ `
${noise}
uniform sampler2D tMap;
uniform sampler2D tFlow;
uniform vec2 uPlane;
uniform vec2 uImage;
uniform vec2 uRes;
uniform float uProgress;
uniform float uParallax;
uniform float uHover;
uniform float uSeed;
uniform float uTime;
uniform float uDark;
uniform float uReady;
varying vec2 vUv;

void main(){
  vec2 ratio = vec2(min((uPlane.x / uPlane.y) / (uImage.x / uImage.y), 1.0), min((uImage.x / uImage.y) / (uPlane.x / uPlane.y), 1.0));
  vec2 uv = vec2(vUv.x * ratio.x + (1.0 - ratio.x) * 0.5, vUv.y * ratio.y + (1.0 - ratio.y) * 0.5);
  float zoom = 1.12 - 0.05 * uHover - 0.1 * (1.0 - uProgress);
  uv = (uv - 0.5) / zoom + 0.5;
  uv.y += uParallax * 0.045;

  vec4 fl = texture2D(tFlow, gl_FragCoord.xy / uRes);
  uv -= fl.rg * 0.012 * fl.b;

  // Images emerge from noise: a grain band runs ahead of the clean image.
  float n = 0.5 + 0.5 * fbm(vUv * vec2(3.0, 2.2) + uSeed);
  float p = uProgress * 1.35;
  float shape = smoothstep(n - 0.02, n, p);
  float image = smoothstep(n + 0.06, n + 0.22, p) * uReady;

  vec3 tex = texture2D(tMap, uv).rgb;
  float lum = dot(tex, vec3(0.299, 0.587, 0.114));
  float g = hash12(gl_FragCoord.xy + fract(uTime) * 60.0);
  vec3 latent = vec3(0.17, 0.15, 0.125) * (1.0 - 0.45 * uDark) + (g - 0.5) * 0.3 + (lum - 0.5) * 0.25;
  vec3 col = mix(latent, tex, image);
  gl_FragColor = vec4(col, shape);
}
`

export type PlaneSource = HTMLImageElement | HTMLVideoElement

export class MediaPlane {
  mesh: THREE.Mesh
  material: THREE.ShaderMaterial
  texture: THREE.Texture
  el: HTMLElement
  progress = 0
  hover = 0
  hoverTarget = 0
  alive = true

  constructor(el: HTMLElement, source: PlaneSource, flow: THREE.Texture, geometry: THREE.PlaneGeometry) {
    this.el = el
    const isVideo = source instanceof HTMLVideoElement
    this.texture = isVideo ? new THREE.VideoTexture(source) : new THREE.Texture(source)
    this.texture.colorSpace = THREE.NoColorSpace // raw shader: pass sRGB through untouched
    this.texture.minFilter = THREE.LinearFilter
    this.texture.generateMipmaps = false
    this.material = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthTest: false,
      uniforms: {
        tMap: { value: this.texture },
        tFlow: { value: flow },
        uPlane: { value: new THREE.Vector2(1, 1) },
        uImage: { value: new THREE.Vector2(16, 10) },
        uRes: { value: new THREE.Vector2(1, 1) },
        uProgress: { value: 0 },
        uParallax: { value: 0 },
        uHover: { value: 0 },
        uVelocity: { value: 0 },
        uSeed: { value: Math.random() * 10 },
        uTime: { value: 0 },
        uDark: { value: 0 },
        uReady: { value: 0 },
      },
    })
    this.mesh = new THREE.Mesh(geometry, this.material)
    this.mesh.frustumCulled = false
    this.mesh.visible = false

    const ready = () => {
      const w = isVideo ? (source as HTMLVideoElement).videoWidth : (source as HTMLImageElement).naturalWidth
      const h = isVideo ? (source as HTMLVideoElement).videoHeight : (source as HTMLImageElement).naturalHeight
      if (!w || !h) return
      this.material.uniforms.uImage.value.set(w, h)
      this.texture.needsUpdate = true
      this.material.uniforms.uReady.value = 1
    }
    if (isVideo) {
      const v = source as HTMLVideoElement
      if (v.readyState >= 2) ready()
      else v.addEventListener('loadeddata', ready, { once: true })
    } else {
      const img = source as HTMLImageElement
      if (img.complete && img.naturalWidth) ready()
      else img.addEventListener('load', ready, { once: true })
    }
  }

  update(vw: number, vh: number, dpr: number, velocity: number, time: number, dark: number) {
    const r = this.el.getBoundingClientRect()
    const visible = r.bottom > -100 && r.top < vh + 100 && r.width > 0
    this.mesh.visible = visible && this.progress > 0.001
    if (!this.mesh.visible) return
    this.mesh.scale.set(r.width, r.height, 1)
    this.mesh.position.set(r.left + r.width / 2 - vw / 2, vh / 2 - (r.top + r.height / 2), 0)
    this.hover += (this.hoverTarget - this.hover) * 0.08
    const u = this.material.uniforms
    u.uPlane.value.set(r.width, r.height)
    u.uRes.value.set(vw * dpr, vh * dpr)
    u.uProgress.value = this.progress
    u.uParallax.value = ((r.top + r.height / 2) / vh - 0.5) * 2
    u.uHover.value = this.hover
    u.uVelocity.value += (THREE.MathUtils.clamp(velocity / 40, -1, 1) - u.uVelocity.value) * 0.12
    u.uTime.value = time
    u.uDark.value = dark
  }

  dispose() {
    this.alive = false
    this.texture.dispose()
    this.material.dispose()
    this.mesh.removeFromParent()
  }
}
