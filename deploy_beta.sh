#!/usr/bin/env bash
set -e

# 1) 生成
npm ci
npm run build
npm run generate  # 出力: .output/public/

# 2) アップ
sftp -i ~/.ssh/xs225231-personal.key -P 10022 xs225231@sv13290.xserver.jp <<'EOF'
mkdir -p /home/xs225231/xs225231.xsrv.jp/public_html/flashcardbackend
cd /home/xs225231/xs225231.xsrv.jp/public_html/flashcardbackend
lcd ./.output/public
put -r * 
bye
EOF

# 3) 確認
echo "Deployed to https://xs225231.xsrv.jp/flashcardbackend/"


