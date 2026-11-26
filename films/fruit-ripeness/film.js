// Ripe or Not — "Three yes/no questions". Pop art, 8 s loop (TREATMENT.md).
// Ordinal regression in one image: a strawberry rides a ripeness ruler, three stamped panels ask
// "riper than…?" and stamp YES / YES / NO, and the verdict lands. Ben-Day dots stay fixed in page space.
// ?plate=img/x.jpg → 6 s plate: one real screen slammed in as a comic panel with a stamped sticker.
import { clamp, lerp, seg, ss, eio, eo, ei, back, hash, TAU } from '/core/lib.js';

const Q = new URLSearchParams(location.search);
const PLATE = Q.get('plate');
const W = +(Q.get('w') || 1920), H = +(Q.get('h') || 1080);
const DUR = PLATE ? 6 : 8;
const CREAM = '#FBF6EE', INK = '#141414', PINK = '#EC0B9C', YEL = '#F9C34B', GREEN = '#2E9E5B';
const cv = document.getElementById('c'); cv.width = W; cv.height = H;
const X = cv.getContext('2d');
let IMG, DOT = {};

function dotPattern(col, step, r) {          // Ben-Day dots, fixed to the page (patterns are anchored at the canvas origin)
  const c = document.createElement('canvas'); c.width = step; c.height = step; const g = c.getContext('2d');
  g.fillStyle = col; g.beginPath(); g.arc(step / 2, step / 2, r, 0, TAU); g.arc(0, 0, r, 0, TAU); g.arc(step, 0, r, 0, TAU); g.arc(0, step, r, 0, TAU); g.arc(step, step, r, 0, TAU); g.fill();
  return X.createPattern(c, 'repeat');
}
const ANTON = '"Anton", sans-serif', SERIF = '"Fraunces", serif';

// a filled, inked shape with a hard offset shadow (pop-art print)
function slab(path, fill, dots, shadow = 12) {
  X.save(); X.translate(shadow, shadow); path(); X.fillStyle = INK; X.fill(); X.restore();
  path(); X.fillStyle = fill; X.fill();
  if (dots) { X.save(); path(); X.clip(); X.setTransform(1, 0, 0, 1, 0, 0); X.fillStyle = dots; X.globalAlpha = .55; X.fillRect(0, 0, W, H); X.restore(); }
  path(); X.lineWidth = 7; X.strokeStyle = INK; X.lineJoin = 'round'; X.stroke();
}
function burst(cx, cy, r0, r1, n, rot) {
  return () => { X.beginPath(); for (let i = 0; i < n * 2; i++) { const a = rot + i / (n * 2) * TAU, r = i % 2 ? r0 : r1 * (1 + .08 * hash(i)); X.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } X.closePath(); };
}
function stampText(str, x, y, size, col, rot, k = 1, outline = true) {
  X.save(); X.translate(x, y); X.rotate(rot); X.scale(k, k);
  X.font = `400 ${size}px ${ANTON}`; X.textAlign = 'center'; X.textBaseline = 'middle';
  if (outline) { X.lineWidth = size * .14; X.strokeStyle = INK; X.lineJoin = 'round'; X.strokeText(str, 6, 6); X.fillStyle = INK; X.fillText(str, 6, 6); X.strokeText(str, 0, 0); }
  X.fillStyle = col; X.fillText(str, 0, 0); X.restore();
}

// the strawberry marker
function berry(x, y, s, wob) {
  X.save(); X.translate(x, y); X.rotate(wob); X.scale(s, s);
  const body = () => { X.beginPath(); X.moveTo(0, 95); X.bezierCurveTo(-80, 40, -92, -40, -50, -62); X.bezierCurveTo(-22, -76, 22, -76, 50, -62); X.bezierCurveTo(92, -40, 80, 40, 0, 95); X.closePath(); };
  slab(body, PINK, DOT.red, 8);
  X.fillStyle = YEL; X.strokeStyle = INK; X.lineWidth = 2.5;
  for (const [sx, sy] of [[-30, -30], [5, -40], [36, -26], [-44, 4], [-8, -6], [28, 6], [-24, 34], [12, 40], [-4, 68], [46, -2]]) { X.beginPath(); X.ellipse(sx, sy, 5, 8, .2, 0, TAU); X.fill(); X.stroke(); }
  const leaf = () => { X.beginPath(); X.moveTo(0, -66); for (let i = 0; i < 5; i++) { const a = Math.PI + i / 4 * Math.PI; X.lineTo(Math.cos(a) * 62, -70 + Math.sin(a) * 26 - 8); X.lineTo(Math.cos(a + .32) * 24, -66 + Math.sin(a + .32) * 10); } X.closePath(); };
  slab(leaf, GREEN, null, 5);
  X.restore();
}

