import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { Product, AppConfig } from './types';

// Generate a random ID
export const generateId = () => Math.random().toString(36).substr(2, 9);

// Export Card to Image
export const exportToImage = async (elementId: string, fileName: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  try {
    const canvas = await html2canvas(element, { 
      backgroundColor: '#ffffff',
      scale: 2 // High resolution
    });
    const link = document.createElement('a');
    link.download = `${fileName}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (err) {
    console.error("Export failed", err);
    alert("圖片匯出失敗");
  }
};

// Parse Excel Import
export const parseExcel = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet);
        resolve(json);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

// Export Data to Excel
export const exportToExcel = (products: Product[], config: AppConfig) => {
  try {
    // Transform data to human-readable format matching import logic
    const data = products.map(p => ({
      '產品名稱': p.name,
      '品牌': config.brands.find(b => b.id === p.brandId)?.label || '',
      '樣式': config.styles.find(s => s.id === p.styleId)?.label || '',
      '種類': config.types.find(t => t.id === p.typeId)?.label || '',
      '管徑': config.pipes.find(pi => pi.id === p.pipeId)?.label || '',
      '環境': p.environment === 'heating' ? '暖氣' : '冷氣',
      '室內機尺寸': p.dimensions.indoor,
      '室外機尺寸': p.dimensions.outdoor,
      '價格': p.price,
      '備註': p.remarks,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "產品清單");
    
    // Auto-width columns
    const max_width = data.reduce((w, r) => Math.max(w, r['產品名稱'].length), 10);
    worksheet["!cols"] = [ { wch: max_width + 5 } ];

    XLSX.writeFile(workbook, `AC_Master_Products_${new Date().toISOString().split('T')[0]}.xlsx`);
  } catch (error) {
    console.error("Export Excel failed", error);
    alert("Excel 匯出失敗");
  }
};

// Helper to find ID by label for imports
export const findOptionId = (label: string, options: any[]) => {
  const found = options.find(o => o.label === label);
  return found ? found.id : null;
}