// Relay — "Pass it on". Marker on cream paper, 8 s loop (TREATMENT.md).
// Every frame is rebuilt from t alone: strokes are reseeded per frame, the boil cycles on twos.
// ?plate=img/x.jpg  → a 6 s plate: one real screen taped to the sheet, with doodles that draw and lift.
import { W, H, Ink, line, poly, curve, arc, circle, arrow, makePaper, composeOn, paperCanvas, reseed, setBoil, setGlyphs } from './pen.js';
import { clamp, lerp, seg, ss, eio, eo, ei, back, TAU } from '/core/lib.js';

const Q = new URLSearchParams(location.search);
const PLATE = Q.get('plate');
const DUR = PLATE ? 6 : 8;

const cv = document.getElementById('c'); cv.width = W; cv.height = H;
const X = cv.getContext('2d');
const B = document.createElement('canvas'); B.width = W; B.height = H;
const BX = B.getContext('2d');
const ink = new Ink();
const IM = BX.createImageData(W, H);
let PD = null;
const IMG = {};

// ───────── helpers
const quad = (a, c, b, u) => [(1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1]];
const drawUp = (strokes, p) => {            // draw a group of strokes in order up to fraction p of their total length
  const L = strokes.reduce((a, s) => a + s.len, 0); let left = L * clamp(p);
  for (const s of strokes) { if (left <= 0) break; ink.stroke(s, left); left -= s.len; }
};
const retract = (strokes, p) => drawUp(strokes, 1 - clamp(p));

function person(x, y, reach = 0, dir = 1, s = 1) {
  const hy = y - 150 * s;
  const out = [circle(x, hy, 34 * s, { w: 7 })];
  out.push(line(x, hy + 36 * s, x + 2, y - 20 * s, { w: 7 }));                       // body
  out.push(line(x + 2, y - 20 * s, x - 34 * s, y + 52 * s, { w: 7 }));               // legs
  out.push(line(x + 2, y - 20 * s, x + 36 * s, y + 52 * s, { w: 7 }));
  const sh = [x, hy + 66 * s];
  out.push(line(sh[0], sh[1], sh[0] - dir * 44 * s, sh[1] + 52 * s, { w: 7 }));     // resting arm
  const a = lerp(.9, -.75, reach);                                                    // the passing arm rises
  out.push(line(sh[0], sh[1], sh[0] + dir * Math.cos(a) * 64 * s, sh[1] + Math.sin(a) * 64 * s, { w: 7 }));
  return out;
}

function bot(x, y) {                         // the Relay Bot, a round-headed helper
  const o = [];
  o.push(...[line(x - 70, y - 160, x + 70, y - 160, { w: 7, over: 6 }), line(x + 70, y - 160, x + 76, y - 60, { w: 7, over: 6 }),
    line(x + 76, y - 60, x - 76, y - 60, { w: 7, over: 6 }), line(x - 76, y - 60, x - 70, y - 160, { w: 7, over: 6 })]);
  o.push(line(x, y - 160, x + 4, y - 200, { w: 6 }), circle(x + 5, y - 212, 11, { w: 6 }));
  o.push(circle(x - 30, y - 112, 7, { w: 9 }), circle(x + 30, y - 112, 7, { w: 9 }));
  o.push(arc(x, y - 100, 26, .35, Math.PI - .35, { w: 6 }));
  o.push(...[line(x - 52, y - 46, x + 52, y - 46, { w: 7 }), line(x + 52, y - 46, x + 46, y + 40, { w: 7 }),
    line(x + 46, y + 40, x - 46, y + 40, { w: 7 }), line(x - 46, y + 40, x - 52, y - 46, { w: 7 })]);
  return o;
}

