<script setup>
import { ref, onMounted, watchEffect } from 'vue';

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
    const newSetIndex = cardSets.value.length;
    cardSets.value.push({ name: newCardSetName.value, cards: [] });
    newCardSetName.value = '';
    saveCardSets();
    playCardSet(newSetIndex); // 新しいカードセットを自動的に選択
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
    cardSets.value[currentSetIndex.value]?.cards.push({
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
    cardSets.value[currentSetIndex.value]?.cards.splice(index, 1);
    saveCardSets();
  }
};

// カードの編集を開始
const startEditCard = (index) => {
  editingCardIndex.value = index;
  editJapanese.value = cardSets.value[currentSetIndex.value]?.cards[index].japanese;
  editEnglish.value = cardSets.value[currentSetIndex.value]?.cards[index].english;
};

// 編集を保存
const saveEditCard = () => {
  if (editJapanese.value.trim() && editEnglish.value.trim()) {
    const card = cardSets.value[currentSetIndex.value]?.cards[editingCardIndex.value];
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
  if (currentCardIndex.value < cardSets.value[currentSetIndex.value]?.cards.length - 1) {
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
    currentCardIndex.value = cardSets.value[currentSetIndex.value]?.cards.length - 1; // 最後のカードに戻る
  }
};

// カードを裏返す
const flipCard = () => {
  isFlipped.value = !isFlipped.value;
};

// 初期化
onMounted(() => {
  try {
    loadCardSets();
  } catch (error) {
    console.error('カードセットのロード中にエラーが発生しました:', error);
  }
});

// デバッグ用
watchEffect(() => {
  console.log('現在のカードセット:', cardSets.value);
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
        <button @click="addCardSet" class="styled-button">カードセットを追加</button>
      </div>

      <ul>
        <li v-for="(set, index) in cardSets" :key="index" class="card-set">
          <div class="card-set-header">
            <h3>{{ set?.name || '名前なし' }}</h3>
            <div class="button-group">
              <button @click="playCardSet(index)" class="styled-button play">遊ぶ</button>
              <button @click="deleteCardSet(index)" class="styled-button delete">削除</button>
            </div>
          </div>

          <!-- カードの一覧 -->
          <ul class="card-list">
            <li v-for="(card, cardIndex) in set.cards" :key="cardIndex" class="card-item">
              <p>{{ card.japanese }} - {{ card.english }}</p>
            </li>
          </ul>
        </li>
      </ul>
    </div>

    <!-- 遊び画面 -->
    <div v-else>
      <header class="header">
        <h1>{{ cardSets[currentSetIndex]?.name || 'カードセット' }}</h1>
        <button @click="backToList" class="styled-button back">一覧に戻る</button>
      </header>

      <!-- カードとナビゲーション -->
      <div class="card-container">
        <button @click="prevCard" class="navigation-button prev styled-button">前へ</button>
        <div class="card" @click="flipCard">
          <p v-if="!isFlipped">{{ cardSets[currentSetIndex]?.cards[currentCardIndex]?.japanese }}</p>
          <p v-else>{{ cardSets[currentSetIndex]?.cards[currentCardIndex]?.english }}</p>
        </div>
        <button @click="nextCard" class="navigation-button next styled-button">次へ</button>
      </div>

      <div class="form">
        <input v-model="newJapanese" placeholder="日本語" />
        <input v-model="newEnglish" placeholder="英語" />
        <button @click="addNewCard" class="styled-button">カードを追加</button>
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
  justify-content: center; /* 中央揃え */
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

/* ナビゲーションボタンの位置調整 */
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
  left: -100px; /* 左側の位置調整 */
}

.navigation-button.next {
  right: -100px; /* 右側の位置調整 */
}

.navigation-button:hover {
  background-color: #0056b3;
  transform: translateY(-50%) scale(1.1);
}

.add-card-form {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  gap: 10px;
}

.add-card-form input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 14px;
  width: 150px;
}

.add-card-form button {
  background-color: #6a11cb;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-card-form button:hover {
  background-color: #0056b3;
}

/* ボタンのスタイル */
.styled-button {
  display: inline-block;
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

/* ボタンのバリエーション */
.styled-button.play {
  background: linear-gradient(45deg, #28a745, #218838);
}

.styled-button.delete {
  background: linear-gradient(45deg, #dc3545, #c82333);
}

.styled-button.back {
  background: linear-gradient(45deg, #007bff, #0056b3);
}
</style>
