// composables/useAuth.ts
import { ref, onMounted } from 'vue'
import { useRuntimeConfig } from '#imports'

const isLoggedIn = ref(false)
const loginEmail = ref<string>('')
const loginName = ref('')

export const useAuth = () => {
  const config = useRuntimeConfig()
  const url = `${config.public.apiBase}/auth/login`
  console.log('🔍 Sending request to:', url)

  /* ===== ログイン処理 ===== */
  const handleLogin = async (password: string) => {
    const response: any = await $fetch('/auth/login', {
      baseURL: config.public.apiBase,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        email: loginEmail.value,
        password,
      },
    })

    if (response?.ok) {
      localStorage.setItem('access_token', response.access_token)
      localStorage.setItem('user_email', response.user?.email || loginEmail.value)
      localStorage.setItem('user_name', response.user?.name || '')
      isLoggedIn.value = true
      loginName.value = response.user?.name || ''
      loginEmail.value = response.user?.email || loginEmail.value
    }

    return response
  }

  /* ===== リロード時の状態復元 ===== */
  onMounted(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      isLoggedIn.value = true
      loginEmail.value = localStorage.getItem('user_email') || ''
      loginName.value = localStorage.getItem('user_name') || ''
    }
  })

  /* ===== ログアウト処理 ===== */
  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_email')
    localStorage.removeItem('user_name')
    isLoggedIn.value = false
    loginEmail.value = ''
    loginName.value = ''
  }

  /* ===== 認証付きfetch ===== */
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
        if (ctx.response.status === 401) {
          console.error('認証エラー: トークンが無効です')
          logout()
        }
      },
    })
  }

  return {
    isLoggedIn,
    loginEmail,
    loginName,
    handleLogin,
    logout,
    fetchWithAuth,
  }
}
