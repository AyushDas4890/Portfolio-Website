// Dynamic Island for Windows — "A living pill". Glass product, 8 s loop (TREATMENT.md).
// A black glass pill under strip lights springs between real island states (their UI on its face);
// a comet of light laps the rim at every change. Camera orbits ±10° and returns.
// ?plate=img/x.png|jpg → 6 s plate: that one state (or screenshot) on the glass, slowly turning.
import * as THREE from 'three';
import { clamp, lerp, seg, eio, eo, back, TAU } from '/core/lib.js';

const Q = new URLSearchParams(location.search);
const PLATE = Q.get('plate');
const W = +(Q.get('w') || 1920), H = +(Q.get('h') || 1080);
const DUR = PLATE ? 6 : 8;

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: false });
renderer.setPixelRatio(1.5); renderer.setSize(W, H);
renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById('stage').appendChild(renderer.domElement);
const ov = document.getElementById('ov'); ov.width = W; ov.height = H; const OX = ov.getContext('2d');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(26, W / H, .1, 200);

// studio backdrop: a soft graphite sweep
{
  const c = document.createElement('canvas'); c.width = 512; c.height = 288; const g = c.getContext('2d');
  const gr = g.createRadialGradient(256, 130, 10, 256, 150, 320); gr.addColorStop(0, '#2e3136'); gr.addColorStop(.5, '#141518'); gr.addColorStop(1, '#030304');
  g.fillStyle = gr; g.fillRect(0, 0, 512, 288);
  const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; scene.background = tx;
}
// environment: long strip softboxes, baked once
{
  const env = new THREE.Scene(); env.background = new THREE.Color('#000');
  const strip = (w, h, I, pos, col = '#ffffff') => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(I), side: THREE.DoubleSide })); m.position.set(...pos); m.lookAt(0, 0, 0); env.add(m); };
  strip(220, 10, 3.0, [0, 60, 120]);           // long horizontal strip above-front: the top highlight line
  strip(14, 160, 2.2, [-140, 20, 40], '#eef4ff');
  strip(14, 160, 2.2, [140, 20, 30], '#fff6ee');
  strip(260, 8, 1.2, [0, -40, 140]);           // low strip: the bottom edge glint
  strip(180, 60, .25, [0, 150, 0]);
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(env, 0, 1, 1000).texture;
}

// ───────── the pill
const DEPTH = .42, BEV = .14;
const glass = new THREE.MeshPhysicalMaterial({ color: '#060607', roughness: .06, metalness: .1, clearcoat: 1, clearcoatRoughness: .04, envMapIntensity: 1.4, specularIntensity: 1 });
const body = new THREE.Mesh(new THREE.BufferGeometry(), glass); scene.add(body);
const faceMat = [0, 1].map(() => new THREE.MeshBasicMaterial({ transparent: true, toneMapped: false, depthWrite: false }));
const faces = faceMat.map(m => { const f = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), m); f.position.z = DEPTH / 2 + BEV + .002; scene.add(f); return f; });
let geoKey = '';
function pillShape(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  r = Math.min(r, h / 2, w / 2);
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0); s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2); s.lineTo(x + r, y + h); s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
  s.lineTo(x, y + r); s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5); return s;
}
function setPill(w, h, r) {
  const k = [w, h, r].map(v => v.toFixed(3)).join();
  if (k === geoKey) return; geoKey = k;
  body.geometry.dispose();
  const g = new THREE.ExtrudeGeometry(pillShape(w - BEV * 2, h - BEV * 2, Math.max(.01, r - BEV)), { depth: DEPTH, bevelEnabled: true, bevelThickness: BEV, bevelSize: BEV, bevelSegments: 10, curveSegments: 40 });
  g.translate(0, 0, -DEPTH / 2); g.computeVertexNormals(); body.geometry = g;
}
// a point on the outline of a pill, by arc-length fraction (for the comet)
function rimPoint(w, h, f) {
  const r = h / 2, straight = w - 2 * r, P = 2 * straight + TAU * r; let s = ((f % 1) + 1) % 1 * P;
  if (s < straight) return [-straight / 2 + s, -r]; s -= straight;
  if (s < Math.PI * r) { const a = -Math.PI / 2 + s / r; return [straight / 2 + Math.cos(a) * r, Math.sin(a) * r]; } s -= Math.PI * r;
  if (s < straight) return [straight / 2 - s, r]; s -= straight;
  const a = Math.PI / 2 + s / r; return [-straight / 2 + Math.cos(a) * r, Math.sin(a) * r];
}
// comet: additive glow sprites along the rim
const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.25, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
const NC = 46;
const comet = Array.from({ length: NC }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false })); scene.add(s); return s; });
function setComet(w, h, head, len, col, a) {
  comet.forEach((s, i) => {
    const k = i / (NC - 1), [x, y] = rimPoint(w, h, head - k * len), fall = Math.pow(1 - k, 1.6) * a;
    s.position.set(x, y, DEPTH / 2 + BEV * .6); s.scale.setScalar((.34 - .2 * k) * (fall > 0 ? 1 : 0) + .001);
    s.material.color.set(col).multiplyScalar(fall * 1.6); s.visible = fall > .01;
  });
}

