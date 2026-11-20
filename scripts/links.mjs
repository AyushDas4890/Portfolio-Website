import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
await p.goto(process.argv[2], { waitUntil: 'domcontentloaded', timeout: 90000 })
await p.waitForTimeout(8000)
const links = await p.evaluate(() => [...new Set([...document.querySelectorAll('a[href]')].map(a => a.href))])
console.log(links.join('\n'))
await b.close()
