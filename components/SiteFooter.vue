<script setup lang="ts">
import { profile } from '~/data'

const copied = ref(false)
const time = ref('')
const fmt = () => new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }).format(new Date())
let id: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  time.value = fmt()
  id = setInterval(() => (time.value = fmt()), 15000)
})
onBeforeUnmount(() => clearInterval(id))

async function copy() {
  try {
    await navigator.clipboard.writeText(profile.email)
    copied.value = true
    setTimeout(() => (copied.value = false), 1800)
  } catch {
    window.location.href = `mailto:${profile.email}`
  }
}
const links = [
  { label: 'GitHub', href: profile.github },
  { label: 'LinkedIn', href: profile.linkedin },
  { label: 'Résumé', href: profile.resume },
]
</script>

<template>
  <footer class="footer" id="contact">
    <TextReveal as="h2" class="footer__head serif" text="Have a model that needs to ship? Let’s build something useful." />
    <div class="footer__grid ui">
      <div class="footer__col">
        <p class="muted">Write</p>
        <a :href="`mailto:${profile.email}`" class="footer__mail serif line-link is-quiet">{{ profile.email }}</a>
        <button type="button" class="footer__copy line-link" @click="copy">{{ copied ? 'Copied' : 'Copy email' }}</button>
      </div>
      <div class="footer__col">
        <p class="muted">Elsewhere</p>
        <a v-for="l in links" :key="l.label" :href="l.href" target="_blank" rel="noreferrer" class="line-link is-quiet">{{ l.label }}</a>
      </div>
      <div class="footer__col">
        <p class="muted">Based in</p>
        <p>{{ profile.location }}</p>
        <p>{{ time }} IST</p>
      </div>
    </div>
    <p class="footer__legal ui muted">© {{ new Date().getFullYear() }} Ayush Das · Built with Nuxt, three.js, GSAP, anime.js and Lenis</p>
  </footer>
</template>

<style scoped>
.footer {
  padding: 28vh var(--gutter) calc(var(--gutter) * 4.5);
}
.footer__head {
  font-size: var(--fs-display);
  max-width: 15em;
  margin-bottom: 12vh;
}
.footer__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 32px;
  border-top: 1px solid var(--line);
  padding-top: 22px;
}
.footer__col {
  display: grid;
  align-content: start;
  justify-items: start;
  gap: 6px;
}
.footer__mail {
  font-size: var(--fs-lead);
}
.footer__copy {
  margin-top: 6px;
}
.footer__legal {
  margin-top: 10vh;
}
@media (max-width: 760px) {
  .footer__grid {
    grid-template-columns: 1fr;
  }
}
</style>
