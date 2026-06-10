import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/*
  WebGL particle universe.
  - GPU point cloud (~9k particles) shaped into a slowly rotating galaxy disc + halo.
  - Mouse parallax tilts the whole field.
  - Scroll drives a camera fly-through: the camera dollies inward and the field rolls.
  - Additive blending + soft round sprites = glow without postprocessing.
  - Theme-aware colours, dpr capped, honours prefers-reduced-motion, full dispose() on unmount.
*/
export default function ThreeBackground({ theme }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const light = theme === 'light'
    const cA = new THREE.Color(light ? '#2f6fdb' : '#4d9fff')
    const cB = new THREE.Color(light ? '#1f9e8f' : '#7afcd0')
    const cC = new THREE.Color(light ? '#8a93a6' : '#9fb4ff')

    let w = window.innerWidth
    let h = window.innerHeight
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(dpr)
    renderer.setSize(w, h)
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(light ? 0xffffff : 0x070b12, 0.045)

    const camera = new THREE.PerspectiveCamera(62, w / h, 0.1, 100)
    camera.position.set(0, 0, 9)

    const makeSprite = () => {
      const s = 64
      const c = document.createElement('canvas')
      c.width = c.height = s
      const g = c.getContext('2d')
      const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
      grd.addColorStop(0, 'rgba(255,255,255,1)')
      grd.addColorStop(0.35, 'rgba(255,255,255,0.6)')
      grd.addColorStop(1, 'rgba(255,255,255,0)')
      g.fillStyle = grd
      g.fillRect(0, 0, s, s)
      const tex = new THREE.CanvasTexture(c)
      tex.colorSpace = THREE.SRGBColorSpace
      return tex
    }
    const sprite = makeSprite()

    const COUNT = Math.min(Math.floor((w * h) / 220), 9000)
    const positions = new Float32Array(COUNT * 3)
    const colors = new Float32Array(COUNT * 3)
    const arms = 4
    const radius = 7
    for (let i = 0; i < COUNT; i++) {
      const r = Math.pow(Math.random(), 0.7) * radius
      const arm = (i % arms) / arms * Math.PI * 2
      const branch = arm + r * 0.55
      const scatter = (Math.pow(Math.random(), 3) - 0.5) * (0.7 + r * 0.07)
      positions[i * 3] = Math.cos(branch) * r + (Math.random() - 0.5) * scatter * 2
      positions[i * 3 + 1] = (Math.random() - 0.5) * (1.4 - r * 0.12) + scatter
      positions[i * 3 + 2] = Math.sin(branch) * r + (Math.random() - 0.5) * scatter * 2
      const t = r / radius
      const col = cA.clone().lerp(cB, Math.random() * 0.6).lerp(cC, t * 0.8)
      colors[i * 3] = col.r
      colors[i * 3 + 1] = col.g
      colors[i * 3 + 2] = col.b
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    const mat = new THREE.PointsMaterial({
      size: 0.06, map: sprite, vertexColors: true, transparent: true,
      depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
      opacity: light ? 0.85 : 1,
    })
    const galaxy = new THREE.Points(geo, mat)
    scene.add(galaxy)

    const ST = 1400
    const sp = new Float32Array(ST * 3)
    for (let i = 0; i < ST; i++) {
      const rr = 14 + Math.random() * 22
      const th = Math.random() * Math.PI * 2
      const ph = Math.acos(2 * Math.random() - 1)
      sp[i * 3] = rr * Math.sin(ph) * Math.cos(th)
      sp[i * 3 + 1] = rr * Math.cos(ph)
      sp[i * 3 + 2] = rr * Math.sin(ph) * Math.sin(th)
    }
    const sgeo = new THREE.BufferGeometry()
    sgeo.setAttribute('position', new THREE.BufferAttribute(sp, 3))
    const smat = new THREE.PointsMaterial({
      size: 0.08, map: sprite, color: cC, transparent: true, opacity: 0.5,
      depthWrite: false, blending: THREE.AdditiveBlending,
    })
    const stars = new THREE.Points(sgeo, smat)
    scene.add(stars)

    const target = { x: 0, y: 0 }
    const cur = { x: 0, y: 0 }
    let scrollN = 0
    const onMove = (e) => {
      target.x = (e.clientX / window.innerWidth - 0.5)
      target.y = (e.clientY / window.innerHeight - 0.5)
    }
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      scrollN = max > 0 ? Math.min(1, window.scrollY / max) : 0
    }
    const onResize = () => {
      w = window.innerWidth; h = window.innerHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    onScroll()
    window.addEventListener('mousemove', onMove)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)

    const clock = new THREE.Clock()
    let raf = 0
    const render = () => {
      const t = clock.getElapsedTime()
      const s = scrollN
      camera.position.z = 9 - s * 6.4
      camera.position.y = s * 1.6
      galaxy.rotation.y = t * 0.05 + s * Math.PI * 0.9
      galaxy.rotation.x = -0.35 + s * 0.5
      stars.rotation.y = t * 0.01
      cur.x += (target.x - cur.x) * 0.05
      cur.y += (target.y - cur.y) * 0.05
      camera.position.x = cur.x * 2.4
      camera.lookAt(0, camera.position.y * 0.3, 0)
      camera.rotation.z = cur.x * 0.05
      renderer.render(scene, camera)
      if (!reduce) raf = requestAnimationFrame(render)
    }
    render()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      geo.dispose(); mat.dispose(); sgeo.dispose(); smat.dispose(); sprite.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement)
    }
  }, [theme])

  return <div ref={mountRef} className="three-canvas" aria-hidden="true" />
}
