export default defineNuxtConfig({
  nitro: {
    devProxy: {
      '/api/': {
        target: 'http://localhost:8080', // バックエンド
        changeOrigin: true
      }
    }
  },

  runtimeConfig: {
    public: { apiBase: '/api' }
  },

  compatibilityDate: '2025-09-15'
})