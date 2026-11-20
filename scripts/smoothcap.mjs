// Frame-by-frame site capture with an even scroll step per frame, so loops play back smoothly.
// node scripts/smoothcap.mjs <name> <url> <waitMs> <holdFrames> <scrollFrames> <pxPerFrame> [clickSelector]
import { chromium } from 'playwright'
import { mkdirSync, rmSync } from 'node:fs'
const [, , name, url, waitMs = 8000, hold = 45, frames = 360, px = 9, click] = process.argv
const OUT = `scripts/.raw/frames-${name}`
rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })
const b = await chromium.launch({ channel: 'msedge' })
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 })
await p.mouse.move(720, 450)
await p.waitForTimeout(Number(waitMs))
if (click) {
  await p.locator(click).first().click()
  await p.waitForTimeout(50000) // first prediction downloads the ONNX model
}
let f = 0
const snap = () => p.screenshot({ path: `${OUT}/f${String(f++).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 88 })
for (let i = 0; i < Number(hold); i++) { await p.waitForTimeout(33); await snap() }
for (let i = 0; i < Number(frames); i++) {
  await p.mouse.wheel(0, Number(px))
  await p.waitForTimeout(33)
  await snap()
}
await b.close()
console.log(name, 'frames', f)
