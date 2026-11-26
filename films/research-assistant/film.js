// AI Research Assistant — "Five agents, one sourced report". Dark keynote, 8 s loop (TREATMENT.md).
// ?plate=img/x.jpg → 6 s plate: one real screen as a keynote card that expands out of a point and folds back.
import { clamp, lerp, seg, ss, eio, eo, ei, back, hash, TAU } from '/core/lib.js';

const Q = new URLSearchParams(location.search);
const PLATE = Q.get('plate');
const W = +(Q.get('w') || 1920), H = +(Q.get('h') || 1080);
const DUR = PLATE ? 6 : 8;
const BG = '#0B0C10', FG = '#E8ECF2', VI = '#8B7CFF', TEAL = '#2DD4BF';
const cv = document.getElementById('c'); cv.width = W; cv.height = H;
const X = cv.getContext('2d');
const IMG = {};
const MONO = '"JetBrains Mono", monospace', SANS = '"Inter Tight", sans-serif';

function rr(x, y, w, h, r) { X.beginPath(); X.roundRect(x, y, w, h, r); }
function grid(t) {
  X.fillStyle = BG; X.fillRect(0, 0, W, H);
  X.strokeStyle = 'rgba(232,236,242,.045)'; X.lineWidth = 1; X.beginPath();
  for (let x = (W / 2) % 64; x < W; x += 64) { X.moveTo(x + .5, 0); X.lineTo(x + .5, H); }
  for (let y = (H / 2) % 64; y < H; y += 64) { X.moveTo(0, y + .5); X.lineTo(W, y + .5); }
  X.stroke();
  const g = X.createRadialGradient(W / 2, H * .55, 0, W / 2, H * .55, W * .6);
  g.addColorStop(0, 'rgba(139,124,255,.07)'); g.addColorStop(1, 'rgba(11,12,16,0)'); X.fillStyle = g; X.fillRect(0, 0, W, H);
  const v = X.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, W * .75);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)'); X.fillStyle = v; X.fillRect(0, 0, W, H);
}
// text that resolves out of glyph noise: each character settles at its own moment
const NOISE = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&*+<>/';
function resolve(str, p, frame) {
  return [...str].map((ch, i) => {
    if (ch === ' ' || p >= 1) return ch;
    const at = .15 + .7 * hash(i * 3.7 + 1);
    return p > at ? ch : p > at - .35 ? NOISE[Math.floor(hash(i * 9.1 + frame * .37) * NOISE.length)] : ' ';
  }).join('');
}

const NAMES = ['Planner', 'Searcher', 'Reader', 'Critic', 'Writer'];
const NX = i => W / 2 + (i - 2) * 350, NY = H * .5, NW = 250, NH = 82;
// the pulse: [time, node]; between keys it travels; a key with `up` routes over the top (the critic's loop)
const PATH = [[.2, 0], [.8, 1], [1.35, 2], [1.9, 3], [2.0, 3], [2.75, 1, 'up'], [3.15, 2], [3.5, 3], [3.6, 3], [3.95, 4]];
function pulseAt(t) {
  if (t < PATH[0][0]) return { x: NX(0), y: NY, on: 0 };
  for (let i = 0; i < PATH.length - 1; i++) {
    const [t0, a] = PATH[i], [t1, b, mode] = PATH[i + 1];
    if (t >= t0 && t < t1) {
      const u = eio(seg(t, t0, t1)), x = lerp(NX(a), NX(b), u);
      const y = mode === 'up' ? NY - NH / 2 - Math.sin(u * Math.PI) * 150 : NY;
      return { x, y, on: a === b ? a : -1 };
    }
  }
  if (t >= 6.6) {                                  // home again, under the line, quietly
    const u = eio(seg(t, 6.6, 7.95));
    return { x: lerp(NX(4), NX(0), u), y: NY + NH / 2 + Math.sin(u * Math.PI) * 120, on: -1, dim: 1 };
  }
  return { x: NX(4), y: NY, on: 4 };
}
function visits(i, t) {                            // how lit a node is: a flash when the pulse is inside it
  let v = 0;
  for (let k = 0; k < 40; k++) { const tt = t - k / 48; const p = pulseAt(tt); if (Math.abs(p.x - NX(i)) < NW / 2 && Math.abs(p.y - NY) < NH) v = Math.max(v, 1 - k / 40); }
  return v;
}

