<!-- components/LoginUI.vue -->
<template>
  <div class="login-container">
    <div class="login-card">
      <h1>ログイン</h1>
      <form @submit.prevent="onSubmit">
        <div class="form-group">
          <label for="email">メールアドレス</label>
          <input id="email" type="email" v-model="email" placeholder="you@example.com" required />
        </div>

        <div class="form-group">
          <label for="password">パスワード</label>
          <input id="password" type="password" v-model="password" placeholder="••••••••" required />
        </div>

        <button type="submit">ログイン</button>
        <p v-if="error" class="error">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['submit']);
const props = defineProps({ error: { type: String, default: '' } });

const email = ref('');
const password = ref('');

const onSubmit = () => {
  emit('submit', { email: email.value, password: password.value });
};
</script>

<style scoped>
.login-container{display:flex;justify-content:center;align-items:center;margin-top:48px}
.login-card{background:#fff;padding:24px;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.08);width:320px}
h1{margin:0 0 16px;font-size:20px;text-align:center}
.form-group{margin-bottom:14px}
label{display:block;font-size:14px;margin-bottom:6px;color:#374151}
input{width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:8px;font-size:14px}
input:focus{outline:none;border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.15)}
button{width:100%;padding:12px;background:#2563eb;color:#fff;border:none;border-radius:8px;font-size:15px;cursor:pointer}
button:hover{background:#1d4ed8}
.error{margin-top:10px;color:#dc2626;font-size:13px;text-align:center}
</style>
