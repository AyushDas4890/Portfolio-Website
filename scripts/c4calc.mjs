// Records C4Future end to end in Edge (H.264 video plays): intro, horses, a real calculation and its results.
import { chromium } from 'playwright'
import { readdirSync, renameSync } from 'node:fs'
const OUT = 'public/media/c4future'
const RAW = 'scripts/.raw/c4calc'
const b = await chromium.launch({ channel: 'msedge' })
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: RAW, size: { width: 1440, height: 900 } } })
const p = await ctx.newPage()
const t0 = Date.now()
const mark = (m) => console.log(((Date.now() - t0) / 1000).toFixed(1), m)
const wheel = async (px, steps = 10, gap = 70) => { for (let i = 0; i < steps; i++) { await p.mouse.wheel(0, px / steps); await p.waitForTimeout(gap) } }
await p.goto('https://ad074890-c4future.hf.space/', { waitUntil: 'domcontentloaded', timeout: 90000 })
await p.mouse.move(720, 450)
await p.waitForTimeout(12000); mark('loaded')
// Walk the intro until the horse video section, giving the clip time to load and play.
for (let i = 0; i < 7; i++) { await wheel(450); await p.waitForTimeout(1300) }
const hasVideo = await p.evaluate(() => { const v = document.querySelector('video'); if (!v) return 'none'; const r = v.getBoundingClientRect(); return `${v.readyState} top=${Math.round(r.top)}` })
mark('video state ' + hasVideo)
await p.waitForTimeout(2000); mark('horses held')
await p.screenshot({ path: `${OUT}/why-horses.jpg`, type: 'jpeg', quality: 80 })
// Calculator
await p.evaluate(() => document.querySelector('#productName').scrollIntoView({ block: 'center', behavior: 'smooth' }))
await p.waitForTimeout(2500); mark('calculator')
const mats = await p.$$eval('#material option', (o) => o.map((x) => x.value + '=' + x.textContent))
const cotton = mats.find((m) => /cotton/i.test(m))
mark('material ' + cotton)
await p.fill('#productName', 'Cotton T-shirt')
if (cotton) await p.selectOption('#material', cotton.split('=')[0])
await p.selectOption('#country', 'CHINA')
await p.waitForTimeout(600)
await p.evaluate(() => { const btn = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Sea'); btn?.click() })
await p.waitForTimeout(600)
await p.screenshot({ path: `${OUT}/calc-form.jpg`, type: 'jpeg', quality: 80 })
await p.evaluate(() => [...document.querySelectorAll('button[type=submit]')].find((x) => /Calculate/.test(x.textContent))?.click()); mark('submitted')
await p.waitForTimeout(9000); mark('after submit url=' + p.url())
await p.screenshot({ path: `${OUT}/result-1.jpg`, type: 'jpeg', quality: 80 })
for (let i = 2; i <= 6; i++) { await wheel(650, 12, 60); await p.waitForTimeout(1800); await p.screenshot({ path: `${OUT}/result-${i}.jpg`, type: 'jpeg', quality: 80 }) }
mark('done')
await ctx.close(); await b.close()
const v = readdirSync(RAW).find((f) => f.endsWith('.webm')); if (v) renameSync(`${RAW}/${v}`, `${RAW}/raw.webm`)
