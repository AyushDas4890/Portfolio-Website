// Scroll a page in fixed wheel steps and screenshot each step: node scripts/scan.mjs <url> <outDir> <steps> <px>
import { chromium } from 'playwright'
const [,, url, out, steps = 24, px = 500] = process.argv
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 })
await p.waitForTimeout(9000)
await p.mouse.move(720, 450)
for (let i = 0; i < Number(steps); i++) {
  await p.screenshot({ path: `${out}/s${String(i).padStart(2, '0')}.jpg`, type: 'jpeg', quality: 55 })
  await p.mouse.wheel(0, Number(px)); await p.waitForTimeout(1100)
}
await b.close()
