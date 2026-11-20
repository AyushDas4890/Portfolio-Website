// Edge recordings: Fruit demo grading a test photo, and Relay landing with a slow hero.
import { chromium } from 'playwright'
import { readdirSync, renameSync, statSync } from 'node:fs'
const which = process.argv[2]
const b = await chromium.launch({ channel: 'msedge' })
const view = { width: 1440, height: 900 }
const newest = (dir) => readdirSync(dir).filter((f) => f.startsWith('page@')).sort((a, c) => statSync(`${dir}/${c}`).mtimeMs - statSync(`${dir}/${a}`).mtimeMs)[0]
const wheel = async (p, px, steps = 14, gap = 80) => { for (let i = 0; i < steps; i++) { await p.mouse.wheel(0, px / steps); await p.waitForTimeout(gap) } }
const t0 = Date.now(); const mark = (m) => console.log(((Date.now() - t0) / 1000).toFixed(1), m)

if (which === 'fruit') {
  const RAW = 'scripts/.raw/fruit', OUT = 'public/media/fruit'
  const ctx = await b.newContext({ viewport: view, recordVideo: { dir: RAW, size: view } })
  const p = await ctx.newPage()
  await p.goto('https://ad074890-ripe-or-not.static.hf.space/index.html', { waitUntil: 'domcontentloaded', timeout: 90000 })
  await p.mouse.move(720, 450); await p.waitForTimeout(6000); mark('loaded')
  await p.screenshot({ path: `${OUT}/hero.jpg`, type: 'jpeg', quality: 80 })
  await p.waitForSelector('button:has(img)', { timeout: 60000 })
  const photos = p.locator('button:has(img)')
  const n = await photos.count(); mark('test photos ' + n)
  await photos.nth(Math.min(5, n - 1)).scrollIntoViewIfNeeded()
  await p.waitForTimeout(800)
  await photos.nth(Math.min(5, n - 1)).click(); mark('clicked test photo')
  // First prediction downloads ~90 MB of ONNX model; wait for the ruler/result to appear.
  await p.waitForTimeout(45000); mark('waited for model')
  await p.screenshot({ path: `${OUT}/result.jpg`, type: 'jpeg', quality: 80 })
  await photos.nth(1).click(); await p.waitForTimeout(6000)
  await p.screenshot({ path: `${OUT}/result-2.jpg`, type: 'jpeg', quality: 80 })
  for (const id of ['idea', 'pipeline', 'results', 'look']) {
    await p.evaluate((x) => document.getElementById(x)?.scrollIntoView({ behavior: 'smooth' }), id)
    await p.waitForTimeout(2500)
    await p.screenshot({ path: `${OUT}/${id}.jpg`, type: 'jpeg', quality: 80 })
  }
  await p.goto('https://ad074890-ripe-or-not.static.hf.space/presentation.html', { waitUntil: 'domcontentloaded' })
  await p.waitForTimeout(4000)
  await p.screenshot({ path: `${OUT}/slides.jpg`, type: 'jpeg', quality: 80 })
  mark('done'); await ctx.close()
  renameSync(`${RAW}/${newest(RAW)}`, `${RAW}/raw.webm`)
}

if (which === 'relay') {
  const RAW = 'scripts/.raw/relay2'
  const ctx = await b.newContext({ viewport: view, recordVideo: { dir: RAW, size: view } })
  const p = await ctx.newPage()
  await p.goto('https://relay-landing-page-five.vercel.app', { waitUntil: 'domcontentloaded', timeout: 90000 })
  await p.mouse.move(900, 300); await p.waitForTimeout(5000); mark('loaded')
  // Let the hero breathe: gentle cursor moves (the robot follows the cursor), then slow scroll.
  for (const [x, y] of [[500, 380], [1100, 260], [760, 520], [700, 420]]) { await p.mouse.move(x, y, { steps: 25 }); await p.waitForTimeout(900) }
  mark('hero held')
  for (let i = 0; i < 9; i++) { await wheel(p, 420, 16, 90); await p.waitForTimeout(1600) }
  mark('done'); await ctx.close()
  renameSync(`${RAW}/${newest(RAW)}`, `${RAW}/raw.webm`)
}
await b.close()
