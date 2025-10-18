// composables/useUserRegister.ts
import { ref } from 'vue'
import { useRuntimeConfig } from '#imports'
import { useAuth } from '~/composables/useAuth'
import { useRouter } from 'vue-router'

export const useUserRegister = () => {
  const config = useRuntimeConfig()
  const router = useRouter()
  const { handleLogin } = useAuth()

  const loading = ref(false)
  const errors = ref<string[]>([])  // ← 複数エラー対応
  const success = ref(false)

  const registerUser = async (form: { name: string; email: string; password: string }) => {
    loading.value = true
    errors.value = []
    success.value = false

    try {
      const res: any = await $fetch('/auth/register', {
        baseURL: config.public.apiBase,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: form
      })

      if (res?.ok) {
        success.value = true

        // JWTを保存
        if (res.access_token) {
          localStorage.setItem('access_token', res.access_token)
          localStorage.setItem('token_type', res.token_type || 'Bearer')
          localStorage.setItem('user_email', res.user?.email || form.email)
          localStorage.setItem('user_name', res.user?.name || form.name)
          localStorage.setItem('user_id', res.user?.id?.toString() || '')
        }

        router.push('/')
      } else if (res?.errors) {
        // Laravel風エラー { errors: { field: [msg1, msg2] } }
        errors.value = Object.values(res.errors).flat() as string[]
      } else {
        errors.value = [res?.error || '登録に失敗しました。']
      }
    } catch (err: any) {
      console.error('❌ 登録エラー:', err)
      if (err?.data?.errors) {
        // Laravel側でバリデーションエラー
        errors.value = Object.values(err.data.errors).flat() as string[]
      } else {
        errors.value = [err?.data?.error || '通信エラーが発生しました。']
      }
    } finally {
      loading.value = false
    }
  }

  return { registerUser, loading, errors, success }
}
