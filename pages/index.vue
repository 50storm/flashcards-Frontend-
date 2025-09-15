<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue'
import { v4 as uuidv4 } from 'uuid'

/* ===== JWT 認証 ===== */
const isLoggedIn = ref(false)
const loginEmail = ref('')
const loginPassword = ref('')
const config = useRuntimeConfig()

// ログイン
const handleLogin = async () => {
  try {
    const response: any = await $fetch('/auth/login', {
      baseURL: config.public.apiBase,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { email: loginEmail.value, password: loginPassword.value },
      onResponseError(ctx) {
        console.error('Login error detail:', {
          status: ctx.response.status,
          data: ctx.response._data,
        })
      }
    })

    if (response?.ok) {
      localStorage.setItem('access_token', response.access_token)
      isLoggedIn.value = true
      const me = await fetchUser()
      if (me) loginEmail.value = me.email
      await loadCardSets()
    }
  } catch (err: any) {
    console.error('ログインエラー:', err?.data ?? err)
    alert(err?.data?.error || 'ログインに失敗しました')
  }
}

// ログアウト
const logout = () => {
  localStorage.removeItem('access_token')
  isLoggedIn.value = false
  loginPassword.value = ''
}

// 認証付きフェッチ
const fetchWithAuth = async (url: string, options: any = {}) => {
  const token = localStorage.getItem('access_token')
  if (!token) throw new Error('Not Authenticated')

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    'Authorization': `Bearer ${token}`,
  }

  const res = await $fetch(url, {
    baseURL: config.public.apiBase,
    ...options,
    headers,
    onResponseError(ctx) {
      if (ctx.response.status === 401) {
        console.error('認証エラー: トークンが無効です')
        logout()
      }
    }
  })
  return res
}

// ユーザー情報取得
const fetchUser = async () => {
  try {
    const data = await fetchWithAuth('/api/me', { method: 'GET' })
    if (data.ok) {
      return data.user
    }
  } catch (err: any) {
    console.error('ユーザー情報取得エラー:', err)
  }
  return null
}

/* ===== 型 ===== */
interface ApiCard { id: number; front: string; back: string }
interface Card   { japanese: string; english: string; _id?: number }
interface CardSet { name: string; cards: Card[]; userId: string }
const toUi = (a: ApiCard): Card => ({ _id: a.id, japanese: a.front, english: a.back })

/* ===== 状態 ===== */
const userId = ref<string>('')
const cardSets = ref<CardSet[]>([])
const currentSetIndex = ref<number | null>(null)
const currentCardIndex = ref(0)
const isFlipped = ref(false)

const newCardSetName = ref('')
const newJapanese = ref('')
const newEnglish = ref('')

const editingCardIndex = ref<number | null>(null)
const editJapanese = ref('')
const editEnglish = ref('')

/* ===== ユーティリティ ===== */
const generateUserId = (): string => uuidv4()
const getUserId = (): string => {
  let stored = localStorage.getItem('userId')
  if (!stored) {
    stored = generateUserId()
    localStorage.setItem('userId', stored)
  }
  return stored
}

const defaultCardSet: CardSet = {
  name: 'ビジネス英会話',
  cards: [
    { japanese: 'お世話になっております', english: 'Thank you for your continued support' },
    { japanese: 'よろしくお願いします', english: 'I look forward to working with you' }
  ],
  userId: ''
}

/* ===== サーバ ⇔ UI ===== */
const loadServerCards = async () => {
  const list = await fetchWithAuth('/api/flash-cards', { method: 'GET' }) as ApiCard[]
  const ui = (list || []).map(toUi)
  cardSets.value = [{ name: 'My Cards (Server)', cards: ui, userId: userId.value }]
  if (currentSetIndex.value === null) currentSetIndex.value = 0
}

