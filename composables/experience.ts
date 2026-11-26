import type Lenis from 'lenis'
import type { WebglApp, Scene } from '~/webgl/App'

export const useGl = () => (import.meta.client ? (useNuxtApp().$gl as WebglApp | null) : null)
export const useLenis = () => (import.meta.client ? (useNuxtApp().$lenis as Lenis) : null)
export const useReducedMotion = () => (import.meta.client ? (useNuxtApp().$reducedMotion as boolean) : false)

/** Shared UI state. */
export const useMenuOpen = () => useState('menu-open', () => false)
export const useIntroDone = () => useState('intro-done', () => false)
export const useTheme = () => useState<'light' | 'dark'>('theme', () => 'light')

/** Set the WebGL look and the DOM theme for the current page. */
export function usePageScene(scene: Scene) {
  const theme = useTheme()
  const stored = useState<Scene | null>('page-scene', () => null)
  theme.value = scene.dark > 0.5 ? 'dark' : 'light'
  stored.value = scene
  onMounted(() => {
    useGl()?.setScene(scene)
  })
}

/** Page-change curtain state, shared by app.vue (driver) and PageCurtain (view). */
export const usePageCurtain = () => useState('page-curtain', () => ({ state: '' as '' | 'is-in' | 'is-out', label: '' }))
