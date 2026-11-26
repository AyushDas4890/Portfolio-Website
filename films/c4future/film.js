// C4Future — "The hidden number". Copperplate engraving, 8 s loop (TREATMENT.md).
// Tone is made only by lines: graticule, parallel hatching, cross-hatching on the night side.
// ?plate=img/x.jpg → 6 s plate: a real screen set in an engraved double rule with corner flourishes.
import { clamp, lerp, seg, ss, eio, eo, mulberry, TAU } from '/core/lib.js';

const Q = new URLSearchParams(location.search);
const PLATE = Q.get('plate');
const W = +(Q.get('w') || 1920), H = +(Q.get('h') || 1080);
const DUR = PLATE ? 6 : 8;
const PAPER = '#EBEEE7', INK = '#2B3A30', WASH = '#B4502A';
const cv = document.getElementById('c'); cv.width = W; cv.height = H;
const X = cv.getContext('2d');
let GRAIN, IMG;

function makeGrain() {                       // laid paper: faint chain lines and a fine tooth, made once
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
  const R = mulberry(4); g.globalAlpha = .05; g.fillStyle = '#6b6a55';
  for (let i = 0; i < 26000; i++) g.fillRect(R() * W, R() * H, 1 + R() * 1.5, 1);
  g.globalAlpha = .035; g.strokeStyle = '#6b6a55';
  for (let x = 40; x < W; x += 46) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 3, H); g.stroke(); }
  const v = g.createRadialGradient(W / 2, H / 2, H * .4, W / 2, H / 2, H * .95);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(60,55,30,.13)');
  g.globalAlpha = 1; g.fillStyle = v; g.fillRect(0, 0, W, H);
  return c;
}

// the burin: a line whose width swells in the middle (lozenge cut)
function cut(pts, w = 1.6, upTo = 1) {
  const n = pts.length; if (n < 2 || upTo <= 0) return;
  const m = Math.max(2, Math.floor(n * clamp(upTo)));
  X.beginPath(); X.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < m; i++) X.lineTo(pts[i][0], pts[i][1]);
  X.lineWidth = w; X.stroke();
}
const swell = (x0, y0, x1, y1, w) => {       // a tapered hatch line as a thin lozenge
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L * w / 2, ny = dx / L * w / 2;
  X.moveTo(x0, y0); X.lineTo((x0 + x1) / 2 + nx, (y0 + y1) / 2 + ny); X.lineTo(x1, y1); X.lineTo((x0 + x1) / 2 - nx, (y0 + y1) / 2 - ny); X.closePath();
};

// ───────── globe
const G = { x: 600, y: 470, r: 290 };
function globe(t) {
  const { x, y, r } = G, spin = TAU / 12 * (t / DUR);      // one meridian spacing per loop: seamless
  X.save(); X.strokeStyle = INK; X.fillStyle = INK;
  X.beginPath(); X.arc(x, y, r, 0, TAU); X.lineWidth = 2.6; X.stroke();
  X.beginPath(); X.arc(x, y, r, 0, TAU); X.clip();
  for (let k = 0; k < 12; k++) {                            // meridians: ellipses whose width follows the turn
    const a = k * TAU / 12 + spin, c = Math.cos(a);
    if (Math.sin(a) < 0) continue;
    X.beginPath(); X.ellipse(x, y, Math.abs(c) * r, r, 0, 0, TAU); X.lineWidth = .9 + .6 * Math.sin(a); X.stroke();
  }
  for (let k = -5; k <= 5; k++) {                           // parallels
    const yy = y + Math.sin(k / 6 * Math.PI / 2) * r, w = Math.sqrt(Math.max(0, r * r - (yy - y) ** 2));
    X.beginPath(); X.ellipse(x, yy, w, w * .12, 0, 0, Math.PI); X.lineWidth = .9; X.stroke();
  }
  // night side, by line only: parallel hatch whose length grows toward the terminator, then a cross-hatch
  X.beginPath();
  for (let yy = y - r; yy < y + r; yy += 6) {
    const w = Math.sqrt(Math.max(0, r * r - (yy - y) ** 2)), x1 = x + w, x0 = x + w * .15;
    swell(x0, yy, x1, yy, 2.4);
  }
  X.fill();
  X.beginPath();
  for (let d = -r * 2; d < r * 2; d += 9) {
    const x0 = x + r * .45 + d * .3, y0 = y - r + d, x1 = x0 + r, y1 = y0 + r * .6;
    swell(x0, y0, x1, y1, 1.6);
  }
  X.globalAlpha = .55; X.fill(); X.globalAlpha = 1;
  X.restore();
}