const R0 = 300, R1 = 1620, RY = 850, tick = i => lerp(R0, R1, i / 3);
const LABELS = ['UNRIPE', 'PARTIALLY RIPE', 'RIPE', 'ROTTEN'];
const PANELS = [
  { q: 'RIPER THAN', w: 'UNRIPE?', a: 'YES', t: 1.0, x: 300, fill: PINK, dot: 'yel' },
  { q: 'RIPER THAN', w: 'PARTIALLY?', a: 'YES', t: 2.5, x: 820, fill: YEL, dot: 'red' },
  { q: 'RIPER THAN', w: 'RIPE?', a: 'NO', t: 4.0, x: 1340, fill: PINK, dot: 'yel' },
];

function shakeAt(t) {                         // a slap on every stamp, decaying fast
  let s = 0; for (const k of [1.0, 1.45, 2.5, 2.95, 4.0, 4.45, 5.45]) { const d = t - k; if (d >= 0 && d < .35) s += Math.exp(-d * 14) * Math.sin(d * 90) * 9; }
  return s;
}

function film(t) {
  X.fillStyle = CREAM; X.fillRect(0, 0, W, H);
  X.fillStyle = DOT.pinkPage; X.fillRect(0, 0, W, 210);            // a band of pink dots across the top, like a printed header
  const sh = shakeAt(t); X.translate(sh, -sh * .5);
  // title
  X.save(); X.font = `900 92px ${SERIF}`; X.textBaseline = 'alphabetic'; X.fillStyle = INK; X.fillText('Ripe', 120, 150);
  X.font = `italic 900 92px ${SERIF}`; X.fillStyle = PINK; X.fillText('or not?', 352, 150); X.restore();
  X.save(); X.font = `400 26px ${ANTON}`; X.fillStyle = INK; X.textAlign = 'right'; X.fillText('ORDINAL REGRESSION · 3 YES/NO QUESTIONS', W - 120, 140); X.restore();

  // question panels: slam in, answer stamped, slide away up at the end
  const away = eio(seg(t, 4.95, 5.45));
  PANELS.forEach((p, i) => {
    const k = back(seg(t, p.t, p.t + .3), 2.4); if (k <= .01) return;
    const x = p.x, y = 240 - away * 560, w = 460, h = 270, rot = (i - 1) * .025;
    X.save(); X.translate(x + w / 2, y + h / 2); X.rotate(rot); X.scale(k, k); X.translate(-w / 2, -h / 2);
    slab(() => { X.beginPath(); X.rect(0, 0, w, h); }, p.fill, DOT[p.dot], 14);
    X.fillStyle = INK; X.font = `400 34px ${ANTON}`; X.textAlign = 'center'; X.fillText(p.q, w / 2, 70);
    X.font = `400 64px ${ANTON}`; X.fillText(p.w, w / 2, 140);
    const ka = back(seg(t, p.t + .45, p.t + .7), 2.6);
    if (ka > .01) {
      X.save(); X.translate(w - 70, h - 34); X.scale(ka, ka);
      slab(burst(0, 0, 54, 86, 12, i), p.a === 'YES' ? '#fff' : INK, null, 6);
      X.restore();
      stampText(p.a, w - 70, h - 32, 58, p.a === 'YES' ? GREEN : '#fff', -.08, ka, false);
    }
    X.restore();
  });

  // the ruler
  X.save(); X.lineCap = 'round'; X.strokeStyle = INK; X.lineWidth = 14;
  X.beginPath(); X.moveTo(R0 - 40, RY); X.lineTo(R1 + 40, RY); X.stroke();
  for (let i = 0; i < 4; i++) {
    X.lineWidth = 10; X.beginPath(); X.moveTo(tick(i), RY - 26); X.lineTo(tick(i), RY + 26); X.stroke();
    X.fillStyle = INK; X.font = `400 54px ${ANTON}`; X.textAlign = 'center'; X.fillText(String(i), tick(i), RY + 92);
    X.font = `400 26px ${ANTON}`; X.fillStyle = i === 2 && t > 5.45 && t < 7.2 ? PINK : INK; X.fillText(LABELS[i], tick(i), RY + 130);
  }
  X.restore();

  // the marker climbs one tick per YES, holds on NO, and slides home at the end
  let pos = 0;
  pos += eio(seg(t, 1.6, 2.2)); pos += eio(seg(t, 3.1, 3.7));
  pos -= 2 * eio(seg(t, 7.0, 7.85));
  const hop = Math.sin(Math.PI * seg(t, 1.6, 2.2)) + Math.sin(Math.PI * seg(t, 3.1, 3.7)) + .6 * Math.sin(Math.PI * seg(t, 7.0, 7.85));
  const no = seg(t, 4.45, 5.0), wob = Math.sin(no * TAU * 3) * .12 * (1 - no);

  // the verdict: a starburst behind the berry, stamped "RIPE!"
  const v = Math.min(back(seg(t, 5.45, 5.75), 2.2), 1 - eio(seg(t, 6.8, 7.2)));
  if (v > .01) {
    X.save(); X.translate(tick(2), RY - 120); X.scale(v, v); X.rotate(t * .25);
    slab(burst(0, 0, 120, 185, 16, 0), YEL, DOT.red, 12); X.restore();
  }
  berry(tick(pos), RY - 120 - hop * 60, 1, wob);
  if (v > .01) stampText('RIPE!', tick(2) + 300, RY - 250, 120, PINK, -.12, v);
}

