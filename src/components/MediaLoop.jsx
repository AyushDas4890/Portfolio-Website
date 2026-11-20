import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'

/**
 * Muted looping video in a fixed-ratio box. The poster is a real <img>, so the box
 * is never empty and never shifts. Plays only while on screen (or on hover when
 * `hoverOnly`). If playback is blocked or fails, the poster stays.
 */
export function MediaLoop({ src, poster, alt, ratio = '16 / 10', hoverOnly = false, paused = false, className = '' }) {
  const box = useRef(null)
  const video = useRef(null)
  const [visible, setVisible] = useState(false)
  const [hover, setHover] = useState(false)
  const [playing, setPlaying] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    const node = box.current
    if (!node) return undefined
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '200px 0px' })
    io.observe(node)
    return () => io.disconnect()
  }, [])

  const want = Boolean(src) && visible && !paused && !reduced && (!hoverOnly || hover)

  useEffect(() => {
    const v = video.current
    if (!v) return
    if (want) {
      const p = v.play()
      if (p && p.catch) p.catch(() => setPlaying(false))
    } else {
      v.pause()
    }
  }, [want])

  return (
    <div
      ref={box}
      className={`media ${playing ? 'is-playing' : ''} ${className}`}
      style={{ aspectRatio: ratio }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <img src={poster} alt={alt} loading="lazy" decoding="async" />
      {src && (visible || playing) && (
        <video
          ref={video}
          src={src}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          onPlaying={() => setPlaying(true)}
          onError={() => setPlaying(false)}
        />
      )}
    </div>
  )
}
