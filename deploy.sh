#!/bin/bash
# ================================
# 🚀 Deploy Nuxt 3 static site to Xserver via SFTP (Full Copy)
# ================================

# === 設定読み込み ===
if [ -f .env.deploy ]; then
  export $(grep -v '^#' .env.deploy | xargs)
else
  echo "❌ .env.deploy file not found. Aborting."
  exit 1
fi

# === 変数チェック ===
if [ -z "$XSERVER_HOST" ] || [ -z "$XSERVER_USER" ] || [ -z "$XSERVER_PORT" ] || [ -z "$XSERVER_REMOTE_PATH" ] || [ -z "$XSERVER_KEY_PATH" ]; then
  echo "❌ Missing environment variables. Please check .env.deploy"
  exit 1
fi

# === ビルド ===
echo "🏗️ Building Nuxt 3 static site..."
npm run build && npm run generate
if [ $? -ne 0 ]; then
  echo "❌ Build failed. Deployment aborted."
  exit 1
fi

# === SFTP転送 ===
echo "🚀 Deploying to Xserver via SFTP..."
sftp -i "$XSERVER_KEY_PATH" -P "$XSERVER_PORT" -o StrictHostKeyChecking=no "$XSERVER_USER@$XSERVER_HOST" <<EOF
cd $XSERVER_REMOTE_PATH
lcd .output/public
put -r *
bye
EOF

if [ $? -eq 0 ]; then
  echo "✅ Deployment complete! (Full Copy)"
else
  echo "❌ Deployment failed."
  exit 1
fi