function plate(t) {
  X.fillStyle = CREAM; X.fillRect(0, 0, W, H);
  X.fillStyle = DOT.pinkPage; X.fillRect(0, 0, W, H);
  const img = IMG, k = Math.min((W - 320) / img.width, (H - 300) / img.height), w = img.width * k, h = img.height * k;
  const s = Math.min(back(seg(t, .05, .45), 2), 1 - ei(seg(t, 5.3, 5.85)));
  const sh = shakeAt(t - .7 + 1.0) * (t < 2 ? 1 : 0);
  X.save(); X.translate(W / 2 + sh, H / 2 + 10); X.rotate(-.012); X.scale(Math.max(s, .001), Math.max(s, .001)); X.translate(-w / 2, -h / 2);
  X.fillStyle = INK; X.fillRect(18, 18, w, h);
  X.fillStyle = '#fff'; X.fillRect(-14, -14, w + 28, h + 28);
  X.drawImage(img, 0, 0, w, h);
  X.lineWidth = 8; X.strokeStyle = INK; X.strokeRect(-14, -14, w + 28, h + 28);
  X.restore();
  const ks = Math.min(back(seg(t, .55, .85), 2.6), 1 - ei(seg(t, 5.2, 5.6)));
  if (ks > .01) {
    X.save(); X.translate(W / 2 + w / 2 - 30, H / 2 - h / 2 + 10); X.scale(ks, ks);
    slab(burst(0, 0, 70, 110, 12, .3), YEL, DOT.red, 8); X.restore();
    stampText('RIPE?', W / 2 + w / 2 - 30, H / 2 - h / 2 + 12, 52, PINK, -.15, ks);
  }
}

function render(t) {
  t = ((t % DUR) + DUR) % DUR;
  X.setTransform(1, 0, 0, 1, 0, 0);
  (PLATE ? plate : film)(t);
}

async function boot() {
  for (const [f, file, d] of [['Fraunces', 'fraunces-latin-900-normal', { weight: '900' }], ['Fraunces', 'fraunces-latin-900-italic', { weight: '900', style: 'italic' }], ['Anton', 'anton-latin-400-normal', {}]]) {
    const o = new FontFace(f, `url(fonts/${file}.woff2)`, d); await o.load(); document.fonts.add(o);
  }
  DOT.yel = dotPattern('rgba(249,195,75,.9)', 16, 4.2);
  DOT.red = dotPattern('rgba(236,11,156,.55)', 14, 3.2);
  DOT.pinkPage = dotPattern('rgba(236,11,156,.16)', 22, 4.4);
  if (PLATE) IMG = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = PLATE; });
  window.DUR = DUR; window.render = render; window.READY = true;
}
boot();
