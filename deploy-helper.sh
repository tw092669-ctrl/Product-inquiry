#!/bin/bash

echo "🚀 AC Master Pro 部署助手"
echo "================================"
echo ""

# 檢查建置目錄
if [ -d "dist" ]; then
    echo "✅ 建置檔案已準備好 (dist/)"
else
    echo "⚠️  正在建置專案..."
    npm run build
fi

echo ""
echo "📋 後續步驟:"
echo ""
echo "1️⃣  啟用 GitHub Pages:"
echo "   👉 前往: https://github.com/tw092669-ctrl/Product-inquiry/settings/pages"
echo "   👉 Source 選擇: 'GitHub Actions'"
echo ""
echo "2️⃣  查看部署狀態:"
echo "   👉 前往: https://github.com/tw092669-ctrl/Product-inquiry/actions"
echo ""
echo "3️⃣  部署完成後,你的網站將在:"
echo "   🌐 https://tw092669-ctrl.github.io/Product-inquiry/"
echo ""
echo "================================"
echo "✨ 完成!"
