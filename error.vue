<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
useHead({ title: 'Not found — Ayush Das' })
const home = () => clearError({ redirect: '/' })
</script>

<template>
  <main class="err">
    <p class="ui muted">{{ props.error.statusCode }}</p>
    <h1 class="serif">This page is still noise.</h1>
    <button type="button" class="ui line-link" @click="home">Back to the wall</button>
  </main>
</template>

<style scoped>
.err {
  min-height: 100vh;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 24px;
  text-align: center;
  padding: var(--gutter);
}
h1 {
  font-size: var(--fs-display);
}
</style>
