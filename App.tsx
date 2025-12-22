import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, Minus, Settings, Pin, Trash2, Edit2, Download, 
  Sun, Snowflake, Upload, X, Save, AlertTriangle, Menu,
  LayoutGrid, List, Grid3x3, Home, Trees, BarChart3, ChevronDown, ChevronUp,
  Package, DollarSign, TrendingUp, PieChart, Zap, FileDown, Calculator, Scale, CheckCircle2, ArrowRightLeft, ChevronLeft, ChevronRight, ShoppingCart
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { Product, AppConfig, ConfigOption, EnvironmentType } from './types';
import { INITIAL_CONFIG, MOCK_PRODUCTS } from './constants';
import { generateId, exportToImage, parseExcel, findOptionId, exportToExcel } from './utils';

// --- Components ---

// 0. Dashboard Component
const Dashboard = ({ 
  products, 
  config,
  isOpen,
  onToggle
}: { 
  products: Product[]; 
  config: AppConfig;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const stats = useMemo(() => {
    const total = products.length;
    const pinned = products.filter(p => p.isPinned).length;
    const heating = products.filter(p => p.environment === 'heating').length;
    const cooling = products.filter(p => p.environment === 'cooling').length;
    
    // Calculate Average Price
    let totalPrice = 0;
    let priceCount = 0;
    products.forEach(p => {
      const priceVal = parseInt(p.price.toString().replace(/,/g, ''), 10);
      if (!isNaN(priceVal)) {
        totalPrice += priceVal;
        priceCount++;
      }
    });
    const avgPrice = priceCount > 0 ? Math.round(totalPrice / priceCount).toLocaleString() : '0';

    // Brand Distribution
    const brandCounts: Record<string, number> = {};
    products.forEach(p => { brandCounts[p.brandId] = (brandCounts[p.brandId] || 0) + 1 });
    const brandStats = config.brands.map(b => ({
      ...b,
      count: brandCounts[b.id] || 0,
      percent: total ? ((brandCounts[b.id] || 0) / total) * 100 : 0
    })).filter(b => b.count > 0).sort((a,b) => b.count - a.count);

    // Dominant Style Logic
    const styleCounts: Record<string, number> = {};
    products.forEach(p => { styleCounts[p.styleId] = (styleCounts[p.styleId] || 0) + 1 });
    let dominantStyle = { label: '無資料', count: 0, percent: 0 };
    
    if (total > 0) {
        let maxCount = 0;
        let maxStyleId = '';
        Object.entries(styleCounts).forEach(([id, count]) => {
            if (count > maxCount) {
                maxCount = count;
                maxStyleId = id;
            }
        });
        const styleObj = config.styles.find(s => s.id === maxStyleId);
        if (styleObj) {
            dominantStyle = {
                label: styleObj.label,
                count: maxCount,
                percent: (maxCount / total) * 100
            };
        }
    }

    return { total, pinned, heating, cooling, avgPrice, brandStats, dominantStyle };
  }, [products, config]);

  return (
    <div className="mb-8 bg-gradient-to-br from-slate-900 to-black backdrop-blur-sm rounded-3xl shadow-2xl shadow-amber-500/20 border-2 border-amber-500/30 overflow-hidden transition-all duration-300">
      {/* Header / Toggle */}
      <div 
        onClick={onToggle}
        className="bg-gradient-to-r from-black via-slate-900 to-black p-6 flex justify-between items-center cursor-pointer hover:from-slate-900 hover:via-slate-800 hover:to-slate-900 transition-all border-b-2 border-amber-500/30 group"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-amber-500 to-yellow-600 text-black rounded-2xl group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/50">
             <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500 block">產品分析 📊</span>
            <span className="text-sm text-amber-400/70 font-medium">即時庫存概況分析</span>
          </div>
        </div>
        <button className="p-2 bg-amber-500/20 rounded-full text-amber-400 group-hover:text-amber-300 transition-colors shadow-sm border border-amber-500/30">
          {isOpen ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
        </button>
      </div>

      {/* Content */}
      <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-6">
          {/* Top Row: Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
            {/* Total Products */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-black rounded-3xl p-6 text-white shadow-2xl shadow-amber-500/30 group hover:-translate-y-1 hover:shadow-amber-500/50 transition-all border-2 border-amber-500/30">
              <div className="absolute -top-6 -right-6 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-125">
                <Package className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3 text-amber-400">
                  <Package className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">總產品數</span>
                </div>
                <div className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">{stats.total}</div>
                <div className="mt-3 text-sm text-amber-400 font-medium bg-amber-500/20 inline-block px-3 py-1 rounded-full border border-amber-500/30">
                  {stats.pinned} 個釘選項目
                </div>
              </div>
            </div>
            
            {/* Heating */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-black rounded-3xl p-6 text-white shadow-2xl shadow-amber-500/30 group hover:-translate-y-1 hover:shadow-amber-500/50 transition-all border-2 border-amber-500/30">
              <div className="absolute -bottom-4 -right-4 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform rotate-12">
                <Sun className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3 text-amber-400">
                  <Sun className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">暖氣功能</span>
                </div>
                <div className="flex items-end gap-2">
                  <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">{stats.heating}</div>
                  <div className="text-base font-medium text-amber-400/90 mb-1">台</div>
                </div>
                <div className="w-full bg-amber-500/20 h-2 rounded-full mt-4 overflow-hidden shadow-inner border border-amber-500/30">
                  <div className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all duration-500" style={{ width: `${stats.total ? (stats.heating/stats.total)*100 : 0}%` }}></div>
                </div>
              </div>
            </div>

            {/* Cooling */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-black rounded-3xl p-6 text-white shadow-2xl shadow-amber-500/30 group hover:-translate-y-1 hover:shadow-amber-500/50 transition-all border-2 border-amber-500/30">
               <div className="absolute -top-4 -right-4 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform -rotate-12">
                <Snowflake className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3 text-amber-400">
                  <Snowflake className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">冷氣專用</span>
                </div>
                 <div className="flex items-end gap-2">
                  <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">{stats.cooling}</div>
                  <div className="text-base font-medium text-amber-400/90 mb-1">台</div>
                </div>
                 <div className="w-full bg-amber-500/20 h-2 rounded-full mt-4 overflow-hidden shadow-inner border border-amber-500/30">
                  <div className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all duration-500" style={{ width: `${stats.total ? (stats.cooling/stats.total)*100 : 0}%` }}></div>
                </div>
              </div>
            </div>

             {/* Dominant Style (Replaced Avg Price) */}
             <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-black rounded-3xl p-6 text-white shadow-2xl shadow-amber-500/30 group hover:-translate-y-1 hover:shadow-amber-500/50 transition-all border-2 border-amber-500/30">
               <div className="absolute top-1/2 right-2 transform -translate-y-1/2 opacity-10 group-hover:opacity-20">
                <LayoutGrid className="w-20 h-20" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3 text-amber-400">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">主流樣式</span>
                </div>
                <div className="text-2xl font-black tracking-tight truncate mb-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">{stats.dominantStyle.label}</div>
                <div className="mt-3 text-sm text-amber-400 font-medium">
                  佔庫存 {Math.round(stats.dominantStyle.percent)}% ({stats.dominantStyle.count}台)
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Brand Distribution */}
          <div className="bg-gradient-to-br from-slate-900 to-black rounded-3xl p-6 border-2 border-amber-500/30 shadow-2xl">
            <h4 className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500 mb-4 flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-yellow-600 text-black rounded-xl shadow-md">
                <PieChart className="w-5 h-5" /> 
              </div>
              品牌佔比分佈 🎉
            </h4>
            
            <div className="h-8 w-full bg-black rounded-full overflow-hidden flex shadow-lg mb-5 border-2 border-amber-500/30">
              {stats.brandStats.map((brand, index) => (
                <div 
                  key={brand.id}
                  className="h-full transition-all hover:brightness-125 hover:scale-y-110 relative group first:rounded-l-full last:rounded-r-full"
                  style={{ width: `${brand.percent}%`, backgroundColor: brand.color }}
                >
                   <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-amber-400 text-xs py-1.5 px-3 rounded-lg whitespace-nowrap z-10 pointer-events-none shadow-xl border border-amber-500/30">
                    {brand.label}: {Math.round(brand.percent)}%
                   </div>
                </div>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-3">
              {stats.brandStats.map(brand => (
                <div key={brand.id} className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full border-2 border-amber-500/30 shadow-md hover:shadow-amber-500/30 transition-all hover:-translate-y-0.5">
                  <div className="w-4 h-4 rounded-full shadow-md border border-amber-500/30" style={{ backgroundColor: brand.color }} />
                  <span className="text-sm font-bold text-amber-400">{brand.label}</span>
                  <span className="text-sm font-black text-black bg-gradient-to-r from-amber-400 to-yellow-500 px-2.5 py-0.5 rounded-full">{Math.round(brand.percent)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 1. Settings Modal
const SettingsModal = ({ 
  isOpen, 
  onClose, 
  config, 
  onSaveConfig,
  products,
  onImport,
  googleSheetUrl,
  setGoogleSheetUrl,
  onGoogleSheetSync,
  isSyncing,
  autoSync,
  setAutoSync,
  maxDisplayCards,
  setMaxDisplayCards,
  filteredProducts
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  config: AppConfig; 
  onSaveConfig: (newConfig: AppConfig) => void;
  products: Product[];
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  googleSheetUrl: string;
  setGoogleSheetUrl: (url: string) => void;
  onGoogleSheetSync: (url?: string) => void;
  isSyncing: boolean;
  autoSync: boolean;
  setAutoSync: (value: boolean) => void;
  maxDisplayCards: number;
  setMaxDisplayCards: (value: number) => void;
  filteredProducts: Product[];
}) => {
  const [localConfig, setLocalConfig] = useState<AppConfig>(config);
  const [activeTab, setActiveTab] = useState<keyof AppConfig>('brands');

  // Sync when opening
  useEffect(() => {
    if (isOpen) setLocalConfig(config);
  }, [isOpen, config]);

  const handleAddOption = (category: keyof AppConfig) => {
    const newOption: ConfigOption = {
      id: generateId(),
      label: '新選項',
      color: '#000000'
    };
    setLocalConfig(prev => ({
      ...prev,
      [category]: [...prev[category], newOption]
    }));
  };

  const handleRemoveOption = (category: keyof AppConfig, id: string) => {
    if (window.confirm('確定要刪除此選項嗎？')) {
      setLocalConfig(prev => ({
        ...prev,
        [category]: prev[category].filter(opt => opt.id !== id)
      }));
    }
  };

  const handleUpdateOption = (category: keyof AppConfig, id: string, field: 'label' | 'color', value: string) => {
    setLocalConfig(prev => ({
      ...prev,
      [category]: prev[category].map(opt => opt.id === id ? { ...opt, [field]: value } : opt)
    }));
  };

  if (!isOpen) return null;

  const tabs: {key: keyof AppConfig, label: string}[] = [
    { key: 'brands', label: '品牌' },
    { key: 'styles', label: '樣式' },
    { key: 'types', label: '種類' },
    { key: 'pipes', label: '管徑' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <Settings className="w-5 h-5" />
            </div>
            選項設定
          </h2>
          <div className="flex items-center gap-2">
            {/* Import Excel Button */}
            <div className="relative group">
              <input 
                type="file" 
                accept=".xlsx, .xls, .csv" 
                onChange={onImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              />
              <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="匯入 Excel">
                <Upload className="w-5 h-5" />
              </button>
            </div>
            {/* Export Excel Button */}
            <button 
              onClick={() => exportToExcel(products, config)}
              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
              title="匯出 Excel (備份)"
            >
              <FileDown className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition"><X className="w-5 h-5" /></button>
          </div>
        </div>
        
        <div className="flex border-b overflow-x-auto bg-slate-50/50">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-4 font-medium whitespace-nowrap transition-all relative ${
                activeTab === tab.key 
                  ? 'text-indigo-600 bg-white' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"></div>
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
          <div className="space-y-3">
            {localConfig[activeTab].map(option => (
              <div key={option.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition group">
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 relative shadow-inner">
                  <input 
                    type="color" 
                    value={option.color}
                    onChange={(e) => handleUpdateOption(activeTab, option.id, 'color', e.target.value)}
                    className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer p-0 border-0"
                    title="更改字體顏色"
                  />
                </div>
                
                <input 
                  type="text" 
                  value={option.label}
                  onChange={(e) => handleUpdateOption(activeTab, option.id, 'label', e.target.value)}
                  className="flex-1 border-gray-200 bg-transparent font-medium rounded-md focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 text-slate-700"
                  style={{ color: option.color }}
                />
                <button 
                  onClick={() => handleRemoveOption(activeTab, option.id)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                  title="刪除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button 
            onClick={() => handleAddOption(activeTab)}
            className="mt-6 w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition flex items-center justify-center gap-2 font-medium"
          >
            <Plus className="w-4 h-4" /> 新增{tabs.find(t => t.key === activeTab)?.label}
          </button>

          {/* Google Sheets Sync Section */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg">
                <Upload className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800">Google 試算表同步</h3>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              輸入 Google 試算表的公開 URL 或 Apps Script Web URL，點擊同步即可自動匯入資料。
              <a href="/GOOGLE_SHEETS_SETUP.md" target="_blank" className="text-indigo-600 hover:underline ml-1">查看設定教學</a>
            </p>
            
            {/* 自動同步開關 */}
            <div className="mb-3 flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer flex-1">
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={(e) => setAutoSync(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-slate-700">
                  啟用自動同步
                </span>
              </label>
              <span className="text-xs text-slate-500">
                開啟後每次載入應用程式時自動同步
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={googleSheetUrl}
                onChange={(e) => {
                  const newUrl = e.target.value;
                  setGoogleSheetUrl(newUrl);
                  // 如果清空 URL，自動停用自動同步
                  if (!newUrl.trim() && autoSync) {
                    setAutoSync(false);
                    localStorage.setItem('autoSync', 'false');
                  }
                }}
                placeholder="貼上 Google 試算表 URL..."
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
              <button
                onClick={() => onGoogleSheetSync(googleSheetUrl)}
                disabled={isSyncing || !googleSheetUrl.trim()}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition font-medium text-sm flex items-center gap-2"
              >
                {isSyncing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    同步中...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    同步資料
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 顯示卡片數量設定 */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                <LayoutGrid className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800">顯示設定</h3>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-slate-700 whitespace-nowrap">
                最大顯示產品數量：
              </label>
              <input
                type="number"
                min="1"
                max="999"
                value={maxDisplayCards}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (!isNaN(value) && value > 0) {
                    setMaxDisplayCards(value);
                  }
                }}
                className="w-24 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
              <span className="text-xs text-slate-500">
                目前顯示 {Math.min(filteredProducts.length, maxDisplayCards)} / {filteredProducts.length} 張卡片
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-white flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition font-medium">取消</button>
          <button 
            onClick={() => { 
              onSaveConfig(localConfig); 
              // 保存 Google Sheet URL 和自動同步設定
              localStorage.setItem('googleSheetUrl', googleSheetUrl);
              localStorage.setItem('autoSync', autoSync.toString());
              localStorage.setItem('maxDisplayCards', maxDisplayCards.toString());
              onClose(); 
            }}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 hover:brightness-110 transition font-medium"
          >
            儲存設定
          </button>
        </div>
      </div>
    </div>
  );
};

// 2. Product Form Modal
const ProductForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  config
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Product, 'id' | 'createdAt' | 'isPinned'>) => void;
  initialData?: Product;
  config: AppConfig;
}) => {
  const [formData, setFormData] = useState({
    name: '',
    brandId: '',
    styleId: '',
    typeId: '',
    pipeId: '',
    environment: 'cooling' as EnvironmentType,
    dimensions: { indoor: '', outdoor: '' },
    price: '',
    remarks: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // 將 pipeId 轉換為顯示值（如果是ID則顯示label，否則直接顯示）
        const pipeOpt = config.pipes.find(p => p.id === initialData.pipeId);
        const pipeValue = pipeOpt ? pipeOpt.label : initialData.pipeId;
        
        setFormData({
          name: initialData.name,
          brandId: initialData.brandId,
          styleId: initialData.styleId,
          typeId: initialData.typeId,
          pipeId: pipeValue,
          environment: initialData.environment,
          dimensions: initialData.dimensions || { indoor: '', outdoor: '' },
          price: initialData.price.toString(),
          remarks: initialData.remarks
        });
      } else {
        // Reset defaults
        setFormData({
          name: '',
          brandId: config.brands[0]?.id || '',
          styleId: config.styles[0]?.id || '',
          typeId: config.types[0]?.id || '',
          pipeId: config.pipes[0]?.label || '',
          environment: 'cooling',
          dimensions: { indoor: '', outdoor: '' },
          price: '',
          remarks: ''
        });
      }
    }
  }, [isOpen, initialData, config]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg my-8 flex flex-col">
        <div className="p-6 border-b bg-gradient-to-r from-slate-50 to-white rounded-t-3xl">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
               {initialData ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            {initialData ? '編輯產品' : '新增產品'}
          </h2>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="p-8 space-y-6">
          
          {/* Environment (Sun/Snow/Indoor Unit) */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">環境功能 (選擇圖示)</label>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setFormData({...formData, environment: 'heating'})}
                className={`group relative py-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
                  formData.environment === 'heating' 
                    ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-md shadow-orange-500/10' 
                    : 'border-slate-100 text-slate-400 hover:border-orange-200 hover:bg-orange-50/50'
                }`}
              >
                <div className={`p-2 rounded-full transition-colors ${formData.environment === 'heating' ? 'bg-orange-100' : 'bg-slate-100 group-hover:bg-orange-100'}`}>
                   <Sun className="w-6 h-6" />
                </div>
                <span className="font-medium text-xs">暖氣</span>
                {formData.environment === 'heating' && <div className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />}
              </button>

              <button
                type="button"
                onClick={() => setFormData({...formData, environment: 'cooling'})}
                className={`group relative py-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
                  formData.environment === 'cooling' 
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-600 shadow-md shadow-cyan-500/10' 
                    : 'border-slate-100 text-slate-400 hover:border-cyan-200 hover:bg-cyan-50/50'
                }`}
              >
                <div className={`p-2 rounded-full transition-colors ${formData.environment === 'cooling' ? 'bg-cyan-100' : 'bg-slate-100 group-hover:bg-cyan-100'}`}>
                  <Snowflake className="w-6 h-6" />
                </div>
                <span className="font-medium text-xs">冷氣</span>
                {formData.environment === 'cooling' && <div className="absolute top-2 right-2 w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />}
              </button>

              <button
                type="button"
                onClick={() => setFormData({...formData, environment: 'indoor-unit'})}
                className={`group relative py-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
                  formData.environment === 'indoor-unit' 
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-600 shadow-md shadow-indigo-500/10' 
                    : 'border-slate-100 text-slate-400 hover:border-indigo-200 hover:bg-indigo-50/50'
                }`}
              >
                <div className={`p-2 rounded-full transition-colors ${formData.environment === 'indoor-unit' ? 'bg-indigo-100' : 'bg-slate-100 group-hover:bg-indigo-100'}`}>
                   <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                     <rect x="3" y="6" width="18" height="10" rx="2" />
                     <path d="M3 10h18" />
                     <path d="M7 14h2M11 14h2M15 14h2" strokeLinecap="round" />
                     <path d="M12 16v2" strokeLinecap="round" />
                   </svg>
                </div>
                <span className="font-medium text-xs">內機</span>
                {formData.environment === 'indoor-unit' && <div className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">產品名稱</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border bg-slate-50/50 transition-colors" placeholder="輸入產品名稱" />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">品牌</label>
              <select required value={formData.brandId} onChange={e => setFormData({...formData, brandId: e.target.value})} className="w-full rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border bg-white">
                {config.brands.map(opt => <option key={opt.id} value={opt.id} style={{color: opt.color}}>{opt.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">樣式</label>
              <select required value={formData.styleId} onChange={e => setFormData({...formData, styleId: e.target.value})} className="w-full rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border bg-white">
                {config.styles.map(opt => <option key={opt.id} value={opt.id} style={{color: opt.color}}>{opt.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">種類</label>
              <select required value={formData.typeId} onChange={e => setFormData({...formData, typeId: e.target.value})} className="w-full rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border bg-white">
                {config.types.map(opt => <option key={opt.id} value={opt.id} style={{color: opt.color}}>{opt.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">管徑</label>
              <input 
                required 
                type="text"
                list="pipe-options"
                value={formData.pipeId} 
                onChange={e => setFormData({...formData, pipeId: e.target.value})} 
                className="w-full rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border bg-white"
                placeholder="選擇或輸入管徑"
              />
              <datalist id="pipe-options">
                {config.pipes.map(opt => <option key={opt.id} value={opt.label}>{opt.label}</option>)}
              </datalist>
            </div>
          </div>

          {/* Optimized Dimensions Input */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
            <label className="block text-sm font-bold text-slate-700 mb-3">機體尺寸 (寬x高x深)</label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-indigo-500 shadow-sm" title="室內機">
                  <Home className="w-5 h-5" />
                </div>
                <input 
                  type="text" 
                  value={formData.dimensions.indoor} 
                  onChange={e => setFormData({...formData, dimensions: {...formData.dimensions, indoor: e.target.value}})} 
                  className="flex-1 rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border text-sm" 
                  placeholder="輸入室內機尺寸" 
                />
              </div>
              <div className="flex items-center gap-3">
                 <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-emerald-500 shadow-sm" title="室外機">
                  <Trees className="w-5 h-5" />
                </div>
                <input 
                  type="text" 
                  value={formData.dimensions.outdoor} 
                  onChange={e => setFormData({...formData, dimensions: {...formData.dimensions, outdoor: e.target.value}})} 
                  className="flex-1 rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border text-sm" 
                  placeholder="輸入室外機尺寸" 
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">價格</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-500">$</span>
              </div>
              <input type="text" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full pl-7 rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border font-mono text-lg font-semibold" placeholder="0" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">備註 (搜尋用型號)</label>
            <textarea value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} className="w-full rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border h-24" placeholder="輸入型號或其他備註..."></textarea>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-4">
            <button type="button" onClick={onClose} className="px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-xl transition font-medium">取消</button>
            <button type="submit" className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 hover:brightness-110 transition font-bold flex items-center gap-2">
              <Save className="w-4 h-4" /> 儲存產品
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 2.5 Misc Item Form Modal
const MiscItemForm = ({
  isOpen,
  onClose,
  onSave,
  category
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; specification: string; unit: string; price: string; remarks: string }) => void;
  category: 'air-conditioning' | 'materials' | 'tools' | 'high-altitude';
}) => {
  const [formData, setFormData] = useState({
    name: '',
    specification: '',
    unit: '',
    price: '',
    remarks: ''
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({ name: '', specification: '', unit: '', price: '', remarks: '' });
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('請輸入項目名稱');
      return;
    }
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  const categoryLabels = {
    'air-conditioning': '空調',
    'materials': '材料',
    'tools': '工具',
    'high-altitude': '高空'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-8 border border-slate-100 animate-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-3xl">
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <Plus className="w-7 h-7" />
            新增{categoryLabels[category]}項目
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">項目名稱 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border"
              placeholder="輸入項目名稱..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">規格</label>
            <input
              type="text"
              value={formData.specification}
              onChange={e => setFormData({...formData, specification: e.target.value})}
              className="w-full rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border"
              placeholder="輸入規格..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">單位</label>
              <input
                type="text"
                value={formData.unit}
                onChange={e => setFormData({...formData, unit: e.target.value})}
                className="w-full rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border"
                placeholder="例: 個、組、米..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">價格</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-500">$</span>
                </div>
                <input
                  type="text"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                  className="w-full pl-7 rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border font-mono text-lg font-semibold"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">備註</label>
            <textarea
              value={formData.remarks}
              onChange={e => setFormData({...formData, remarks: e.target.value})}
              className="w-full rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border h-24"
              placeholder="輸入備註..."
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-xl transition font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 hover:brightness-110 transition font-bold flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> 儲存項目
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 3. Confirm Modal
const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  title: string; 
  message: string; 
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200 border-t-4 border-red-500">
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-5 text-red-500 shadow-sm">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
          <p className="text-slate-500 mb-8 leading-relaxed">{message}</p>
          <div className="flex gap-3 w-full">
            <button onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 font-bold transition">取消</button>
            <button onClick={onConfirm} className="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg hover:shadow-red-500/30 font-bold transition">確認刪除</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 4. BTU Calculator Modal
const BTUModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [pings, setPings] = useState<string>('');
  const [factors, setFactors] = useState({ topFloor: false, westSun: false, heatSource: false });

  if (!isOpen) return null;

  // 1 Ping approx 450 kcal/hr normal, add 20% for each factor
  const calculateBTU = () => {
    const p = parseFloat(pings);
    if (!p) return { kw: 0, kcal: 0 };
    
    let baseKcal = 600; // base cooling capacity per ping
    if (factors.topFloor) baseKcal *= 1.2;
    if (factors.westSun) baseKcal *= 1.2;
    if (factors.heatSource) baseKcal *= 1.2;

    const totalKcal = Math.round(p * baseKcal);
    const kw = (totalKcal / 860).toFixed(1); // 1 KW = 860 kcal/hr
    
    return { kw, kcal: totalKcal };
  };

  const result = calculateBTU();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Calculator className="w-5 h-5"/></div>
            冷房能力試算
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
        </div>

        <div className="space-y-4">
           <div>
             <label className="block text-sm font-bold text-slate-700 mb-2">房間坪數</label>
             <input 
               type="number" 
               value={pings} 
               onChange={e => setPings(e.target.value)}
               className="w-full rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border text-lg" 
               placeholder="例如：5"
               autoFocus
             />
           </div>
           
           <div className="space-y-2">
             <label className="block text-sm font-bold text-slate-700">環境因素 (多選)</label>
             <div className="grid grid-cols-2 gap-3">
               <button onClick={() => setFactors({...factors, topFloor: !factors.topFloor})} className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-medium transition ${factors.topFloor ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 text-slate-500'}`}>
                 頂樓
               </button>
               <button onClick={() => setFactors({...factors, westSun: !factors.westSun})} className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-medium transition ${factors.westSun ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 text-slate-500'}`}>
                 西曬
               </button>
               <button onClick={() => setFactors({...factors, heatSource: !factors.heatSource})} className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-medium transition ${factors.heatSource ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 text-slate-500'}`}>
                 熱源多 (廚房/人多)
               </button>
             </div>
           </div>

           {result.kcal > 0 && (
             <div className="mt-6 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl p-5 text-white shadow-lg shadow-indigo-500/30">
               <div className="text-indigo-100 text-sm font-medium mb-1">建議規格</div>
               <div className="text-3xl font-black mb-1">{result.kw} kW</div>
               <div className="text-indigo-200 text-sm">約 {result.kcal} kcal/hr</div>
             </div>
           )}

           <p className="text-xs text-slate-400 mt-4 text-center">
             * 試算結果僅供參考，實際需求請依現場丈量為主。
           </p>
        </div>
      </div>
    </div>
  );
};

// 5. Comparison Modal
const ComparisonModal = ({ isOpen, onClose, products, config }: { isOpen: boolean, onClose: () => void, products: Product[], config: AppConfig }) => {
  if (!isOpen || products.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-5xl h-[95vh] sm:h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        <div className="p-3 sm:p-6 border-b flex justify-between items-center bg-gradient-to-r from-slate-50 to-white rounded-t-2xl sm:rounded-t-3xl">
          <h3 className="text-base sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span>產品比較</span>
          </h3>
          <button onClick={onClose} className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-full transition"><X className="w-5 h-5 sm:w-6 sm:h-6 text-slate-500"/></button>
        </div>

        <div className="flex-1 overflow-auto p-2 sm:p-6">
          <table className="w-full text-left border-collapse text-sm sm:text-base">
            <thead>
              <tr>
                <th className="p-2 sm:p-4 border-b border-slate-200 w-20 sm:w-32 bg-slate-50 sticky top-0 z-10 text-slate-500 font-medium text-xs sm:text-sm">項目</th>
                {products.map(p => (
                  <th key={p.id} className="p-2 sm:p-4 border-b border-slate-200 min-w-[140px] sm:min-w-[200px] bg-slate-50 sticky top-0 z-10">
                    <div className="font-bold text-sm sm:text-lg text-slate-800 line-clamp-2 break-words">{p.name}</div>
                    <div className="text-xs sm:text-sm font-normal text-slate-500">{config.brands.find(b => b.id === p.brandId)?.label}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               <tr>
                <td className="p-2 sm:p-4 font-bold text-slate-600 bg-slate-50/50 text-xs sm:text-base">環境</td>
                {products.map(p => (
                  <td key={p.id} className="p-2 sm:p-4">
                    <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold ${p.environment === 'heating' ? 'bg-orange-100 text-orange-600' : 'bg-cyan-100 text-cyan-600'}`}>
                       {p.environment === 'heating' ? <Sun className="w-2.5 h-2.5 sm:w-3 sm:h-3"/> : <Snowflake className="w-2.5 h-2.5 sm:w-3 sm:h-3"/>}
                       {p.environment === 'heating' ? '暖氣' : '冷氣'}
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-2 sm:p-4 font-bold text-slate-600 bg-slate-50/50 text-xs sm:text-base">售價</td>
                {products.map(p => (
                  <td key={p.id} className="p-2 sm:p-4 font-mono font-bold text-sm sm:text-xl text-emerald-600 break-words">
                    ${p.price}
                  </td>
                ))}
              </tr>
               <tr>
                <td className="p-2 sm:p-4 font-bold text-slate-600 bg-slate-50/50 text-xs sm:text-base">樣式</td>
                {products.map(p => (
                   <td key={p.id} className="p-2 sm:p-4 text-xs sm:text-base break-words">{config.styles.find(s => s.id === p.styleId)?.label}</td>
                ))}
              </tr>
              <tr>
                <td className="p-2 sm:p-4 font-bold text-slate-600 bg-slate-50/50 text-xs sm:text-base">種類</td>
                {products.map(p => (
                   <td key={p.id} className="p-2 sm:p-4 text-xs sm:text-base break-words">{config.types.find(t => t.id === p.typeId)?.label}</td>
                ))}
              </tr>
              <tr>
                <td className="p-2 sm:p-4 font-bold text-slate-600 bg-slate-50/50 text-xs sm:text-base">管徑</td>
                {products.map(p => (
                   <td key={p.id} className="p-2 sm:p-4 text-xs sm:text-base break-words">{config.pipes.find(t => t.id === p.pipeId)?.label}</td>
                ))}
              </tr>
               <tr>
                <td className="p-2 sm:p-4 font-bold text-slate-600 bg-slate-50/50 text-xs sm:text-base">室內機</td>
                {products.map(p => (
                   <td key={p.id} className="p-2 sm:p-4 font-mono text-[10px] sm:text-sm break-all">{p.dimensions.indoor || '-'}</td>
                ))}
              </tr>
               <tr>
                <td className="p-2 sm:p-4 font-bold text-slate-600 bg-slate-50/50 text-xs sm:text-base">室外機</td>
                {products.map(p => (
                   <td key={p.id} className="p-2 sm:p-4 font-mono text-[10px] sm:text-sm break-all">{p.dimensions.outdoor || '-'}</td>
                ))}
              </tr>
              <tr>
                <td className="p-2 sm:p-4 font-bold text-slate-600 bg-slate-50/50 text-xs sm:text-base">備註</td>
                {products.map(p => (
                   <td key={p.id} className="p-2 sm:p-4 text-xs sm:text-sm text-slate-500 break-words">{p.remarks}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 6. Quote Page Component
const QuotePage = ({ 
  products, 
  config, 
  onBack,
  onRemoveFromCart
}: { 
  products: (Product & { cartItemId: string })[]; 
  config: AppConfig; 
  onBack: () => void;
  onRemoveFromCart?: (cartItemId: string) => void;
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [quoteDate, setQuoteDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [quoteTitle, setQuoteTitle] = useState('冷氣估價單');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  
  // Product price adjustments
  const [productPrices, setProductPrices] = useState<Record<string, string>>(() => {
    const initialPrices: Record<string, string> = {};
    products.forEach(p => {
      initialPrices[p.cartItemId] = p.price.toString();
    });
    return initialPrices;
  });
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  
  // Product quantities
  const [productQuantities, setProductQuantities] = useState<Record<string, number>>(() => {
    const initialQuantities: Record<string, number> = {};
    products.forEach(p => {
      initialQuantities[p.cartItemId] = 1;
    });
    return initialQuantities;
  });
  const [editingQuantityId, setEditingQuantityId] = useState<string | null>(null);
  const [tempQuantityInput, setTempQuantityInput] = useState<string>('');
  
  const handleUpdateProductPrice = (cartItemId: string, newPrice: string) => {
    setProductPrices(prev => ({ ...prev, [cartItemId]: newPrice }));
  };
  
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
  
  // Calculator state
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcPrevValue, setCalcPrevValue] = useState<string | null>(null);
  const [calcOperation, setCalcOperation] = useState<string | null>(null);
  const [calcNewNumber, setCalcNewNumber] = useState(true);
  
  // Pipe & Wire Calculator state
  const [showPipeWireCalc, setShowPipeWireCalc] = useState(false);
  const [pipeWireItems, setPipeWireItems] = useState({
    // 4種管路
    pipe_2_3: { name: '2/3 管路', quantity: 0, unitPrice: 400 },
    pipe_2_4: { name: '2/4 管路', quantity: 0, unitPrice: 450 },
    pipe_2_5: { name: '2/5 管路', quantity: 0, unitPrice: 500 },
    pipe_3_5: { name: '3/5 管路', quantity: 0, unitPrice: 550 },
    // 2種訊號線
    signal_2core: { name: '2C隔離線', quantity: 0, unitPrice: 100 },
    signal_3core: { name: '1.25*4C訊號線', quantity: 0, unitPrice: 50 },
    // 3種電源線
    power_2mm: { name: '2.0mm電源線', quantity: 0, unitPrice: 120 },
    power_3_5mm: { name: '3.5mm電源線', quantity: 0, unitPrice: 150 },
    power_5_5mm: { name: '5.5mm電源線', quantity: 0, unitPrice: 200 },
  });
  
  const handleCalcNumber = (num: string) => {
    if (calcNewNumber) {
      setCalcDisplay(num);
      setCalcNewNumber(false);
    } else {
      setCalcDisplay(calcDisplay === '0' ? num : calcDisplay + num);
    }
  };
  
  const handleCalcOperation = (op: string) => {
    const current = parseFloat(calcDisplay);
    
    if (calcPrevValue === null) {
      setCalcPrevValue(calcDisplay);
    } else if (calcOperation) {
      const prev = parseFloat(calcPrevValue);
      let result = 0;
      
      switch (calcOperation) {
        case '+': result = prev + current; break;
        case '-': result = prev - current; break;
        case '×': result = prev * current; break;
        case '÷': result = prev / current; break;
      }
      
      setCalcDisplay(result.toString());
      setCalcPrevValue(result.toString());
    }
    
    setCalcOperation(op);
    setCalcNewNumber(true);
  };
  
  const handleCalcEquals = () => {
    if (calcOperation && calcPrevValue !== null) {
      const prev = parseFloat(calcPrevValue);
      const current = parseFloat(calcDisplay);
      let result = 0;
      
      switch (calcOperation) {
        case '+': result = prev + current; break;
        case '-': result = prev - current; break;
        case '×': result = prev * current; break;
        case '÷': result = prev / current; break;
      }
      
      setCalcDisplay(result.toString());
      setCalcPrevValue(null);
      setCalcOperation(null);
      setCalcNewNumber(true);
    }
  };
  
  const handleCalcClear = () => {
    setCalcDisplay('0');
    setCalcPrevValue(null);
    setCalcOperation(null);
    setCalcNewNumber(true);
  };
  
  const handleCalcDecimal = () => {
    if (!calcDisplay.includes('.')) {
      setCalcDisplay(calcDisplay + '.');
      setCalcNewNumber(false);
    }
  };
  
  // Custom items state
  type CustomItem = {
    id: string;
    name: string;
    description: string;
    quantity: number;
    unitPrice: string;
    price: string;
  };
  
  const [customItems, setCustomItems] = useState<CustomItem[]>([]);
  
  // Common custom items templates
  const commonItems = [
    { name: '安裝', description: '分離式安裝工資', quantity: 1, unitPrice: '3500', price: '3500' },
    { name: '移機', description: '拆除&安裝工資', quantity: 1, unitPrice: '4500', price: '4500' },
    { name: '銅管、電線', description: '客廳/主/次臥銅管&線材費用共計', quantity: 1, unitPrice: '5000', price: '5000' },
    { name: '安裝架', description: '室外機白鐵L架/豪華架/落地架', quantity: 1, unitPrice: '2000', price: '2000' },
    { name: '洗孔', description: '牆體洗洞工程', quantity: 1, unitPrice: '1000', price: '1000' },
    { name: '焊接', description: '焊接工程', quantity: 1, unitPrice: '1500', price: '1500' },
    { name: '管槽', description: '防曬美化管槽(白色)', quantity: 1, unitPrice: '3000', price: '3000' },
    { name: '危險施工', description: '高空危險施工費用', quantity: 1, unitPrice: '5000', price: '5000' },
    { name: '管路沖洗', description: '舊管冷凍油沖洗工程', quantity: 1, unitPrice: '3000', price: '3000' },
    { name: '清洗保養', description: '室內/外機-清洗保養服務', quantity: 1, unitPrice: '3000', price: '3000' },
    { name: '打壁填回', description: '牆體切槽配管含水泥填回', quantity: 1, unitPrice: '2000', price: '2000' },
    { name: '風箱、風管', description: '集風箱、減速箱、風管及出風口耗材等施工費用', quantity: 1, unitPrice: '12000', price: '2000' },
    { name: '其他', description: '', quantity: 1, unitPrice: '0', price: '0' },
  ];

  const handleAddCustomItem = () => {
    const newItem: CustomItem = {
      id: generateId(),
      name: '',
      description: '',
      quantity: 1,
      unitPrice: '0',
      price: '0'
    };
    setCustomItems([...customItems, newItem]);
  };

  const handleSelectCommonItem = (index: number, commonItem: typeof commonItems[0]) => {
    const updated = [...customItems];
    updated[index] = {
      ...updated[index],
      name: commonItem.name,
      description: commonItem.description,
      quantity: commonItem.quantity,
      unitPrice: commonItem.unitPrice,
      price: commonItem.price
    };
    setCustomItems(updated);
  };

  const handleUpdateCustomItem = (index: number, field: keyof CustomItem, value: string | number) => {
    const updated = [...customItems];
    if (field === 'quantity') {
      updated[index][field] = typeof value === 'number' ? value : parseInt(value) || 1;
      // 更新總價
      const unitPrice = parseInt(updated[index].unitPrice.replace(/,/g, ''), 10);
      const quantity = updated[index].quantity;
      updated[index].price = (isNaN(unitPrice) ? 0 : unitPrice * quantity).toString();
    } else if (field === 'unitPrice') {
      updated[index][field] = value.toString();
      // 更新總價
      const unitPrice = parseInt(value.toString().replace(/,/g, ''), 10);
      const quantity = updated[index].quantity;
      updated[index].price = (isNaN(unitPrice) ? 0 : unitPrice * quantity).toString();
    } else {
      updated[index][field] = value as any;
    }
    setCustomItems(updated);
  };

  const handleRemoveCustomItem = (index: number) => {
    setCustomItems(customItems.filter((_, i) => i !== index));
  };

  const totalPrice = useMemo(() => {
    const productsTotal = products.reduce((sum, p) => {
      const adjustedPrice = productPrices[p.id] || p.price.toString();
      const price = parseInt(adjustedPrice.replace(/,/g, ''), 10);
      const quantity = productQuantities[p.id] || 1;
      return sum + (isNaN(price) ? 0 : price * quantity);
    }, 0);
    
    const customTotal = customItems.reduce((sum, item) => {
      const unitPrice = parseInt(item.unitPrice.replace(/,/g, ''), 10);
      const quantity = item.quantity || 1;
      return sum + (isNaN(unitPrice) ? 0 : unitPrice * quantity);
    }, 0);
    
    return productsTotal + customTotal;
  }, [products, customItems, productPrices, productQuantities]);

  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleExportImage = async () => {
    setIsExporting(true);
    setShowExportMenu(false);
    try {
      const element = document.getElementById('quote-content');
      if (!element) return;

      // Store original styles
      const originalMinWidth = element.style.minWidth;
      const originalWidth = element.style.width;
      
      // Force desktop width for mobile
      element.style.minWidth = '800px';
      element.style.width = '800px';

      // Hide interactive elements
      const editElements = element.querySelectorAll('.export-hide');
      const displayElements = element.querySelectorAll('.export-show');
      
      editElements.forEach(el => (el as HTMLElement).style.display = 'none');
      displayElements.forEach(el => (el as HTMLElement).style.display = 'block');

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        width: 800,
      });

      // Restore original styles
      element.style.minWidth = originalMinWidth;
      element.style.width = originalWidth;
      
      // Restore interactive elements
      editElements.forEach(el => (el as HTMLElement).style.display = '');
      displayElements.forEach(el => (el as HTMLElement).style.display = '');

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          const fileName = `報價單_${quoteDate}_${customerName || '客戶'}.png`;
          link.download = fileName;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
        }
        setIsExporting(false);
      }, 'image/png');
    } catch (error) {
      console.error('Export failed:', error);
      alert('匯出失敗，請稍後再試');
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    setShowExportMenu(false);
    try {
      const element = document.getElementById('quote-content');
      if (!element) return;

      // Store original styles
      const originalMinWidth = element.style.minWidth;
      const originalWidth = element.style.width;
      
      // Force desktop width for consistent export
      element.style.minWidth = '800px';
      element.style.width = '800px';

      // Hide interactive elements
      const editElements = element.querySelectorAll('.export-hide');
      const displayElements = element.querySelectorAll('.export-show');
      
      editElements.forEach(el => (el as HTMLElement).style.display = 'none');
      displayElements.forEach(el => (el as HTMLElement).style.display = 'block');

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        width: 800,
      });

      // Restore original styles
      element.style.minWidth = originalMinWidth;
      element.style.width = originalWidth;
      
      // Restore interactive elements
      editElements.forEach(el => (el as HTMLElement).style.display = '');
      displayElements.forEach(el => (el as HTMLElement).style.display = '');

      const imgData = canvas.toDataURL('image/png');
      
      // Open in new window to display
      const previewWindow = window.open('', '_blank');
      if (previewWindow) {
        previewWindow.document.write(`
          <html>
            <head>
              <title>報價單預覽 - ${quoteDate}_${customerName || '客戶'}</title>
              <style>
                body { 
                  margin: 0; 
                  padding: 20px;
                  background: #f5f5f5;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                }
                .container {
                  max-width: 1200px;
                  background: white;
                  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                  border-radius: 8px;
                  overflow: hidden;
                }
                img { 
                  width: 100%; 
                  height: auto; 
                  display: block; 
                }
                .toolbar {
                  padding: 15px 20px;
                  background: #fff;
                  border-bottom: 1px solid #e5e7eb;
                  display: flex;
                  gap: 10px;
                  justify-content: center;
                }
                button {
                  padding: 10px 20px;
                  border: none;
                  border-radius: 6px;
                  font-size: 14px;
                  font-weight: 600;
                  cursor: pointer;
                  transition: all 0.2s;
                }
                .btn-print {
                  background: #4f46e5;
                  color: white;
                }
                .btn-print:hover {
                  background: #4338ca;
                }
                .btn-download {
                  background: #059669;
                  color: white;
                }
                .btn-download:hover {
                  background: #047857;
                }
                @media print {
                  body { 
                    background: white;
                    padding: 0;
                  }
                  .toolbar { 
                    display: none; 
                  }
                  .container {
                    box-shadow: none;
                    max-width: none;
                  }
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="toolbar">
                  <button class="btn-print" onclick="window.print()">🖨️ 列印</button>
                  <button class="btn-download" onclick="downloadImage()">💾 下載圖片</button>
                </div>
                <img src="${imgData}" alt="報價單" />
              </div>
              <script>
                function downloadImage() {
                  const link = document.createElement('a');
                  link.download = '報價單_${quoteDate}_${customerName || '客戶'}.png';
                  link.href = '${imgData}';
                  link.click();
                }
              </script>
            </body>
          </html>
        `);
        previewWindow.document.close();
      }
      setIsExporting(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert('匯出失敗，請稍後再試');
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition"
          >
            <X className="w-5 h-5" />
            <span>返回</span>
          </button>
          <h1 className="text-xl font-bold text-slate-800">報價單</h1>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPipeWireCalc(!showPipeWireCalc)}
              className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-emerald-200 transition font-medium"
              title="管路電線計算"
            >
              <Zap className="w-5 h-5" />
              <span className="hidden sm:inline">管路電線</span>
            </button>
            
            <button
              onClick={() => setShowCalculator(!showCalculator)}
              className="flex items-center gap-2 bg-slate-100 text-slate-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-slate-200 transition font-medium"
              title="開啟計算機"
            >
              <Calculator className="w-5 h-5" />
              <span className="hidden sm:inline">計算機</span>
            </button>
            
            {/* Export Menu */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={isExporting}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    匯出中...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    匯出
                  </>
                )}
              </button>
            
              {showExportMenu && !isExporting && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50">
                <button
                  onClick={handleExportImage}
                  className="w-full px-4 py-2 text-left hover:bg-slate-50 transition flex items-center gap-3 text-slate-700"
                >
                  <FileDown className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="font-medium">匯出 PNG</div>
                    <div className="text-xs text-slate-500">圖片格式</div>
                  </div>
                </button>
                <button
                  onClick={handleExportPDF}
                  className="w-full px-4 py-2 text-left hover:bg-slate-50 transition flex items-center gap-3 text-slate-700"
                >
                  <FileDown className="w-4 h-4 text-red-600" />
                  <div>
                    <div className="font-medium">預覽報價單</div>
                    <div className="text-xs text-slate-500">可列印或下載</div>
                  </div>
                </button>
              </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quote Content */}
      <div className="max-w-5xl mx-auto p-4 sm:p-8">
        <div id="quote-content" className="bg-white rounded-2xl shadow-lg p-6 sm:p-10">
          {/* Title */}
          <div className="text-center mb-6">
            <div className="inline-block">
              {/* 編輯模式 */}
              <div className="export-hide">
                {isEditingTitle ? (
                  <div className="flex items-center gap-3 justify-center mb-3">
                    <input
                      type="text"
                      value={quoteTitle}
                      onChange={(e) => setQuoteTitle(e.target.value)}
                      onBlur={() => setIsEditingTitle(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setIsEditingTitle(false);
                        if (e.key === 'Escape') {
                          setQuoteTitle('冷氣估價單');
                          setIsEditingTitle(false);
                        }
                      }}
                      className="text-4xl sm:text-5xl font-black text-center bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 bg-clip-text text-transparent border-b-2 border-indigo-300 focus:outline-none focus:border-indigo-500 px-4"
                      autoFocus
                    />
                    <button
                      onClick={() => setIsEditingTitle(false)}
                      className="text-green-600 hover:text-green-700 p-2"
                      title="確認"
                    >
                      <CheckCircle2 className="w-6 h-6" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 justify-center mb-3 group">
                    <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {quoteTitle}
                    </h1>
                    <button
                      onClick={() => setIsEditingTitle(true)}
                      className="text-indigo-600 hover:text-indigo-700 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="編輯標題"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
              
              {/* 匯出模式 */}
              <h1 className="hidden export-show text-4xl sm:text-5xl font-black text-indigo-600 mb-4">{quoteTitle}</h1>
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-4 mb-8 border border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2 whitespace-nowrap">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                  客戶姓名
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="export-hide flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                  placeholder="請輸入客戶姓名"
                />
                <div className="hidden export-show flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-white min-h-[40px] flex items-center font-medium text-slate-800">
                  {customerName || '未填寫'}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2 whitespace-nowrap">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                  報價日期
                </label>
                <input
                  type="date"
                  value={quoteDate}
                  onChange={(e) => setQuoteDate(e.target.value)}
                  className="export-hide flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                />
                <div className="hidden export-show flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-white min-h-[40px] flex items-center font-medium text-slate-800">
                  {quoteDate || '未填寫'}
                </div>
              </div>
              <div className="sm:col-span-2 flex items-center gap-3">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2 whitespace-nowrap">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                  客戶地址
                </label>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="export-hide flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                  placeholder="請輸入客戶地址"
                />
                <div className="hidden export-show flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-white min-h-[40px] flex items-center font-medium text-slate-800">
                  {customerAddress || '未填寫'}
                </div>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="mb-8 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                  <th className="text-center p-4 font-bold text-sm w-16 rounded-tl-xl whitespace-nowrap">項次</th>
                  <th className="text-center p-4 font-bold text-sm whitespace-nowrap">產品名稱</th>
                  <th className="text-center p-4 font-bold text-sm whitespace-nowrap">品牌</th>
                  <th className="text-center p-4 font-bold text-sm whitespace-nowrap">規格</th>
                  <th className="text-center p-4 font-bold text-sm w-16 whitespace-nowrap">數量</th>
                  <th className="text-center p-4 font-bold text-sm w-24 whitespace-nowrap">單價</th>
                  <th className="text-center p-4 font-bold text-sm w-32 whitespace-nowrap">小計</th>
                  <th className="export-hide w-12 rounded-tr-xl"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => {
                  const brand = config.brands.find(b => b.id === product.brandId);
                  const style = config.styles.find(s => s.id === product.styleId);
                  const type = config.types.find(t => t.id === product.typeId);
                  const pipe = config.pipes.find(p => p.id === product.pipeId);
                  const EnvIcon = product.environment === 'heating' ? Sun : 
                                 product.environment === 'cooling' ? Snowflake :
                                 () => (
                                   <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                     <rect x="3" y="6" width="18" height="10" rx="2" />
                                     <path d="M3 10h18" />
                                     <path d="M7 14h2M11 14h2M15 14h2" strokeLinecap="round" />
                                     <path d="M12 16v2" strokeLinecap="round" />
                                   </svg>
                                 );
                  const envColor = product.environment === 'heating' ? 'text-orange-500' : 
                                  product.environment === 'cooling' ? 'text-cyan-500' : 
                                  'text-indigo-500';
                  const quantity = productQuantities[product.cartItemId] || 1;
                  const unitPrice = parseInt((productPrices[product.cartItemId] || product.price).toString().replace(/,/g, ''), 10);
                  const subtotal = isNaN(unitPrice) ? 0 : unitPrice * quantity;
                  
                  return (
                    <tr key={product.cartItemId} className="group border-b border-slate-200 hover:bg-slate-50">
                      <td className="p-4 text-center align-middle text-slate-600 whitespace-nowrap">{index + 1}</td>
                      <td className="p-3 text-center align-middle">
                        <div className="font-medium text-slate-800 text-sm leading-tight">
                          {product.name.split('/').map((part, i, arr) => (
                            <span key={i}>
                              {part.trim()}
                              {i < arr.length - 1 && <br />}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-center align-middle text-slate-700 whitespace-nowrap">
                        {brand?.label.split(' (')[0].replace('三菱重工', '重工').replace('三菱電機', '電機')}
                      </td>
                      <td className="p-4 text-center align-middle text-sm text-slate-600 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <span>{style?.label} / {type?.label}</span>
                          <EnvIcon className={`w-4 h-4 ${envColor}`} />
                        </div>
                      </td>
                      <td className="p-4 text-center align-middle">
                        <div className="export-hide flex items-center justify-center relative">
                          {editingQuantityId === product.cartItemId ? (
                            <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" onClick={() => setEditingQuantityId(null)}>
                              <div className="bg-white rounded-xl shadow-2xl p-6 min-w-[300px]" onClick={(e) => e.stopPropagation()}>
                                <div className="text-sm font-bold text-slate-700 mb-3">修改數量</div>
                                <input
                                  type="number"
                                  value={tempQuantityInput}
                                  onChange={(e) => setTempQuantityInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const newValue = parseInt(tempQuantityInput) || 0;
                                      if (newValue === 0) {
                                        handleUpdateProductQuantity(product.cartItemId, 0);
                                      } else {
                                        setProductQuantities(prev => ({ ...prev, [product.cartItemId]: Math.max(1, newValue) }));
                                      }
                                      setEditingQuantityId(null);
                                      setTempQuantityInput('');
                                    } else if (e.key === 'Escape') {
                                      setEditingQuantityId(null);
                                      setTempQuantityInput('');
                                    }
                                  }}
                                  className="w-full text-center py-2 px-3 border-2 border-indigo-300 rounded-lg font-mono font-bold text-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                  autoFocus
                                  placeholder="請輸入數量"
                                />
                                <div className="mt-4 flex gap-2">
                                  <button
                                    onClick={() => {
                                      const newValue = parseInt(tempQuantityInput) || 0;
                                      if (newValue === 0) {
                                        handleUpdateProductQuantity(product.cartItemId, 0);
                                      } else {
                                        setProductQuantities(prev => ({ ...prev, [product.cartItemId]: Math.max(1, newValue) }));
                                      }
                                      setEditingQuantityId(null);
                                      setTempQuantityInput('');
                                    }}
                                    className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
                                  >
                                    確認
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingQuantityId(null);
                                      setTempQuantityInput('');
                                    }}
                                    className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-lg font-medium hover:bg-slate-300 transition"
                                  >
                                    取消
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingQuantityId(product.cartItemId);
                                setTempQuantityInput('');
                              }}
                              className="w-16 text-center py-1 border border-slate-300 rounded-lg font-mono font-bold hover:border-indigo-400 hover:bg-indigo-50 transition cursor-pointer"
                            >
                              {quantity}
                            </button>
                          )}
                        </div>
                        <div className="hidden export-show text-center font-mono font-bold text-slate-800">
                          {quantity}
                        </div>
                      </td>
                      <td className="p-4 text-center align-middle whitespace-nowrap">
                        <div className="export-hide flex items-center justify-end gap-2">
                          {editingPriceId === product.cartItemId ? (
                            <>
                              <input
                                type="text"
                                value={productPrices[product.cartItemId] || product.price}
                                onChange={(e) => handleUpdateProductPrice(product.cartItemId, e.target.value)}
                                onBlur={() => setEditingPriceId(null)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') setEditingPriceId(null);
                                  if (e.key === 'Escape') {
                                    handleUpdateProductPrice(product.cartItemId, product.price.toString());
                                    setEditingPriceId(null);
                                  }
                                }}
                                className="w-28 px-2 py-1 border border-indigo-300 rounded text-right font-mono font-bold text-sm focus:ring-2 focus:ring-indigo-500"
                                autoFocus
                              />
                              <button
                                onClick={() => setEditingPriceId(null)}
                                className="text-green-600 hover:text-green-700 p-1"
                                title="確認"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="font-mono font-bold text-slate-800">
                                {productPrices[product.cartItemId] || product.price}
                              </span>
                              <button
                                onClick={() => setEditingPriceId(product.cartItemId)}
                                className="text-indigo-600 hover:text-indigo-700 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="編輯價格"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                        <div className="hidden export-show text-center font-mono font-bold text-slate-800 whitespace-nowrap">
                          {productPrices[product.cartItemId] || product.price}
                        </div>
                      </td>
                      <td className="p-4 text-center align-middle whitespace-nowrap">
                        <span className="font-mono font-bold text-emerald-600 text-lg">
                          ${subtotal.toLocaleString()}
                        </span>
                      </td>
                      <td className="export-hide"></td>
                    </tr>
                  );
                })}
                
                {/* Custom Items */}
                {customItems.map((item, index) => {
                  const quantity = item.quantity || 1;
                  const unitPrice = parseInt((item.unitPrice || '0').toString().replace(/,/g, ''), 10);
                  const subtotal = isNaN(unitPrice) ? 0 : unitPrice * quantity;
                  
                  return (
                    <tr key={item.id} className="border-b border-slate-200 bg-blue-50/30">
                      <td className="p-4 text-center align-middle text-slate-600 whitespace-nowrap">{products.length + index + 1}</td>
                      <td className="p-4 text-center align-middle whitespace-nowrap">
                        <div className="export-hide">
                          <select
                            value={item.name || ""}
                            onChange={(e) => {
                              if (e.target.value === "") {
                                // 清空，讓使用者自訂
                                handleUpdateCustomItem(index, 'name', '');
                                handleUpdateCustomItem(index, 'description', '');
                                handleUpdateCustomItem(index, 'unitPrice', '0');
                              } else {
                                const selected = commonItems.find(ci => ci.name === e.target.value);
                                if (selected) {
                                  handleSelectCommonItem(index, selected);
                                }
                              }
                            }}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                          >
                            <option value="">自訂項目...</option>
                            {commonItems.map((ci) => (
                              <option key={ci.name} value={ci.name}>{ci.name}</option>
                            ))}
                          </select>
                          {/* 只在下拉選單為"自訂項目"或空值時顯示輸入框 */}
                          {!item.name && (
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => handleUpdateCustomItem(index, 'name', e.target.value)}
                              placeholder="請輸入項目名稱"
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 mt-2"
                              autoFocus
                            />
                          )}
                        </div>
                        <div className="hidden export-show font-medium text-slate-800 text-sm leading-tight">
                          {(item.name || '未命名項目').split('/').map((part, i, arr) => (
                            <span key={i}>
                              {part.trim()}
                              {i < arr.length - 1 && <br />}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-center align-middle" colSpan={2}>
                        <div className="export-hide">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleUpdateCustomItem(index, 'description', e.target.value)}
                            placeholder="說明"
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="hidden export-show text-sm text-slate-600">{item.description}</div>
                      </td>
                      <td className="p-4 text-center align-middle whitespace-nowrap">
                        <div className="export-hide">
                          <input
                            type="number"
                            value={quantity === 0 ? '' : quantity}
                            onChange={(e) => {
                              const newValue = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value) || 0);
                              handleUpdateCustomItem(index, 'quantity', newValue);
                            }}
                            className="w-16 px-2 py-1 border border-slate-300 rounded text-center font-mono font-bold text-sm focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="hidden export-show text-center font-mono font-bold text-slate-800">
                          {quantity}
                        </div>
                      </td>
                      <td className="p-4 text-center align-middle whitespace-nowrap">
                        <div className="export-hide">
                          <input
                            type="text"
                            value={item.unitPrice}
                            onChange={(e) => handleUpdateCustomItem(index, 'unitPrice', e.target.value)}
                            placeholder="0"
                            className="w-28 px-2 py-1 border border-slate-300 rounded text-right font-mono font-bold text-sm focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="hidden export-show text-right font-mono font-bold text-slate-800 whitespace-nowrap">{item.unitPrice}</div>
                      </td>
                      <td className="p-4 text-center align-middle whitespace-nowrap">
                        <div className="text-center font-mono font-bold text-slate-800">
                          ${subtotal.toLocaleString()}
                        </div>
                      </td>
                      <td className="p-3 export-hide">
                        <button
                          onClick={() => handleRemoveCustomItem(index)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded transition"
                          title="刪除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                
                {/* Add Custom Item Button */}
                <tr className="export-hide">
                  <td colSpan={8} className="p-3">
                    <button
                      onClick={handleAddCustomItem}
                      className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition flex items-center justify-center gap-2 font-medium"
                    >
                      <Plus className="w-5 h-5" />
                      新增自訂項目
                    </button>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-300">
                  <td colSpan={6} className="p-5 text-center font-black text-xl text-slate-700">
                    總計
                  </td>
                  <td className="p-5 text-center">
                    <span className="font-mono font-black text-2xl text-emerald-600">${totalPrice.toLocaleString()}</span>
                  </td>
                  <td className="export-hide"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Notes - Only show if has content or in edit mode */}
          {(notes || !isExporting) && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-slate-700">備註說明</label>
                {notes && (
                  <button
                    onClick={() => setNotes('')}
                    className="export-hide text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                    清除備註
                  </button>
                )}
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="export-hide w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none overflow-hidden"
                placeholder="請輸入備註事項（如：付款方式、貨物稅申請、汰舊換新廢四機...等）"
                rows={1}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = target.scrollHeight + 'px';
                }}
              />
              <div className="hidden export-show px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 whitespace-pre-wrap break-words">
                {notes}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-10 pt-8 border-t-2 border-slate-200">
            <div className="bg-gradient-to-br from-slate-50 to-indigo-50 rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center gap-4 text-sm text-slate-600">
                <span className="font-bold text-indigo-600">注意事項</span>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                  本報價單有效期限為 30 天
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                  如有任何疑問，請隨時與我們聯繫
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Calculator Modal */}
      {showCalculator && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-black rounded-3xl shadow-2xl w-full max-w-xs overflow-hidden">
            {/* Calculator Header */}
            <div className="bg-black px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white/80">
                <Calculator className="w-5 h-5" />
                <span className="font-medium text-sm">計算機</span>
              </div>
              <button
                onClick={() => setShowCalculator(false)}
                className="text-white/80 hover:text-white rounded-lg p-1 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Calculator Display */}
            <div className="bg-black px-6 pt-8 pb-4">
              <div className="text-right">
                {calcOperation && calcPrevValue && (
                  <div className="text-white/40 text-lg mb-2 font-light">
                    {calcPrevValue} {calcOperation}
                  </div>
                )}
                <div className="text-white text-6xl font-extralight break-all tracking-tight">
                  {calcDisplay}
                </div>
              </div>
            </div>
            
            {/* Calculator Buttons */}
            <div className="grid grid-cols-4 gap-3 p-3 bg-black">
              {[
                { label: 'C', type: 'function', action: handleCalcClear, color: 'bg-[#A5A5A5] hover:bg-[#D4D4D4] text-black' },
                { label: '÷', type: 'operator', action: () => handleCalcOperation('÷'), color: 'bg-[#FF9F0A] hover:bg-[#FFB340] text-white' },
                { label: '×', type: 'operator', action: () => handleCalcOperation('×'), color: 'bg-[#FF9F0A] hover:bg-[#FFB340] text-white' },
                { label: '←', type: 'function', action: () => setCalcDisplay(calcDisplay.slice(0, -1) || '0'), color: 'bg-[#A5A5A5] hover:bg-[#D4D4D4] text-black' },
                
                { label: '7', type: 'number', action: () => handleCalcNumber('7'), color: 'bg-[#333333] hover:bg-[#505050] text-white' },
                { label: '8', type: 'number', action: () => handleCalcNumber('8'), color: 'bg-[#333333] hover:bg-[#505050] text-white' },
                { label: '9', type: 'number', action: () => handleCalcNumber('9'), color: 'bg-[#333333] hover:bg-[#505050] text-white' },
                { label: '-', type: 'operator', action: () => handleCalcOperation('-'), color: 'bg-[#FF9F0A] hover:bg-[#FFB340] text-white' },
                
                { label: '4', type: 'number', action: () => handleCalcNumber('4'), color: 'bg-[#333333] hover:bg-[#505050] text-white' },
                { label: '5', type: 'number', action: () => handleCalcNumber('5'), color: 'bg-[#333333] hover:bg-[#505050] text-white' },
                { label: '6', type: 'number', action: () => handleCalcNumber('6'), color: 'bg-[#333333] hover:bg-[#505050] text-white' },
                { label: '+', type: 'operator', action: () => handleCalcOperation('+'), color: 'bg-[#FF9F0A] hover:bg-[#FFB340] text-white' },
                
                { label: '1', type: 'number', action: () => handleCalcNumber('1'), color: 'bg-[#333333] hover:bg-[#505050] text-white' },
                { label: '2', type: 'number', action: () => handleCalcNumber('2'), color: 'bg-[#333333] hover:bg-[#505050] text-white' },
                { label: '3', type: 'number', action: () => handleCalcNumber('3'), color: 'bg-[#333333] hover:bg-[#505050] text-white' },
                { label: '=', type: 'equals', action: handleCalcEquals, color: 'bg-[#FF9F0A] hover:bg-[#FFB340] text-white row-span-2' },
                
                { label: '0', type: 'number', action: () => handleCalcNumber('0'), color: 'bg-[#333333] hover:bg-[#505050] text-white col-span-2' },
                { label: '.', type: 'decimal', action: handleCalcDecimal, color: 'bg-[#333333] hover:bg-[#505050] text-white' },
              ].map((btn, idx) => (
                <button
                  key={idx}
                  onClick={btn.action}
                  className={`${btn.color} rounded-full text-2xl font-light transition active:brightness-75 flex items-center justify-center ${
                    btn.label === '0' ? 'col-span-2 rounded-full aspect-[2/1]' : 'aspect-square'
                  } ${btn.label === '=' ? 'row-span-2' : ''}`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Pipe & Wire Calculator Modal */}
      {showPipeWireCalc && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:w-[600px] max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b flex justify-between items-center bg-gradient-to-r from-emerald-50 to-teal-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500 text-white rounded-lg">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-lg text-slate-800 block">管路電線計算器</span>
                  <span className="text-xs text-slate-500">快速計算管路與電線費用</span>
                </div>
              </div>
              <button
                onClick={() => setShowPipeWireCalc(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Calculator Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {/* 管路區域 */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  管路規格
                </h3>
                <div className="space-y-2">
                  {Object.entries(pipeWireItems)
                    .filter(([key]) => key.startsWith('pipe_'))
                    .map(([key, item]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                        <div className="flex-1">
                          <div className="font-medium text-slate-800 text-sm">{item.name}</div>
                          <div className="text-xs text-slate-500">${item.unitPrice}/米</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPipeWireItems(prev => ({
                              ...prev,
                              [key]: { ...prev[key as keyof typeof prev], quantity: Math.max(0, prev[key as keyof typeof prev].quantity - 1) }
                            }))}
                            className="w-8 h-8 flex items-center justify-center bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            value={item.quantity === 0 ? '' : item.quantity}
                            onChange={(e) => setPipeWireItems(prev => ({
                              ...prev,
                              [key]: { ...prev[key as keyof typeof prev], quantity: e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value) || 0) }
                            }))}
                            onBlur={(e) => {
                              if (e.target.value === '') {
                                setPipeWireItems(prev => ({
                                  ...prev,
                                  [key]: { ...prev[key as keyof typeof prev], quantity: 0 }
                                }));
                              }
                            }}
                            className="w-16 text-center py-1 border border-slate-300 rounded-lg font-mono font-bold"
                          />
                          <button
                            onClick={() => setPipeWireItems(prev => ({
                              ...prev,
                              [key]: { ...prev[key as keyof typeof prev], quantity: prev[key as keyof typeof prev].quantity + 1 }
                            }))}
                            className="w-8 h-8 flex items-center justify-center bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* 訊號線區域 */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  訊號線
                </h3>
                <div className="space-y-2">
                  {Object.entries(pipeWireItems)
                    .filter(([key]) => key.startsWith('signal_'))
                    .map(([key, item]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                        <div className="flex-1">
                          <div className="font-medium text-slate-800 text-sm">{item.name}</div>
                          <div className="text-xs text-slate-500">${item.unitPrice}/米</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPipeWireItems(prev => ({
                              ...prev,
                              [key]: { ...prev[key as keyof typeof prev], quantity: Math.max(0, prev[key as keyof typeof prev].quantity - 1) }
                            }))}
                            className="w-8 h-8 flex items-center justify-center bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            value={item.quantity === 0 ? '' : item.quantity}
                            onChange={(e) => setPipeWireItems(prev => ({
                              ...prev,
                              [key]: { ...prev[key as keyof typeof prev], quantity: e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value) || 0) }
                            }))}
                            onBlur={(e) => {
                              if (e.target.value === '') {
                                setPipeWireItems(prev => ({
                                  ...prev,
                                  [key]: { ...prev[key as keyof typeof prev], quantity: 0 }
                                }));
                              }
                            }}
                            className="w-16 text-center py-1 border border-slate-300 rounded-lg font-mono font-bold"
                          />
                          <button
                            onClick={() => setPipeWireItems(prev => ({
                              ...prev,
                              [key]: { ...prev[key as keyof typeof prev], quantity: prev[key as keyof typeof prev].quantity + 1 }
                            }))}
                            className="w-8 h-8 flex items-center justify-center bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* 電源線區域 */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  電源線
                </h3>
                <div className="space-y-2">
                  {Object.entries(pipeWireItems)
                    .filter(([key]) => key.startsWith('power_'))
                    .map(([key, item]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                        <div className="flex-1">
                          <div className="font-medium text-slate-800 text-sm">{item.name}</div>
                          <div className="text-xs text-slate-500">${item.unitPrice}/米</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPipeWireItems(prev => ({
                              ...prev,
                              [key]: { ...prev[key as keyof typeof prev], quantity: Math.max(0, prev[key as keyof typeof prev].quantity - 1) }
                            }))}
                            className="w-8 h-8 flex items-center justify-center bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            value={item.quantity === 0 ? '' : item.quantity}
                            onChange={(e) => setPipeWireItems(prev => ({
                              ...prev,
                              [key]: { ...prev[key as keyof typeof prev], quantity: e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value) || 0) }
                            }))}
                            onBlur={(e) => {
                              if (e.target.value === '') {
                                setPipeWireItems(prev => ({
                                  ...prev,
                                  [key]: { ...prev[key as keyof typeof prev], quantity: 0 }
                                }));
                              }
                            }}
                            className="w-16 text-center py-1 border border-slate-300 rounded-lg font-mono font-bold"
                          />
                          <button
                            onClick={() => setPipeWireItems(prev => ({
                              ...prev,
                              [key]: { ...prev[key as keyof typeof prev], quantity: prev[key as keyof typeof prev].quantity + 1 }
                            }))}
                            className="w-8 h-8 flex items-center justify-center bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* 總計 */}
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">總計金額</span>
                  <span className="text-2xl font-black text-emerald-600">
                    ${Object.values(pipeWireItems).reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-6 border-t bg-slate-50 flex gap-3">
              <button
                onClick={() => {
                  setPipeWireItems(prev => {
                    const reset = { ...prev };
                    Object.keys(reset).forEach(key => {
                      reset[key as keyof typeof reset].quantity = 0;
                    });
                    return reset;
                  });
                }}
                className="flex-1 py-3 bg-white border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-bold"
              >
                清除
              </button>
              <button
                onClick={() => {
                  const total = Object.values(pipeWireItems).reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
                  alert(`管路電線費用總計：$${total.toLocaleString()}`);
                  setShowPipeWireCalc(false);
                }}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition font-bold shadow-lg"
              >
                確認計算
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 7. Product Card
type ViewMode = 'grid' | 'list' | 'compact';

const ProductCard: React.FC<{ 
  product: Product; 
  config: AppConfig; 
  viewMode: ViewMode;
  isSelected: boolean;
  onToggleCompare: (id: string) => void;
  onPin: (id: string) => void; 
  onEdit: (product: Product) => void; 
  onDelete: (id: string) => void;
  onAddToCart: (product: Product) => void;
}> = ({ 
  product, 
  config, 
  viewMode,
  isSelected,
  onToggleCompare,
  onPin, 
  onEdit, 
  onDelete,
  onAddToCart
}) => {
  const getLabel = (cat: keyof AppConfig, id: string) => {
    const opt = config[cat].find(x => x.id === id);
    return opt ? { label: opt.label, color: opt.color } : { label: '未知', color: '#94a3b8' };
  };

  // 管徑特殊處理：如果是設定中的ID則使用設定，否則直接顯示輸入值
  const getPipeLabel = (pipeIdOrValue: string) => {
    const opt = config.pipes.find(x => x.id === pipeIdOrValue || x.label === pipeIdOrValue);
    return opt ? { label: opt.label, color: opt.color } : { label: pipeIdOrValue, color: '#64748b' };
  };

  const brand = getLabel('brands', product.brandId);
  const style = getLabel('styles', product.styleId);
  const type = getLabel('types', product.typeId);
  const pipe = getPipeLabel(product.pipeId);

  const cardId = `product-card-${product.id}`;

  // Environment icon component
  const EnvIcon = product.environment === 'heating' ? Sun : 
                  product.environment === 'cooling' ? Snowflake :
                  // Indoor unit SVG icon
                  () => (
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="6" width="18" height="10" rx="2" />
                      <path d="M3 10h18" />
                      <path d="M7 14h2M11 14h2M15 14h2" strokeLinecap="round" />
                      <path d="M12 16v2" strokeLinecap="round" />
                    </svg>
                  );
  
  // Use gradients for text
  const envColorClass = product.environment === 'heating' ? 'text-orange-500' : 
                       product.environment === 'cooling' ? 'text-cyan-500' : 
                       'text-indigo-500';
  const envGradientBg = product.environment === 'heating' 
    ? 'bg-gradient-to-br from-orange-100 to-rose-100 border-orange-200' 
    : product.environment === 'cooling'
    ? 'bg-gradient-to-br from-cyan-100 to-blue-100 border-cyan-200'
    : 'bg-gradient-to-br from-indigo-100 to-purple-100 border-indigo-200';

  // --- COMPACT VIEW ---
  if (viewMode === 'compact') {
    return (
      <div id={cardId} className={`group relative bg-white rounded-3xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col p-5 text-center border-2 overflow-hidden ${isSelected ? 'border-pink-400 ring-4 ring-pink-200' : 'border-purple-100 hover:border-pink-200'}`}>
        {/* Background Decorative Mesh */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${product.environment === 'heating' ? 'from-orange-300 to-pink-400' : 'from-cyan-300 to-purple-400'}`}></div>

        {/* Pin Button - Top Left */}
        <button 
          onClick={() => onPin(product.id)} 
          className={`absolute top-2 left-2 transition-all p-1.5 rounded-full z-10 shadow-sm ${product.isPinned ? 'text-white bg-gradient-to-br from-pink-400 to-purple-500 shadow-pink-400/50' : 'text-slate-300 hover:text-pink-400 bg-white/80 opacity-0 group-hover:opacity-100'}`}
        >
          <Pin className={`w-3.5 h-3.5 ${product.isPinned ? 'fill-current' : ''}`} />
        </button>

        {/* Action Buttons (Overlay) */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-white/90 p-1.5 rounded-2xl shadow-md backdrop-blur-md border-2 border-purple-100">
          <button onClick={() => onAddToCart(product)} className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition" title="加入報價單">
            <ShoppingCart className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onEdit(product)} className="p-1.5 text-slate-400 hover:text-purple-500 hover:bg-purple-50 rounded-xl transition">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(product.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-50 rounded-xl transition">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
        
        <div className="flex justify-center mb-4 relative z-10">
          <div className={`p-4 rounded-2xl border-2 shadow-lg ${envGradientBg} ${envColorClass}`}>
            <EnvIcon className="w-8 h-8" />
          </div>
        </div>
        
        <h3 className="font-black text-slate-800 text-sm leading-tight mb-2 line-clamp-2 min-h-[2.5em] relative z-10">{product.name}</h3>
        
        <div className="mt-auto relative z-10">
          <span className="text-lg font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600">
             {product.price ? `$${product.price}` : '洽詢'}
          </span>
        </div>
      </div>
    );
  }

  // --- LIST VIEW ---
  if (viewMode === 'list') {
    return (
      <div id={cardId} className={`group bg-white rounded-xl border hover:shadow-lg transition-all p-3 md:p-4 flex items-center gap-2 md:gap-5 ${isSelected ? 'border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50/10' : 'border-slate-100 hover:border-indigo-200'}`}>
        {/* Pin & Icon */}
        <div className="flex items-center gap-1 md:gap-3 w-10 md:w-14 justify-center flex-shrink-0">
          <button onClick={() => onPin(product.id)} className={`${product.isPinned ? 'text-indigo-600' : 'text-slate-200 hover:text-slate-400'}`}>
             <Pin className={`w-3 h-3 md:w-4 md:h-4 ${product.isPinned ? 'fill-current' : ''}`} />
          </button>
          <div className={`p-1.5 md:p-2 rounded-lg border ${envGradientBg} ${envColorClass}`}>
            <EnvIcon className="w-4 h-4 md:w-5 md:h-5" />
          </div>
        </div>

        {/* Main Info */}
        <div className="flex-1 min-w-0">
          <div className="text-[10px] md:text-xs font-bold mb-0.5 md:mb-1 opacity-90" style={{ color: brand.color }}>{brand.label}</div>
          <h3 className="font-bold text-slate-800 text-sm md:text-lg truncate">{product.name}</h3>
        </div>

        {/* Dimensions (List View) */}
        <div className="hidden lg:flex flex-col text-xs text-slate-500 w-56 shrink-0 border-l border-r border-slate-100 px-4">
           <div className="flex items-start gap-2 mb-1.5">
             <Home className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
             <span className="break-all font-mono leading-tight" title={product.dimensions.indoor}>{product.dimensions.indoor || '-'}</span>
           </div>
           <div className="flex items-start gap-2">
             <Trees className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
             <span className="break-all font-mono leading-tight" title={product.dimensions.outdoor}>{product.dimensions.outdoor || '-'}</span>
           </div>
        </div>

        {/* Specs Tags */}
        <div className="hidden md:flex gap-2 flex-wrap w-[28%]">
          <span className="text-xs px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-600 font-medium whitespace-nowrap overflow-hidden text-ellipsis" style={{color: style.color}} title={style.label}>{style.label}</span>
          <span className="text-xs px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-600 font-medium whitespace-nowrap overflow-hidden text-ellipsis" style={{color: type.color}} title={type.label}>{type.label}</span>
          <span className="text-xs px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-600 font-medium whitespace-nowrap overflow-hidden text-ellipsis" style={{color: pipe.color}} title={pipe.label}>{pipe.label}</span>
        </div>

        {/* Price */}
        <div className="w-16 md:w-28 text-right font-black font-mono text-sm md:text-lg text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600 flex-shrink-0">
           {product.price ? `$${product.price}` : '洽詢'}
        </div>

        {/* Actions */}
        <div className="flex gap-0.5 md:gap-1 w-auto md:w-32 justify-end opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={() => onAddToCart(product)} className="p-1.5 md:p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition" title="加入報價單"><ShoppingCart className="w-3.5 h-3.5 md:w-4 md:h-4" /></button>
          <button onClick={() => onEdit(product)} className="p-1.5 md:p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"><Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4" /></button>
          <button onClick={() => exportToImage(cardId, product.name)} className="hidden sm:block p-1.5 md:p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"><Download className="w-3.5 h-3.5 md:w-4 md:h-4" /></button>
          <button onClick={() => onDelete(product.id)} className="p-1.5 md:p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" /></button>
        </div>
      </div>
    );
  }

  // --- GRID VIEW (Default) ---
  return (
    <div className={`group relative bg-white rounded-3xl shadow-md hover:shadow-2xl border-2 hover:-translate-y-2 transition-all duration-300 flex flex-col overflow-hidden h-full ${isSelected ? 'border-pink-400 ring-4 ring-pink-200 ring-offset-2' : 'border-purple-100 hover:border-pink-200'}`}>
      
      {/* Top Gradient Line */}
      <div className={`h-2 w-full bg-gradient-to-r ${product.environment === 'heating' ? 'from-orange-300 via-pink-300 to-rose-400' : 'from-cyan-300 via-blue-300 to-purple-400'}`}></div>

      {/* Pin Button - Top Left */}
      <button 
        onClick={() => onPin(product.id)} 
        className={`absolute top-5 left-4 transition-all p-2 rounded-full z-10 shadow-md ${product.isPinned ? 'text-white bg-gradient-to-br from-pink-400 to-purple-500 shadow-pink-400/50 scale-110' : 'text-slate-300 hover:text-pink-400 bg-white/80 opacity-0 group-hover:opacity-100'}`}
      >
        <Pin className={`w-4 h-4 ${product.isPinned ? 'fill-current' : ''}`} />
      </button>

      {/* Action Bar */}
      <div className="absolute top-5 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-slate-800/95 backdrop-blur-md p-2 rounded-2xl shadow-xl border-2 border-amber-500/30">
        <button onClick={() => onAddToCart(product)} className="p-2 text-amber-400/70 hover:text-amber-400 hover:bg-amber-500/20 rounded-xl transition-all hover:scale-110" title="加入報價單">
          <ShoppingCart className="w-4 h-4" />
        </button>
        <button onClick={() => onEdit(product)} className="p-2 text-amber-400/70 hover:text-amber-400 hover:bg-amber-500/20 rounded-xl transition-all hover:scale-110" title="編輯">
          <Edit2 className="w-4 h-4" />
        </button>
        <button onClick={() => exportToImage(cardId, product.name)} className="p-2 text-amber-400/70 hover:text-amber-400 hover:bg-amber-500/20 rounded-xl transition-all hover:scale-110" title="匯出圖檔">
          <Download className="w-4 h-4" />
        </button>
        <button onClick={() => onDelete(product.id)} className="p-2 text-amber-400/70 hover:text-red-400 hover:bg-red-500/20 rounded-xl transition-all hover:scale-110" title="刪除">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div id={cardId} className="flex flex-col h-full bg-gradient-to-br from-slate-900/50 to-black/50 p-6">
        {/* Header: Environment Icon + Name */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-start gap-3">
            <div className={`mt-1 p-3.5 rounded-2xl flex-shrink-0 shadow-lg border-2 ${envGradientBg} ${envColorClass}`}>
              <EnvIcon className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs font-black tracking-wider uppercase mb-1.5 opacity-80" style={{ color: brand.color }}>
                {brand.label}
              </div>
              <h3 className="text-lg font-black text-amber-400 leading-tight">{product.name}</h3>
            </div>
          </div>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6 flex-1">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-amber-500/30 p-4 rounded-2xl hover:shadow-lg hover:shadow-amber-500/20 transition-all hover:-translate-y-0.5">
            <span className="text-xs text-amber-400 font-bold block mb-1.5">種類</span>
            <span className="font-black text-sm break-all text-amber-300" style={{color: type.color}}>{type.label}</span>
          </div>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-amber-500/30 p-4 rounded-2xl hover:shadow-lg hover:shadow-amber-500/20 transition-all hover:-translate-y-0.5">
            <span className="text-xs text-amber-400 font-bold block mb-1.5">樣式</span>
            <span className="font-black text-sm break-all text-amber-300" style={{color: style.color}}>{style.label}</span>
          </div>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-amber-500/30 p-4 rounded-2xl hover:shadow-lg hover:shadow-amber-500/20 transition-all hover:-translate-y-0.5">
            <span className="text-xs text-amber-400 font-bold block mb-1.5">管徑</span>
            <span className="font-black text-sm break-all leading-tight text-amber-300" style={{color: pipe.color}}>{pipe.label}</span>
          </div>
          
          {/* Dimensions Box */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-amber-500/30 p-4 rounded-2xl flex flex-col justify-center hover:shadow-lg hover:shadow-amber-500/20 transition-all hover:-translate-y-0.5">
            <div className="mb-2">
               <span className="text-xs font-black text-amber-400 break-all font-mono leading-tight block">{product.dimensions.indoor || '-'}</span>
            </div>
            <div>
               <span className="text-xs font-black text-amber-300 break-all font-mono leading-tight block">{product.dimensions.outdoor || '-'}</span>
            </div>
          </div>
        </div>

        {/* Footer: Price */}
        <div className="mt-auto pt-5 border-t-2 border-dashed border-amber-500/30 flex justify-between items-center">
          <span className="text-sm text-amber-400 font-bold">💰 建議售價</span>
          <span className="text-2xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600">
             {product.price ? `$${product.price}` : '洽詢'}
          </span>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

// --- Production-friendly URL pill (toggleable) ---
const UrlPill: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem('showUrlPill');
      return v === null ? true : v === 'true';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try { localStorage.setItem('showUrlPill', visible ? 'true' : 'false'); } catch {}
  }, [visible]);

  const href = typeof window !== 'undefined' ? window.location.href : '';

  if (!visible) {
    return (
      <button
        onClick={() => setVisible(true)}
        className="ml-3 hidden md:inline-flex items-center gap-2 text-xs text-slate-300 px-3 py-1 rounded-full border border-white/10 hover:bg-white/5 transition"
        title="顯示網址"
      >
        Show URL
      </button>
    );
  }

  return (
    <div className="ml-3 hidden md:flex items-center gap-2 text-xs text-slate-300 bg-white/5 px-3 py-1 rounded-full border border-white/10">
      <span className="font-mono truncate max-w-[250px]" title={href}>{href}</span>
      <button
        onClick={() => {
          try {
            navigator.clipboard?.writeText(href);
            alert('已複製網址');
          } catch {
            // fallback
            const ta = document.createElement('textarea');
            ta.value = href;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            ta.remove();
            alert('已複製網址');
          }
        }}
        className="px-2 py-1 bg-white/10 rounded-md hover:bg-white/20 transition text-xs"
        title="複製網址"
      >
        複製
      </button>
      <button onClick={() => setVisible(false)} className="px-1.5 py-1 text-xs text-slate-300 hover:text-white/90 rounded-md transition" title="隱藏網址">✕</button>
    </div>
  );
};

export default function App() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [config, setConfig] = useState<AppConfig>(INITIAL_CONFIG);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  // Category State
  const [activeCategory, setActiveCategory] = useState<'air-conditioning' | 'materials' | 'tools' | 'high-altitude'>('air-conditioning');
  const [miscItems, setMiscItems] = useState<any[]>([
    // 材料範例資料
    {
      id: 'misc-material-1',
      category: 'materials',
      name: '銅管2330',
      specification: '1/4" + 3/8"',
      unit: '30米',
      price: '5000',
      remarks: '冷媒管',
      createdAt: Date.now() - 1000
    },
    {
      id: 'misc-material-2',
      category: 'materials',
      name: '銅管2430',
      specification: '1/4" + 1/2"',
      unit: '30米',
      price: '6000',
      remarks: '冷媒管',
      createdAt: Date.now() - 2000
    },
    {
      id: 'misc-material-3',
      category: 'materials',
      name: '銅管2530',
      specification: '1/4" + 5/8"',
      unit: '30米',
      price: '8000',
      remarks: '冷媒管',
      createdAt: Date.now() - 3000
    },
    {
      id: 'misc-material-4',
      category: 'materials',
      name: '排水管',
      specification: 'PVC 16mm',
      unit: '米',
      price: '30',
      remarks: '冷凝水排放',
      createdAt: Date.now() - 4000
    },
    // 工具範例資料
    {
      id: 'misc-tool-1',
      category: 'tools',
      name: '威克士真空泵',
      specification: '1/4HP',
      unit: '台',
      price: '8500',
      remarks: '抽真空用',
      createdAt: Date.now() - 5000
    },
    {
      id: 'misc-tool-2',
      category: 'tools',
      name: '扭力扳手',
      specification: '專業型',
      unit: '支',
      price: '1200',
      remarks: '銅管接頭用',
      createdAt: Date.now() - 6000
    },
    // 高空範例資料
    {
      id: 'misc-high-1',
      category: 'high-altitude',
      name: '高空作業費',
      specification: '3-5樓',
      unit: '次',
      price: '3000',
      remarks: '危險加給',
      createdAt: Date.now() - 7000
    },
    {
      id: 'misc-high-2',
      category: 'high-altitude',
      name: '吊車費用',
      specification: '25噸吊車',
      unit: '趟',
      price: '15000',
      remarks: '大型設備吊裝',
      createdAt: Date.now() - 8000
    }
  ]);
  const [isMiscFormOpen, setIsMiscFormOpen] = useState(false);
  
  // Modals & UI State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isBTUOpen, setIsBTUOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [autoSync, setAutoSync] = useState(false);
  const [showQuotePage, setShowQuotePage] = useState(false);
  const [maxDisplayCards, setMaxDisplayCards] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Comparison State
  const [compareList, setCompareList] = useState<string[]>([]);
  
  // Cart State - stores cart items with unique IDs (allows same product multiple times)
  const [cartItems, setCartItems] = useState<Array<{ cartItemId: string; productId: string }>>([]);

  // Reset to page 1 when search term or max cards changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, maxDisplayCards]);

  // Derived State
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        const lowerTerm = searchTerm.toLowerCase();
        // Includes remarks in search but remarks are hidden in UI
        return (
          p.name.toLowerCase().includes(lowerTerm) ||
          p.remarks.toLowerCase().includes(lowerTerm) ||
          config.brands.find(b => b.id === p.brandId)?.label.toLowerCase().includes(lowerTerm)
        );
      })
      .sort((a, b) => {
        if (a.isPinned === b.isPinned) return b.createdAt - a.createdAt;
        return a.isPinned ? -1 : 1;
      });
  }, [products, searchTerm, config]);

  const compareProducts = useMemo(() => 
    products.filter(p => compareList.includes(p.id)), 
  [products, compareList]);

  const pinnedProducts = useMemo(() => 
    products.filter(p => p.isPinned),
  [products]);
  
  const cartProducts = useMemo(() => 
    cartItems.map(item => {
      const product = products.find(p => p.id === item.productId);
      return product ? { ...product, cartItemId: item.cartItemId } : null;
    }).filter(Boolean) as (Product & { cartItemId: string })[],
  [products, cartItems]);

  // Handlers
  const handlePin = (id: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, isPinned: !p.isPinned } : p));
  };
  
  const handleAddToCart = (product: Product) => {
    const isAlreadyInCart = cartItems.some(item => item.productId === product.id);
    
    if (isAlreadyInCart) {
      const confirmAdd = window.confirm(`此產品「${product.name}」已在報價單中，是否再次添加？`);
      if (!confirmAdd) return;
      
      const cartItemId = `${product.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setCartItems(prev => [...prev, { cartItemId, productId: product.id }]);
      alert('產品已再次添加到報價單');
    } else {
      const cartItemId = `${product.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setCartItems(prev => [...prev, { cartItemId, productId: product.id }]);
    }
  };
  
  const handleRemoveFromCart = (cartItemId: string) => {
    setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const handleGenerateQuote = () => {
    if (cartItems.length === 0) {
      alert('請先將產品加入報價單');
      return;
    }
    setShowQuotePage(true);
  };

  const handleToggleCompare = (id: string) => {
    setCompareList(prev => {
      if (prev.includes(id)) return prev.filter(pid => pid !== id);
      if (prev.length >= 3) {
        alert("最多只能比較 3 項產品");
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleSaveMiscItem = (data: { name: string; specification: string; unit: string; price: string; remarks: string }) => {
    const newItem = {
      id: generateId(),
      category: activeCategory,
      name: data.name,
      specification: data.specification,
      unit: data.unit,
      price: data.price,
      remarks: data.remarks,
      createdAt: Date.now()
    };
    setMiscItems(prev => [...prev, newItem]);
  };

  const handleDeleteMiscItem = (id: string) => {
    if (confirm('確定要刪除此項目嗎？')) {
      setMiscItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleGoogleSheetSync = async (urlOverride?: string) => {
    const urlToUse = urlOverride || googleSheetUrl;
    
    // 確保 urlToUse 是字串
    if (typeof urlToUse !== 'string' || !urlToUse.trim()) {
      alert('請輸入 Google 試算表 URL');
      return;
    }

    setIsSyncing(true);
    try {
      let finalUrl = urlToUse;
      
      // 如果是一般的 Google Sheets URL,轉換為 CSV export URL
      if (urlToUse.includes('/edit')) {
        const match = urlToUse.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
        if (match) {
          const spreadsheetId = match[1];
          finalUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=0`;
        }
      }

      const response = await fetch(finalUrl);
      if (!response.ok) throw new Error('無法取得試算表資料');
      
      const text = await response.text();
      
      // 解析 CSV
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length < 2) throw new Error('試算表沒有資料');
      
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const jsonData = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      // 檢查是否有分類欄位
      const hasCategory = headers.includes('分類');
      
      const newProducts: Product[] = [];
      const newMiscItems: any[] = [];

      jsonData.forEach((row: any) => {
        const category = row['分類']?.toLowerCase();
        
        // 如果有分類欄位且為材料/工具/高空，則加入雜項
        if (hasCategory && (category === '材料' || category === 'materials' || 
            category === '工具' || category === 'tools' || 
            category === '高空' || category === 'high-altitude')) {
          
          let categoryType: 'materials' | 'tools' | 'high-altitude' = 'materials';
          if (category === '工具' || category === 'tools') categoryType = 'tools';
          else if (category === '高空' || category === 'high-altitude') categoryType = 'high-altitude';
          
          newMiscItems.push({
            id: generateId(),
            category: categoryType,
            name: row['項目名稱'] || row['產品名稱'] || row['名稱'] || '未命名項目',
            specification: row['規格'] || '',
            unit: row['單位'] || '',
            price: row['價格'] || row['建議售價'] || '0',
            remarks: row['備註'] || '',
            createdAt: Date.now()
          });
        } else {
          // 否則作為產品處理
          const brandId = findOptionId(row['品牌'], config.brands) || config.brands[0].id;
          const styleId = findOptionId(row['樣式'], config.styles) || config.styles[0].id;
          const typeId = findOptionId(row['種類'], config.types) || config.types[0].id;
          // 管徑直接使用原始值，不轉換為 ID
          const pipeValue = row['管徑'] || config.pipes[0]?.label || '';
          
          const indoor = row['室內機尺寸'] || row['尺寸'] || '';
          const outdoor = row['室外機尺寸'] || '';

          // 判斷環境類型
          let environment: EnvironmentType = 'cooling';
          const envValue = row['環境']?.toLowerCase();
          if (envValue?.includes('暖')) {
            environment = 'heating';
          } else if (envValue?.includes('內機') || envValue?.includes('indoor')) {
            environment = 'indoor-unit';
          } else if (envValue?.includes('冷')) {
            environment = 'cooling';
          }

          newProducts.push({
            id: generateId(),
            name: row['產品名稱'] || '同步產品',
            brandId,
            styleId,
            typeId,
            pipeId: pipeValue,
            environment,
            dimensions: { indoor, outdoor },
            price: row['建議售價'] || row['價格'] || '',
            remarks: row['備註'] || '',
            isPinned: false,
            createdAt: Date.now()
          });
        }
      });

      // 清除現有資料並替換為新資料
      setProducts(newProducts);
      setMiscItems(newMiscItems);
      
      let message = `成功從 Google 試算表同步資料：\n`;
      message += `- 空調產品：${newProducts.length} 筆\n`;
      message += `- 雜項項目：${newMiscItems.length} 筆\n`;
      message += `(已清除舊有資料)`;
      
      alert(message);
      // 保存使用的 URL（可能是參數傳入的或狀態中的）
      localStorage.setItem('googleSheetUrl', urlToUse);
    } catch (err) {
      console.error('同步失敗:', err);
      alert('同步失敗,請確認試算表 URL 是否正確且已設定為公開。\n\n詳見 GOOGLE_SHEETS_SETUP.md 設定說明。');
    } finally {
      setIsSyncing(false);
    }
  };

  // 載入設定並自動同步
  useEffect(() => {
    const savedUrl = localStorage.getItem('googleSheetUrl');
    const savedAutoSync = localStorage.getItem('autoSync');
    const savedMaxCards = localStorage.getItem('maxDisplayCards');
    const savedMiscItems = localStorage.getItem('miscItems');
    
    if (savedUrl) {
      setGoogleSheetUrl(savedUrl);
      
      // 如果有 URL 且啟用自動同步,則執行同步
      if (savedAutoSync === 'true') {
        setAutoSync(true);
        // 延遲一下讓 UI 先渲染，並傳入 savedUrl 避免空值檢查
        setTimeout(() => {
          handleGoogleSheetSync(savedUrl);
        }, 500);
      }
    } else {
      // 沒有 URL 時,停用自動同步
      setAutoSync(false);
      localStorage.setItem('autoSync', 'false');
    }
    
    if (savedMaxCards) {
      setMaxDisplayCards(parseInt(savedMaxCards, 10));
    }

    if (savedMiscItems) {
      try {
        setMiscItems(JSON.parse(savedMiscItems));
      } catch (e) {
        console.error('Failed to load misc items:', e);
      }
    }
  }, []); // 只在首次載入時執行

  // 儲存雜項項目到 localStorage
  useEffect(() => {
    localStorage.setItem('miscItems', JSON.stringify(miscItems));
  }, [miscItems]);

  const handleDeleteRequest = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      setProducts(prev => prev.filter(p => p.id !== deleteId));
      setDeleteId(null);
      setCompareList(prev => prev.filter(id => id !== deleteId));
    }
  };

  const handleSaveProduct = (data: Omit<Product, 'id' | 'createdAt' | 'isPinned'>) => {
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...data } : p));
    } else {
      const newProduct: Product = {
        ...data,
        id: generateId(),
        createdAt: Date.now(),
        isPinned: false
      };
      setProducts(prev => [newProduct, ...prev]);
    }
    setIsFormOpen(false);
    setEditingProduct(undefined);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const jsonData = await parseExcel(file);
      // Basic mapping logic
      const newProducts: Product[] = jsonData.map((row: any) => {
        const brandId = findOptionId(row['品牌'], config.brands) || config.brands[0].id;
        const styleId = findOptionId(row['樣式'], config.styles) || config.styles[0].id;
        const typeId = findOptionId(row['種類'], config.types) || config.types[0].id;
        const pipeId = findOptionId(row['管徑'], config.pipes) || config.pipes[0].id;
        
        // Logic for dimensions: Check for specific columns, fallback to general '尺寸'
        const indoor = row['室內機尺寸'] || row['尺寸'] || '';
        const outdoor = row['室外機尺寸'] || '';

        return {
          id: generateId(),
          name: row['產品名稱'] || '匯入產品',
          brandId,
          styleId,
          typeId,
          pipeId,
          environment: row['環境']?.includes('暖') ? 'heating' : 'cooling',
          dimensions: { indoor, outdoor },
          price: row['價格'] || '',
          remarks: row['備註'] || '',
          isPinned: false,
          createdAt: Date.now()
        };
      });

      setProducts(prev => [...newProducts, ...prev]);
      alert(`成功匯入 ${newProducts.length} 筆資料`);
    } catch (error) {
      console.error(error);
      alert('匯入失敗，請確認檔案格式 (.xlsx 或 .csv)');
    }
    e.target.value = '';
  };

  return (
    <AppErrorOverlay>
      {showQuotePage ? (
        <QuotePage 
          products={cartProducts}
          config={config}
          onBack={() => setShowQuotePage(false)}
          onRemoveFromCart={handleRemoveFromCart}
        />
      ) : (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black flex flex-col font-sans text-white pb-20">
      {/* Navbar */}
      <header className="bg-gradient-to-r from-black via-slate-900 to-black sticky top-0 z-40 shadow-2xl shadow-amber-500/20 backdrop-blur-md border-b-2 border-amber-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-amber-400 to-yellow-600 p-3 rounded-2xl shadow-lg shadow-amber-500/50 hover:shadow-amber-400/70 transition-all hover:rotate-6 transform">
              <img src="./icon.png" alt="Logo" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600">
                小隼 ver. 2.0
              </h1>
              <p className="text-xs text-amber-400/80 font-medium">專業至上 尊榮體驗 ✨</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             {/* BTU Calc Button (New) */}
             <button 
              onClick={() => setIsBTUOpen(true)}
              className="p-3 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 hover:text-amber-300 rounded-2xl transition-all shadow-sm hover:shadow-amber-500/30 hover:scale-105 border border-amber-500/30"
              title="冷房能力試算"
            >
              <Calculator className="w-5 h-5" />
            </button>

            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-3 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 hover:text-amber-300 rounded-2xl transition-all shadow-sm hover:shadow-amber-500/30 hover:scale-105 border border-amber-500/30"
              title="選項設定"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button 
              onClick={() => { setEditingProduct(undefined); setIsFormOpen(true); }}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black px-6 py-3 rounded-full transition-all font-black shadow-lg shadow-amber-500/50 hover:shadow-xl hover:scale-105 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">新增產品</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Dashboard */}
        <Dashboard 
          products={products} 
          config={config} 
          isOpen={isDashboardOpen} 
          onToggle={() => setIsDashboardOpen(!isDashboardOpen)} 
        />

        {/* Search Bar */}
        <div className="relative mb-10 max-w-2xl mx-auto group">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-amber-400 group-focus-within:text-amber-300 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-16 pr-6 py-6 bg-slate-800/90 backdrop-blur-sm border-2 border-amber-500/30 rounded-full text-white placeholder-amber-400/50 focus:border-amber-400 focus:bg-slate-800 shadow-xl shadow-amber-500/20 transition-all text-lg hover:shadow-2xl hover:shadow-amber-500/30"
            placeholder="搜尋產品名稱、型號、品牌... 🔍"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category Tabs */}
        <div className="mb-8 bg-slate-900/70 backdrop-blur-sm rounded-3xl shadow-lg border-2 border-amber-500/30 overflow-hidden p-2">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveCategory('air-conditioning')}
              className={`flex-shrink-0 px-5 sm:px-7 py-4 font-bold text-sm transition-all rounded-2xl flex items-center gap-2 ${
                activeCategory === 'air-conditioning'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-lg shadow-amber-500/50 scale-105'
                  : 'bg-slate-800/50 text-amber-400/70 hover:bg-slate-700 hover:text-amber-400 hover:shadow-md border border-amber-500/20'
              }`}
            >
              <Package className="w-5 h-5" />
              空調
            </button>
            <button
              onClick={() => setActiveCategory('materials')}
              className={`flex-shrink-0 px-5 sm:px-7 py-4 font-bold text-sm transition-all rounded-2xl flex items-center gap-2 ${
                activeCategory === 'materials'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-lg shadow-amber-500/50 scale-105'
                  : 'bg-slate-800/50 text-amber-400/70 hover:bg-slate-700 hover:text-amber-400 hover:shadow-md border border-amber-500/20'
              }`}
            >
              <Scale className="w-5 h-5" />
              材料
            </button>
            <button
              onClick={() => setActiveCategory('tools')}
              className={`flex-shrink-0 px-5 sm:px-7 py-4 font-bold text-sm transition-all rounded-2xl flex items-center gap-2 ${
                activeCategory === 'tools'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-lg shadow-amber-500/50 scale-105'
                  : 'bg-slate-800/50 text-amber-400/70 hover:bg-slate-700 hover:text-amber-400 hover:shadow-md border border-amber-500/20'
              }`}
            >
              <Settings className="w-5 h-5" />
              工具
            </button>
            <button
              onClick={() => setActiveCategory('high-altitude')}
              className={`flex-shrink-0 px-5 sm:px-7 py-4 font-bold text-sm transition-all rounded-2xl flex items-center gap-2 ${
                activeCategory === 'high-altitude'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-lg shadow-amber-500/50 scale-105'
                  : 'bg-slate-800/50 text-amber-400/70 hover:bg-slate-700 hover:text-amber-400 hover:shadow-md border border-amber-500/20'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              高空
            </button>
          </div>
        </div>

        {/* Stats & View Switcher */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
           <div>
             <h2 className={`text-4xl font-black tracking-tight mb-2 px-5 py-3 rounded-2xl inline-block ${
               activeCategory === 'air-conditioning' ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500' : 
               activeCategory === 'materials' ? 'text-amber-400 bg-gradient-to-r from-slate-900 to-black border-3 border-amber-500/30 shadow-md' :
               activeCategory === 'tools' ? 'text-amber-400 bg-gradient-to-r from-slate-900 to-black border-3 border-amber-500/30 shadow-md' :
               'text-amber-400 bg-gradient-to-r from-slate-900 to-black border-3 border-amber-500/30 shadow-md'
             }`}>
               {activeCategory === 'air-conditioning' ? '🌟 產品列表' : 
                activeCategory === 'materials' ? '📦 材料項目' :
                activeCategory === 'tools' ? '🔧 工具項目' :
                '⛰️ 高空項目'}
             </h2>
             <span className="text-amber-400 font-bold bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-2 rounded-full text-sm ml-2 border-2 border-amber-500/30 shadow-sm">
               {activeCategory === 'air-conditioning' ? `共 ${filteredProducts.length} 筆` : `共 ${miscItems.filter(item => item.category === activeCategory).length} 筆`}
             </span>
           </div>

           {/* View Switcher Controls - Only show for air-conditioning */}
           {activeCategory === 'air-conditioning' && (
           <div className="bg-slate-900/80 backdrop-blur-sm p-2 rounded-2xl border-2 border-amber-500/30 shadow-md flex items-center gap-1.5">
             <button 
               onClick={() => setViewMode('grid')}
               className={`p-3 rounded-xl transition-all ${
                 viewMode === 'grid' 
                   ? 'bg-gradient-to-br from-amber-500 to-yellow-600 text-black shadow-lg shadow-amber-500/50 scale-105' 
                   : 'text-amber-400/70 hover:text-amber-400 hover:bg-amber-500/20'
               }`}
               title="卡片檢視"
             >
               <LayoutGrid className="w-5 h-5" />
             </button>
             <button 
               onClick={() => setViewMode('list')}
               className={`p-3 rounded-xl transition-all ${
                 viewMode === 'list' 
                   ? 'bg-gradient-to-br from-amber-500 to-yellow-600 text-black shadow-lg shadow-amber-500/50 scale-105' 
                   : 'text-amber-400/70 hover:text-amber-400 hover:bg-amber-500/20'
               }`}
               title="條列式"
             >
               <List className="w-5 h-5" />
             </button>
             <button 
               onClick={() => setViewMode('compact')}
               className={`p-3 rounded-xl transition-all ${
                 viewMode === 'compact' 
                   ? 'bg-gradient-to-br from-amber-500 to-yellow-600 text-black shadow-lg shadow-amber-500/50 scale-105' 
                   : 'text-amber-400/70 hover:text-amber-400 hover:bg-amber-500/20'
               }`}
               title="小圖示"
             >
               <Grid3x3 className="w-5 h-5" />
             </button>
           </div>
           )}
        </div>

        {/* Content based on active category */}
        {activeCategory === 'air-conditioning' ? (
          // Show product cards
          <>
        {/* Product Grid / List / Compact Wrapper */}
        {filteredProducts.length > 0 ? (
          <>
            <div className={
              viewMode === 'list' 
                ? "flex flex-col gap-3" 
                : viewMode === 'compact'
                ? "grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-5"
                : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            }>
              {(() => {
                const startIndex = (currentPage - 1) * maxDisplayCards;
                const endIndex = startIndex + maxDisplayCards;
                return filteredProducts.slice(startIndex, endIndex).map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    config={config}
                    viewMode={viewMode}
                    isSelected={compareList.includes(product.id)}
                    onToggleCompare={handleToggleCompare}
                    onPin={handlePin}
                    onEdit={(p) => { setEditingProduct(p); setIsFormOpen(true); }}
                    onDelete={handleDeleteRequest}
                    onAddToCart={handleAddToCart}
                  />
                ));
              })()}
            </div>
            
            {/* Pagination Controls */}
            {filteredProducts.length > maxDisplayCards && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  onClick={() => {
                    setCurrentPage(prev => Math.max(1, prev - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === 1}
                  className="p-4 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 border-2 border-amber-500/30 text-amber-400 hover:from-slate-700 hover:to-slate-800 hover:border-amber-400 hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:from-slate-800 disabled:hover:to-slate-900 disabled:hover:scale-100 transition-all shadow-md disabled:shadow-sm"
                  title="上一頁"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                
                <div className="flex items-center gap-3 px-6 py-3 bg-slate-900/80 backdrop-blur-sm border-2 border-amber-500/30 rounded-2xl shadow-lg">
                  <span className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">
                    第 {currentPage} 頁
                  </span>
                  <span className="text-amber-500/50 font-bold">/</span>
                  <span className="text-base font-black text-amber-400">
                    共 {Math.ceil(filteredProducts.length / maxDisplayCards)} 頁
                  </span>
                  <span className="text-xs text-amber-400/50 ml-2 bg-amber-500/10 px-2 py-1 rounded-full font-medium border border-amber-500/20">
                    ({(currentPage - 1) * maxDisplayCards + 1}-{Math.min(currentPage * maxDisplayCards, filteredProducts.length)} / {filteredProducts.length})
                  </span>
                </div>
                
                <button
                  onClick={() => {
                    setCurrentPage(prev => Math.min(Math.ceil(filteredProducts.length / maxDisplayCards), prev + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage >= Math.ceil(filteredProducts.length / maxDisplayCards)}
                  className="p-4 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 border-2 border-amber-500/30 text-amber-400 hover:from-slate-700 hover:to-slate-800 hover:border-amber-400 hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:from-slate-800 disabled:hover:to-slate-900 disabled:hover:scale-100 transition-all shadow-md disabled:shadow-sm"
                  title="下一頁"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl border-4 border-amber-500/30 animate-pulse">
              <Search className="w-14 h-14 text-amber-400" />
            </div>
            <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500 mb-3">🔍 沒有找到產品</h3>
            <p className="text-amber-400/70 font-medium text-lg">試試看搜尋其他關鍵字或點擊上方「新增產品」</p>
          </div>
        )}
        </>
        ) : (
          // Show misc items table for other categories
          <div className="bg-gradient-to-br from-slate-900 to-black backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-amber-500/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 border-b-2 border-amber-500/30">
                  <tr>
                    <th className="px-3 sm:px-6 py-4 sm:py-5 text-left text-xs font-black text-amber-400 uppercase tracking-wider whitespace-nowrap">名稱</th>
                    <th className="px-3 sm:px-6 py-4 sm:py-5 text-left text-xs font-black text-amber-400 uppercase tracking-wider whitespace-nowrap">規格</th>
                    <th className="px-3 sm:px-6 py-4 sm:py-5 text-left text-xs font-black text-amber-400 uppercase tracking-wider whitespace-nowrap">單位</th>
                    <th className="px-3 sm:px-6 py-4 sm:py-5 text-left text-xs font-black text-amber-400 uppercase tracking-wider whitespace-nowrap">價格</th>
                    <th className="hidden md:table-cell px-6 py-5 text-left text-xs font-black text-amber-400 uppercase tracking-wider whitespace-nowrap">備註</th>
                    <th className="px-3 sm:px-6 py-4 sm:py-5 text-right text-xs font-black text-amber-400 uppercase tracking-wider whitespace-nowrap">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-500/20">
                  {miscItems.filter(item => item.category === activeCategory).length > 0 ? (
                    miscItems.filter(item => item.category === activeCategory).map((item, index) => (
                      <tr key={item.id} className="hover:bg-amber-500/10 transition-all">
                        <td className="px-3 sm:px-6 py-4 sm:py-5 text-xs sm:text-sm font-bold text-amber-400 whitespace-nowrap">{item.name}</td>
                        <td className="px-3 sm:px-6 py-4 sm:py-5 text-xs sm:text-sm text-amber-300/70 whitespace-nowrap">{item.specification}</td>
                        <td className="px-3 sm:px-6 py-4 sm:py-5 text-xs sm:text-sm font-medium text-amber-300/70 whitespace-nowrap">{item.unit}</td>
                        <td className="px-3 sm:px-6 py-4 sm:py-5 text-xs sm:text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500 whitespace-nowrap">${item.price}</td>
                        <td className="hidden md:table-cell px-6 py-5 text-sm text-amber-300/50">{item.remarks || '-'}</td>
                        <td className="px-3 sm:px-6 py-4 sm:py-5 text-right">
                          <button 
                            onClick={() => handleDeleteMiscItem(item.id)}
                            className="text-amber-400/50 hover:text-red-400 hover:bg-red-500/20 transition-all p-2.5 rounded-xl border border-transparent hover:border-red-500/30"
                            title="刪除項目"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-20 h-20 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center border-2 border-amber-500/30">
                            <Package className="w-10 h-10 text-amber-400" />
                          </div>
                          <p className="text-amber-400/70 font-medium">尚無資料，點擊下方按鈕新增項目</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-5 border-t-2 border-amber-500/30 bg-gradient-to-r from-slate-900 to-black">
              <button 
                onClick={() => setIsMiscFormOpen(true)}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black rounded-2xl font-black shadow-xl hover:shadow-2xl hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
              >
                <Plus className="w-6 h-6" />
                新增項目
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Floating Compare Bar */}
      {compareList.length > 0 && (
        <div className="fixed bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 px-4 w-full max-w-2xl">
          <div className="bg-gradient-to-r from-black via-slate-900 to-black backdrop-blur-md text-white rounded-3xl sm:rounded-full pl-6 pr-3 py-3 sm:py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-6 shadow-2xl border-2 border-amber-500/50">
            <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 px-2 sm:px-0">
              <span className="font-black text-base sm:text-lg text-amber-400 whitespace-nowrap">✨ 已選 {compareList.length} 項</span>
              <span className="text-xs sm:text-sm text-amber-400/70">(最多 3 項)</span>
            </div>
            <div className="flex gap-2 sm:ml-auto">
              <button 
                onClick={() => setCompareList([])}
                className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 rounded-full transition-all text-sm font-bold backdrop-blur-sm border border-amber-500/30"
              >
                清除
              </button>
              <button 
                onClick={() => setIsComparisonOpen(true)}
                className="flex-1 sm:flex-none px-5 sm:px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black rounded-full transition-all text-sm font-black shadow-lg flex items-center justify-center gap-2 hover:scale-105"
              >
                <ArrowRightLeft className="w-4 h-4 sm:w-5 sm:h-5"/> 
                <span className="whitespace-nowrap">開始比較</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Quote Button */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
        <button
          onClick={handleGenerateQuote}
          className="group bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:via-yellow-400 hover:to-amber-500 text-black px-5 sm:px-7 py-4 sm:py-5 rounded-full shadow-2xl hover:shadow-amber-500/60 transition-all duration-300 flex items-center gap-2 font-black text-sm sm:text-base hover:scale-110 active:scale-95 border-2 border-amber-400"
          title="生成報價單"
        >
          <FileDown className="w-6 h-6 sm:w-7 sm:h-7 group-hover:animate-bounce" />
          <span className="hidden sm:inline">生成報價單</span>
          <span className="sm:hidden">報價單</span>
          {cartItems.length > 0 && (
            <span className="ml-1 bg-black text-amber-400 text-xs font-black px-2.5 py-1 rounded-full">
              {cartItems.length}
            </span>
          )}
        </button>
      </div>

      {/* Modals */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        config={config} 
        onSaveConfig={setConfig}
        products={products}
        onImport={handleImport}
        googleSheetUrl={googleSheetUrl}
        setGoogleSheetUrl={setGoogleSheetUrl}
        onGoogleSheetSync={(url) => handleGoogleSheetSync(url)}
        isSyncing={isSyncing}
        autoSync={autoSync}
        setAutoSync={(value) => {
          setAutoSync(value);
          localStorage.setItem('autoSync', value.toString());
        }}
        maxDisplayCards={maxDisplayCards}
        setMaxDisplayCards={setMaxDisplayCards}
        filteredProducts={filteredProducts}
      />
      
      <ProductForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSubmit={handleSaveProduct} 
        initialData={editingProduct} 
        config={config} 
      />

      <MiscItemForm
        isOpen={isMiscFormOpen}
        onClose={() => setIsMiscFormOpen(false)}
        onSave={handleSaveMiscItem}
        category={activeCategory}
      />

      <ConfirmModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={confirmDelete}
        title="確認刪除"
        message="您確定要刪除這個產品檔案嗎？此動作無法復原，請謹慎操作。"
      />

      <BTUModal 
        isOpen={isBTUOpen} 
        onClose={() => setIsBTUOpen(false)} 
      />

      <ComparisonModal 
        isOpen={isComparisonOpen} 
        onClose={() => setIsComparisonOpen(false)} 
        products={compareProducts}
        config={config}
      />
    </div>
      )}
    </AppErrorOverlay>
  );
}

// --- Error Overlay for runtime diagnostics ---
const AppErrorOverlay: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const onErr = (ev: ErrorEvent) => {
      setErrors(prev => [...prev, `Error: ${ev.message} at ${ev.filename}:${ev.lineno}:${ev.colno}`]);
    };
    const onReject = (ev: PromiseRejectionEvent) => {
      setErrors(prev => [...prev, `UnhandledRejection: ${String(ev.reason)}`]);
    };
    window.addEventListener('error', onErr);
    window.addEventListener('unhandledrejection', onReject as EventListener);
    return () => {
      window.removeEventListener('error', onErr);
      window.removeEventListener('unhandledrejection', onReject as EventListener);
    };
  }, []);

  return (
    <>
      {children}
      {errors.length > 0 && (
        <div className="fixed inset-4 z-50 pointer-events-none">
          <div className="max-w-3xl m-auto bg-red-900/90 text-white rounded-2xl p-4 shadow-2xl pointer-events-auto">
            <div className="flex justify-between items-center mb-2">
              <div className="font-bold">Runtime Errors</div>
              <button onClick={() => setErrors([])} className="text-sm opacity-80 hover:opacity-100">Clear</button>
            </div>
            <div className="text-xs leading-relaxed">
              {errors.map((e, i) => <div key={i} className="mb-2 break-words">{e}</div>)}
            </div>
          </div>
        </div>
      )}
    </>
  );
};