#!/usr/bin/env node

/**
 * 生成版本標識文件
 * 每次構建時自動生成唯一的版本代碼
 */

const fs = require('fs');
const path = require('path');

// 生成隨機版本碼（基於時間戳和隨機數）
const generateVersionCode = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}`;
};

// 創建版本信息對象
const versionInfo = {
  version: generateVersionCode(),
  buildTime: new Date().toISOString(),
  timestamp: Date.now()
};

// 確保 public 目錄存在
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 寫入版本文件
const versionFilePath = path.join(publicDir, 'version.json');
fs.writeFileSync(versionFilePath, JSON.stringify(versionInfo, null, 2));

console.log('✅ 版本文件已生成:', versionInfo.version);
console.log('📝 文件位置:', versionFilePath);
