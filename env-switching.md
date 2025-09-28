# 環境ごとの `.env` 切り替えガイド

## 📌 Nuxt 4 側の `.env` 運用

### 1. `.env` ファイル作成
プロジェクト直下に `.env` を作成し、環境変数を定義します。  

```env
# .env (開発用)
NUXT_PUBLIC_API_BASE=http://localhost:8080/flashcard

# development 環境用
npx nuxt dev --dotenv .env.dev