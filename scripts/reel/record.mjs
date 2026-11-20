// Records scripts/reel/index.html in Edge and prints where the reel starts and ends in the recording.
// Serve the site folder first: python -m http.server 8770 --bind 127.0.0.1
import { chromium } from 'playwright'
import { readdirSync, renameSync, statSync, mkdirSync } from 'node:fs'
const RAW = 'scripts/.raw/reel'
mkdirSync(RAW, { recursive: true })
const view = { width: 1600, height: 900 }
const b = await chromium.launch({ channel: 'msedge' })
const ctx = await b.newContext({ viewport: view, recordVideo: { dir: RAW, size: view } })
const t0 = Date.now()
const p = await ctx.newPage()
let start = 0, end = 0
p.on('console', (m) => {
  if (m.text() === 'REEL_START') start = (Date.now() - t0) / 1000
  if (m.text() === 'REEL_END') end = (Date.now() - t0) / 1000
})
await p.goto('http://127.0.0.1:8770/scripts/reel/index.html', { waitUntil: 'load' })
await p.waitForFunction(() => window.__reelDone === true, null, { timeout: 120000 })
await p.waitForTimeout(500)
await ctx.close(); await b.close()
const files = readdirSync(RAW).filter((f) => f.startsWith('page@')).sort((a, c) => statSync(`${RAW}/${c}`).mtimeMs - statSync(`${RAW}/${a}`).mtimeMs)
renameSync(`${RAW}/${files[0]}`, `${RAW}/raw.webm`)
console.log(JSON.stringify({ start, end }))
