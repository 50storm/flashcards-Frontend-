export const useHealthCheck = async () => {
  const config = useRuntimeConfig()

  try {
    const res = await $fetch('/health', {
      baseURL: config.public.apiBase
    })
    return res
  } catch (err) {
    console.error('Health check failed:', err)
    return { status: 'error' }
  }
}
