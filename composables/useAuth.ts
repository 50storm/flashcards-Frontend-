// composables/useAuth.ts
import { ref } from 'vue'
import { useRuntimeConfig } from '#imports'

const isLoggedIn = ref(false)
const loginEmail = ref<string>('')

export const useAuth = () => {
  const config = useRuntimeConfig()

  const handleLogin = async (password: string) => {
    const response: any = await $fetch('/auth/login', {
      baseURL: config.public.apiBase,
      method: 'POST',
      body: {
        email: loginEmail.value,
        password,
      },
    })
    if (response?.ok) {
      localStorage.setItem('access_token', response.access_token)
      isLoggedIn.value = true
    }
    return response
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    isLoggedIn.value = false
    loginEmail.value = ''
  }

  // ✅ これを追加
  const fetchWithAuth = async (url: string, options: any = {}) => {
    const token = localStorage.getItem('access_token')
    if (!token) throw new Error('Not Authenticated')

    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      'Authorization': `Bearer ${token}`,
    }

    return await $fetch(url, {
      baseURL: config.public.apiBase,
      ...options,
      headers,
      onResponseError(ctx) {
        debugger
        if (ctx.response.status === 401) {
          console.error('認証エラー: トークンが無効です')
          console.error()
          logout()
        }
      }
    })
  }

  return { isLoggedIn, loginEmail, handleLogin, logout, fetchWithAuth }
}
