import { chromium } from 'playwright'
const b = await chromium.launch({ channel: 'msedge' })
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
await p.goto(process.argv[2], { waitUntil: 'domcontentloaded', timeout: 90000 })
await p.waitForTimeout(8000)
const info = await p.evaluate(() => {
  const f = [...document.querySelectorAll('input,select,textarea,button')].map(e => ({ tag: e.tagName, id: e.id, name: e.name, type: e.type, text: (e.innerText || e.value || e.placeholder || '').slice(0, 40), opts: e.tagName === 'SELECT' ? [...e.options].slice(0, 8).map(o => o.value).join('|') : '' }))
  const canv = [...document.querySelectorAll('canvas')].map(c => c.id || c.className)
  return { f, canv }
})
console.log(JSON.stringify(info, null, 0))
await b.close()
