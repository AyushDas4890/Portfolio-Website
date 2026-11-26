// Cancer TF Atlas — "Discovery, in 3D". Microscope grammar, 8 s loop (TREATMENT.md).
// An endless logarithmic dive: every layer of tissue sits inside the nucleus of the cell at the centre of the
// layer above, ten times smaller. Over 8 s the zoom grows exactly ×10, so the last frame is the first.
// The tissue is procedural and illustrative, never a real sample.
// ?plate=img/x.jpg → 6 s plate: one real screen in a frosted panel over slowly drifting tissue.
import { clamp, lerp, seg, ss, eio, eo, mulberry, TAU } from '/core/lib.js';

const Q = new URLSearchParams(location.search);
const PLATE = Q.get('plate');
const W = +(Q.get('w') || 1920), H = +(Q.get('h') || 1080);
const DUR = PLATE ? 6 : 8;
const BG = '#07101F', FG = '#E9EEF7', ACC = '#FFD23F', BLUE = [79, 139, 255];
const cv = document.getElementById('c'); cv.width = W; cv.height = H;
const X = cv.getContext('2d');
const T = document.createElement('canvas'); T.width = W; T.height = H; const TX = T.getContext('2d');
const SANS = '"Space Grotesk", sans-serif';
let IMG;

// one layer's cells, in units of half the screen height; the centre cell is the way in
const NR = .21, MR = .34;                                   // centre nucleus / membrane radius
const CELLS = (() => {
  const R = mulberry(17), out = [];
  for (let i = 0; i < 2600 && out.length < 230; i++) {
    const x = (R() * 2 - 1) * 2.6, y = (R() * 2 - 1) * 2.6, r = .07 + R() * .07;
    if (Math.hypot(x, y) < MR + r + .06) continue;
    if (out.some(c => Math.hypot(c.x - x, c.y - y) < (c.r + r) * 1.45)) continue;
    out.push({ x, y, r, e: .75 + R() * .5, a: R() * TAU, b: .45 + R() * .55, s: R() });
  }
  return out;
})();
// three cells near the centre carry the transcription factors the model rediscovered
const TFS = [['GATA3', 'breast'], ['HNF1B', 'kidney'], ['NKX2-1', 'lung']];
const TFC = (() => { const c = CELLS.slice().sort((p, q) => Math.hypot(p.x, p.y) - Math.hypot(q.x, q.y)); return [c[0], c[3], c[6]]; })();

function layer(S, rot, alpha, t) {
  if (alpha <= 0) return;
  const u = H / 2 * S;                                       // px per unit
  X.save(); X.translate(W / 2, H / 2); X.rotate(rot); X.globalAlpha = alpha;
  for (const c of CELLS) {
    const px = c.x * u, py = c.y * u, r = c.r * u;
    if (Math.abs(px) - r * 2.2 > W * .8 || Math.abs(py) - r * 2.2 > W * .8 || r < .4) continue;
    const br = c.b * (.85 + .15 * Math.sin(TAU * t / DUR * 2 + c.s * 9));   // a slow breathing, period-aligned
    const hl = TFC.includes(c);
    X.save(); X.translate(px, py); X.rotate(c.a); X.scale(c.e, 1 / c.e);
    // cytoplasm halo, then the stained nucleus
    let g = X.createRadialGradient(0, 0, r * .6, 0, 0, r * 2.1);
    g.addColorStop(0, `rgba(${BLUE},${.10 * br})`); g.addColorStop(1, 'rgba(79,139,255,0)');
    X.fillStyle = g; X.beginPath(); X.arc(0, 0, r * 2.1, 0, TAU); X.fill();
    g = X.createRadialGradient(-r * .25, -r * .25, 0, 0, 0, r);
    g.addColorStop(0, `rgba(170,200,255,${.85 * br})`); g.addColorStop(.6, `rgba(${BLUE},${.6 * br})`); g.addColorStop(1, 'rgba(40,70,160,.05)');
    X.fillStyle = g; X.beginPath(); X.arc(0, 0, r, 0, TAU); X.fill();
    if (hl) { X.strokeStyle = 'rgba(255,210,63,.55)'; X.lineWidth = Math.max(1, r * .06); X.stroke(); }
    X.restore();
  }
  // the centre cell: a membrane and an open, glowing nucleus that frames the next layer
  const m = MR * u, n = NR * u;
  X.strokeStyle = 'rgba(233,238,247,.18)'; X.lineWidth = Math.max(1, m * .015); X.beginPath(); X.arc(0, 0, m, 0, TAU); X.stroke();
  const g = X.createRadialGradient(0, 0, n * .9, 0, 0, n * 1.25);
  g.addColorStop(0, 'rgba(255,210,63,0)'); g.addColorStop(.35, 'rgba(255,210,63,.45)'); g.addColorStop(1, 'rgba(255,210,63,0)');
  X.fillStyle = g; X.beginPath(); X.arc(0, 0, n * 1.25, 0, TAU); X.arc(0, 0, n * .9, 0, TAU, true); X.fill();
  X.restore();
}

