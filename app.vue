<script setup>
import { ref, onMounted } from 'vue';

const newFront = ref('');
const newBack = ref('');
const flashcards = ref([]);
const flipped = ref([]); // カードの裏表を管理

const loadFlashcards = () => {
  const savedFlashcards = localStorage.getItem('flashcards');
  if (savedFlashcards) {
    flashcards.value = JSON.parse(savedFlashcards);
    flipped.value = new Array(flashcards.value.length).fill(false);
  }
};

const addFlashcard = () => {
  if (newFront.value && newBack.value) {
    flashcards.value.push({ front: newFront.value, back: newBack.value });
    flipped.value.push(false); // 初期状態は表
    saveFlashcards();
    newFront.value = '';
    newBack.value = '';
  }
};

const removeFlashcard = (index) => {
  flashcards.value.splice(index, 1);
  flipped.value.splice(index, 1);
  saveFlashcards();
};

const shuffleFlashcards = () => {
  flashcards.value = [...flashcards.value].sort(() => Math.random() - 0.5);
  flipped.value = new Array(flashcards.value.length).fill(false);
  saveFlashcards();
};

const flipCard = (index) => {
  flipped.value[index] = !flipped.value[index];
};

const saveFlashcards = () => {
  localStorage.setItem('flashcards', JSON.stringify(flashcards.value));
};

onMounted(() => {
  loadFlashcards();
});
</script>

<template>
  <div class="container">
    <h1>Flashcard Stack</h1>
    <div class="input-group">
      <input v-model="newFront" placeholder="Front" />
      <input v-model="newBack" placeholder="Back" />
      <button @click="addFlashcard">Add</button>
      <button @click="shuffleFlashcards">Shuffle</button>
    </div>
    <div class="stack">
      <div v-for="(card, index) in flashcards" :key="index" class="card" :class="{ flipped: flipped[index] }" @click="flipCard(index)">
        <div class="card-inner">
          <div class="card-face">
            <p>{{ flipped[index] ? card.back : card.front }}</p>
          </div>
        </div>
        <button @click.stop="removeFlashcard(index)">Remove</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  text-align: center;
  max-width: 400px;
  margin: auto;
}
.input-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}
.stack {
  position: relative;
  width: 200px;
  height: 120px;
  margin: auto;
}
.card {
  width: 100%;
  height: 100%;
  position: absolute;
  border: 1px solid #ccc;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  transition: transform 0.5s;
}
.card.flipped {
  background-color: lightgray;
}
.card-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
.card-face {
  text-align: center;
  font-size: 16px;
}
</style>