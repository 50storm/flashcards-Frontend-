<script setup>
import { ref, onMounted } from 'vue';

// 状態管理
const cardSets = ref([]); // カードセットのリスト
const currentSetIndex = ref(0); // 表示中のカードセットのインデックス
const currentCardIndex = ref(0); // 表示中のカードのインデックス
const isFlipped = ref(false); // 現在のカードが裏返し状態かどうか

// デフォルトのカードセット
const defaultCardSet = {
  name: 'ビジネス英会話',
  cards: [
    { japanese: 'お世話になっております', english: 'Thank you for your continued support' },
    { japanese: 'よろしくお願いします', english: 'I look forward to working with you' },
    { japanese: 'お時間をいただきありがとうございます', english: 'Thank you for your time' },
    { japanese: '確認させていただきます', english: 'Let me confirm that' },
    { japanese: '折り返しご連絡いたします', english: 'I will get back to you' },
    { japanese: 'お手数をおかけしますが', english: 'I apologize for the inconvenience' },
    { japanese: 'お会いできるのを楽しみにしています', english: 'I look forward to meeting you' },
    { japanese: '進捗状況はいかがですか？', english: 'How is the progress going?' },
    { japanese: '資料を共有いただけますか？', english: 'Could you share the materials?' },
    { japanese: '何か質問はございますか？', english: 'Do you have any questions?' },
  ],
};

// ローカルストレージからカードセットをロード
const loadCardSets = () => {
  const savedCardSets = localStorage.getItem('cardSets');
  if (savedCardSets) {
    cardSets.value = JSON.parse(savedCardSets);
  } else {
    // 初回ロード時にデフォルトのカードセットを追加
    cardSets.value.push(defaultCardSet);
    saveCardSets();
  }
};

// 次のカードに進む
const nextCard = () => {
  isFlipped.value = false;
  if (currentCardIndex.value < cardSets.value[currentSetIndex.value].cards.length - 1) {
    currentCardIndex.value++;
  } else {
    currentCardIndex.value = 0; // 最初のカードに戻る
  }
};

// 前のカードに戻る
const prevCard = () => {
  isFlipped.value = false;
  if (currentCardIndex.value > 0) {
    currentCardIndex.value--;
  } else {
    currentCardIndex.value = cardSets.value[currentSetIndex.value].cards.length - 1; // 最後のカードに戻る
  }
};

// カードを裏返す
const flipCard = () => {
  isFlipped.value = !isFlipped.value;
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
      <h1>{{ cardSets[currentSetIndex]?.name || 'カードセット' }}</h1>
    </header>

    <!-- 表示中のカード -->
    <div class="card" @click="flipCard">
      <p v-if="!isFlipped">{{ cardSets[currentSetIndex]?.cards[currentCardIndex]?.japanese }}</p>
      <p v-else>{{ cardSets[currentSetIndex]?.cards[currentCardIndex]?.english }}</p>
    </div>

    <!-- ナビゲーションボタン -->
    <div class="navigation">
      <button @click="prevCard">前へ</button>
      <button @click="nextCard">次へ</button>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-family: Arial, sans-serif;
}

.header {
  margin-bottom: 20px;
  font-size: 24px;
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
}

.card:hover {
  background-color: #e0e0e0;
}

.navigation {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background-color: #007bff;
  color: white;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #0056b3;
}
</style>