function film(t) {
  grid(t);
  const frame = Math.floor(t * 24);
  // header
  X.fillStyle = 'rgba(232,236,242,.55)'; X.font = `400 18px ${MONO}`; X.textAlign = 'left';
  X.fillText('RESEARCHAI', 96, 100); X.textAlign = 'right'; X.fillText('LANGGRAPH · STATEGRAPH', W - 96, 100);
  const exp = Math.min(eio(seg(t, 3.95, 4.6)), 1 - eio(seg(t, 6.0, 6.6)));
  // edges
  X.strokeStyle = 'rgba(232,236,242,.16)'; X.lineWidth = 1.5; X.beginPath();
  for (let i = 0; i < 4; i++) { X.moveTo(NX(i) + NW / 2, NY); X.lineTo(NX(i + 1) - NW / 2, NY); }
  X.stroke();
  X.setLineDash([4, 8]); X.beginPath(); X.moveTo(NX(3), NY - NH / 2); X.bezierCurveTo(NX(3), NY - 220, NX(1), NY - 220, NX(1), NY - NH / 2); X.stroke(); X.setLineDash([]);
  X.fillStyle = 'rgba(232,236,242,.4)'; X.font = `400 15px ${MONO}`; X.textAlign = 'center'; X.fillText('if gaps and retry < 2', NX(2), NY - 190);
  // nodes
  NAMES.forEach((n, i) => {
    const v = visits(i, t), x = NX(i) - NW / 2, y = NY - NH / 2;
    X.save(); X.globalAlpha = 1 - exp;
    rr(x, y, NW, NH, 14); X.fillStyle = `rgba(139,124,255,${.06 + .22 * v})`; X.fill();
    X.strokeStyle = v > .02 ? `rgba(139,124,255,${.35 + .65 * v})` : 'rgba(232,236,242,.18)'; X.lineWidth = 1.5; X.stroke();
    if (v > .02) { X.shadowColor = VI; X.shadowBlur = 40 * v; X.stroke(); X.shadowBlur = 0; }
    X.fillStyle = FG; X.font = `500 27px ${SANS}`; X.textAlign = 'center'; X.fillText(n, NX(i), NY + 9);
    X.fillStyle = 'rgba(232,236,242,.38)'; X.font = `400 13px ${MONO}`; X.fillText(`0${i + 1}`, NX(i), NY + NH / 2 + 28);
    X.restore();
  });
  // critic says: gap, retry; then pass
  const gap = Math.min(seg(t, 1.9, 2.05), 1 - seg(t, 2.6, 2.8)), pass = Math.min(seg(t, 3.5, 3.62), 1 - seg(t, 4.1, 4.3));
  if (gap > 0) { X.globalAlpha = gap; X.fillStyle = VI; X.font = `400 16px ${MONO}`; X.textAlign = 'center'; X.fillText('GAP FOUND · RETRY 1/2', NX(3), NY + 96); X.globalAlpha = 1; }
  if (pass > 0) { X.globalAlpha = pass; X.fillStyle = TEAL; X.font = `400 16px ${MONO}`; X.textAlign = 'center'; X.fillText('✓ COVERAGE OK', NX(3), NY + 96); X.globalAlpha = 1; }
  // the pulse with a short trail
  if (exp < .5) for (let k = 14; k >= 0; k--) {
    const p = pulseAt(t - k / 60), a = (1 - k / 15) * (p.dim ? .45 : 1);
    X.beginPath(); X.arc(p.x, p.y, 7 - k * .35, 0, TAU); X.fillStyle = `rgba(139,124,255,${a})`;
    if (!k) { X.shadowColor = VI; X.shadowBlur = 24; }
    X.fill(); X.shadowBlur = 0;
  }
  // writer expands into the report
  if (exp > 0) {
    const fw = 1500, fh = fw * IMG.r.height / IMG.r.width * .82, cx = lerp(NX(4), W / 2, exp), cy = lerp(NY, H * .57, exp);
    const w = lerp(NW, fw, exp), h = lerp(NH, fh, exp), x = cx - w / 2, y = cy - h / 2;
    X.save(); X.shadowColor = 'rgba(139,124,255,.35)'; X.shadowBlur = 80 * exp; rr(x, y, w, h, lerp(14, 18, exp)); X.fillStyle = '#12131a'; X.fill(); X.restore();
    X.save(); rr(x, y, w, h, lerp(14, 18, exp)); X.clip();
    X.globalAlpha = seg(exp, .45, 1); X.drawImage(IMG.r, 0, 0, IMG.r.width, IMG.r.height * .82, x, y, w, h); X.restore();
    rr(x, y, w, h, lerp(14, 18, exp)); X.strokeStyle = `rgba(139,124,255,${.7})`; X.lineWidth = 1.5; X.stroke();
    const tp = seg(t, 4.3, 5.0) * (1 - seg(t, 5.9, 6.1));
    X.globalAlpha = Math.min(1, tp * 3); X.fillStyle = FG; X.font = `200 64px ${SANS}`; X.textAlign = 'center';
    X.fillText(resolve('5 agents · 1 sourced report', tp, frame), W / 2, y - 44); X.globalAlpha = 1;
  }
}