// bubble with a tail, scaled about its centre
function bubble(cx, cy, k) {
  const w = 270 * k, h = 116 * k, r = 30 * k, x = cx - w / 2, y = cy - h / 2;
  const P = [];
  const corner = (ax, ay, a0) => { for (let i = 0; i <= 6; i++) { const a = a0 + i / 6 * Math.PI / 2; P.push([ax + Math.cos(a) * r, ay + Math.sin(a) * r]); } };
  corner(x + w - r, y + r, -Math.PI / 2); corner(x + w - r, y + h - r, 0);
  P.push([cx + 18 * k, y + h], [cx - 6 * k, y + h + 34 * k], [cx - 22 * k, y + h]);
  corner(x + r, y + h - r, Math.PI / 2); corner(x + r, y + r, Math.PI); P.push([x + w - r, y]);
  return { outline: curve(P, { w: 7 * Math.max(k, .5), smooth: 1 }), fill: scrib(x + 18 * k, y + 16 * k, w - 36 * k, h - 32 * k, 'amber', 26 * k) };
}
function scrib(x, y, w, h, color, wd) {      // a highlighter fill: one zig-zag stroke
  const P = [], n = Math.max(2, Math.round(h / (wd * .7)));
  for (let i = 0; i <= n; i++) { const yy = y + h * i / n; P.push(i % 2 ? [x + w, yy] : [x, yy]); }
  return poly(P, { color, w: wd, jitter: .6, pool: 0 });
}

