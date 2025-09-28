// composables/useCards.ts
import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { useAuth } from './useAuth'

export interface Card { japanese: string; english: string; _id?: number }
export interface CardSet { name: string; cards: Card[]; userId: string }

const cardSets = ref<CardSet[]>([])
const currentSetIndex = ref<number | null>(null)
const currentCardIndex = ref(0)
const isFlipped = ref(false)
const editingCardIndex = ref<number | null>(null)
const editJapanese = ref('')
const editEnglish = ref('')

export function useCards() {
  const { isLoggedIn, fetchWithAuth } = useAuth()

  /* ===== サーバーからロード ===== */
  const loadServerCards = async () => {
    const list: any[] = await fetchWithAuth('/api/flash-cards', { method: 'GET' })
    cardSets.value = [{
      name: 'My Cards (Server)',
      cards: list.map(c => ({ _id: c.id, japanese: c.front, english: c.back })),
      userId: 'server'
    }]
    if (currentSetIndex.value === null) currentSetIndex.value = 0
  }

  /* ===== カード追加 ===== */
  const addNewCard = async (japanese: string, english: string) => {
    if (isLoggedIn.value) {
      const created: any = await fetchWithAuth('/api/flash-cards', {
        method: 'POST',
        body: { front: japanese, back: english }
      })
      if (created?.ok && created.card) {
        cardSets.value[0].cards.unshift({
          _id: created.card.id,
          japanese: created.card.front,
          english: created.card.back
        })
      }
    } else {
      cardSets.value[currentSetIndex.value!].cards.push({ japanese, english })
    }
  }

  /* ===== カード削除 ===== */
  const deleteCard = async (index: number) => {
    const setIdx = currentSetIndex.value ?? 0
    const c = cardSets.value[setIdx].cards[index]
    if (isLoggedIn.value) {
      if (typeof c._id !== 'number') return
      await fetchWithAuth(`/api/flash-cards/${c._id}`, { method: 'DELETE' })
    }
    cardSets.value[setIdx].cards.splice(index, 1)
  }

  /* ===== 編集開始 ===== */
  const startEditCard = (index: number) => {
    editingCardIndex.value = index
    const setIdx = currentSetIndex.value ?? 0
    const c = cardSets.value[setIdx].cards[index]
    editJapanese.value = c.japanese
    editEnglish.value = c.english
  }

  /* ===== 編集保存 ===== */
  const saveEditCard = async () => {
    if (editingCardIndex.value === null) return
    const setIdx = currentSetIndex.value ?? 0
    const c = cardSets.value[setIdx].cards[editingCardIndex.value]

    if (isLoggedIn.value && typeof c._id === 'number') {
      const updated: any = await fetchWithAuth(`/api/flash-cards/${c._id}`, {
        method: 'PATCH',
        body: { front: editJapanese.value.trim(), back: editEnglish.value.trim() }
      })
      if (updated?.ok && updated.card) {
        c.japanese = updated.card.front
        c.english  = updated.card.back
      }
    } else {
      c.japanese = editJapanese.value.trim()
      c.english  = editEnglish.value.trim()
    }

    editingCardIndex.value = null
  }

  const cancelEdit = () => { editingCardIndex.value = null }

  /* ===== ナビゲーション ===== */
  const playCardSet = (index: number) => {
    currentSetIndex.value = index
    currentCardIndex.value = 0
    isFlipped.value = false
  }
  const backToList = () => { currentSetIndex.value = null }
  const nextCard = () => {
    isFlipped.value = false
    const cards = cardSets.value[currentSetIndex.value!]?.cards || []
    if (cards.length) currentCardIndex.value = (currentCardIndex.value + 1) % cards.length
  }
  const prevCard = () => {
    isFlipped.value = false
    const cards = cardSets.value[currentSetIndex.value!]?.cards || []
    if (cards.length) currentCardIndex.value = (currentCardIndex.value - 1 + cards.length) % cards.length
  }
  const flipCard = () => { isFlipped.value = !isFlipped.value }

  return {
    // 状態
    cardSets,
    currentSetIndex,
    currentCardIndex,
    isFlipped,
    editingCardIndex,
    editJapanese,
    editEnglish,
    // 操作
    loadServerCards,
    addNewCard,
    deleteCard,
    startEditCard,
    saveEditCard,
    cancelEdit,
    playCardSet,
    backToList,
    nextCard,
    prevCard,
    flipCard,
  }
}
