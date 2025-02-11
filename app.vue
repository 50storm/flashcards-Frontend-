<script setup>
import { ref, onMounted } from 'vue';

// テキストの状態を管理
const japaneseText = ref('');
const englishText = ref('');
const flashcards = ref([]);

// ローカルストレージからフラッシュカードをロード
const loadFlashcards = () => {
  const savedFlashcards = localStorage.getItem('flashcards');
  if (savedFlashcards) {
    flashcards.value = JSON.parse(savedFlashcards);
  }
};

// 新しいフラッシュカードを追加
const addFlashcard = () => {
  if (japaneseText.value.trim() && englishText.value.trim()) {
    flashcards.value.push({
      japanese: japaneseText.value,
      english: englishText.value,
    });
    saveFlashcards();
    japaneseText.value = '';
    englishText.value = '';
  } else {
    alert('日本語と英語を両方入力してください！');
  }
};

// フラッシュカードを削除
const removeFlashcard = (index) => {
  flashcards.value.splice(index, 1);
  saveFlashcards();
};

// フラッシュカードを保存
const saveFlashcards = () => {
  localStorage.setItem('flashcards', JSON.stringify(flashcards.value));
};

// 初期化
onMounted(() => {
  loadFlashcards();
});
</script>

<template>
  <div class="container">
    <!-- Header -->
    <header class="header">
      <div class="menu-icon">☰</div>
      <h1>ビジネス英会話</h1>
      <div class="profile-icon">👤</div>
    </header>

    <!-- Content Sections -->
    <div class="content">
      <!-- 日本語入力 -->
      <div class="section">
        <label for="japanese">日本語</label>
        <textarea id="japanese" v-model="japaneseText" class="textarea" placeholder="単語を入力"></textarea>
      </div>

      <!-- 英語入力 -->
      <div class="section">
        <label for="english">英語</label>
        <textarea id="english" v-model="englishText" class="textarea" placeholder="単語を入力"></textarea>
      </div>

      <!-- 登録ボタン -->
      <button class="add-button" @click="addFlashcard">単語を登録</button>
    </div>

    <!-- Flashcard List -->
    <div class="flashcards">
      <h2>登録された単語</h2>
      <ul>
        <li v-for="(card, index) in flashcards" :key="index" class="flashcard">
          <p><strong>日本語:</strong> {{ card.japanese }}</p>
          <p><strong>英語:</strong> {{ card.english }}</p>
          <button @click="removeFlashcard(index)">削除</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  max-width: 400px;
  margin: auto;
  font-family: Arial, sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ccc;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 20px 0;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.textarea {
  width: 100%;
  height: 50px;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 5px;
  resize: none;
}

.add-button {
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.add-button:hover {
  background-color: #0056b3;
}

.flashcards {
  margin-top: 20px;
}

.flashcard {
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 10px;
}

.flashcard button {
  padding: 5px 10px;
  background-color: red;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.flashcard button:hover {
  background-color: darkred;
}
</style>