// ───────── states (world units; height of the sliver = 0.68)
const TEX = {};
const load = src => new Promise((res, rej) => new THREE.TextureLoader().load(src, t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; res(crop(t)); }, undefined, rej));
const M = 18;                                   // the island PNGs carry an 18 px transparent margin
function crop(tx) { if (!/png$/i.test(tx.image.src)) return tx; const { width: w, height: h } = tx.image; tx.repeat.set((w - 2 * M) / w, (h - 2 * M) / h); tx.offset.set(M / w, M / h); tx.userData.crop = [w - 2 * M, h - 2 * M]; return tx; }
const dims = (tx, h) => { const [iw, ih] = tx.userData.crop || [tx.image.width, tx.image.height]; return [h * iw / ih, h]; };
let STATES;

function face(i, tex, w, h, a) {
  const f = faces[i]; f.visible = a > .005 && !!tex; if (!f.visible) return;
  f.material.map = tex; f.material.opacity = a; f.material.needsUpdate = true; f.scale.set(w, h, 1);
}

function film(t) {
  // keyframes: [time, state index]; each change springs from the last state
  const K = [[0, 0], [1.4, 1], [3.6, 2], [5.8, 0]];
  let cur = 0; for (let i = 0; i < K.length; i++) if (t >= K[i][0]) cur = i;
  const [t0, to] = K[cur], from = cur ? K[cur - 1][1] : 0, A = STATES[from], B = STATES[to];
  const dt = t - t0, sp = cur ? back(seg(dt, 0, .62), 1.15) : 1;
  const w = lerp(A.w, B.w, sp), h = lerp(A.h, B.h, sp), rk = lerp(A.rk, B.rk, clamp(sp));
  setPill(w, h, h * rk);
  // content leaves fast and arrives with the shape
  const outA = 1 - seg(dt, 0, .16), inB = cur ? seg(dt, .28, .6) : 1;
  face(0, A.tex, w - .08, h - .08, cur ? outA : 0); face(1, B.tex, w - .08, h - .08, inB);
  // a comet laps the rim at each change, in the brand's red or blue
  const lap = cur ? seg(dt, .05, 1.35) : 0;
  setComet(w, h, .62 + eio(lap) * 1.0, .32, cur === 2 ? '#2B59C3' : '#D7263D', cur ? Math.sin(Math.PI * lap) : 0);
  // camera: ±10° orbit, a slight lift, back home at the loop point
  const az = .17 * Math.sin(TAU * t / DUR), el = .1 + .03 * Math.sin(TAU * t / DUR * 2);
  const R = 17.5; camera.position.set(Math.sin(az) * R, Math.sin(el) * R, Math.cos(az) * R); camera.lookAt(0, -.2, 0);
  body.rotation.set(0, 0, 0);
  // the line of type
  OX.clearRect(0, 0, W, H);
  OX.fillStyle = 'rgba(237,237,237,.86)'; OX.textAlign = 'center'; OX.font = '200 46px "Inter Tight"';
  OX.fillText('Dynamic Island for Windows', W / 2, H - 150);
  OX.fillStyle = 'rgba(237,237,237,.42)'; OX.font = '300 20px "Inter Tight"';
  OX.fillText(['IDLE · A SLIVER', 'NOW PLAYING', 'NOTIFICATION', 'BACK TO A SLIVER'][cur].split('').join(' '), W / 2, H - 104);
}

function plate(t) {
  const S = STATES[0];
  setPill(S.w, S.h, S.r);
  face(0, S.tex, S.w - .08, S.h - .08, Math.min(1, seg(t, .1, .6)) * (1 - seg(t, 5.5, 5.95)) || .001);
  face(1, null, 1, 1, 0);
  setComet(S.w, S.h, .62 + eio(seg(t, .3, 2.3)), .3, '#D7263D', Math.sin(Math.PI * seg(t, .3, 2.3)));
  const az = .14 * Math.sin(TAU * t / DUR), vh = Math.max(S.h / .6, S.w / (.84 * W / H)), R = vh / (2 * Math.tan(13 * Math.PI / 180)) + DEPTH;
  camera.position.set(Math.sin(az) * R, .12 * R, Math.cos(az) * R); camera.lookAt(0, 0, 0);
  OX.clearRect(0, 0, W, H);
}

function render(t) {
  t = ((t % DUR) + DUR) % DUR;
  (PLATE ? plate : film)(t);
  renderer.render(scene, camera);
}

async function boot() {
  for (const [file, wt] of [['inter-tight-latin-200-normal', '200'], ['inter-tight-latin-300-normal', '300']]) {
    const o = new FontFace('Inter Tight', `url(fonts/${file}.woff2)`, { weight: wt }); await o.load(); document.fonts.add(o);
  }
  if (PLATE) {
    const tx = await load(PLATE), pill = /\.png$/i.test(PLATE), h = pill ? (tx.image.height > 200 ? 2.6 : 1.2) : 5.2;
    const [w] = dims(tx, h);
    STATES = [{ tex: tx, w, h, r: pill ? h * (tx.image.height > 300 ? .21 : .5) : .28 }];
  } else {
    const names = ['sliver-music', 'now-playing', 'notification'], hs = [.95, 3.5, 2.1];
    STATES = [];
    const rks = [.5, .21, .5];
    for (let i = 0; i < 3; i++) { const tx = await load(`img/${names[i]}.png`); const [w, h] = dims(tx, hs[i]); STATES.push({ tex: tx, w, h, rk: rks[i] }); }
  }
  render(0);
  window.DUR = DUR; window.render = render; window.READY = true;
}
boot();
