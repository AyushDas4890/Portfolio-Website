import * as THREE from 'three'
import { fullscreenVert, noise } from './glsl'

/**
 * A hidden bas-relief in a dark wall.
 *
 * A botanical composition (vines, veined leaves, layered blossoms, fern
 * fiddleheads, scallop shells, berries) is generated from a seed and baked once
 * into a height map. The wall stays smooth until the cursor's fluid trail
 * passes; then the relief rises out of it as patinated bronze (brass on the
 * ridges, verdigris in the crevices) and sinks back as the trail fades.
 */

const ROWS = 11
const COLS = 64

// Data texture rows (RGBA float per item):
// 0,1 stems  · a.xy b.xy | ctrl.xy thickness
// 2,3 leaves · base.xy tip.xy | ctrl.xy width curl
// 4,5 blooms · c.xy radius rot | petals layers cup
// 6,7 spirals· c.xy size rot | mirror turns
// 8,9 shells · c.xy size rot | ribs
// 10  berries· c.xy radius

type V2 = [number, number]

function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const bez = (a: V2, c: V2, b: V2, t: number): V2 => {
  const u = 1 - t
  return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]
}
const bezTan = (a: V2, c: V2, b: V2, t: number): V2 => {
  const x = 2 * (1 - t) * (c[0] - a[0]) + 2 * t * (b[0] - c[0])
  const y = 2 * (1 - t) * (c[1] - a[1]) + 2 * t * (b[1] - c[1])
  const l = Math.hypot(x, y) || 1
  return [x / l, y / l]
}

/** Grow the composition: vines wander across a 2:1 wall and sprout leaves, flowers and curls. */
export function compose(seed = 4890) {
  const r = rng(seed)
  const R = (a: number, b: number) => a + (b - a) * r()
  const stems: number[][] = []
  const leaves: number[][] = []
  const blooms: number[][] = []
  const spirals: number[][] = []
  const shells: number[][] = []
  const berries: number[][] = []
  const heads: V2[] = []

  const starts: [V2, number][] = [
    [[-0.05, 0.18], 0.35],
    [[0.32, -0.04], 1.25],
    [[0.78, 1.04], -1.35],
    [[1.12, -0.05], 1.75],
    [[1.55, 1.05], -1.9],
    [[2.05, 0.3], 2.95],
    [[2.05, 0.82], -2.8],
    [[-0.05, 0.86], -0.25],
  ]
  for (const [start, heading] of starts) {
    let p = start
    let dir = heading
    let thick = R(0.0075, 0.0095)
    const segs = 3 + Math.floor(r() * 2)
    for (let s = 0; s < segs && stems.length < COLS; s++) {
      const len = R(0.2, 0.3)
      const b: V2 = [p[0] + Math.cos(dir) * len, p[1] + Math.sin(dir) * len]
      const bend = R(0.18, 0.36) * (r() < 0.5 ? -1 : 1)
      const c: V2 = [(p[0] + b[0]) / 2 - Math.sin(dir) * len * bend, (p[1] + b[1]) / 2 + Math.cos(dir) * len * bend]
      stems.push([p[0], p[1], b[0], b[1], c[0], c[1], thick, 0])
      // Leaves, alternating sides along the segment.
      for (const t of [0.32, 0.72]) {
        if (r() < 0.18) continue
        const at = bez(p, c, b, t)
        const tan = bezTan(p, c, b, t)
        const side = t < 0.5 ? 1 : -1
        const ang = Math.atan2(tan[1], tan[0]) + side * R(0.55, 1.05)
        const L = R(0.11, 0.17)
        const tip: V2 = [at[0] + Math.cos(ang) * L, at[1] + Math.sin(ang) * L]
        const curve = R(0.12, 0.24) * side
        const ctrl: V2 = [(at[0] + tip[0]) / 2 - Math.sin(ang) * L * curve, (at[1] + tip[1]) / 2 + Math.cos(ang) * L * curve]
        leaves.push([at[0], at[1], tip[0], tip[1], ctrl[0], ctrl[1], R(0.028, 0.042), R(0, 1)])
        if (r() < 0.25) {
          for (let k = 0; k < 3; k++) {
            const off = R(0.02, 0.04)
            const a2 = ang + Math.PI + R(-1, 1)
            berries.push([at[0] + Math.cos(a2) * off, at[1] + Math.sin(a2) * off, R(0.009, 0.014), 0])
          }
        }
      }
      p = b
      dir += R(-0.6, 0.6)
      thick *= 0.88
    }
    heads.push(p)
    if (r() < 0.62) blooms.push([p[0], p[1], R(0.085, 0.13), R(0, 6.28), 5 + Math.floor(r() * 4), 3 + Math.floor(r() * 2), R(0.4, 1), 0])
    else spirals.push([p[0], p[1], R(0.045, 0.065), R(0, 6.28), r() < 0.5 ? -1 : 1, R(2.1, 2.8), 0, 0])
  }

  // Free blossoms and shells fill the open plaster, away from what already grew.
  const taken = () => [...blooms.map((b) => [b[0], b[1], b[2]]), ...shells.map((s) => [s[0], s[1], s[2]])]
  const free = (x: number, y: number, rad: number) => taken().every(([a, b, c]) => Math.hypot(a - x, b - y) > c + rad + 0.06)
  for (let i = 0; i < 60 && blooms.length < 10; i++) {
    const x = R(0.1, 1.9)
    const y = R(0.12, 0.88)
    const rad = R(0.07, 0.11)
    if (free(x, y, rad)) blooms.push([x, y, rad, R(0, 6.28), 5 + Math.floor(r() * 3), 2 + Math.floor(r() * 2), R(0.3, 0.9), 0])
  }
  for (let i = 0; i < 80 && shells.length < 5; i++) {
    const x = R(0.1, 1.9)
    const y = R(0.1, 0.9)
    const rad = R(0.06, 0.09)
    if (free(x, y, rad)) shells.push([x, y, rad, R(0, 6.28), 14 + Math.floor(r() * 8), 0, 0, 0])
  }
  return { stems, leaves: leaves.slice(0, COLS), blooms: blooms.slice(0, 10), spirals: spirals.slice(0, 8), shells, berries: berries.slice(0, COLS) }
}

