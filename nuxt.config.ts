// nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'
import * as dotenv from 'dotenv'

// NODE_ENV が空なら "development" を使う
const envFile = `.env.${process.env.NODE_ENV || 'development'}`
console.log('🔧 loading env file:', envFile)
dotenv.config({ path: envFile })

export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      testEnv: process.env.TEST_ENV || 'default-value',
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8080/fallback'
    }
  },

  compatibilityDate: '2025-09-28'
})