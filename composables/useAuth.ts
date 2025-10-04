// composables/useAuth.ts
import { ref } from 'vue'
import { useRuntimeConfig } from '#imports'

const isLoggedIn = ref(false)
const loginEmail = ref<string>('')
const loginName = ref('')

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
      loginName.value = response.user?.name || '' // ← ★ ユーザー名を保存
      loginEmail.value = response.user?.email || loginEmail.value // ← ★ 安全に反映
    }
    return response
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    isLoggedIn.value = false
    loginEmail.value = ''
    loginName.value = '' // ← ★ リセット忘れ防止
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

  return { isLoggedIn, loginEmail,loginName, handleLogin, logout, fetchWithAuth }
}
