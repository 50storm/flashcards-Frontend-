<template>
  <div class="register-container">
    <h2>ユーザー登録</h2>

    <form @submit.prevent="onSubmit">
      <div class="form-group">
        <label for="name">名前</label>
        <input id="name" v-model="form.name" type="text" required />
      </div>

      <div class="form-group">
        <label for="email">メールアドレス</label>
        <input id="email" v-model="form.email" type="email" required />
      </div>

      <div class="form-group">
        <label for="password">パスワード</label>
        <input id="password" v-model="form.password" type="password" required />
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? '登録中...' : '登録する' }}
      </button>

      <!-- ✅ エラー一覧 -->
      <ul v-if="errors.length" class="error-list">
        <li v-for="(msg, i) in errors" :key="i">{{ msg }}</li>
      </ul>

      <!-- ✅ 成功メッセージ -->
      <p v-if="success" class="success">登録が完了しました！</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const form = ref({ name: '', email: '', password: '' })
const { registerUser, loading, errors, success } = useUserRegister()

const onSubmit = async () => {
  await registerUser(form.value)
}
</script>

<style scoped>
.register-container {
  max-width: 400px;
  margin: 60px auto;
  padding: 24px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
}

h2 {
  text-align: center;
  margin-bottom: 24px;
  font-size: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 4px;
  font-weight: 600;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #bbb;
  border-radius: 4px;
  font-size: 14px;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #1d72b8;
  color: white;
  font-size: 15px;
  font-weight: bold;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover:not(:disabled) {
  background-color: #155d8a;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error-list {
  color: #d9534f;
  margin-top: 12px;
  padding-left: 18px;
}

.error-list li {
  margin-bottom: 4px;
}

.success {
  color: #28a745;
  margin-top: 12px;
}
</style>
