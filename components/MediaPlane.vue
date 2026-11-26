<script setup lang="ts">
import gsap from 'gsap'
import type { MediaPlane } from '~/webgl/MediaPlanes'

/**
 * A photo or video drawn by WebGL: it emerges from noise when scrolled into
 * view, bends with scroll speed and ripples under the cursor. The DOM media is
 * the fallback (and the texture source).
 */
const props = withDefaults(defineProps<{ src?: string | null; poster?: string | null; alt?: string; ratio?: string; eager?: boolean }>(), {
  src: null,
  poster: null,
  alt: '',
  ratio: '16 / 10',
  eager: false,
})

const root = ref<HTMLElement | null>(null)
const media = ref<HTMLImageElement | HTMLVideoElement | null>(null)
const isVideo = computed(() => !!props.src && /\.(mp4|webm)$/i.test(props.src))
// A clip without an explicit poster uses the still of the same name next to it (films/export.sh writes both).
const posterSrc = computed(() => props.poster || (isVideo.value ? props.src!.replace(/\.(mp4|webm)$/i, '.jpg') : null))
const shown = ref(false)
let plane: MediaPlane | null = null
let io: IntersectionObserver | null = null

onMounted(() => {
  const gl = useGl()
  if (gl && media.value) plane = gl.addPlane(root.value!, media.value)
  io = new IntersectionObserver(
    (entries) => {
      const e = entries[0]
      if (isVideo.value && media.value instanceof HTMLVideoElement) {
        if (e.isIntersecting) media.value.play().catch(() => {})
        else media.value.pause()
      }
      if (e.isIntersecting && !shown.value) {
        shown.value = true
        if (plane) gsap.to(plane, { progress: 1, duration: 2.2, ease: 'power3.out', delay: 0.05 })
      }
    },
    { rootMargin: '0px 0px -8% 0px' },
  )
  io.observe(root.value!)
})

onBeforeUnmount(() => {
  io?.disconnect()
  if (plane) {
    gsap.killTweensOf(plane)
    useGl()?.removePlane(plane)
  }
})

const enter = () => plane && (plane.hoverTarget = 1)
const leave = () => plane && (plane.hoverTarget = 0)
</script>

<template>
  <div ref="root" class="media" :class="{ 'is-shown': shown }" :style="{ aspectRatio: ratio }" @pointerenter="enter" @pointerleave="leave">
    <video
      v-if="isVideo"
      ref="media"
      class="media__src"
      :src="src!"
      :poster="posterSrc || undefined"
      muted
      loop
      playsinline
      preload="metadata"
      :aria-label="alt"
    />
    <img v-else ref="media" class="media__src" :src="(src || poster)!" :alt="alt" :loading="eager ? 'eager' : 'lazy'" decoding="async" />
  </div>
</template>

<style scoped>
.media {
  position: relative;
  width: 100%;
  overflow: hidden;
}
.media__src {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transform: scale(1.04);
  transition: opacity 1.4s var(--ease-out), transform 1.8s var(--ease-out);
}
.media.is-shown .media__src {
  opacity: 1;
  transform: none;
}
/* WebGL draws the media; keep the source alive but invisible. */
html.gl-on .media__src,
html.gl-on .media.is-shown .media__src {
  opacity: 0;
}
</style>
