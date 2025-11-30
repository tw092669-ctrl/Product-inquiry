# ❄️ AC Master Pro - 專業空調設備管理系統

這是一個基於 **React** + **Vite** + **Tailwind CSS** 開發的現代化空調產品管理系統。專為空調經銷商、工程師設計，提供直觀的視覺化管理、冷房能力試算與產品型錄生成功能。

**特色：純前端架構，無需架設後端伺服器，資料可透過 Excel 輕鬆管理。**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Vite](https://img.shields.io/badge/Vite-5-purple)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3-cyan)

## ✨ 核心功能

*   **📊 戰情儀表板**：即時分析庫存概況、冷暖氣比例、品牌分佈佔比及主流樣式。
*   **🗂️ 彈性資料管理**：支援 Excel (`.xlsx`, `.csv`) 批次匯入與匯出備份。
*   **🎨 視覺化設定**：品牌、樣式、管徑皆可自定義顏色標籤，介面精美。
*   **🖼️ 產品卡片產生器**：一鍵將產品資訊匯出為精美圖片，方便 LINE/社群行銷轉發。
*   **🧮 專業工具箱**：
    *   **冷房能力試算 (BTU Calculator)**：考量頂樓、西曬等熱源，精準計算所需 KW/Kcal。
    *   **超級比一比**：同時比較多項產品規格，差異一目了然。
*   **📱 響應式設計**：完美支援桌機、平板與手機操作。

## 🚀 快速開始

### 環境需求
*   Node.js (建議 v18 以上)

### 安裝與執行

1.  **複製專案**
    ```bash
    git clone https://github.com/your-username/ac-master-pro.git
    cd ac-master-pro
    ```

2.  **安裝套件**
    ```bash
    npm install
    ```

3.  **啟動開發伺服器**
    ```bash
    npm run dev
    ```
    開啟瀏覽器訪問 `http://localhost:5173` 即可看到畫面。

4.  **打包專案**
    ```bash
    npm run build
    ```

## 📥 Excel 匯入格式說明

若要使用「匯入 Excel」功能，請確保您的檔案 (`.xlsx`) 包含以下欄位名稱（標題列）：

| 欄位名稱 | 說明 | 範例 |
| :--- | :--- | :--- |
| **產品名稱** | (必填) 產品完整型號名稱 | 尊榮頂級冷暖系列 |
| **品牌** | 需對應系統設定中的品牌名稱 | 日立 (Hitachi) |
| **樣式** | 壁掛型、窗型等 | 壁掛型 |
| **種類** | 變頻、定速 | 變頻 |
| **管徑** | 銅管尺寸 | 2/3 |
| **環境** | 包含「暖」字自動判斷為冷暖 | 冷暖氣 |
| **室內機尺寸** | 寬 x 高 x 深 | 810 x 300 x 215 mm |
| **室外機尺寸** | 寬 x 高 x 深 | 800 x 550 x 300 mm |
| **價格** | 數字或文字 | 45,900 |
| **備註** | 隱藏欄位，可用於搜尋型號 | RAC-50NK |

> 💡 **提示**：您可以先使用系統右上角的「匯出 Excel」功能下載範本，編輯後再重新匯入。

## 🌍 GitHub Pages 部署

本專案已設定 GitHub Actions 自動化部署流程。

1.  將程式碼推送到 GitHub 的 `main` 或 `master` 分支。
2.  前往 GitHub Repository 的 **Settings** > **Pages**。
3.  在 **Build and deployment** > **Source** 選擇 **GitHub Actions**。
4.  等待 Actions 執行完畢（約 1-2 分鐘），即可獲得線上網址。

### 使用 Vercel 部署（快速且推薦）

如果你想要最簡單的部署體驗，可以直接使用 Vercel：

1.  登入 https://vercel.com 並選擇 "Import Project" → 連結到你的 GitHub repository。
2.  選擇 main 分支並點 Deploy（Vercel 會自動偵測 Vite 並執行 build）。
3.  部署成功後會自動提供一個 .vercel.app 的網址；你也可以綁定自訂網域。

Vercel 的好處：自動化 previews、快速 CDN 發佈、免費 SSL，通常是靜態站點的首選。

---

### 注意（相對路徑設定）

為了能兼容 GitHub Pages（通常會以 /repo/ 為根），本專案在 `vite.config.ts` 已把 `base` 設為 `./`，因此 build 後資源會用相對路徑配置，能正確部署到 GitHub Pages 或其他子路徑靜態站台。

## 🛠️ 技術棧詳細

*   **Framework**: React 18
*   **Language**: TypeScript
*   **Build Tool**: Vite
*   **Styling**: Tailwind CSS
*   **Icons**: Lucide React
*   **Excel Logic**: SheetJS (xlsx)
*   **Image Gen**: html2canvas

## 📄 License

MIT License
