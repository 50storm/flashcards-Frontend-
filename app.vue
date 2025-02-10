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
  flashcards.value = flashcards.value.sort(() => Math.random() - 0.5);
  saveFlashcards();
};

const flipCard = (index) => {
  flipped.value[index] = !flipped.value[index];
};

const saveFlashcards = () => {
  localStorage.setItem('flashcards', JSON.stringify(flashcards.value));
};

onMounted(loadFlashcards);
</script>

<template>
  <div>
    <h1>Flashcards</h1>
    <input v-model="newFront" placeholder="Front" />
    <input v-model="newBack" placeholder="Back" />
    <button @click="addFlashcard">Add</button>
    <button @click="shuffleFlashcards">Shuffle</button>
    <ul>
      <li v-for="(card, index) in flashcards" :key="index" @click="flipCard(index)" class="flashcard" :class="{ flipped: flipped[index] }">
        <div class="card-content">
          <div v-if="!flipped[index]">{{ card.front }}</div>
          <div v-else>{{ card.back }}</div>
        </div>
        <button @click.stop="removeFlashcard(index)">Remove</button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.flashcard {
  cursor: pointer;
  display: inline-block;
  padding: 10px;
  border: 1px solid #ccc;
  margin: 5px;
  text-align: center;
  width: 150px;
  height: 100px;
  background-color: white;
}
.flipped {
  background-color: lightgray;
}
</style>
