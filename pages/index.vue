<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useCards } from '~/composables/useCards'

/* ===== Composables ===== */
const { isLoggedIn, loginEmail, handleLogin, logout } = useAuth()
const { 
  cardSets, currentSetIndex, currentCardIndex, isFlipped,
  editingCardIndex, editJapanese, editEnglish,
  loadServerCards, addNewCard, deleteCard,
  startEditCard, saveEditCard, cancelEdit,
  playCardSet, backToList, nextCard, prevCard, flipCard
} = useCards()

/* ===== ローカル状態 ===== */
const loginPassword = ref('')
const newCardSetName = ref('')
const newJapanese = ref('')
const newEnglish = ref('')

/* ===== 初期化 ===== */
onMounted(async () => {
  if (isLoggedIn.value) {
    await loadServerCards()
  }
})

/* ===== UIラッパー関数 ===== */
const onLogin = async () => {
  const res = await handleLogin(loginPassword.value)
  if (res?.ok) {
    await loadServerCards()
  }
}

const onAddNewCard = async () => {
  if (!(newJapanese.value.trim() && newEnglish.value.trim())) {
    return alert('日本語と英語を入力してください')
  }
  await addNewCard(newJapanese.value.trim(), newEnglish.value.trim())
  newJapanese.value = ''
  newEnglish.value = ''
}
</script>

<template>
  <div class="container">
    <!-- ===== ログイン前 ===== -->
    <div v-if="!isLoggedIn" class="login-container">
      <div class="login-card">
        <h1>ログイン</h1>
        <form @submit.prevent="onLogin">
          <div class="form-group">
            <label for="email">メールアドレス</label>
            <input id="email" type="email" v-model="loginEmail" required />
          </div>
          <div class="form-group">
            <label for="password">パスワード</label>
            <input id="password" type="password" v-model="loginPassword" required />
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

      <!-- ===== 一覧表示 ===== -->
      <div v-if="currentSetIndex === null">
        <div class="form">
          <input v-model="newCardSetName" class="card-set-name-input" placeholder="新しいカードセット名" />
          <button class="styled-button">カードセットを追加</button>
        </div>

        <ul>
          <li v-for="(set, index) in cardSets" :key="index" class="card-set">
            <div class="card-set-header">
              <h3>{{ set.name || '名前なし' }}</h3>
              <div class="button-group">
                <button @click="playCardSet(index)" class="styled-button play">遊ぶ</button>
                <button class="styled-button delete">削除</button>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- ===== カード表示中 ===== -->
      <div v-else>
        <div class="card-top-actions">
          <button @click="backToList" class="btn-ghost">一覧に戻る</button>
        </div>

        <div class="card-container">
          <div class="card" @click="flipCard">
            <!-- 前へ・次へボタンをカード上に重ねる -->
            <button @click.stop="prevCard" class="navigation-button prev styled-button">前へ</button>

            <p v-if="!isFlipped">
              {{ cardSets[currentSetIndex]?.cards[currentCardIndex]?.japanese }}
            </p>
            <p v-else>
              {{ cardSets[currentSetIndex]?.cards[currentCardIndex]?.english }}
            </p>

            <button @click.stop="nextCard" class="navigation-button next styled-button">次へ</button>
          </div>
        </div>

        <div class="form">
          <!-- 編集中 -->
          <div v-if="editingCardIndex !== null">
            <textarea v-model="editJapanese" placeholder="日本語"></textarea>
            <textarea v-model="editEnglish" placeholder="英語"></textarea>
            <div class="button-group">
              <button @click="saveEditCard" class="styled-button">保存</button>
              <button @click="cancelEdit" class="btn-ghost">キャンセル</button>
            </div>
          </div>
          <!-- 新規追加 -->
          <div v-else>
            <textarea v-model="newJapanese" placeholder="日本語"></textarea>
            <textarea v-model="newEnglish" placeholder="英語"></textarea>
            <div>
              <button @click="onAddNewCard" class="styled-button">カードを追加</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ===== 共通コンテナ ===== */
.container {
  max-width: 960px;
  margin: 24px auto;
  padding: 0 16px;
  font-family: Arial, sans-serif;
}

/* ===== ヘッダー ===== */
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

/* ===== ログインフォーム ===== */
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

/* ===== カード一覧 ===== */
.card-set { margin: 10px 0; padding: 10px; border: 1px solid #ccc; border-radius: 5px; text-align: left; width: 100%; }
.card-set-header { display: flex; justify-content: space-between; align-items: center; }
.card-list { margin-top: 10px; list-style: none; padding-left: 0; }
.card-item { background: #f9f9f9; margin: 5px 0; padding: 10px; border-radius: 5px; font-size: 14px; }

.card-top-actions { display: flex; justify-content: flex-end; margin: 12px 0; }

/* ===== カード表示エリア ===== */
.card-container {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-top: 20px;
}
.card {
  position: relative;
  width: 300px;
  height: 200px;
  border: 1px solid #ccc;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 18px;
  cursor: pointer;
  transition: transform .3s, background-color .3s;
  background-color: #f9f9f9;
  box-shadow: 0 4px 8px rgba(0,0,0,.1);
}
.card:hover { background-color: #e0e0e0; }

/* ===== 前へ・次へボタン ===== */
.navigation-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: #6a11cb;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(0,0,0,.2);
  transition: all .3s ease;
}
.navigation-button.prev { left: -80px; }
.navigation-button.next { right: -80px; }
.navigation-button:hover { background-color: #0056b3; transform: translateY(-50%) scale(1.1); }

/* ===== フォームエリア ===== */
.form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
}
textarea {
  width: 250px;
  height: 100px;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,.1);
  transition: all .3s ease;
}
textarea:focus { outline: none; border-color: #007bff; box-shadow: 0 4px 8px rgba(0,123,255,.2); }

/* ===== ボタンスタイル ===== */
.styled-button {
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  color: white;
  text-transform: uppercase;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: linear-gradient(45deg, #6a11cb, #2575fc);
  box-shadow: 0 4px 8px rgba(0,0,0,.2);
  transition: all .3s ease;
}
.styled-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0,0,0,.3);
}
.styled-button:active {
  transform: translateY(0);
  box-shadow: 0 3px 6px rgba(0,0,0,.2);
}
.styled-button.play { background: linear-gradient(45deg, #28a745, #218838); }
.styled-button.delete { background: linear-gradient(45deg, #dc3545, #c82333); }
.styled-button.back { background: linear-gradient(45deg, #007bff, #0056b3); }

.card-set-name-input {
  width: 100%;
  max-width: 600px;
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,.1);
  transition: all .3s ease;
}
.card-set-name-input:focus { outline: none; border-color: #007bff; box-shadow: 0 4px 8px rgba(0,123,255,.2); }

.export { background: none; background-color: #13f08d; }
.card-set-name-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 4px 8px rgba(0,123,255,.2);
}
</style>
