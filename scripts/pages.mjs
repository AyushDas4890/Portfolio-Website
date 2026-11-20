// Screenshots of individual pages: node scripts/pages.mjs <outDir> <name>=<url> ...
import { chromium } from 'playwright'
const [,, out, ...pairs] = process.argv
const b = await chromium.launch()
for (const pair of pairs) {
  const [name, url] = pair.split(/=(.+)/)
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
  try {
    await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 })
    await p.waitForTimeout(7000)
    await p.screenshot({ path: `${out}/${name}.jpg`, type: 'jpeg', quality: 78 })
    console.log(name, 'ok')
  } catch (e) { console.log(name, 'FAILED', e.message.split('\n')[0]) }
  await p.close()
}
await b.close()
