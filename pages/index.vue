<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue'
import { v4 as uuidv4 } from 'uuid'

interface Card {
  japanese: string
  english: string
}

interface CardSet {
  name: string
  cards: Card[]
  userId: string
}

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
    const parsedCardSets: CardSet[] = JSON.parse(savedCardSets)
    parsedCardSets.forEach(set => {
      if (!set.userId) set.userId = userId.value
    })
    cardSets.value = parsedCardSets
  } else {
    const newDefaultCardSet = { ...defaultCardSet, userId: userId.value }
    cardSets.value.push(newDefaultCardSet)
    saveCardSets()
  }
}

const saveCardSets = () => {
  localStorage.setItem('cardSets', JSON.stringify(cardSets.value))
}

const addCardSet = () => {
  if (newCardSetName.value.trim()) {
    const newSetIndex = cardSets.value.length
    cardSets.value.push({
      name: newCardSetName.value.trim(),
      cards: [],
      userId: userId.value
    })
    newCardSetName.value = ''
    saveCardSets()
    playCardSet(newSetIndex)
  } else {
    alert('カードセット名を入力してください！')
  }
}

const deleteCardSet = (index: number) => {
  if (confirm('このカードセットを削除してもよろしいですか？')) {
    cardSets.value.splice(index, 1)
    saveCardSets()
  }
}

const addNewCard = () => {
  if (newJapanese.value.trim() && newEnglish.value.trim()) {
    cardSets.value[currentSetIndex.value!].cards.push({
      japanese: newJapanese.value.trim(),
      english: newEnglish.value.trim()
    })
    newJapanese.value = ''
    newEnglish.value = ''
    saveCardSets()
  } else {
    alert('日本語と英語の両方を入力してください！')
  }
}

const deleteCard = (index: number) => {
  if (confirm('このカードを削除してもよろしいですか？')) {
    cardSets.value[currentSetIndex.value!].cards.splice(index, 1)
    saveCardSets()
  }
}

const startEditCard = (index: number) => {
  editingCardIndex.value = index
  const card = cardSets.value[currentSetIndex.value!].cards[index]
  editJapanese.value = card.japanese
  editEnglish.value = card.english
}

const saveEditCard = () => {
  if (editJapanese.value.trim() && editEnglish.value.trim() && editingCardIndex.value !== null) {
    const card = cardSets.value[currentSetIndex.value!].cards[editingCardIndex.value]
    card.japanese = editJapanese.value.trim()
    card.english = editEnglish.value.trim()
    editingCardIndex.value = null
    saveCardSets()
  } else {
    alert('日本語と英語の両方を入力してください！')
  }
}

const cancelEdit = () => {
  editingCardIndex.value = null
}

const playCardSet = (index: number) => {
  currentSetIndex.value = index
  currentCardIndex.value = 0
  isFlipped.value = false
}

const backToList = () => {
  currentSetIndex.value = null
}

const nextCard = () => {
  isFlipped.value = false
  const cards = cardSets.value[currentSetIndex.value!].cards
  if (currentCardIndex.value < cards.length - 1) {
    currentCardIndex.value++
  } else {
    currentCardIndex.value = 0
  }
}

const prevCard = () => {
  isFlipped.value = false
  const cards = cardSets.value[currentSetIndex.value!].cards
  if (currentCardIndex.value > 0) {
    currentCardIndex.value--
  } else {
    currentCardIndex.value = cards.length - 1
  }
}

const flipCard = () => {
  isFlipped.value = !isFlipped.value
}

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

onMounted(() => {
  try {
    userId.value = getUserId()
    loadCardSets()
  } catch (error) {
    console.error('カードセットのロード中にエラーが発生しました:', error)
  }
})

watchEffect(() => {
  console.log('現在のカードセット:', cardSets.value)
})
</script>

<template>
  <div class="container">

    <div v-if="currentSetIndex === null">
      <header class="header">
        <h1>カードセット一覧</h1>
        <p>ユーザーID: {{ userId }}</p>
      </header>

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
            </li>
          </ul>
        </li>
      </ul>
    </div>

    <div v-else>
      <header class="header">
        <h1>{{ cardSets[currentSetIndex]?.name || 'カードセット' }}</h1>
        <button @click="backToList" class="styled-button back">一覧に戻る</button>
      </header>

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
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: Arial, sans-serif;
  margin-top: 20px;
}

.header {
  margin-bottom: 20px;
  font-size: 24px;
  text-align: center;
}

.card-set {
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  text-align: left;
  width: 100%;
  max-width: 600px;
}

.card-set-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-list {
  margin-top: 10px;
  list-style: none;
  padding-left: 0;
}

.card-item {
  background: #f9f9f9;
  margin: 5px 0;
  padding: 10px;
  border-radius: 5px;
  font-size: 14px;
}

.card-container {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-top: 20px;
}

.card {
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
  transition: transform 0.3s, background-color 0.3s;
  background-color: #f9f9f9;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.card:hover {
  background-color: #e0e0e0;
}

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
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.navigation-button.prev {
  left: -100px;
}

.navigation-button.next {
  right: -100px;
}

.navigation-button:hover {
  background-color: #0056b3;
  transform: translateY(-50%) scale(1.1);
}

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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.2);
}

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
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.styled-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
}

.styled-button:active {
  transform: translateY(0);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
}

.styled-button.play {
  background: linear-gradient(45deg, #28a745, #218838);
}

.styled-button.delete {
  background: linear-gradient(45deg, #dc3545, #c82333);
}

.styled-button.back {
  background: linear-gradient(45deg, #007bff, #0056b3);
}

.card-set-name-input {
  width: 100%;
  max-width: 600px;
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.card-set-name-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.2);
}

.export {
  background: none;
  background-color: #13f08d;
}
</style>
