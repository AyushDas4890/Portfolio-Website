import { Howl, Howler } from 'howler'

let ambient: Howl | null = null
let tick: Howl | null = null

/** Ambient bed + UI ticks. Off by default; the browser needs a gesture first. */
export function useSound() {
  const on = useState('sound-on', () => false)

  const ensure = () => {
    if (ambient || !import.meta.client) return
    ambient = new Howl({ src: ['/sound/ambient.mp3'], loop: true, volume: 0 })
    tick = new Howl({ src: ['/sound/tick.mp3'], volume: 0.25 })
  }

  const toggle = () => {
    ensure()
    on.value = !on.value
    if (on.value) {
      if (!ambient!.playing()) ambient!.play()
      ambient!.fade(ambient!.volume(), 0.5, 1200)
    } else {
      ambient!.fade(ambient!.volume(), 0, 600)
    }
  }

  const play = () => {
    if (on.value && tick) tick.play()
  }

  const mute = (m: boolean) => Howler.mute(m)

  return { on, toggle, play, mute }
}
