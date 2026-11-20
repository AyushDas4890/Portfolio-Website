import { chromium } from 'playwright'
const b = await chromium.launch({ channel: 'msedge' })
const p = await b.newPage({ viewport: { width: 1600, height: 900 } })
await p.goto('http://127.0.0.1:8770/scripts/reel/index.html?render=1', { waitUntil: 'load' })
await p.evaluate(() => window.reelReady())
for (const t of [4300, 4900, 5600]) { await p.evaluate((t) => window.renderAt(t), t); await p.screenshot({ path: `scripts/.shots/probe-${t}.jpg`, type: 'jpeg', quality: 60 }) }
await b.close()
