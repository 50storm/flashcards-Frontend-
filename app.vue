<script setup>
import { ref, onMounted } from 'vue';

// フラッシュカードのデータ
const flashcards = ref([]);
const newFront = ref('');
const newBack = ref('');

// ローカルストレージからフラッシュカードを取得
const loadFlashcards = () => {
  const savedFlashcards = localStorage.getItem('flashcards');
  if (savedFlashcards) {
    flashcards.value = JSON.parse(savedFlashcards);
  }
};

// フラッシュカードを追加
const addFlashcard = () => {
  if (newFront.value && newBack.value) {
    flashcards.value.push({ front: newFront.value, back: newBack.value });
    saveFlashcards();
    newFront.value = '';
    newBack.value = '';
  }
};

// フラッシュカードを削除
const removeFlashcard = (index) => {
  flashcards.value.splice(index, 1);
  saveFlashcards();
};

// フラッシュカードをシャッフル
const shuffleFlashcards = () => {
  flashcards.value = flashcards.value.sort(() => Math.random() - 0.5);
  saveFlashcards();
};

// ローカルストレージに保存
const saveFlashcards = () => {
  localStorage.setItem('flashcards', JSON.stringify(flashcards.value));
};

// マウント時にデータをロード
onMounted(loadFlashcards);
</script>

<template>
  <div class="container">
    <h1>Flashcards</h1>
    <div class="input-group">
      <input v-model="newFront" placeholder="Front" />
      <input v-model="newBack" placeholder="Back" />
      <button @click="addFlashcard">Add</button>
    </div>
    <button @click="shuffleFlashcards">Shuffle</button>
    <ul>
      <li v-for="(card, index) in flashcards" :key="index">
        <strong>{{ card.front }}</strong> - {{ card.back }}
        <button @click="removeFlashcard(index)">Remove</button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.container {
  max-width: 600px;
  margin: auto;
  text-align: center;
}

.input-group {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 10px;
}

input {
  padding: 5px;
  border: 1px solid #ccc;
}

button {
  padding: 5px 10px;
  cursor: pointer;
}
</style>
