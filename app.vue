<script setup>
import { ref, onMounted } from 'vue';

// 状態管理
const cardSets = ref([]); // カードセットのリスト
const currentSetIndex = ref(null); // 選択中のカードセットのインデックス
const currentCardIndex = ref(0); // 表示中のカードのインデックス
const isFlipped = ref(false); // 現在のカードが裏返し状態かどうか

// 新しいカードセット作成用
const newCardSetName = ref('');

// 新しいカードの登録用
const newJapanese = ref('');
const newEnglish = ref('');

// 編集用
const editingCardIndex = ref(null);
const editJapanese = ref('');
const editEnglish = ref('');

// デフォルトのカードセット
const defaultCardSet = {
  name: 'ビジネス英会話',
  cards: [
    { japanese: 'お世話になっております', english: 'Thank you for your continued support' },
    { japanese: 'よろしくお願いします', english: 'I look forward to working with you' },
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

// カードセットを保存
const saveCardSets = () => {
  localStorage.setItem('cardSets', JSON.stringify(cardSets.value));
};

// 新しいカードセットを追加
const addCardSet = () => {
  if (newCardSetName.value.trim()) {
    cardSets.value.push({ name: newCardSetName.value, cards: [] });
    newCardSetName.value = '';
    saveCardSets();
  } else {
    alert('カードセット名を入力してください！');
  }
};

// カードセットを削除
const deleteCardSet = (index) => {
  if (confirm('このカードセットを削除してもよろしいですか？')) {
    cardSets.value.splice(index, 1);
    saveCardSets();
  }
};

// 新しいカードを追加
const addNewCard = () => {
  if (newJapanese.value.trim() && newEnglish.value.trim()) {
    cardSets.value[currentSetIndex.value].cards.push({
      japanese: newJapanese.value,
      english: newEnglish.value,
    });
    newJapanese.value = '';
    newEnglish.value = '';
    saveCardSets();
  } else {
    alert('日本語と英語の両方を入力してください！');
  }
};

// カードの削除
const deleteCard = (index) => {
  if (confirm('このカードを削除してもよろしいですか？')) {
    cardSets.value[currentSetIndex.value].cards.splice(index, 1);
    saveCardSets();
  }
};

// カードの編集を開始
const startEditCard = (index) => {
  editingCardIndex.value = index;
  editJapanese.value = cardSets.value[currentSetIndex.value].cards[index].japanese;
  editEnglish.value = cardSets.value[currentSetIndex.value].cards[index].english;
};

// 編集を保存
const saveEditCard = () => {
  if (editJapanese.value.trim() && editEnglish.value.trim()) {
    const card = cardSets.value[currentSetIndex.value].cards[editingCardIndex.value];
    card.japanese = editJapanese.value;
    card.english = editEnglish.value;
    editingCardIndex.value = null;
    saveCardSets();
  } else {
    alert('日本語と英語の両方を入力してください！');
  }
};

// 編集をキャンセル
const cancelEdit = () => {
  editingCardIndex.value = null;
};

// 「遊ぶ」画面に切り替え
const playCardSet = (index) => {
  currentSetIndex.value = index;
  currentCardIndex.value = 0;
  isFlipped.value = false;
};

// 「カードセット一覧」画面に戻る
const backToList = () => {
  currentSetIndex.value = null;
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

// 初期化
onMounted(() => {
  loadCardSets();
});
</script>

<template>
  <div class="container">
    <!-- カードセット一覧画面 -->
    <div v-if="currentSetIndex === null">
      <header class="header">
        <h1>カードセット一覧</h1>
      </header>

      <div class="form">
        <input v-model="newCardSetName" placeholder="新しいカードセット名" />
        <button @click="addCardSet">カードセットを追加</button>
      </div>

      <ul>
        <li v-for="(set, index) in cardSets" :key="index">
          <h3>{{ set.name }}</h3>
          <button @click="playCardSet(index)">遊ぶ</button>
          <button @click="deleteCardSet(index)">削除</button>
        </li>
      </ul>
    </div>

    <!-- 遊び画面 -->
    <div v-else>
      <header class="header">
        <h1>{{ cardSets[currentSetIndex]?.name || 'カードセット' }}</h1>
        <button @click="backToList">一覧に戻る</button>
      </header>

      <div class="form">
        <div v-if="editingCardIndex === null">
          <input v-model="newJapanese" placeholder="日本語" />
          <input v-model="newEnglish" placeholder="英語" />
          <button @click="addNewCard">カードを追加</button>
        </div>
        <div v-else>
          <input v-model="editJapanese" placeholder="日本語" />
          <input v-model="editEnglish" placeholder="英語" />
          <button @click="saveEditCard">保存</button>
          <button @click="cancelEdit">キャンセル</button>
        </div>
      </div>

      <ul>
        <li v-for="(card, index) in cardSets[currentSetIndex].cards" :key="index">
          {{ card.japanese }} - {{ card.english }}
          <button @click="startEditCard(index)">編集</button>
          <button @click="deleteCard(index)">削除</button>
        </li>
      </ul>

      <div class="card" @click="flipCard">
        <p v-if="!isFlipped">{{ cardSets[currentSetIndex]?.cards[currentCardIndex]?.japanese }}</p>
        <p v-else>{{ cardSets[currentSetIndex]?.cards[currentCardIndex]?.english }}</p>
      </div>

      <div class="navigation">
        <button @click="prevCard">前へ</button>
        <button @click="nextCard">次へ</button>
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
}

/* 共通スタイル */
.header {
  margin-bottom: 20px;
  font-size: 24px;
  text-align: center;
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

.back-button {
  margin-top: 10px;
}

.card-set {
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  text-align: center;
}

.play-button {
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background-color: #007bff;
  color: white;
  transition: background-color 0.3s;
}

.play-button:hover {
  background-color: #0056b3;
}
</style>
