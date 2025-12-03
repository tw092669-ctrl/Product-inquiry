import { AppConfig, Product } from './types';

export const INITIAL_CONFIG: AppConfig = {
  brands: [
    { id: 'b1', label: '日立 (Hitachi)', color: '#1e3a8a' }, // Deep Blue
    { id: 'b2', label: '國際牌 (Panasonic)', color: '#005c9c' }, // Panasonic Blue
    { id: 'b3', label: '大金 (Daikin)', color: '#0ea5e9' }, // Cyan/Light Blue
    // New Brands
    { id: 'b5', label: '三菱重工 (Mitsubishi Heavy)', color: '#881337' }, // Dark Rose
    { id: 'b6', label: '三菱電機 (Mitsubishi Electric)', color: '#b91c1c' }, // Red
    { id: 'b7', label: '金鼎 (Jin Ting)', color: '#d97706' }, // Amber/Gold
    { id: 'b8', label: '華菱 (Hawrin)', color: '#047857' }, // Emerald Green
    { id: 'b9', label: '聲寶 (Sampo)', color: '#ea580c' }, // Orange
    { id: 'b10', label: '東元 (Teco)', color: '#0369a1' }, // Deep Sky Blue
    { id: 'b11', label: '格力 (Gree)', color: '#991b1b' }, // Dark Red
    { id: 'b12', label: '大同 (Tatung)', color: '#15803d' }, // Green
    { id: 'b13', label: 'TCL', color: '#dc2626' }, // Red
    { id: 'b14', label: '美的 (Midea)', color: '#1d4ed8' }, // Blue
    { id: 'b15', label: '禾聯 (Heran)', color: '#6d28d9' }, // Violet
    { id: 'b16', label: '三洋 (Sanlux)', color: '#b91c1c' }, // Red
    { id: 'b17', label: '冰點 (Frost)', color: '#0891b2' }, // Cyan
  ],
  styles: [
    { id: 's1', label: '壁掛型', color: '#475569' },
    { id: 's2', label: '埋入型', color: '#475569' },
    { id: 's3', label: '窗型', color: '#475569' },
    { id: 's4', label: '落地型', color: '#475569' },
    { id: 's5', label: '一對多', color: '#475569' },
  ],
  types: [
    { id: 't1', label: '變頻', color: '#059669' },
    { id: 't2', label: '定速', color: '#d97706' },
  ],
  pipes: [
    { id: 'p1', label: '2/3', color: '#64748b' },
    { id: 'p2', label: '2/4', color: '#64748b' },
    { id: 'p3', label: '2/5', color: '#64748b' },
    { id: 'p4', label: '3/5', color: '#64748b' },
    { id: 'p5', label: '3/6', color: '#64748b' },
  ],
};

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: '尊榮頂級冷暖系列',
    brandId: 'b1',
    styleId: 's1',
    typeId: 't1',
    pipeId: 'p1',
    environment: 'heating',
    dimensions: {
      indoor: '810 x 300 x 215 mm',
      outdoor: '800 x 550 x 300 mm'
    },
    price: '45,900',
    remarks: 'RAC-50NK',
    isPinned: true,
    createdAt: Date.now(),
  },
  {
    id: '2',
    name: '標準定速冷專',
    brandId: 'b2',
    styleId: 's3',
    typeId: 't2',
    pipeId: 'p2',
    environment: 'cooling',
    dimensions: {
      indoor: '600 x 400 x 500 mm',
      outdoor: '-'
    },
    price: '22,000',
    remarks: 'CW-P22CA2',
    isPinned: false,
    createdAt: Date.now() - 10000,
  }
];