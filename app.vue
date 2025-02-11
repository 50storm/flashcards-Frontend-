<script setup>
import { ref, onMounted } from 'vue';

// 状態管理
const cardSets = ref([]); // カードセットのリスト
const newCardSet = ref({
  name: '',
  cards: [], // 各セット内の単語リスト
});
const newJapanese = ref('');
const newEnglish = ref('');
const flippedCards = ref([]); // 各カードが裏返し状態かどうかを管理

// ローカルストレージからカードセットをロード
const loadCardSets = () => {
  const savedCardSets = localStorage.getItem('cardSets');
  if (savedCardSets) {
    cardSets.value = JSON.parse(savedCardSets);
    initializeFlippedCards();
  }
};

// カードの裏返し状態を初期化
const initializeFlippedCards = () => {
  flippedCards.value = cardSets.value.map(set =>
    set.cards.map(() => false)
  );
};

// 新しいカードをセット内に追加
const addCardToSet = () => {
  if (newJapanese.value.trim() && newEnglish.value.trim()) {
    newCardSet.value.cards.push({
      japanese: newJapanese.value,
      english: newEnglish.value,
    });
    newJapanese.value = '';
    newEnglish.value = '';
  } else {
    alert('日本語と英語を両方入力してください！');
  }
};

// 新しいカードセットを登録
const addCardSet = () => {
  if (newCardSet.value.name.trim() && newCardSet.value.cards.length > 0) {
    cardSets.value.push({ ...newCardSet.value });
    saveCardSets();
    newCardSet.value.name = '';
    newCardSet.value.cards = [];
    initializeFlippedCards();
  } else {
    alert('カードセット名と単語を入力してください！');
  }
};

// カードセットを削除
const removeCardSet = (index) => {
  cardSets.value.splice(index, 1);
  flippedCards.value.splice(index, 1);
  saveCardSets();
};

// カードを裏返す
const flipCard = (setIndex, cardIndex) => {
  flippedCards.value[setIndex][cardIndex] = !flippedCards.value[setIndex][cardIndex];
};

// カードセットを保存
const saveCardSets = () => {
  localStorage.setItem('cardSets', JSON.stringify(cardSets.value));
};

// 初期化
onMounted(() => {
  loadCardSets();
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

    <!-- 新しいカードセットの作成 -->
    <div class="new-card-set">
      <input v-model="newCardSet.name" class="input" placeholder="カードセット名を入力" />

      <div class="add-card">
        <label>日本語</label>
        <textarea v-model="newJapanese" class="textarea" placeholder="単語を入力"></textarea>

        <label>英語</label>
        <textarea v-model="newEnglish" class="textarea" placeholder="単語を入力"></textarea>

        <button @click="addCardToSet" class="add-card-button">単語を追加</button>
      </div>

      <button @click="addCardSet" class="add-set-button">カードセットを登録</button>
    </div>

    <!-- 登録されたカードセット -->
    <div class="card-sets">
      <h2>登録されたカードセット</h2>
      <ul>
        <li v-for="(set, setIndex) in cardSets" :key="setIndex" class="card-set">
          <h3>{{ set.name }}</h3>
          <ul>
            <li v-for="(card, cardIndex) in set.cards" :key="cardIndex" class="flashcard">
              <!-- カード -->
              <div
                class="card"
                @click="flipCard(setIndex, cardIndex)"
              >
                <p v-if="!flippedCards[setIndex][cardIndex]">
                  {{ card.japanese }}
                </p>
                <p v-else>
                  {{ card.english }}
                </p>
              </div>
            </li>
          </ul>
          <button @click="removeCardSet(setIndex)" class="remove-set-button">セットを削除</button>
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

.new-card-set {
  margin: 20px 0;
}

.input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.add-card {
  margin-bottom: 20px;
}

.textarea {
  width: 100%;
  height: 50px;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 5px;
  resize: none;
}

.add-card-button,
.add-set-button {
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
}

.add-card-button:hover,
.add-set-button:hover {
  background-color: #0056b3;
}

.card-sets {
  margin-top: 20px;
}

.card-set {
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 10px;
}

.flashcard {
  margin: 5px 0;
}

.card {
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  cursor: pointer;
  background-color: #f9f9f9;
  text-align: center;
  transition: background-color 0.3s;
}

.card:hover {
  background-color: #e0e0e0;
}

.remove-set-button {
  padding: 5px 10px;
  background-color: red;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.remove-set-button:hover {
  background-color: darkred;
}
</style>