/* ===== localStorage 操作 ===== */
const loadLocalCardSets = () => {
  const saved = localStorage.getItem('cardSets')
  if (saved) {
    const parsed: CardSet[] = JSON.parse(saved)
    parsed.forEach(set => { if (!set.userId) set.userId = userId.value })
    cardSets.value = parsed
  } else {
    cardSets.value.push({ ...defaultCardSet, userId: userId.value })
    saveCardSets()
  }
}
const saveCardSets = () => localStorage.setItem('cardSets', JSON.stringify(cardSets.value))

/* ===== 共通ロード ===== */
const loadCardSets = async () => {
  if (isLoggedIn.value) {
    await loadServerCards()
  } else {
    loadLocalCardSets()
  }
}

/* ===== カード操作 ===== */
const addNewCard = async () => {
  if (!(newJapanese.value.trim() && newEnglish.value.trim())) return alert('日本語と英語の両方を入力してください！')
  if (isLoggedIn.value) {
    const created: any = await fetchWithAuth('/api/flash-cards', {
      method: 'POST',
      body: { front: newJapanese.value.trim(), back: newEnglish.value.trim() }
    })
    if (created?.ok && created.card) {
      cardSets.value[0].cards.unshift(toUi(created.card))
    }
  } else {
    cardSets.value[currentSetIndex.value!].cards.push({
      japanese: newJapanese.value.trim(),
      english: newEnglish.value.trim()
    })
    saveCardSets()
  }
  newJapanese.value = ''
  newEnglish.value = ''
}

const deleteCard = async (index: number) => {
  if (!confirm('このカードを削除してもよろしいですか？')) return
  const setIdx = currentSetIndex.value ?? 0
  const c = cardSets.value[setIdx].cards[index]
  if (isLoggedIn.value) {
    if (typeof c._id !== 'number') return alert('カードIDが不明')
    await fetchWithAuth(`/api/flash-cards/${c._id}`, { method: 'DELETE' })
    cardSets.value[setIdx].cards.splice(index, 1)
  } else {
    cardSets.value[setIdx].cards.splice(index, 1)
    saveCardSets()
  }
}

const startEditCard = (index: number) => {
  editingCardIndex.value = index
  const setIdx = currentSetIndex.value ?? 0
  const c = cardSets.value[setIdx].cards[index]
  editJapanese.value = c.japanese
  editEnglish.value = c.english
}

const saveEditCard = async () => {
  if (!(editJapanese.value.trim() && editEnglish.value.trim()) || editingCardIndex.value === null) return
  const setIdx = currentSetIndex.value ?? 0
  const c = cardSets.value[setIdx].cards[editingCardIndex.value]
  if (isLoggedIn.value) {
    if (typeof c._id !== 'number') return
    const updated: any = await fetchWithAuth(`/api/flash-cards/${c._id}`, {
      method: 'PATCH',
      body: { front: editJapanese.value.trim(), back: editEnglish.value.trim() }
    })
    if (updated?.ok && updated.card) {
      const u = toUi(updated.card)
      c.japanese = u.japanese
      c.english  = u.english
    }
  } else {
    c.japanese = editJapanese.value.trim()
    c.english  = editEnglish.value.trim()
    saveCardSets()
  }
  editingCardIndex.value = null
}

/* ===== ナビゲーション ===== */
const playCardSet = (index: number) => { currentSetIndex.value = index; currentCardIndex.value = 0; isFlipped.value = false }
const backToList   = () => { currentSetIndex.value = null }
const nextCard = () => {
  isFlipped.value = false
  const cards = cardSets.value[currentSetIndex.value!].cards
  if (cards.length) currentCardIndex.value = (currentCardIndex.value + 1) % cards.length
}
const prevCard = () => {
  isFlipped.value = false
  const cards = cardSets.value[currentSetIndex.value!].cards
  if (cards.length) currentCardIndex.value = (currentCardIndex.value - 1 + cards.length) % cards.length
}
const flipCard = () => { isFlipped.value = !isFlipped.value }

/* ===== 初期化 ===== */
onMounted(async () => {
  const token = localStorage.getItem('access_token')
  if (token) {
    const user = await fetchUser()
    if (user) {
      isLoggedIn.value = true
      loginEmail.value = user.email
    }
  }
  userId.value = getUserId()
  await loadCardSets()
})
watchEffect(() => console.log('カードセット:', cardSets.value))
</script>

