// Records a scroll-through loop and screenshots of each live demo.
// Usage: node scripts/capture.mjs [slug...]
import { chromium } from 'playwright'
import { mkdirSync, readdirSync, renameSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const TARGETS = {
  'relay-landing': { url: 'https://relay-landing-page-five.vercel.app', out: 'relay', prefix: 'landing', wait: 4000 },
  c4future: { url: 'https://ad074890-c4future.hf.space/', out: 'c4future', prefix: 'screen', wait: 12000 },
  'cancer-tf': { url: 'https://cancer-tf-dashboard.vercel.app', out: 'cancer-tf', prefix: 'screen', wait: 6000 },
  'research-assistant': {
    url: 'https://ayushdas4890-ai-research-assistant-pipeline-app-1sjuvf.streamlit.app/',
    out: 'research-assistant', prefix: 'screen', wait: 25000,
  },
}

const VIEW = { width: 1440, height: 900 }
const pick = process.argv.slice(2)
const names = pick.length ? pick : Object.keys(TARGETS)

const browser = await chromium.launch()
for (const name of names) {
  const t = TARGETS[name]
  const dir = join('public/media', t.out)
  const raw = join('scripts/.raw', name)
  mkdirSync(dir, { recursive: true })
  rmSync(raw, { recursive: true, force: true })
  mkdirSync(raw, { recursive: true })

  const ctx = await browser.newContext({ viewport: VIEW, recordVideo: { dir: raw, size: VIEW }, reducedMotion: 'no-preference' })
  const page = await ctx.newPage()
  try {
    await page.goto(t.url, { waitUntil: 'domcontentloaded', timeout: 90000 })
    await page.waitForTimeout(t.wait)
    // Streamlit Community Cloud sleeps idle apps; press its wake button and wait for the app.
    const wake = page.getByRole('button', { name: /get this app back up/i })
    if (await wake.count()) {
      await wake.click()
      await page.waitForTimeout(120000)
    }
    // Wheel scrolling works for both window scrolling and inner scroll containers.
    await page.mouse.move(VIEW.width / 2, VIEW.height / 2)
    const stops = t.stops ?? 6
    for (let i = 0; i < stops; i++) {
      await page.screenshot({ path: join(dir, `${t.prefix}-${i + 1}.jpg`), type: 'jpeg', quality: 78 })
      for (let k = 0; k < 12; k++) {
        await page.mouse.wheel(0, 70)
        await page.waitForTimeout(60)
      }
      await page.waitForTimeout(900)
    }
    const height = await page.evaluate(() => document.documentElement.scrollHeight)
    console.log(`${name}: ok, height=${height}`)
  } catch (err) {
    console.log(`${name}: FAILED ${err.message.split('\n')[0]}`)
  }
  await ctx.close()
  const vid = readdirSync(raw).find((f) => f.endsWith('.webm'))
  if (vid) renameSync(join(raw, vid), join(raw, 'raw.webm'))
}
await browser.close()