// a taped card with an optional corner peel (0 = flat, 1 = gone)
function card(ctx, img, cx, cy, cw, rot, peel = 0) {
  const ch = cw * img.height / img.width, x = -cw / 2, y = -ch / 2;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
  // fold line travels from the bottom-right corner to beyond the top-left, perpendicular to the diagonal
  const D = Math.hypot(cw, ch), ux = -cw / D, uy = -ch / D, d = peel * D * 1.08;
  const lx = cw / 2 + ux * d, ly = ch / 2 + uy * d;              // a point on the fold line
  const keep = ([px, py]) => (px - lx) * ux + (py - ly) * uy >= 0; // the side that stays flat (towards top-left)
  const R = [[x, y], [x + cw, y], [x + cw, y + ch], [x, y + ch]];
  const clipPoly = (pts, inside) => {
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length], ia = inside(a), ib = inside(b);
      if (ia) out.push(a);
      if (ia !== ib) {
        const fa = (a[0] - lx) * ux + (a[1] - ly) * uy, fb = (b[0] - lx) * ux + (b[1] - ly) * uy, u = fa / (fa - fb);
        out.push([lerp(a[0], b[0], u), lerp(a[1], b[1], u)]);
      }
    }
    return out;
  };
  const flat = peel > 0 ? clipPoly(R, keep) : R;
  if (flat.length > 2) {
    ctx.save();
    ctx.shadowColor = 'rgba(40,30,10,.22)'; ctx.shadowBlur = 28; ctx.shadowOffsetY = 10;
    ctx.beginPath(); flat.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.closePath();
    ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore();
    ctx.save(); ctx.beginPath(); flat.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.closePath(); ctx.clip();
    ctx.drawImage(img, x + 10, y + 10, cw - 20, ch - 20); ctx.restore();
  }
  if (peel > 0 && peel < 1) {                                      // the curled-back flap: the removed corner mirrored over the fold
    const gone = clipPoly(R, p => !keep(p));
    if (gone.length > 2) {
      const flap = gone.map(([px, py]) => { const f = (px - lx) * ux + (py - ly) * uy; return [px - 2 * f * ux, py - 2 * f * uy]; });
      const keepFlap = clipPoly(flap, p => true);
      ctx.save(); ctx.shadowColor = 'rgba(40,30,10,.28)'; ctx.shadowBlur = 22; ctx.shadowOffsetX = 6; ctx.shadowOffsetY = 8;
      ctx.beginPath(); keepFlap.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.closePath();
      const g = ctx.createLinearGradient(lx, ly, lx + ux * 260, ly + uy * 260);
      g.addColorStop(0, '#d9d2c3'); g.addColorStop(.5, '#f4efe4'); g.addColorStop(1, '#fbf8f1');
      ctx.fillStyle = g; ctx.fill(); ctx.restore();
    }
  }
  if (peel < .55) {                                                // tape on the two top corners
    ctx.globalAlpha = 1 - seg(peel, .3, .55);
    for (const [tx, tr] of [[x + 40, -.6], [x + cw - 40, .6]]) {
      ctx.save(); ctx.translate(tx, y + 4); ctx.rotate(tr);
      ctx.fillStyle = 'rgba(245, 228, 170, .78)'; ctx.fillRect(-70, -20, 140, 40);
      ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(-70, -20, 140, 8);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

// ───────── the film
const A = [470, 660], Bp = [960, 360], C = [1450, 660], BOT = [960, 820];
const BA = [470, 400], BB = [960, 120], BC = [1450, 400], BBOT = [960, 560];   // bubble anchors
const HOPS = [[BA, [600, 120], BB, .9, 1.5], [BB, [1320, 120], BC, 1.5, 2.1], [BC, [1300, 640], BBOT, 2.1, 2.7]];

function film(t) {
  ink.clear(); reseed(11); setBoil(Math.floor(t * 12) % 3);
  // pass arcs (a dashed relay trail would be busier; one confident arrow per hand-off)
  const arcs = [
    arrow(560, 540, 860, 300, { via: [610, 330], w: 6, head: 26 }),
    arrow(1060, 300, 1370, 540, { via: [1310, 330], w: 6, head: 26 }),
    arrow(1400, 760, 1080, 790, { via: [1280, 860], w: 6, head: 26 }),
  ];
  const wipe = seg(t, 6.95, 7.45);
  arcs.forEach((a, i) => { const [, , , t0, t1] = HOPS[i]; if (wipe > 0) retract(a, wipe); else drawUp(a, seg(t, t0 - .05, t1 - .1)); });

  // who is reaching: the giver lifts the arm as the bubble leaves
  const reachA = Math.max(1 - Math.abs(t - .95) / .5, 0), reachB = Math.max(1 - Math.abs(t - 1.55) / .5, 0), reachC = Math.max(1 - Math.abs(t - 2.15) / .5, 0);
  ink.add(person(...A, ss(reachA), 1), person(...Bp, ss(reachB), 1), person(...C, ss(reachC), -1), bot(...BOT));

  // the bubble: rests above A, hops A→B→C→bot, sinks into the bot, re-pops above A at the end
  let pos = BA, k = 1;
  for (const [a, c, b, t0, t1] of HOPS) if (t >= t0) pos = t < t1 ? quad(a, c, b, eio(seg(t, t0, t1))) : b;
  if (t >= 2.7) k = 1 - ei(seg(t, 2.7, 2.95));
  if (t >= 7.35) { pos = BA; k = back(seg(t, 7.35, 7.85), 2.2); }
  if (k > .02) {
    const bb = bubble(pos[0], pos[1], k);
    ink.stroke(bb.fill); ink.stroke(bb.outline);
    const T = ink.layout('standup?', pos[0], pos[1] + 15 * k, { size: 46 * k, align: 'center', seed: 5 });
    ink.write(T);
  }
  // the bot answers in pink
  const stamp = [circle(1150, 690, 74, { color: 'pink', w: 10 }), poly([[1112, 690], [1140, 722], [1192, 650]], { color: 'pink', w: 12 })];
  if (wipe > 0) retract(stamp, wipe); else drawUp(stamp, seg(t, 2.85, 3.25));
  const done = ink.layout('done', 1150, 830, { size: 44, color: 'pink', align: 'center', seed: 9 });
  ink.write(done, done.L * (wipe > 0 ? 1 - wipe : seg(t, 3.0, 3.3)));

  // title, written after the last card lifts away, wiped with the trail
  const T1 = ink.layout('Relay', 110, 1010, { size: 104, seed: 21 });
  const T2 = ink.layout('team management, minus the meetings', 420, 1004, { size: 40, weight: 400, seed: 22 });
  const hl = scrib(100, 960, 300, 60, 'amber', 34);
  if (wipe > 0) { retract([hl], wipe); ink.write(T1, T1.L * (1 - wipe)); ink.write(T2, T2.L * (1 - wipe)); }
  else { drawUp([hl], seg(t, 6.0, 6.3)); ink.write(T1, T1.L * seg(t, 6.1, 6.55)); ink.write(T2, T2.L * seg(t, 6.35, 6.9)); }

  composeOn(PD, ink, IM); BX.putImageData(IM, 0, 0);

  // the real screens, taped on, then peeled away
  const up = eo(seg(t, 3.1, 3.7));
  if (t >= 3.1 && t < 6.6) {
    const yy = 520 + (1 - up) * 900;
    if (t >= 4.6) card(BX, IMG.b, 960, 520, 1240, .012, eio(seg(t, 5.8, 6.55)));
    card(BX, IMG.a, 960, yy, 1240, -.018, eio(seg(t, 4.6, 5.35)));
  }
}

function plate(t) {
  ink.clear(); reseed(31); setBoil(Math.floor(t * 12) % 3);
  const lift = seg(t, 5.0, 5.8), dr = p => lift > 0 ? 1 - lift : p;
  const img = IMG.p, cw = Math.min(W * .78, (H * .8) * img.width / img.height), ch = cw * img.height / img.width;
  const cx = W / 2, cy = H / 2 + 8 * Math.sin(TAU * t / DUR);
  // margin doodles: a star, a looping arrow at the card, an amber underline
  const L = cx - cw / 2, Rr = cx + cw / 2, Tt = cy - ch / 2, Bt = cy + ch / 2;
  const star = poly([[L - 70, Tt + 40], [L - 40, Tt + 110], [L - 110, Tt + 66], [L - 30, Tt + 66], [L - 100, Tt + 110], [L - 70, Tt + 40]], { w: 6 });
  const arr = arrow(Rr + 120, Bt - 20, Rr + 30, Bt - 150, { via: [Rr + 150, Bt - 170], w: 6, head: 24 });
  const und = scrib(L + 40, Bt + 34, cw * .32, 22, 'amber', 26);
  const loop = circle(Rr + 70, Tt + 70, 34, { color: 'pink', w: 9 });
  drawUp([star], dr(seg(t, .3, .9))); drawUp(arr, dr(seg(t, .7, 1.5))); drawUp([und], dr(seg(t, 1.1, 1.6))); drawUp([loop], dr(seg(t, 1.4, 1.9)));
  composeOn(PD, ink, IM); BX.putImageData(IM, 0, 0);
  card(BX, img, cx, cy, cw, -.01 + .004 * Math.sin(TAU * t / DUR), 0);
}

function render(t) {
  t = ((t % DUR) + DUR) % DUR;
  (PLATE ? plate : film)(t);
  const k = 1 + .012 * (1 - Math.cos(TAU * t / DUR)) / 2;         // the sheet breathes, back to 1 at the loop point
  X.setTransform(1, 0, 0, 1, 0, 0); X.fillStyle = '#F8F5EC'; X.fillRect(0, 0, W, H);
  X.setTransform(k, 0, 0, k, W / 2 * (1 - k), H / 2 * (1 - k)); X.drawImage(B, 0, 0);
}

const load = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
async function boot() {
  for (const f of [new FontFace('Kalam', 'url(fonts/kalam-latin-700-normal.woff2)', { weight: '700' }),
    new FontFace('Kalam', 'url(fonts/kalam-latin-400-normal.woff2)', { weight: '400' })]) { await f.load(); document.fonts.add(f); }
  setGlyphs(await (await fetch('glyphs.json')).json());
  if (PLATE) IMG.p = await load(PLATE);
  else { IMG.a = await load(Q.get('a') || 'img/landing-1.jpg'); IMG.b = await load(Q.get('b') || 'img/app-channel.jpg'); }
  const pc = paperCanvas(makePaper(7, [0, 0, -4]));
  PD = pc.getContext('2d').getImageData(0, 0, W, H).data;
  window.DUR = DUR; window.render = render; window.READY = true;
}
boot();
