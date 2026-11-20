// Renders the C4Future template scene (sage paper + multiply-blended engraving) frame by frame.
import { chromium } from 'playwright'
const b = await chromium.launch({ channel: 'msedge' })
const p = await b.newPage({ viewport: { width: 1600, height: 1000 } })
await p.goto('http://127.0.0.1:8770/scripts/c4scene/index.html', { waitUntil: 'load' })
await p.evaluate(() => window.sceneReady())
for (let n = 1; n <= 300; n++) {
  await p.evaluate((n) => window.renderFrame(n), n)
  await p.screenshot({ path: `scripts/.raw/c4scene-frames/f${String(n).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 92 })
}
await b.close()
