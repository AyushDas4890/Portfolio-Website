import { chromium } from 'playwright'
const b = await chromium.launch({ channel: 'msedge' })
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
const media = new Set()
p.on('response', (r) => { const ct = r.headers()['content-type'] || ''; if (/video|webm|mp4/.test(ct) || /\.(mp4|webm|mov)(\?|$)/.test(r.url())) media.add(r.url()) })
await p.goto(process.argv[2], { waitUntil: 'domcontentloaded', timeout: 90000 })
await p.waitForTimeout(6000)
for (let i = 0; i < 20; i++) { await p.mouse.wheel(0, 500); await p.waitForTimeout(500) }
const tags = await p.evaluate(() => [...document.querySelectorAll('video, video source')].map(v => v.currentSrc || v.src || v.getAttribute('src')))
console.log(JSON.stringify({ tags, media: [...media] }, null, 1))
await b.close()