// a sea lane girdling the globe, tilted; the far half passes behind
const lane = u => { const a = TAU * u, rx = G.r * 1.28, ry = G.r * .36, tilt = -.32;
  const px = Math.cos(a) * rx, py = Math.sin(a) * ry;
  return [G.x + px * Math.cos(tilt) - py * Math.sin(tilt), G.y + px * Math.sin(tilt) + py * Math.cos(tilt), Math.sin(a)]; };
function route(t, front) {
  X.save(); X.fillStyle = INK;
  for (let i = 0; i < 120; i++) {
    const [px, py, z] = lane(i / 120);
    if ((z > 0) !== front) continue;
    const hidden = !front && Math.hypot(px - G.x, py - G.y) < G.r;
    if (hidden) continue;
    X.beginPath(); X.arc(px, py, front ? 2.6 : 1.8, 0, TAU); X.fill();
  }
  const u = t / DUR + .1, [sx, sy, z] = lane(u);
  if ((z > 0) === front && !(z <= 0 && Math.hypot(sx - G.x, sy - G.y) < G.r)) {
    const [nx, ny] = lane(u + .004), a = Math.atan2(ny - sy, nx - sx), k = front ? 1 : .7;
    X.translate(sx, sy); X.rotate(a); X.scale(k, k);
    X.beginPath(); X.moveTo(-34, -6); X.lineTo(30, -6); X.lineTo(40, 2); X.lineTo(26, 12); X.lineTo(-30, 12); X.closePath();
    X.fillStyle = PAPER; X.fill(); X.lineWidth = 2; X.strokeStyle = INK; X.stroke();
    X.beginPath(); for (let yy = 0; yy < 12; yy += 3) { X.moveTo(-28, yy); X.lineTo(26, yy); } X.lineWidth = .8; X.stroke();
    X.fillStyle = INK; for (let i = 0; i < 4; i++) X.fillRect(-24 + i * 12, -16, 9, 9);
    X.fillRect(20, -24, 8, 18);
  }
  X.restore();
}