<template>
  <div class="container">
    <!-- ===== ログイン前 ===== -->
    <div v-if="!isLoggedIn" class="login-container">
      <div class="login-card">
        <h1>ログイン</h1>
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="email">メールアドレス</label>
            <input id="email" type="email" v-model="loginEmail" placeholder="you@example.com" required />
          </div>
          <div class="form-group">
            <label for="password">パスワード</label>
            <input id="password" type="password" v-model="loginPassword" placeholder="••••••••" required />
          </div>
          <button type="submit">ログイン</button>
        </form>
      </div>
    </div>

    <!-- ===== ログイン後 ===== -->
    <div v-else>
      <header class="header">
        <h1>カードセット一覧</h1>
        <div class="login-status">
          <span>✅ ログイン中: {{ loginEmail }}</span>
          <button @click="logout" class="btn-ghost">ログアウト</button>
        </div>
      </header>

      <p class="uid">ユーザーID: {{ userId }}</p>

      <!-- ===== 一覧表示 ===== -->
      <div v-if="currentSetIndex === null">
        <div class="form">
          <input v-model="newCardSetName" class="card-set-name-input" placeholder="新しいカードセット名" />
          <button @click="addCardSet" class="styled-button">カードセットを追加</button>
          <button @click="exportCardSetsAsJson" class="styled-button export">カードセットをJSONとしてエクスポート</button>
        </div>

        <ul>
          <li v-for="(set, index) in cardSets" :key="index" class="card-set">
            <div class="card-set-header">
              <h3>{{ set.name || '名前なし' }}</h3>
              <div class="button-group">
                <button @click="playCardSet(index)" class="styled-button play">遊ぶ</button>
                <button @click="deleteCardSet(index)" class="styled-button delete">削除</button>
              </div>
            </div>

            <ul class="card-list">
              <li v-for="(card, cardIndex) in set.cards" :key="cardIndex" class="card-item">
                <p>{{ card.japanese }} - {{ card.english }}</p>
                <div class="button-group" style="margin-top:6px">
                  <button class="btn-ghost" @click="startEditCard(cardIndex)">編集</button>
                  <button class="btn-ghost" @click="deleteCard(cardIndex)">削除</button>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </div>

      <!-- ===== カード表示中 ===== -->
      <div v-else>
        <div class="card-top-actions">
          <button @click="backToList" class="btn-ghost">一覧に戻る</button>
        </div>

        <div class="card-container">
          <button @click="prevCard" class="navigation-button prev styled-button">前へ</button>
          <div class="card" @click="flipCard">
            <p v-if="!isFlipped">
              {{ cardSets[currentSetIndex]?.cards[currentCardIndex]?.japanese }}
            </p>
            <p v-else>
              {{ cardSets[currentSetIndex]?.cards[currentCardIndex]?.english }}
            </p>
          </div>
          <button @click="nextCard" class="navigation-button next styled-button">次へ</button>
        </div>

        <!-- 編集モード or 新規追加 -->
        <div class="form">
          <div v-if="editingCardIndex !== null">
            <textarea v-model="editJapanese" placeholder="日本語"></textarea>
            <textarea v-model="editEnglish" placeholder="英語"></textarea>
            <div class="button-group">
              <button @click="saveEditCard" class="styled-button">保存</button>
              <button @click="cancelEdit" class="btn-ghost">キャンセル</button>
            </div>
          </div>
          <div v-else>
            <textarea v-model="newJapanese" placeholder="日本語"></textarea>
            <textarea v-model="newEnglish" placeholder="英語"></textarea>
            <div>
              <button @click="addNewCard" class="styled-button">カードを追加</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* (変更なし) */
/* ページ幅と左右余白を統一 */
.container {
  max-width: 960px;
  margin: 24px auto;
  padding: 0 16px;
  font-family: Arial, sans-serif;
}

