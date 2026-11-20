// Pre-extracts the exact 30 fps frames each reel clip needs.
import { chromium } from 'playwright'
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync } from 'node:fs'
const b = await chromium.launch({ channel: 'msedge' })
const p = await b.newPage()
await p.goto('http://127.0.0.1:8770/scripts/reel/index.html?render=1', { waitUntil: 'load' })
const clips = await p.evaluate(() => window.reelClips())
await b.close()
for (const c of clips) {
  const dir = `scripts/.raw/reelsrc/${c.key}`
  rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true })
  const src = c.src.replace('/public/', 'public/')
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(c.at), '-i', src, '-t', String(c.d / 1000 + 0.2),
    '-vf', `fps=30,scale=${c.w}:-2:flags=lanczos`, '-q:v', '3', `${dir}/f%04d.jpg`])
  console.log(c.key, src)
}