// ───────── the shirt
const SX = 1340, SY = 400;
const shirt = [[-80, -170], [-150, -140], [-230, -70], [-190, -10], [-140, -40], [-140, 200], [140, 200], [140, -40], [190, -10], [230, -70], [150, -140], [80, -170], [40, -140], [0, -132], [-40, -140]];
function shirtPath() { X.beginPath(); shirt.forEach(([a, b], i) => i ? X.lineTo(SX + a, SY + b) : X.moveTo(SX + a, SY + b)); X.closePath(); }
function tshirt(t) {
  const draw = seg(t, 2.0, 3.4), back = seg(t, 6.6, 7.5), vis = back > 0 ? 1 - back : draw;
  if (vis <= 0) return;
  const wash = Math.min(seg(t, 3.0, 3.8), 1 - seg(t, 6.2, 6.9));
  X.save(); X.strokeStyle = INK; X.fillStyle = INK;
  // the burin travels down the plate: everything above its line is cut
  X.beginPath(); X.rect(SX - 260, SY - 200, 520, 420 * vis); X.clip();
  if (wash > 0) { shirtPath(); X.globalAlpha = .62 * wash; X.fillStyle = WASH; X.fill(); X.globalAlpha = 1; X.fillStyle = INK; }
  X.save(); shirtPath(); X.clip();
  X.beginPath();
  for (let d = -500; d < 500; d += 8) {                      // diagonal tone, heavier on the shadow side
    const x0 = SX + d - 200, y0 = SY - 200, x1 = SX + d + 200, y1 = SY + 220;
    swell(x0, y0, x1, y1, 1.2 + 1.6 * clamp((d + 100) / 400));
  }
  X.globalAlpha = .8; X.fill(); X.globalAlpha = 1;
  X.beginPath(); for (let yy = SY - 60; yy < SY + 200; yy += 22) swell(SX - 140, yy, SX + 140, yy + 4, 1.1); X.fill();  // knit courses
  X.restore();
  shirtPath(); X.lineWidth = 3; X.stroke();
  X.beginPath(); X.moveTo(SX - 40, SY - 140); X.quadraticCurveTo(SX, SY - 96, SX + 40, SY - 140); X.lineWidth = 2.4; X.stroke();
  X.beginPath(); X.moveTo(SX - 140, SY - 40); X.lineTo(SX - 150, SY - 80); X.moveTo(SX + 140, SY - 40); X.lineTo(SX + 150, SY - 80); X.lineWidth = 1.4; X.stroke();
  X.restore();
}

// ───────── cartouche
function cartouche(t) {
  const inn = seg(t, 4.0, 4.7), out = seg(t, 6.5, 7.3), v = out > 0 ? 1 - out : inn;
  if (v <= 0) return;
  const cx = 1340, cy = 820, w = 620, h = 200;
  X.save();
  X.beginPath(); X.rect(cx - w / 2 - 20, cy - h / 2 - 20, (w + 40) * eio(v), h + 40); X.clip();
  X.strokeStyle = INK; X.fillStyle = INK;
  X.lineWidth = 2.4; X.strokeRect(cx - w / 2, cy - h / 2, w, h); X.lineWidth = .9; X.strokeRect(cx - w / 2 + 8, cy - h / 2 + 8, w - 16, h - 16);
  X.textAlign = 'center';
  X.font = 'italic 400 34px Fraunces'; X.fillText('The hidden number', cx, cy - 46);
  const num = seg(t, 4.5, 5.1);
  X.font = '300 84px Fraunces'; X.fillText('8.46', cx - 80, cy + 40);
  X.font = 'italic 400 34px Fraunces'; X.fillText('kg CO₂e', cx + 110, cy + 40);
  // the honest interval as an engraved scale
  const x0 = cx - 240, x1 = cx + 240, sy = cy + 74, a = 6.9, b = 10.4, xv = v2 => lerp(x0, x1, (v2 - a) / (b - a));
  X.lineWidth = 1.4; X.beginPath(); X.moveTo(x0, sy); X.lineTo(x1, sy);
  for (let k = 7; k <= 10; k += .5) { X.moveTo(xv(k), sy - (k % 1 ? 5 : 9)); X.lineTo(xv(k), sy + (k % 1 ? 5 : 9)); }
  X.stroke();
  X.beginPath(); X.rect(xv(7.4), sy - 4, (xv(9.9) - xv(7.4)) * eo(num), 8); X.globalAlpha = .7; X.fillStyle = WASH; X.fill(); X.globalAlpha = 1;
  X.fillStyle = INK; X.beginPath(); X.moveTo(xv(8.46), sy - 12); X.lineTo(xv(8.46) + 7, sy); X.lineTo(xv(8.46), sy + 12); X.lineTo(xv(8.46) - 7, sy); X.fill();
  X.font = '400 16px Fraunces'; X.fillText('90 % interval', cx, sy + 30);
  X.restore();
}