function dataTexture(c: ReturnType<typeof compose>) {
  const d = new Float32Array(COLS * ROWS * 4)
  const put = (row: number, i: number, v: number[]) => d.set(v.slice(0, 4), (row * COLS + i) * 4)
  c.stems.forEach((s, i) => (put(0, i, s.slice(0, 4)), put(1, i, s.slice(4))))
  c.leaves.forEach((s, i) => (put(2, i, s.slice(0, 4)), put(3, i, s.slice(4))))
  c.blooms.forEach((s, i) => (put(4, i, s.slice(0, 4)), put(5, i, s.slice(4))))
  c.spirals.forEach((s, i) => (put(6, i, s.slice(0, 4)), put(7, i, s.slice(4))))
  c.shells.forEach((s, i) => (put(8, i, s.slice(0, 4)), put(9, i, s.slice(4))))
  c.berries.forEach((s, i) => put(10, i, s))
  const t = new THREE.DataTexture(d, COLS, ROWS, THREE.RGBAFormat, THREE.FloatType)
  t.needsUpdate = true
  return t
}

const bakeFrag = /* glsl */ `
uniform sampler2D tData;
uniform ivec4 uCountA; // stems, leaves, blooms, spirals
uniform ivec2 uCountB; // shells, berries
varying vec2 vUv;
const float PI = 3.14159265;

vec4 item(int i, int row){ return texelFetch(tData, ivec2(i, row), 0); }
float smax(float a, float b, float k){ float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(a, b, h) + k * h * (1.0 - h); }
mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

// Distance to a quadratic bezier (A, control B, C) and the curve parameter there.
vec2 bezier(vec2 pos, vec2 A, vec2 B, vec2 C){
  vec2 a = B - A; vec2 b = A - 2.0 * B + C; vec2 c = a * 2.0; vec2 d = A - pos;
  float kk = 1.0 / max(dot(b, b), 1e-7);
  float kx = kk * dot(a, b);
  float ky = kk * (2.0 * dot(a, a) + dot(d, b)) / 3.0;
  float kz = kk * dot(d, a);
  float p = ky - kx * kx; float p3 = p * p * p;
  float q = kx * (2.0 * kx * kx - 3.0 * ky) + kz;
  float h = q * q + 4.0 * p3;
  float res; float t;
  if (h >= 0.0) {
    h = sqrt(h);
    vec2 x = (vec2(h, -h) - q) / 2.0;
    vec2 uv = sign(x) * pow(abs(x), vec2(1.0 / 3.0));
    t = clamp(uv.x + uv.y - kx, 0.0, 1.0);
    vec2 w = d + (c + b * t) * t; res = dot(w, w);
  } else {
    float z = sqrt(-p);
    float v = acos(q / (p * z * 2.0)) / 3.0;
    float m = cos(v); float n = sin(v) * 1.732050808;
    vec3 tt = clamp(vec3(m + m, -n - m, n - m) * z - kx, 0.0, 1.0);
    vec2 wx = d + (c + b * tt.x) * tt.x; float dx = dot(wx, wx);
    vec2 wy = d + (c + b * tt.y) * tt.y; float dy = dot(wy, wy);
    if (dx < dy) { res = dx; t = tt.x; } else { res = dy; t = tt.y; }
  }
  return vec2(sqrt(res), t);
}

float stem(vec2 p, vec4 s0, vec4 s1){
  vec2 mid = (s0.xy + s0.zw) * 0.5;
  if (length(p - mid) > length(s0.zw - s0.xy) * 0.75 + 0.03) return 0.0;
  vec2 dt = bezier(p, s0.xy, s1.xy, s0.zw);
  float T = s1.z * mix(1.0, 0.8, dt.y);
  float x = dt.x / T;
  if (x >= 1.0) return 0.0;
  return T * 14.0 * sqrt(1.0 - x * x);
}

float leaf(vec2 p, vec4 l0, vec4 l1){
  vec2 mid = (l0.xy + l0.zw) * 0.5;
  if (length(p - mid) > length(l0.zw - l0.xy) * 0.62 + l1.z) return 0.0;
  vec2 dt = bezier(p, l0.xy, l1.xy, l0.zw);
  float t = dt.y;
  float w = l1.z * pow(sin(PI * pow(t, 0.7)), 0.8);
  float x = dt.x / max(w, 1e-4);
  if (x >= 1.0) return 0.0;
  float body = sqrt(1.0 - x * x);
  float h = 0.36 * body * (0.5 + 0.5 * sin(PI * t));
  h -= 0.045 * exp(-x * x * 70.0) * smoothstep(0.0, 0.15, t);       // midrib groove
  float vein = sin(2.0 * PI * (t * 8.0 - x * 1.5));
  h += 0.02 * smoothstep(0.7, 1.0, vein) * (1.0 - x) * t;             // side veins
  h += l1.w * 0.2 * smoothstep(0.5, 1.0, t) * x * x;                   // curling edge
  return h * smoothstep(1.0, 0.86, x);
}

float bloom(vec2 p, vec4 b0, vec4 b1){
  vec2 q = p - b0.xy;
  float r = length(q) / b0.z;
  if (r > 1.0) return 0.0;
  float a = atan(q.y, q.x) + b0.w;
  float h = 0.0;
  for (int L = 0; L < 4; L++) {
    float fl = float(L);
    if (fl >= b1.y) break;
    float rl = 1.0 - fl * 0.22;
    float x = fract(a * b1.x / (2.0 * PI) + fl * 0.5 + fl * 0.11) - 0.5;
    float ax = abs(x) * 2.0;
    float rb = rl * (1.0 - 0.36 * pow(ax, 2.2)) * (1.0 - 0.05 * smoothstep(0.16, 0.0, ax));
    if (r < rb) {
      float u = r / rb;
      float ph = 0.16 + fl * 0.15 + 0.2 * sin(PI * u * 0.9);
      ph += b1.z * 0.13 * smoothstep(0.6, 1.0, u);
      ph -= 0.06 * pow(ax, 3.0);
      ph += 0.006 * sin(x * 70.0) * u;
      ph *= smoothstep(1.0, 0.93, u);
      h = smax(h, ph, 0.035);
    }
  }
  float c = 0.17;
  if (r < c) {
    float u = r / c;
    float bead = 0.7 + 0.07 * cos(a * 11.0) * cos(u * 14.0);
    h = smax(h, bead * sqrt(1.0 - u * u), 0.04);
  }
  return h;
}

float spiral(vec2 p, vec4 s0, vec4 s1){
  vec2 q = p - s0.xy;
  float size = s0.z;
  if (length(q) > size * 1.25) return 0.0;
  q = rot(s0.w) * q; q.x *= s1.x;
  float r = length(q);
  float th = atan(q.y, q.x) + PI;
  float b = 0.2;
  float span = s1.y * 2.0 * PI;
  float a0 = size * exp(-b * span);
  float base = (log(max(r, 1e-5) / a0) / b - th) / (2.0 * PI);
  float h = 0.0;
  for (int i = 0; i < 2; i++) {
    float k = floor(base) + float(i);
    float t = th + 2.0 * PI * k;
    if (t < 0.0 || t > span) continue;
    float rk = a0 * exp(b * t);
    float T = rk * 0.3 + size * 0.025;
    float x = abs(r - rk) / T;
    if (x < 1.0) {
      float g = t / span;
      float hh = (0.1 + 0.2 * g) * sqrt(1.0 - x * x) * (1.0 + 0.12 * sin(t * 7.0));
      h = max(h, hh);
    }
  }
  if (r < a0 * 2.2) h = max(h, 0.12 * sqrt(max(1.0 - r / (a0 * 2.2), 0.0)));
  return h;
}

float shell(vec2 p, vec4 s0, vec4 s1){
  vec2 q = p - s0.xy;
  float S = s0.z;
  if (length(q) > S * 1.2) return 0.0;
  q = rot(s0.w) * q / S;
  float r = length(q);
  float a = atan(q.x, q.y);
  float spread = 1.05;
  float h = 0.0;
  if (abs(a) < spread) {
    float edge = 0.92 + 0.08 * cos(a * s1.x);
    if (r < edge) {
      float u = r / edge;
      float dome = sqrt(max(1.0 - u * u * 0.85, 0.0)) * (1.0 - pow(abs(a) / spread, 4.0));
      h = 0.36 * dome + 0.045 * cos(a * s1.x) * smoothstep(0.08, 0.45, u) + 0.006 * sin(u * 80.0);
      h *= smoothstep(1.0, 0.94, u) * smoothstep(spread, spread * 0.9, abs(a));
    }
  }
  vec2 e = abs(q - vec2(0.0, 0.03));
  if (e.x < 0.34 && e.y < 0.075) h = max(h, 0.17 * (1.0 - 0.4 * e.x / 0.34));
  return h;
}

float berry(vec2 p, vec4 b){
  float x = length(p - b.xy) / b.z;
  return x < 1.0 ? 0.26 * sqrt(1.0 - x * x) : 0.0;
}

void main(){
  vec2 p = vec2(vUv.x * 2.0, vUv.y);
  float h = 0.0;
  for (int i = 0; i < ${COLS}; i++) { if (i >= uCountA.x) break; h = smax(h, stem(p, item(i, 0), item(i, 1)), 0.02); }
  for (int i = 0; i < ${COLS}; i++) { if (i >= uCountA.y) break; h = smax(h, leaf(p, item(i, 2), item(i, 3)), 0.03); }
  for (int i = 0; i < ${COLS}; i++) { if (i >= uCountB.y) break; h = smax(h, berry(p, item(i, 10)), 0.02); }
  for (int i = 0; i < 10; i++) { if (i >= uCountA.z) break; h = smax(h, bloom(p, item(i, 4), item(i, 5)), 0.04); }
  for (int i = 0; i < 8; i++) { if (i >= uCountA.w) break; h = smax(h, spiral(p, item(i, 6), item(i, 7)), 0.03); }
  for (int i = 0; i < 8; i++) { if (i >= uCountB.x) break; h = smax(h, shell(p, item(i, 8), item(i, 9)), 0.03); }
  gl_FragColor = vec4(h, 0.0, 0.0, 1.0);
}
`

