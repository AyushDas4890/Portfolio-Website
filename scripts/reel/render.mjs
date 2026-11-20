// Renders the reel frame by frame at a fixed 30 fps: node scripts/reel/render.mjs
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
const OUT = 'scripts/.raw/reel-frames'
mkdirSync(OUT, { recursive: true })
const FPS = 30
const b = await chromium.launch({ channel: 'msedge' })
const p = await b.newPage({ viewport: { width: 1600, height: 900 } })
await p.goto('http://127.0.0.1:8770/scripts/reel/index.html?render=1', { waitUntil: 'load' })
const total = await p.evaluate(() => window.reelReady())
const frames = Math.round((total / 1000) * FPS)
for (let f = 0; f < frames; f++) {
  await p.evaluate((t) => window.renderAt(t), (f * 1000) / FPS)
  await p.screenshot({ path: `${OUT}/f${String(f).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 92 })
  if (f % 100 === 0) console.log(f, '/', frames)
}
await b.close()
console.log('frames', frames)
