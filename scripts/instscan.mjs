import { chromium } from 'playwright'
const b = await chromium.launch({ channel: 'msedge' })
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
await p.goto(process.argv[2], { waitUntil: 'domcontentloaded', timeout: 90000 })
await p.waitForTimeout(5000)
await p.evaluate(() => [...document.querySelectorAll('button')].find(x => /disable cookies/i.test(x.textContent))?.click())
await p.mouse.move(720, 450)
const pre = process.argv[3]
for (let i = 0; i < Number(process.argv[4] || 8); i++) {
  await p.screenshot({ path: `scripts/.inst/${pre}${i}.jpg`, type: 'jpeg', quality: 60 })
  for (let k = 0; k < 10; k++) { await p.mouse.wheel(0, 70); await p.waitForTimeout(50) }
  await p.waitForTimeout(900)
}
// Mid-animation capture: hover a work card
await b.close()
