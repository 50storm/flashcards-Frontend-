<script setup lang="ts">
import { ref, onMounted } from 'vue'

const config = useRuntimeConfig()
console.log('API_BASE:', config.public.apiBase)

const healthResult = ref<any>(null)

onMounted(async () => {
  try {
    const url = `${config.public.apiBase}/health`
    console.log("Health check URL:", url)

    healthResult.value = await $fetch(url)
  } catch (error: any) {
    console.error("Health check failed:", error)
    healthResult.value = {
      error: 'Health check failed',
      message: error?.message || null,
      stack: error?.stack || null,
      data: error
    }
  }
})
</script>

<template>
  <div>
    <h1 style="background-color: aqua;">ENV TEST</h1>

    <p>ENV TEST: {{ config.public.testEnv }}</p>
    <p>API BASE: {{ config.public.apiBase }}</p>

    <h2>Health Check Response</h2>
    <pre>{{ healthResult }}</pre>

    <NuxtRouteAnnouncer />
    <NuxtWelcome />
  </div>
</template>