/* 共通ヘッダー */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}
.login-status {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}
.btn-ghost {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #111;
  cursor: pointer;
}
.btn-ghost:hover { background: #f9fafb; }

.uid {
  margin: 0 0 12px;
  color: #6b7280;
  font-size: 13px;
}

/* ログインフォーム */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 48px);
}
.login-card {
  background: #fff;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  width: 320px;
  text-align: center;
}
.login-card h1 { margin-bottom: 20px; font-size: 24px; }
.form-group { margin-bottom: 15px; text-align: left; }
.form-group label { font-size: 14px; margin-bottom: 5px; display: block; }
.form-group input {
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
}
.login-card button {
  width: 100%;
  padding: 10px 16px;
  border: none; border-radius: 6px;
  background-color: #007bff; color: #fff; cursor: pointer;
}
.login-card button:hover { background-color: #0056b3; }

/* 既存スタイル（必要箇所はそのまま） */
.card-set { margin: 10px 0; padding: 10px; border: 1px solid #ccc; border-radius: 5px; text-align: left; width: 100%; }
.card-set-header { display: flex; justify-content: space-between; align-items: center; }
.card-list { margin-top: 10px; list-style: none; padding-left: 0; }
.card-item { background: #f9f9f9; margin: 5px 0; padding: 10px; border-radius: 5px; font-size: 14px; }

.card-top-actions { display: flex; justify-content: flex-end; margin: 12px 0; }

.card-container { display: flex; align-items: center; justify-content: center; position: relative; margin-top: 20px; }
.card {
  width: 300px; height: 200px; border: 1px solid #ccc; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; text-align: center;
  font-size: 18px; cursor: pointer; transition: transform .3s, background-color .3s;
  background-color: #f9f9f9; box-shadow: 0 4px 8px rgba(0,0,0,.1);
}
.card:hover { background-color: #e0e0e0; }

.navigation-button {
  position: absolute; top: 50%; transform: translateY(-50%);
  background-color: #6a11cb; color: white; border: none; border-radius: 5px;
  padding: 10px 20px; cursor: pointer; font-size: 14px; font-weight: bold;
  box-shadow: 0 4px 8px rgba(0,0,0,.2); transition: all .3s ease;
}
.navigation-button.prev { left: -100px; }
.navigation-button.next { right: -100px; }
.navigation-button:hover { background-color: #0056b3; transform: translateY(-50%) scale(1.1); }

.form { display: flex; flex-direction: column; align-items: center; gap: 15px; margin-top: 20px; }
textarea {
  width: 250px; height: 100px; padding: 10px; font-size: 16px; border: 1px solid #ccc; border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,.1); transition: all .3s ease;
}
textarea:focus { outline: none; border-color: #007bff; box-shadow: 0 4px 8px rgba(0,123,255,.2); }

.styled-button {
  padding: 10px 20px; font-size: 16px; font-weight: bold; color: white; text-transform: uppercase;
  border: none; border-radius: 8px; cursor: pointer; background: linear-gradient(45deg, #6a11cb, #2575fc);
  box-shadow: 0 4px 8px rgba(0,0,0,.2); transition: all .3s ease;
}
.styled-button:hover { transform: translateY(-2px); box-shadow: 0 6px 12px rgba(0,0,0,.3); }
.styled-button:active { transform: translateY(0); box-shadow: 0 3px 6px rgba(0,0,0,.2); }
.styled-button.play { background: linear-gradient(45deg, #28a745, #218838); }
.styled-button.delete { background: linear-gradient(45deg, #dc3545, #c82333); }
.styled-button.back { background: linear-gradient(45deg, #007bff, #0056b3); }

.card-set-name-input {
  width: 100%; max-width: 600px; padding: 12px; font-size: 16px; border: 1px solid #ccc; border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,.1); transition: all .3s ease;
}
.card-set-name-input:focus { outline: none; border-color: #007bff; box-shadow: 0 4px 8px rgba(0,123,255,.2); }

.export { background: none; background-color: #13f08d; }
</style>