const displayFrag = /* glsl */ `
${noise}
uniform sampler2D tHeight;
uniform sampler2D tFlow;
uniform vec2 uRes;
uniform float uTime;
uniform float uDark;
uniform float uScroll;
uniform float uReveal;
uniform float uRenoise;
uniform float uAlpha;
varying vec2 vUv;

vec2 cover(vec2 uv){
  float sa = uRes.x / uRes.y; float ta = 2.0;
  vec2 s = sa > ta ? vec2(1.0, ta / sa) : vec2(sa / ta, 1.0);
  return (uv - 0.5) * s + 0.5;
}
float latent(vec2 p){ return 0.5 + 0.5 * fbm(p * vec2(5.0, 2.5) + vec2(uTime * 0.025, -uTime * 0.018)); }

float heightAt(vec2 uv, float reveal, out float k){
  vec2 huv = cover(uv); huv.y += uScroll;
  float relief = texture2D(tHeight, huv).r;
  float n = latent(huv);
  k = smoothstep(0.12, 0.8, reveal + (n - 0.5) * 0.8);
  return mix(n * 0.03, relief, k);
}

void main(){
  vec2 px = 1.0 / uRes;
  vec4 fl = texture2D(tFlow, vUv);
  float reveal = clamp(fl.a * 1.2 + fl.b * 0.55 + uReveal, 0.0, 1.0) * (1.0 - uRenoise);
  float k, kx, ky;
  float h = heightAt(vUv, reveal, k);
  float hx = heightAt(vUv + vec2(px.x * 1.5, 0.0), reveal, kx);
  float hy = heightAt(vUv + vec2(0.0, px.y * 1.5), reveal, ky);
  float strength = 90.0 * min(uRes.x, 1600.0) / 1600.0;
  vec3 n = normalize(vec3(-(hx - h) * strength, -(hy - h) * strength, 1.0));

  // Crevices: where the relief around is higher than here.
  vec2 huv = cover(vUv); huv.y += uScroll;
  float here = texture2D(tHeight, huv).r;
  float around = 0.0;
  for (int i = 0; i < 6; i++) {
    float a = float(i) * 1.0472;
    around += texture2D(tHeight, huv + vec2(cos(a), sin(a)) * px * vec2(10.0, 5.0)).r;
  }
  float cav = clamp((around / 6.0 - here) * 2.6, 0.0, 1.0) * k;

  vec3 key = normalize(vec3(-0.5, 0.62, 0.6));
  vec3 fill = normalize(vec3(0.6, -0.45, 0.65));
  float dk = max(dot(n, key), 0.0);
  float df = max(dot(n, fill), 0.0);
  float sk = pow(max(dot(n, normalize(key + vec3(0.0, 0.0, 1.0))), 0.0), 42.0);
  float rim = pow(1.0 - n.z, 1.6);

  vec3 keyC = vec3(1.0, 0.86, 0.66);
  vec3 fillC = vec3(0.45, 0.62, 0.66);
  vec3 wall = vec3(0.084, 0.081, 0.077) * mix(1.0, 0.36, uDark);
  // Bronze matches the wall's value when flat, so only form (not a tint) gives it away.
  vec3 bronze = vec3(0.096, 0.083, 0.068) * mix(1.0, 0.55, uDark);
  vec3 alb = mix(wall, bronze, k);
  vec3 wallLight = 0.45 + 0.95 * dk * keyC + 0.4 * df * fillC;
  vec3 formLight = 0.22 + 1.3 * dk * keyC + 0.45 * df * fillC;
  vec3 col = alb * mix(wallLight, formLight, k);
  col += sk * vec3(0.86, 0.66, 0.4) * (0.03 + 0.7 * k);
  col += rim * fillC * 0.07 * k;
  col = mix(col, vec3(0.12, 0.2, 0.185), cav * 0.6);
  col *= 1.0 - cav * 0.3;

  float grain = hash12(gl_FragCoord.xy + fract(uTime) * 100.0) - 0.5;
  col += grain * 0.028;
  float vig = smoothstep(1.3, 0.3, length(vUv - 0.5));
  col *= 0.8 + 0.2 * vig;
  gl_FragColor = vec4(col, uAlpha);
}
`

