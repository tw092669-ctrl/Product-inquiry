# Google 試算表同步設定教學

## 步驟 1: 準備 Google 試算表

1. 建立或開啟您的 Google 試算表
2. 確保試算表包含以下欄位（第一列為標題）:
   - 產品名稱
   - 品牌
   - 樣式
   - 種類
   - 管徑
   - 建議售價
   - 環境 (填入"暖氣"或"冷氣")
   - 室內機尺寸
   - 室外機尺寸

## 步驟 2: 發布試算表為 Web

### 方法 A: 使用公開連結（簡單但需要公開試算表）

1. 在 Google 試算表中,點擊右上角「共用」
2. 點擊「變更為知道連結的任何人」
3. 選擇「檢視者」權限
4. 複製試算表的 URL
5. 在應用程式設定中貼上 URL 並點擊「同步」

**試算表 URL 格式:**
```
https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit
```

**公開 CSV 格式 URL:**
```
https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/export?format=csv&gid=0
```
（將 `YOUR_SPREADSHEET_ID` 替換為您的試算表 ID）

### 方法 B: 使用 Google Apps Script（推薦,更安全）

1. 在 Google 試算表中,點擊「擴充功能」→「Apps Script」
2. 刪除預設代碼,貼上以下代碼:

```javascript
function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  
  // 將資料轉換為 JSON
  var headers = data[0];
  var jsonData = [];
  
  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      row[headers[j]] = data[i][j];
    }
    jsonData.push(row);
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(jsonData))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. 點擊「部署」→「新增部署作業」
4. 選擇類型「Web 應用程式」
5. 設定:
   - 執行身分: 我
   - 具有存取權的使用者: 任何人
6. 點擊「部署」並授權
7. 複製「Web 應用程式 URL」
8. 在應用程式設定中貼上這個 URL

## 步驟 3: 在應用程式中同步

1. 開啟應用程式的「設定」
2. 找到「Google 試算表同步」區塊
3. 貼上您的試算表 URL（公開 CSV URL 或 Apps Script URL）
4. 點擊「同步資料」按鈕
5. 等待同步完成

## 資料格式範例

| 產品名稱 | 品牌 | 樣式 | 種類 | 管徑 | 建議售價 | 環境 | 室內機尺寸 | 室外機尺寸 |
|---------|------|------|------|------|---------|------|-----------|-----------|
| 冷氣機A | 大金 | 壁掛式 | 變頻 | 1/4 | 25000 | 冷氣 | 900x300x200 | 800x550x300 |
| 暖氣機B | 三菱 | 吊隱式 | 定頻 | 3/8 | 35000 | 暖氣 | 1200x600x250 | 900x700x350 |

## 注意事項

- 品牌、樣式、種類、管徑必須在系統中已經設定
- 如果試算表中的選項不存在,系統會使用預設值
- 建議售價請填入數字（不含貨幣符號）
- 環境欄位只能填"暖氣"或"冷氣"
- 同步會**新增**資料,不會刪除現有產品

## 自動同步（進階）

如果想要定時自動同步,可以在 Google Apps Script 中設定觸發條件:
1. 在 Apps Script 中點擊「觸發條件」（時鐘圖示）
2. 新增觸發條件
3. 選擇執行間隔（例如:每小時）

但請注意:應用程式目前需要手動點擊同步按鈕來更新資料。
