<script setup lang="ts">
// (変更なし)
import { ref, onMounted, watchEffect } from 'vue'
import { v4 as uuidv4 } from 'uuid'

/* ===== JWT 認証に変更 ===== */
const isLoggedIn = ref(false)
const loginEmail = ref('')
const loginPassword = ref('')
const config = useRuntimeConfig()

// 1. ログイン処理: JWTをlocalStorageに保存
const handleLogin = async () => {
  try {
    const response = await $fetch('/auth/login', {
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

    // ログイン成功: アクセストークンをlocalStorageに保存
    if (response.ok) {
      localStorage.setItem('access_token', response.access_token)
      isLoggedIn.value = true
    }
    
    // ユーザー情報を取得
    const me = await fetchUser()
    if (me) {
      console.log('me:', me)
    }

  } catch (err: any) {
    console.error('ログインエラー:', err?.data ?? err)
    alert(err?.data?.error || 'ログインに失敗しました')
  }
}

// 2. ログアウト処理: localStorageからJWTを削除
const logout = () => {
  localStorage.removeItem('access_token')
  isLoggedIn.value = false
  loginPassword.value = ''
  // ログアウト後の初期化が必要な場合、ここに追記
}

// 3. 認証済みAPIリクエストを行うためのヘルパー関数
const fetchWithAuth = async (url: string, options: any = {}) => {
  const token = localStorage.getItem('access_token')
  if (!token) {
    console.error('アクセストークンがありません。')
    isLoggedIn.value = false
    throw new Error('Not Authenticated')
  }

  // Authorization ヘッダーにトークンを追加
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`
  }

  // fetchをbaseURL付きで実行し、認証失敗ならログアウト処理
  const res = await $fetch(url, {
    baseURL: config.public.apiBase,
    ...options,
    headers,
    onResponseError(ctx) {
      if (ctx.response.status === 401) {
        console.error('認証エラー: トークンが無効です。')
        logout()
      }
    }
  })

  return res
}

// 4. ユーザー情報を取得する関数 (認証が必要)
const fetchUser = async () => {
  try {
    const data = await fetchWithAuth('/api/me')
    if (data.ok) {
      return data.user
    }
  } catch (err: any) {
    console.error('ユーザー情報取得エラー:', err)
  }
  return null
}


/* ===== カードセット関連（変更なし） ===== */
interface Card { japanese: string; english: string }
interface CardSet { name: string; cards: Card[]; userId: string }

const userId = ref<string>('')
const cardSets = ref<CardSet[]>([])
const currentSetIndex = ref<number | null>(null)
const currentCardIndex = ref(0)
const isFlipped = ref(false)

const newCardSetName = ref<string>('')
const newJapanese = ref<string>('')
const newEnglish = ref<string>('')

const editingCardIndex = ref<number | null>(null)
const editJapanese = ref<string>('')
const editEnglish = ref<string>('')

const generateUserId = (): string => uuidv4()
const getUserId = (): string => {
  let storedUserId = localStorage.getItem('userId')
  if (!storedUserId) {
    storedUserId = generateUserId()
    localStorage.setItem('userId', storedUserId)
  }
  return storedUserId
}

const defaultCardSet: CardSet = {
  name: 'ビジネス英会話',
  cards: [
    { japanese: 'お世話になっております', english: 'Thank you for your continued support' },
    { japanese: 'よろしくお願いします', english: 'I look forward to working with you' }
  ],
  userId: ''
}

const loadCardSets = () => {
  const savedCardSets = localStorage.getItem('cardSets')
  if (savedCardSets) {
    const parsed: CardSet[] = JSON.parse(savedCardSets)
    parsed.forEach(set => { if (!set.userId) set.userId = userId.value })
    cardSets.value = parsed
  } else {
    cardSets.value.push({ ...defaultCardSet, userId: userId.value })
    saveCardSets()
  }
}
const saveCardSets = () => localStorage.setItem('cardSets', JSON.stringify(cardSets.value))

const addCardSet = () => {
  if (!newCardSetName.value.trim()) return alert('カードセット名を入力してください！')
  const newIndex = cardSets.value.length
  cardSets.value.push({ name: newCardSetName.value.trim(), cards: [], userId: userId.value })
  newCardSetName.value = ''
  saveCardSets()
  playCardSet(newIndex)
}
const deleteCardSet = (index: number) => {
  if (!confirm('このカードセットを削除してもよろしいですか？')) return
  cardSets.value.splice(index, 1)
  saveCardSets()
}
const addNewCard = () => {
  if (!(newJapanese.value.trim() && newEnglish.value.trim())) return alert('日本語と英語の両方を入力してください！')
  cardSets.value[currentSetIndex.value!].cards.push({
    japanese: newJapanese.value.trim(),
    english: newEnglish.value.trim()
  })
  newJapanese.value = ''
  newEnglish.value = ''
  saveCardSets()
}
const deleteCard = (index: number) => {
  if (!confirm('このカードを削除してもよろしいですか？')) return
  cardSets.value[currentSetIndex.value!].cards.splice(index, 1)
  saveCardSets()
}
const startEditCard = (index: number) => {
  editingCardIndex.value = index
  const c = cardSets.value[currentSetIndex.value!].cards[index]
  editJapanese.value = c.japanese
  editEnglish.value = c.english
}
const saveEditCard = () => {
  if (!(editJapanese.value.trim() && editEnglish.value.trim()) || editingCardIndex.value === null)
    return alert('日本語と英語の両方を入力してください！')
  const c = cardSets.value[currentSetIndex.value!].cards[editingCardIndex.value]
  c.japanese = editJapanese.value.trim()
  c.english  = editEnglish.value.trim()
  editingCardIndex.value = null
  saveCardSets()
}
const cancelEdit = () => { editingCardIndex.value = null }

const playCardSet = (index: number) => { currentSetIndex.value = index; currentCardIndex.value = 0; isFlipped.value = false }
const backToList   = () => { currentSetIndex.value = null }
const nextCard = () => {
  isFlipped.value = false
  const cards = cardSets.value[currentSetIndex.value!].cards
  currentCardIndex.value = (currentCardIndex.value + 1) % cards.length
}
const prevCard = () => {
  isFlipped.value = false
  const cards = cardSets.value[currentSetIndex.value!].cards
  currentCardIndex.value = (currentCardIndex.value - 1 + cards.length) % cards.length
}
const flipCard = () => { isFlipped.value = !isFlipped.value }

const exportCardSetsAsJson = () => {
  const data = JSON.stringify(cardSets.value, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'cardSets.json'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(async () => {
  try {
    // ページロード時にユーザー情報を取得して認証状態をチェック
    const user = await fetchUser()
    if (user) {
      isLoggedIn.value = true
      loginEmail.value = user.email
    }

    userId.value = getUserId()
    loadCardSets()
  } catch (e) {
    console.error('カードセットのロード中にエラーが発生しました:', e)
  }
})
watchEffect(() => { console.log('現在のカードセット:', cardSets.value) })
</script>

<template>
  <div class="container">
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

    <div v-else>
      <header class="header">
        <h1>カードセット一覧</h1>
        <div class="login-status">
          <span>✅ ログイン中: {{ loginEmail }}</span>
          <button @click="logout" class="btn-ghost">ログアウト</button>
        </div>
      </header>

      <p class="uid">ユーザーID: {{ userId }}</p>

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

      <div v-else>
        <div class="card-top-actions">
          <button @click="backToList" class="btn-ghost">一覧に戻る</button>
        </div>

        <div class="card-container">
          <button @click="prevCard" class="navigation-button prev styled-button">前へ</button>
          <div class="card" @click="flipCard">
            <p v-if="!isFlipped">{{ cardSets[currentSetIndex]?.cards[currentCardIndex]?.japanese }}</p>
            <p v-else>{{ cardSets[currentSetIndex]?.cards[currentCardIndex]?.english }}</p>
          </div>
          <button @click="nextCard" class="navigation-button next styled-button">次へ</button>
        </div>

        <div class="form">
          <div>
            <textarea v-model="newJapanese" placeholder="日本語"></textarea>
            <textarea v-model="newEnglish" placeholder="英語"></textarea>
          </div>
          <div>
            <button @click="addNewCard" class="styled-button">カードを追加</button>
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