export class Relief {
  height: THREE.WebGLRenderTarget
  mesh: THREE.Mesh
  material: THREE.ShaderMaterial

  constructor(renderer: THREE.WebGLRenderer, flow: THREE.Texture) {
    const small = Math.min(window.innerWidth, window.innerHeight) < 600
    this.height = new THREE.WebGLRenderTarget(small ? 1536 : 2048, small ? 768 : 1024, {
      type: THREE.HalfFloatType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.MirroredRepeatWrapping,
      wrapT: THREE.MirroredRepeatWrapping,
      depthBuffer: false,
    })
    this.bake(renderer)
    this.material = new THREE.ShaderMaterial({
      vertexShader: fullscreenVert,
      fragmentShader: displayFrag,
      uniforms: {
        tHeight: { value: this.height.texture },
        tFlow: { value: flow },
        uRes: { value: new THREE.Vector2(1, 1) },
        uTime: { value: 0 },
        uDark: { value: 0 },
        uScroll: { value: 0 },
        uReveal: { value: 0 },
        uRenoise: { value: 0 },
        uAlpha: { value: 1 },
      },
      depthTest: false,
      depthWrite: false,
      transparent: true,
    })
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material)
    this.mesh.frustumCulled = false
    this.mesh.renderOrder = -10
  }

  bake(renderer: THREE.WebGLRenderer) {
    const c = compose()
    const data = dataTexture(c)
    const mat = new THREE.ShaderMaterial({
      vertexShader: fullscreenVert,
      fragmentShader: bakeFrag,
      uniforms: {
        tData: { value: data },
        uCountA: { value: [c.stems.length, c.leaves.length, c.blooms.length, c.spirals.length] },
        uCountB: { value: [c.shells.length, c.berries.length] },
      },
    })
    const scene = new THREE.Scene()
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat)
    quad.frustumCulled = false
    scene.add(quad)
    renderer.setRenderTarget(this.height)
    renderer.render(scene, new THREE.Camera())
    renderer.setRenderTarget(null)
    mat.dispose()
    quad.geometry.dispose()
    data.dispose()
  }

  resize(w: number, h: number, dpr: number) {
    this.material.uniforms.uRes.value.set(w * dpr, h * dpr)
  }
}