// draw every layer, deepest first; each one is clipped to the centre nucleus of the one above
function tissue(u, t) {
  X.fillStyle = BG; X.fillRect(0, 0, W, H);
  const ks = [-1, 0, 1, 2, 3];
  // outer layers last; inner layers only inside their parent's nucleus
  const fade = S => S < 4 ? 1 : 1 - clamp((Math.log10(S) - Math.log10(4)) / (1 - Math.log10(4)));
  for (const k of ks) {
    const S = Math.pow(10, u - k); if (S < .0015 || S > 10) continue;
    X.save();
    const parent = S * 10;                                   // the layer above has 10× the scale
    if (parent <= 10) { X.beginPath(); X.arc(W / 2, H / 2, NR * H / 2 * parent * .97, 0, TAU); X.clip(); X.fillStyle = BG; X.fillRect(0, 0, W, H); }
    layer(S, .5 * (u - k), fade(S), t);
    X.restore();
  }
}

function frosted(x, y, w, h, a) {
  TX.clearRect(0, 0, W, H); TX.drawImage(cv, 0, 0);
  X.save(); X.globalAlpha = a; X.beginPath(); X.roundRect(x, y, w, h, 20); X.clip();
  X.filter = 'blur(22px)'; X.drawImage(T, 0, 0); X.filter = 'none';
  X.fillStyle = 'rgba(233,238,247,.08)'; X.fillRect(x, y, w, h); X.restore();
  X.save(); X.globalAlpha = a; X.beginPath(); X.roundRect(x, y, w, h, 20); X.strokeStyle = 'rgba(233,238,247,.22)'; X.lineWidth = 1.5; X.stroke(); X.restore();
}

function scaleBar(u, a) {                     // physical: half-height of layer 0 = 50 µm
  const umPerPx = 50 / (H / 2) / Math.pow(10, u);
  const nice = [200, 100, 50, 20, 10, 5, 2, 1, .5].find(v => v / umPerPx < 320) || .5;
  const L = nice / umPerPx, x = 96, y = H - 96;
  X.save(); X.globalAlpha = a; X.fillStyle = FG; X.fillRect(x, y, L, 4);
  X.font = `500 20px ${SANS}`; X.textAlign = 'left'; X.fillText(`${nice} µm`, x, y - 16); X.restore();
}

