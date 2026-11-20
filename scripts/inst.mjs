import { chromium } from 'playwright'
const b = await chromium.launch({ channel: 'msedge' })
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
await p.goto('https://www.instrument.com/work', { waitUntil: 'domcontentloaded', timeout: 90000 })
await p.waitForTimeout(6000)
const out = await p.evaluate(() => {
  const pick = (el) => { if (!el) return null; const s = getComputedStyle(el); return { tag: el.tagName, cls: el.className?.toString().slice(0, 80), font: s.fontFamily.slice(0, 60), size: s.fontSize, weight: s.fontWeight, lh: s.lineHeight, ls: s.letterSpacing, color: s.color, bg: s.backgroundColor, radius: s.borderRadius, transition: s.transition.slice(0, 160), transform: s.transform, pad: s.padding } }
  const all = [...document.querySelectorAll('h1,h2,h3,p,a,button,video,img,figure,li')]
  const res = {}
  res.h = all.filter(e => /^H/.test(e.tagName)).slice(0, 6).map(pick)
  res.buttons = all.filter(e => e.tagName === 'BUTTON').slice(0, 6).map(pick)
  res.videos = [...document.querySelectorAll('video')].slice(0, 3).map(v => ({ ...pick(v.parentElement), src: v.currentSrc?.slice(0, 120) }))
  res.cardLinks = [...document.querySelectorAll('a[href*="/work/"]')].slice(0, 4).map(pick)
  res.fonts = [...document.fonts].map(f => f.family + ' ' + f.weight + ' ' + f.style).filter((v, i, a) => a.indexOf(v) === i).slice(0, 20)
  res.body = pick(document.body)
  return res
})
console.log(JSON.stringify(out, null, 1))
await b.close()
