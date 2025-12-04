# 數量欄位邏輯備份

## 邏輯1 (當前版本 - 2025/12/04)

### 核心邏輯
```tsx
<input
  type="number"
  value={quantity === 1 ? '' : quantity}
  onChange={(e) => {
    const inputValue = e.target.value;
    if (inputValue === '') {
      // 空字串時保持為 1,不阻止繼續輸入
      return;
    }
    const newValue = Math.max(0, parseInt(inputValue) || 0);
    if (newValue === 0) {
      // 明確輸入 0 時才觸發刪除警告
      handleUpdateProductQuantity(product.cartItemId, 0);
    } else {
      setProductQuantities(prev => ({ ...prev, [product.cartItemId]: newValue }));
    }
  }}
  onKeyDown={(e) => {
    // 當顯示空字串(實際為1)時,允許直接輸入數字
    if (e.key === '0') {
      e.preventDefault();
      handleUpdateProductQuantity(product.cartItemId, 0);
    }
  }}
  className="w-16 text-center py-1 border border-slate-300 rounded-lg font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
/>
```

### 行為特性

1. **預設數量**: 產品加入報價單時預設數量為 1

2. **顯示邏輯**:
   - 當 `quantity === 1` 時,顯示空字串 (`''`)
   - 當 `quantity !== 1` 時,顯示實際數字

3. **輸入行為**:
   - 空字串狀態: 不觸發任何更新,保持內部值為 1
   - 輸入其他數字: 直接更新數量為該數字
   - 輸入 0: 觸發刪除確認對話框

4. **按鍵處理**:
   - 按下 '0' 鍵: 立即觸發刪除流程 (preventDefault)
   - 其他按鍵: 正常處理

5. **刪除邏輯** (handleUpdateProductQuantity):
```tsx
const handleUpdateProductQuantity = (cartItemId: string, newQuantity: number) => {
  if (newQuantity === 0) {
    const product = products.find(p => p.cartItemId === cartItemId);
    const confirmRemove = window.confirm(`數量設為0，是否從報價單中移除「${product?.name}」？`);
    if (confirmRemove && onRemoveFromCart) {
      onRemoveFromCart(cartItemId);
      // Also remove from quantity tracking
      setProductQuantities(prev => {
        const newQuantities = { ...prev };
        delete newQuantities[cartItemId];
        return newQuantities;
      });
    }
    // 如果取消刪除，不做任何操作，保持數量為 0
  } else {
    setProductQuantities(prev => ({ ...prev, [cartItemId]: Math.max(1, newQuantity) }));
  }
};
```

### 優點
- ✅ 數量為 1 時顯示空字串,方便直接輸入其他數字
- ✅ 不需要先刪除 1 就能輸入新數字
- ✅ 輸入 0 可正常觸發刪除確認
- ✅ 支援獨立的 cartItemId 追蹤,同產品多次加入可獨立操作

### 使用場景
- 快速修改數量: 看到空白欄位直接輸入數字
- 刪除產品: 輸入 0 確認刪除
- 保持為 1: 不輸入任何內容即可

### 檔案位置
- 檔案: `/workspaces/Product-inquiry/App.tsx`
- QuotePage 組件內的產品數量輸入欄位
- 約在 1800-1830 行左右

---

## 備註
此版本可正常運作,已準備好進行下一次邏輯調整。