function plate(t) {
  grid(t);
  const img = IMG.p, e = Math.min(eio(seg(t, .1, .9)), 1 - eio(seg(t, 5.2, 5.9)));
  const k = Math.min((W - 300) / img.width, (H - 300) / img.height), fw = img.width * k, fh = img.height * k;
  const w = lerp(40, fw, e), h = lerp(40, fh, eo(clamp(e * 1.4))), x = (W - w) / 2, y = (H - h) / 2 + 20;
  X.save(); X.shadowColor = 'rgba(139,124,255,.32)'; X.shadowBlur = 90; rr(x, y, w, h, 18); X.fillStyle = '#12131a'; X.fill(); X.restore();
  X.save(); rr(x, y, w, h, 18); X.clip(); X.globalAlpha = seg(e, .4, 1);
  X.drawImage(img, (W - fw) / 2, (H - fh) / 2 + 20, fw, fh); X.restore();
  rr(x, y, w, h, 18); X.strokeStyle = 'rgba(139,124,255,.6)'; X.lineWidth = 1.5; X.stroke();
  X.globalAlpha = e; X.fillStyle = 'rgba(232,236,242,.55)'; X.font = `400 18px ${MONO}`; X.textAlign = 'left';
  X.fillText('RESEARCHAI', (W - fw) / 2, (H - fh) / 2 - 14);
  X.textAlign = 'right'; X.fillStyle = VI; X.fillText('● LIVE', (W + fw) / 2, (H - fh) / 2 - 14); X.globalAlpha = 1;
}

function render(t) {
  t = ((t % DUR) + DUR) % DUR;
  const k = 1 + .015 * (1 - Math.cos(TAU * t / DUR)) / 2;
  X.setTransform(1, 0, 0, 1, 0, 0); X.fillStyle = BG; X.fillRect(0, 0, W, H);
  X.setTransform(k, 0, 0, k, W / 2 * (1 - k), H / 2 * (1 - k));
  (PLATE ? plate : film)(t);
}

const load = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
async function boot() {
  for (const [f, file, wt] of [['Inter Tight', 'inter-tight-latin-200-normal', '200'], ['Inter Tight', 'inter-tight-latin-300-normal', '300'],
    ['Inter Tight', 'inter-tight-latin-500-normal', '500'], ['JetBrains Mono', 'jetbrains-mono-latin-400-normal', '400']]) {
    const o = new FontFace(f, `url(fonts/${file}.woff2)`, { weight: wt }); await o.load(); document.fonts.add(o);
  }
  if (PLATE) IMG.p = await load(PLATE); else IMG.r = await load('img/report.png');
  window.DUR = DUR; window.render = render; window.READY = true;
}
boot();
