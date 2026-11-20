import { chromium } from 'playwright'
const [,, path, ...ys] = process.argv
const b = await chromium.launch({ channel: 'msedge' })
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
await p.goto('http://localhost:4173' + path, { waitUntil: 'networkidle' })
await p.waitForTimeout(2500)
let i = 0
for (const y of ys) {
  const target = Number(y)
  let cur = await p.evaluate(() => window.scrollY)
  let guard = 0
  while (Math.abs(cur - target) > 50 && guard++ < 60) { await p.mouse.wheel(0, Math.sign(target - cur) * Math.min(600, Math.abs(target - cur))); await p.waitForTimeout(120); cur = await p.evaluate(() => window.scrollY) }
  await p.waitForTimeout(1800)
  await p.screenshot({ path: `scripts/.shots/vp-${i++}.jpg`, type: 'jpeg', quality: 60 })
}
console.log(await p.evaluate(() => document.activeElement?.className))
await b.close()