function film(t) {
  const u = t / DUR;
  tissue(u, t);
  scaleBar(u, Math.min(seg(t, 0, .5), 1 - seg(t, 7.4, 7.95)) || 0);
  // header
  X.fillStyle = 'rgba(233,238,247,.7)'; X.font = `500 20px ${SANS}`; X.textAlign = 'left';
  X.fillText('CANCER TF ATLAS', 96, 104); X.fillStyle = ACC; X.fillText('●', 96 - 26, 104);
  X.fillStyle = 'rgba(233,238,247,.45)'; X.textAlign = 'right'; X.fillText('TCGA PAN-CANCER · 801 SAMPLES', W - 96, 104);
  // frosted result panel
  const pa = Math.min(eo(seg(t, 2.6, 3.1)), 1 - seg(t, 4.7, 5.1));
  if (pa > 0) {
    const x = W - 96 - 520, y = H / 2 - 120 + (1 - pa) * 30;
    frosted(x, y, 520, 240, pa);
    X.save(); X.globalAlpha = pa; X.textAlign = 'left';
    X.fillStyle = ACC; X.font = `500 78px ${SANS}`; X.fillText('98.76%', x + 40, y + 112);
    X.fillStyle = FG; X.font = `300 26px ${SANS}`; X.fillText('subtype accuracy · 19 TFs found', x + 42, y + 170);
    X.fillStyle = 'rgba(233,238,247,.5)'; X.font = `500 16px ${SANS}`; X.fillText('RANDOM FOREST · 5 CANCER TYPES', x + 42, y + 206);
    X.restore();
  }
  // the rediscovered master regulators, pinned to their nuclei in the incoming layer
  const la = Math.min(eo(seg(t, 4.9, 5.4)), 1 - seg(t, 6.9, 7.35));
  if (la > 0) {
    const S = Math.pow(10, u - 1), rot = .5 * (u - 1), px = H / 2 * S;
    TFC.forEach((c, i) => {
      const a = Math.min(la, eo(seg(t, 4.9 + i * .18, 5.4 + i * .18)));
      const x0 = c.x * px, y0 = c.y * px, sx = W / 2 + x0 * Math.cos(rot) - y0 * Math.sin(rot), sy = H / 2 + x0 * Math.sin(rot) + y0 * Math.cos(rot);
      const r = c.r * px, dir = sx < W / 2 ? -1 : 1, lx = sx + dir * (r + 90), ly = sy - 40 - i * 48;
      X.save(); X.globalAlpha = a;
      X.strokeStyle = ACC; X.lineWidth = 1.5; X.beginPath(); X.arc(sx, sy, r * 1.25, 0, TAU); X.stroke();
      X.beginPath(); X.moveTo(sx + dir * r * 1.25 * .7, sy - r * .9); X.lineTo(lx, ly); X.lineTo(lx + dir * 40, ly); X.stroke();
      X.textAlign = dir < 0 ? 'right' : 'left'; X.fillStyle = FG; X.font = `500 30px ${SANS}`; X.fillText(TFS[i][0], lx + dir * 50, ly + 10);
      X.fillStyle = 'rgba(233,238,247,.55)'; X.font = `300 20px ${SANS}`; X.fillText(TFS[i][1], lx + dir * 50, ly + 38);
      X.restore();
    });
  }
}

function plate(t) {
  const u = .35 + .06 * Math.sin(TAU * t / DUR);
  tissue(u, t);
  const a = Math.min(eo(seg(t, .1, .8)), 1 - seg(t, 5.2, 5.9));
  const img = IMG, k = Math.min((W - 300) / img.width, (H - 300) / img.height), w = img.width * k, h = img.height * k;
  const x = (W - w) / 2, y = (H - h) / 2 + 16 + (1 - a) * 24;
  frosted(x - 28, y - 28, w + 56, h + 56, Math.max(a, .001));
  X.save(); X.globalAlpha = a; X.beginPath(); X.roundRect(x, y, w, h, 10); X.clip(); X.drawImage(img, x, y, w, h); X.restore();
  X.save(); X.globalAlpha = a; X.fillStyle = 'rgba(233,238,247,.7)'; X.font = `500 18px ${SANS}`; X.textAlign = 'left';
  X.fillText('CANCER TF ATLAS', x - 28, y - 52); X.fillStyle = ACC; X.textAlign = 'right'; X.fillText('●  LIVE', x + w + 28, y - 52); X.restore();
  scaleBar(u, a);
}

function render(t) {
  t = ((t % DUR) + DUR) % DUR;
  X.setTransform(1, 0, 0, 1, 0, 0);
  (PLATE ? plate : film)(t);
  const v = X.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, W * .72);   // the objective's vignette
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.6)'); X.fillStyle = v; X.fillRect(0, 0, W, H);
}

async function boot() {
  for (const [file, wt] of [['space-grotesk-latin-300-normal', '300'], ['space-grotesk-latin-500-normal', '500']]) {
    const o = new FontFace('Space Grotesk', `url(fonts/${file}.woff2)`, { weight: wt }); await o.load(); document.fonts.add(o);
  }
  if (PLATE) IMG = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = PLATE; });
  window.DUR = DUR; window.render = render; window.READY = true;
}
boot();