function border(p = 1) {                     // double rule with corner fleurons, drawn round the plate
  const m = 34, L = 2 * (W + H - 4 * m);
  X.save(); X.strokeStyle = INK;
  X.setLineDash([L * p, L]); X.lineWidth = 2.6; X.strokeRect(m, m, W - 2 * m, H - 2 * m);
  X.setLineDash([L * p, L]); X.lineWidth = .9; X.strokeRect(m + 10, m + 10, W - 2 * m - 20, H - 2 * m - 20);
  X.setLineDash([]); X.globalAlpha = clamp(p * 2 - 1);
  for (const [cx, cy, sx, sy] of [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]]) {
    X.beginPath(); X.moveTo(cx + sx * 10, cy + sy * 46); X.bezierCurveTo(cx + sx * 30, cy + sy * 30, cx + sx * 30, cy + sy * 30, cx + sx * 46, cy + sy * 10);
    X.moveTo(cx + sx * 22, cy + sy * 22); X.arc(cx + sx * 22, cy + sy * 22, 5, 0, TAU); X.lineWidth = 1.4; X.stroke();
  }
  X.restore();
}

function film(t) {
  route(t, false); globe(t); route(t, true); tshirt(t); cartouche(t); border(1);
  X.save(); X.fillStyle = INK; X.font = '400 40px "Pinyon Script"'; X.textAlign = 'left';
  X.fillText('C4Future', 100, 1000); X.font = 'italic 400 20px Fraunces'; X.fillText('carbon, measured honestly', 270, 998); X.restore();
}

function plate(t) {
  const p = eio(seg(t, .1, 1.1)), q = 1 - seg(t, 5.2, 5.9), v = Math.min(p, q) || 0;
  border(t < 5.2 ? p : q);
  const img = IMG, aw = W - 260, ah = H - 260, k = Math.min(aw / img.width, ah / img.height);
  const w = img.width * k, h = img.height * k, x = (W - w) / 2, y = (H - h) / 2 - 10;
  X.save();
  X.strokeStyle = INK; X.lineWidth = 2; X.strokeRect(x - 16, y - 16, w + 32, h + 32);
  X.lineWidth = .8; X.strokeRect(x - 24, y - 24, w + 48, h + 48);
  X.beginPath(); X.rect(x, y, w * eio(clamp(v * 1.2)), h); X.clip();        // the plate is pulled left to right
  X.drawImage(img, x, y, w, h);
  X.globalCompositeOperation = 'multiply'; X.fillStyle = '#EBEEE7'; X.fillRect(x, y, w, h);  // printed on the same stock
  X.restore();
  X.save(); X.fillStyle = INK; X.textAlign = 'center'; X.font = '400 34px "Pinyon Script"';
  X.globalAlpha = v; X.fillText('C4Future', W / 2, H - 58); X.restore();
}

function render(t) {
  t = ((t % DUR) + DUR) % DUR;
  X.setTransform(1, 0, 0, 1, 0, 0); X.drawImage(GRAIN, 0, 0);
  const k = 1 + .015 * (1 - Math.cos(TAU * t / DUR)) / 2;
  X.setTransform(k, 0, 0, k, W / 2 * (1 - k), H / 2 * (1 - k));
  (PLATE ? plate : film)(t);
}

async function boot() {
  const ff = [['Fraunces', 'fraunces-latin-400-normal', { weight: '400' }], ['Fraunces', 'fraunces-latin-300-normal', { weight: '300' }],
    ['Fraunces', 'fraunces-latin-400-italic', { weight: '400', style: 'italic' }], ['Pinyon Script', 'pinyon-script-latin-400-normal', {}]];
  for (const [f, file, d] of ff) { const o = new FontFace(f, `url(fonts/${file}.woff2)`, d); await o.load(); document.fonts.add(o); }
  if (PLATE) IMG = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = PLATE; });
  GRAIN = makeGrain();
  window.DUR = DUR; window.render = render; window.READY = true;
}
boot();
