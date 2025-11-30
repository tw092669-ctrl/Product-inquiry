import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 這是部署到 GitHub Pages 的關鍵設定
  // 設定為 './' 確保資源路徑是相對的，適應各種子路徑部署
  base: './',
  build: {
    outDir: 'dist',
  }
})