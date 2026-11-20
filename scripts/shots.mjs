// Visual check: screenshots of key views, console errors, overflow at 375px.
import { chromium } from 'playwright'
const base = process.argv[2] || 'http://localhost:4173'
const out = process.argv[3] || 'scripts/.shots'
const browser = await chromium.launch()
const errors = []
async function shoot(name, path, { width = 1440, height = 900, reduced = false, full = false, settle = 3500, jump = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, reducedMotion: reduced ? 'reduce' : 'no-preference' })
  const page = await ctx.newPage()
  page.on('console', (m) => m.type() === 'error' && errors.push(`${name}: ${m.text()}`))
  page.on('pageerror', (e) => errors.push(`${name}: ${e.message}`))
  await page.goto(base + path, { waitUntil: 'networkidle' })
  await page.waitForTimeout(settle)
  if (jump) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(1500)
  }
  if (full) {
    // Walk the page so reveals fire, then capture.
    const h = await page.evaluate(() => document.body.scrollHeight)
    for (let y = 0; y < h; y += 700) { await page.mouse.wheel(0, 700); await page.waitForTimeout(250) }
    await page.waitForTimeout(1200)
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  if (overflow > 0) errors.push(`${name}: horizontal overflow ${overflow}px`)
  await page.screenshot({ path: `${out}/${name}.jpg`, type: 'jpeg', quality: 70, fullPage: full || jump })
  await ctx.close()
}
await shoot('home', '/')
await shoot('home-full', '/', { full: true })
await shoot('home-jump', '/', { jump: true })
await shoot('relay', '/work/relay', { full: true })
await shoot('research', '/work/research-assistant', { full: true })
await shoot('mobile', '/', { width: 375, height: 812, full: true })
await shoot('mobile-case', '/work/c4future', { width: 375, height: 812, full: true })
await shoot('reduced', '/', { reduced: true })
await shoot('notfound', '/work/xyz')
await browser.close()
console.log(errors.length ? errors.join('\n') : 'no errors')
