import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, Settings, Pin, Trash2, Edit2, Download, 
  Sun, Snowflake, Upload, X, Save, AlertTriangle, Menu,
  LayoutGrid, List, Grid3x3, Home, Trees, BarChart3, ChevronDown, ChevronUp,
  Package, DollarSign, TrendingUp, PieChart, Zap, FileDown, Calculator, Scale, CheckCircle2, ArrowRightLeft
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
    <div className="mb-8 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden transition-all duration-300">
      {/* Header / Toggle */}
      <div 
        onClick={onToggle}
        className="bg-white p-5 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition border-b border-slate-100 group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg group-hover:scale-110 transition-transform">
             <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-lg font-bold text-slate-800 block">產品分析</span>
            <span className="text-xs text-slate-500 font-medium">即時庫存概況分析</span>
          </div>
        </div>
        <button className="text-slate-400 group-hover:text-indigo-600 transition-colors">
          {isOpen ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
        </button>
      </div>

      {/* Content */}
      <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-6">
          {/* Top Row: Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
            {/* Total Products */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-500/30 group hover:-translate-y-1 transition-transform">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-125">
                <Package className="w-16 h-16" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2 text-indigo-100">
                  <Package className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">總產品數</span>
                </div>
                <div className="text-3xl font-black">{stats.total}</div>
                <div className="mt-2 text-xs text-indigo-100 font-medium bg-white/20 inline-block px-2 py-0.5 rounded-full">
                  {stats.pinned} 個釘選項目
                </div>
              </div>
            </div>
            
            {/* Heating */}
            <div className="relative overflow-hidden bg-gradient-to-br from-orange-400 to-rose-500 rounded-2xl p-5 text-white shadow-lg shadow-orange-500/30 group hover:-translate-y-1 transition-transform">
              <div className="absolute -bottom-4 -right-4 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform rotate-12">
                <Sun className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2 text-orange-50">
                  <Sun className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">暖氣功能</span>
                </div>
                <div className="flex items-end gap-2">
                  <div className="text-3xl font-black">{stats.heating}</div>
                  <div className="text-sm font-medium opacity-80 mb-1">台</div>
                </div>
                <div className="w-full bg-black/10 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-white/90" style={{ width: `${stats.total ? (stats.heating/stats.total)*100 : 0}%` }}></div>
                </div>
              </div>
            </div>

            {/* Cooling */}
            <div className="relative overflow-hidden bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl p-5 text-white shadow-lg shadow-cyan-500/30 group hover:-translate-y-1 transition-transform">
               <div className="absolute -top-4 -right-4 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform -rotate-12">
                <Snowflake className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2 text-cyan-50">
                  <Snowflake className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">冷氣專用</span>
                </div>
                 <div className="flex items-end gap-2">
                  <div className="text-3xl font-black">{stats.cooling}</div>
                  <div className="text-sm font-medium opacity-80 mb-1">台</div>
                </div>
                 <div className="w-full bg-black/10 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-white/90" style={{ width: `${stats.total ? (stats.cooling/stats.total)*100 : 0}%` }}></div>
                </div>
              </div>
            </div>

             {/* Dominant Style (Replaced Avg Price) */}
             <div className="relative overflow-hidden bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg shadow-purple-500/30 group hover:-translate-y-1 transition-transform">
               <div className="absolute top-1/2 right-2 transform -translate-y-1/2 opacity-10 group-hover:opacity-20">
                <LayoutGrid className="w-16 h-16" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2 text-fuchsia-100">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">主流樣式</span>
                </div>
                <div className="text-2xl font-black tracking-tight truncate">{stats.dominantStyle.label}</div>
                <div className="mt-2 text-xs text-fuchsia-100 font-medium">
                  佔庫存 {Math.round(stats.dominantStyle.percent)}% ({stats.dominantStyle.count}台)
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Brand Distribution */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
            <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <div className="p-1 bg-indigo-100 text-indigo-600 rounded">
                <PieChart className="w-4 h-4" /> 
              </div>
              品牌佔比分佈
            </h4>
            
            <div className="h-6 w-full bg-white rounded-full overflow-hidden flex shadow-inner mb-4">
              {stats.brandStats.map((brand, index) => (
                <div 
                  key={brand.id}
                  className="h-full transition-all hover:brightness-110 relative group first:rounded-l-full last:rounded-r-full"
                  style={{ width: `${brand.percent}%`, backgroundColor: brand.color }}
                >
                   <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10 pointer-events-none">
                    {brand.label}: {Math.round(brand.percent)}%
                   </div>
                </div>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {stats.brandStats.map(brand => (
                <div key={brand.id} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-slate-100 shadow-sm">
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: brand.color }} />
                  <span className="text-xs font-medium text-slate-600">{brand.label}</span>
                  <span className="text-xs font-bold text-slate-800 bg-slate-100 px-1.5 rounded-md">{Math.round(brand.percent)}%</span>
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
  setAutoSync
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  config: AppConfig; 
  onSaveConfig: (newConfig: AppConfig) => void;
  products: Product[];
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  googleSheetUrl: string;
  setGoogleSheetUrl: (url: string) => void;
  onGoogleSheetSync: () => void;
  isSyncing: boolean;
  autoSync: boolean;
  setAutoSync: (value: boolean) => void;
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
                onClick={onGoogleSheetSync}
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
        </div>

        <div className="p-4 border-t bg-white flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition font-medium">取消</button>
          <button 
            onClick={() => { onSaveConfig(localConfig); onClose(); }}
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
        setFormData({
          name: initialData.name,
          brandId: initialData.brandId,
          styleId: initialData.styleId,
          typeId: initialData.typeId,
          pipeId: initialData.pipeId,
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
          pipeId: config.pipes[0]?.id || '',
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
          
          {/* Environment (Sun/Snow) */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">環境功能 (選擇圖示)</label>
            <div className="grid grid-cols-2 gap-4">
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
                <span className="font-medium">暖氣 (太陽)</span>
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
                <span className="font-medium">冷氣 (雪花)</span>
                {formData.environment === 'cooling' && <div className="absolute top-2 right-2 w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />}
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
              <select required value={formData.pipeId} onChange={e => setFormData({...formData, pipeId: e.target.value})} className="w-full rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border bg-white">
                {config.pipes.map(opt => <option key={opt.id} value={opt.id} style={{color: opt.color}}>{opt.label}</option>)}
              </select>
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
            <div className="p-1.5 sm:p-2 bg-indigo-100 text-indigo-600 rounded-lg"><ArrowRightLeft className="w-4 h-4 sm:w-5 sm:h-5"/></div>
            <span className="hidden xs:inline">產品超級比一比</span>
            <span className="xs:hidden">比較</span>
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
  onBack 
}: { 
  products: Product[]; 
  config: AppConfig; 
  onBack: () => void;
}) => {
  const [customerName, setCustomerName] = useState('');
  const [quoteDate, setQuoteDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [quoteTitle, setQuoteTitle] = useState('空調設備報價單');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  
  // Product price adjustments
  const [productPrices, setProductPrices] = useState<Record<string, string>>(() => {
    const initialPrices: Record<string, string> = {};
    products.forEach(p => {
      initialPrices[p.id] = p.price.toString();
    });
    return initialPrices;
  });
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  
  const handleUpdateProductPrice = (productId: string, newPrice: string) => {
    setProductPrices(prev => ({ ...prev, [productId]: newPrice }));
  };
  
  // Calculator state
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcPrevValue, setCalcPrevValue] = useState<string | null>(null);
  const [calcOperation, setCalcOperation] = useState<string | null>(null);
  const [calcNewNumber, setCalcNewNumber] = useState(true);
  
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
    price: string;
  };
  
  const [customItems, setCustomItems] = useState<CustomItem[]>([]);
  
  // Common custom items templates
  const commonItems = [
    { name: '安裝費用', description: '分離式安裝工資×組', price: '3500' },
    { name: '移機費用', description: '拆除&安裝工資×組', price: '4500' },
    { name: '銅線費用', description: '客廳/主/次臥銅管&線材費用共計', price: '5000' },
    { name: '安裝架', description: '室外機不鏽鋼L/豪華架', price: '2000' },
    { name: '洗孔費用', description: '牆體洗洞工程×孔', price: '1000' },
    { name: '焊接費用', description: '焊接工程', price: '1500' },
    { name: '管槽費用', description: '防曬美化管槽(○色)', price: '3000' },
    { name: '危險施工作業', description: '高空危險施工費用', price: '5000' },
    { name: '管路保養', description: '舊管冷凍油清洗工程×組', price: '3000' },
    { name: '清洗保養', description: '室內/外機-清洗保養服務×組', price: '3000' },
    { name: '打壁費用', description: '牆體切槽配管含水泥填回×組', price: '2000' },
    { name: '其他', description: '', price: '0' },
  ];

  const handleAddCustomItem = () => {
    const newItem: CustomItem = {
      id: generateId(),
      name: '',
      description: '',
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
      price: commonItem.price
    };
    setCustomItems(updated);
  };

  const handleUpdateCustomItem = (index: number, field: keyof CustomItem, value: string) => {
    const updated = [...customItems];
    updated[index][field] = value;
    setCustomItems(updated);
  };

  const handleRemoveCustomItem = (index: number) => {
    setCustomItems(customItems.filter((_, i) => i !== index));
  };

  const totalPrice = useMemo(() => {
    const productsTotal = products.reduce((sum, p) => {
      const adjustedPrice = productPrices[p.id] || p.price.toString();
      const price = parseInt(adjustedPrice.replace(/,/g, ''), 10);
      return sum + (isNaN(price) ? 0 : price);
    }, 0);
    
    const customTotal = customItems.reduce((sum, item) => {
      const price = parseInt(item.price.replace(/,/g, ''), 10);
      return sum + (isNaN(price) ? 0 : price);
    }, 0);
    
    return productsTotal + customTotal;
  }, [products, customItems, productPrices]);

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
          const fileName = `報價單_${quoteDate}_${customerName || '客戶'}.jpg`;
          link.download = fileName;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
        }
        setIsExporting(false);
      }, 'image/jpeg', 0.95);
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

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      // 使用 window.print 搭配自訂樣式來生成 PDF
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>報價單_${quoteDate}_${customerName || '客戶'}</title>
              <style>
                body { margin: 0; padding: 0; }
                img { width: 100%; height: auto; display: block; }
                @media print {
                  body { margin: 0; }
                  img { page-break-inside: avoid; }
                }
              </style>
            </head>
            <body>
              <img src="${imgData}" />
              <script>
                window.onload = function() {
                  window.print();
                  setTimeout(function() { window.close(); }, 100);
                }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
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
              onClick={() => setShowCalculator(!showCalculator)}
              className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition font-medium"
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
                    <div className="font-medium">匯出 JPG</div>
                    <div className="text-xs text-slate-500">圖片格式</div>
                  </div>
                </button>
                <button
                  onClick={handleExportPDF}
                  className="w-full px-4 py-2 text-left hover:bg-slate-50 transition flex items-center gap-3 text-slate-700"
                >
                  <FileDown className="w-4 h-4 text-red-600" />
                  <div>
                    <div className="font-medium">匯出 PDF</div>
                    <div className="text-xs text-slate-500">列印為PDF</div>
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
          <div className="text-center mb-10 pb-8 border-b-2 border-slate-200">
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
                          setQuoteTitle('空調設備報價單');
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
              <h1 className="hidden export-show text-4xl sm:text-5xl font-black text-indigo-600 mb-3">{quoteTitle}</h1>
              
              <div className="h-1 bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 rounded-full mb-3"></div>
            </div>
            <p className="text-slate-500 text-sm tracking-wider">QUOTATION</p>
          </div>

          {/* Info Section */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 mb-8 border border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                  客戶姓名
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="export-hide w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                  placeholder="請輸入客戶姓名"
                />
                <div className="hidden export-show px-4 py-3 border border-slate-300 rounded-lg bg-white min-h-[48px] flex items-center font-medium text-slate-800">
                  {customerName || '未填寫'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                  報價日期
                </label>
                <input
                  type="date"
                  value={quoteDate}
                  onChange={(e) => setQuoteDate(e.target.value)}
                  className="export-hide w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                />
                <div className="hidden export-show px-4 py-3 border border-slate-300 rounded-lg bg-white min-h-[48px] flex items-center font-medium text-slate-800">
                  {quoteDate || '未填寫'}
                </div>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="mb-8 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                  <th className="text-center p-4 font-bold text-sm w-16 rounded-tl-xl">項次</th>
                  <th className="text-center p-4 font-bold text-sm">產品名稱</th>
                  <th className="text-center p-4 font-bold text-sm">品牌</th>
                  <th className="text-center p-4 font-bold text-sm">規格</th>
                  <th className="text-center p-4 font-bold text-sm w-32">單價</th>
                  <th className="export-hide w-12 rounded-tr-xl"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => {
                  const brand = config.brands.find(b => b.id === product.brandId);
                  const style = config.styles.find(s => s.id === product.styleId);
                  const type = config.types.find(t => t.id === product.typeId);
                  const pipe = config.pipes.find(p => p.id === product.pipeId);
                  const EnvIcon = product.environment === 'heating' ? Sun : Snowflake;
                  
                  return (
                    <tr key={product.id} className="group border-b border-slate-200 hover:bg-slate-50">
                      <td className="p-4 text-center align-middle text-slate-600">{index + 1}</td>
                      <td className="p-4 text-center align-middle">
                        <div className="font-medium text-slate-800">{product.name}</div>
                        {product.remarks && (
                          <div className="text-xs text-slate-500 mt-1">{product.remarks}</div>
                        )}
                      </td>
                      <td className="p-4 text-center align-middle text-slate-700">{brand?.label}</td>
                      <td className="p-4 text-center align-middle text-sm text-slate-600">
                        <div className="flex items-center justify-center gap-2">
                          <span>{style?.label} / {type?.label}</span>
                          <EnvIcon className={`w-4 h-4 ${product.environment === 'heating' ? 'text-orange-500' : 'text-cyan-500'}`} />
                        </div>
                      </td>
                      <td className="p-4 text-center align-middle">
                        <div className="export-hide flex items-center justify-end gap-2">
                          {editingPriceId === product.id ? (
                            <>
                              <input
                                type="text"
                                value={productPrices[product.id] || product.price}
                                onChange={(e) => handleUpdateProductPrice(product.id, e.target.value)}
                                onBlur={() => setEditingPriceId(null)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') setEditingPriceId(null);
                                  if (e.key === 'Escape') {
                                    handleUpdateProductPrice(product.id, product.price.toString());
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
                                ${productPrices[product.id] || product.price}
                              </span>
                              <button
                                onClick={() => setEditingPriceId(product.id)}
                                className="text-indigo-600 hover:text-indigo-700 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="編輯價格"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                        <div className="hidden export-show text-center font-mono font-bold text-slate-800">
                          ${productPrices[product.id] || product.price}
                        </div>
                      </td>
                      <td className="export-hide"></td>
                    </tr>
                  );
                })}
                
                {/* Custom Items */}
                {customItems.map((item, index) => (
                  <tr key={item.id} className="border-b border-slate-200 bg-blue-50/30">
                    <td className="p-4 text-center align-middle text-slate-600">{products.length + index + 1}</td>
                    <td className="p-4 text-center align-middle" colSpan={1}>
                      <div className="export-hide">
                        <select
                          value={item.name || ""}
                          onChange={(e) => {
                            if (e.target.value === "") {
                              // 清空，讓使用者自訂
                              handleUpdateCustomItem(index, 'name', '');
                              handleUpdateCustomItem(index, 'description', '');
                              handleUpdateCustomItem(index, 'price', '0');
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
                      <div className="hidden export-show font-medium text-slate-800">{item.name || '未命名項目'}</div>
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
                    <td className="p-4 text-center align-middle">
                      <div className="export-hide">
                        <input
                          type="text"
                          value={item.price}
                          onChange={(e) => handleUpdateCustomItem(index, 'price', e.target.value)}
                          placeholder="0"
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-right font-mono font-bold text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="hidden export-show text-center font-mono font-bold text-slate-800">${item.price}</div>
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
                ))}
                
                {/* Add Custom Item Button */}
                <tr className="export-hide">
                  <td colSpan={6} className="p-3">
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
                  <td colSpan={4} className="p-5 text-center font-black text-xl text-slate-700">
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

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">備註說明</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="export-hide w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-32 resize-none"
              placeholder="請輸入備註事項（如：付款方式、貨物稅申請、汰舊換新廢四機...等）"
            />
            <div className="hidden export-show px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 min-h-[128px] whitespace-pre-wrap break-words">
              {notes || '無'}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-10 pt-8 border-t-2 border-slate-200">
            <div className="bg-gradient-to-br from-slate-50 to-indigo-50 rounded-2xl p-6 text-center">
              <div className="text-indigo-600 font-bold text-lg mb-3">注意事項</div>
              <div className="space-y-2 text-sm text-slate-600">
                <p className="flex items-center justify-center gap-2">
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                  本報價單有效期限為 30 天
                </p>
                <p className="flex items-center justify-center gap-2">
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                  如有任何疑問，請隨時與我們聯繫
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Calculator Modal */}
      {showCalculator && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden">
            {/* Calculator Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Calculator className="w-5 h-5" />
                <span className="font-bold">計算機</span>
              </div>
              <button
                onClick={() => setShowCalculator(false)}
                className="text-white hover:bg-white/20 rounded-lg p-1 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Calculator Display */}
            <div className="bg-slate-900 p-6">
              <div className="text-right">
                {calcOperation && calcPrevValue && (
                  <div className="text-slate-400 text-sm mb-1 font-mono">
                    {calcPrevValue} {calcOperation}
                  </div>
                )}
                <div className="text-white text-4xl font-mono font-bold break-all">
                  {calcDisplay}
                </div>
              </div>
            </div>
            
            {/* Calculator Buttons */}
            <div className="grid grid-cols-4 gap-0 bg-slate-100">
              {[
                { label: 'C', type: 'function', action: handleCalcClear, color: 'bg-red-500 hover:bg-red-600 text-white' },
                { label: '÷', type: 'operator', action: () => handleCalcOperation('÷'), color: 'bg-orange-500 hover:bg-orange-600 text-white' },
                { label: '×', type: 'operator', action: () => handleCalcOperation('×'), color: 'bg-orange-500 hover:bg-orange-600 text-white' },
                { label: '←', type: 'function', action: () => setCalcDisplay(calcDisplay.slice(0, -1) || '0'), color: 'bg-slate-400 hover:bg-slate-500 text-white' },
                
                { label: '7', type: 'number', action: () => handleCalcNumber('7'), color: 'bg-white hover:bg-slate-50' },
                { label: '8', type: 'number', action: () => handleCalcNumber('8'), color: 'bg-white hover:bg-slate-50' },
                { label: '9', type: 'number', action: () => handleCalcNumber('9'), color: 'bg-white hover:bg-slate-50' },
                { label: '-', type: 'operator', action: () => handleCalcOperation('-'), color: 'bg-orange-500 hover:bg-orange-600 text-white' },
                
                { label: '4', type: 'number', action: () => handleCalcNumber('4'), color: 'bg-white hover:bg-slate-50' },
                { label: '5', type: 'number', action: () => handleCalcNumber('5'), color: 'bg-white hover:bg-slate-50' },
                { label: '6', type: 'number', action: () => handleCalcNumber('6'), color: 'bg-white hover:bg-slate-50' },
                { label: '+', type: 'operator', action: () => handleCalcOperation('+'), color: 'bg-orange-500 hover:bg-orange-600 text-white' },
                
                { label: '1', type: 'number', action: () => handleCalcNumber('1'), color: 'bg-white hover:bg-slate-50' },
                { label: '2', type: 'number', action: () => handleCalcNumber('2'), color: 'bg-white hover:bg-slate-50' },
                { label: '3', type: 'number', action: () => handleCalcNumber('3'), color: 'bg-white hover:bg-slate-50' },
                { label: '=', type: 'equals', action: handleCalcEquals, color: 'bg-indigo-600 hover:bg-indigo-700 text-white row-span-2' },
                
                { label: '0', type: 'number', action: () => handleCalcNumber('0'), color: 'bg-white hover:bg-slate-50 col-span-2' },
                { label: '.', type: 'decimal', action: handleCalcDecimal, color: 'bg-white hover:bg-slate-50' },
              ].map((btn, idx) => (
                <button
                  key={idx}
                  onClick={btn.action}
                  className={`${btn.color} p-6 text-xl font-bold transition active:scale-95 border border-slate-200 ${btn.label === '0' ? 'col-span-2' : ''} ${btn.label === '=' ? 'row-span-2' : ''}`}
                >
                  {btn.label}
                </button>
              ))}
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
}> = ({ 
  product, 
  config, 
  viewMode,
  isSelected,
  onToggleCompare,
  onPin, 
  onEdit, 
  onDelete 
}) => {
  const getLabel = (cat: keyof AppConfig, id: string) => {
    const opt = config[cat].find(x => x.id === id);
    return opt ? { label: opt.label, color: opt.color } : { label: '未知', color: '#94a3b8' };
  };

  const brand = getLabel('brands', product.brandId);
  const style = getLabel('styles', product.styleId);
  const type = getLabel('types', product.typeId);
  const pipe = getLabel('pipes', product.pipeId);

  const cardId = `product-card-${product.id}`;

  const EnvIcon = product.environment === 'heating' ? Sun : Snowflake;
  // Use gradients for text
  const envColorClass = product.environment === 'heating' ? 'text-orange-500' : 'text-cyan-500';
  const envGradientBg = product.environment === 'heating' 
    ? 'bg-gradient-to-br from-orange-100 to-rose-100 border-orange-200' 
    : 'bg-gradient-to-br from-cyan-100 to-blue-100 border-cyan-200';

  // --- COMPACT VIEW ---
  if (viewMode === 'compact') {
    return (
      <div id={cardId} className={`group relative bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col p-5 text-center border overflow-hidden ${isSelected ? 'border-indigo-500 ring-2 ring-indigo-500 ring-offset-2' : 'border-slate-100'}`}>
        {/* Background Decorative Mesh */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${product.environment === 'heating' ? 'from-orange-500 to-rose-500' : 'from-cyan-500 to-blue-500'}`}></div>

        {/* Pin Button - Top Left */}
        <button 
          onClick={() => onPin(product.id)} 
          className={`absolute top-2 left-2 transition-all p-1.5 rounded-full z-10 ${product.isPinned ? 'text-white bg-indigo-500 shadow-md shadow-indigo-500/30' : 'text-slate-300 hover:text-slate-400 opacity-0 group-hover:opacity-100'}`}
        >
          <Pin className={`w-3.5 h-3.5 ${product.isPinned ? 'fill-current' : ''}`} />
        </button>

        {/* Action Buttons (Overlay) */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-white/90 p-1.5 rounded-lg shadow-sm backdrop-blur-md border border-slate-100">
           <button onClick={() => onToggleCompare(product.id)} className={`p-1.5 rounded transition ${isSelected ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-indigo-600'}`}>
            <Scale className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onEdit(product)} className="p-1.5 text-slate-500 hover:text-indigo-600 rounded transition">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(product.id)} className="p-1.5 text-slate-500 hover:text-red-500 rounded transition">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
        
        <div className="flex justify-center mb-4 relative z-10">
          <div className={`p-4 rounded-full border shadow-inner ${envGradientBg} ${envColorClass}`}>
            <EnvIcon className="w-8 h-8" />
          </div>
        </div>
        
        <h3 className="font-bold text-slate-800 text-sm leading-tight mb-2 line-clamp-2 min-h-[2.5em] relative z-10">{product.name}</h3>
        
        <div className="mt-auto relative z-10">
          <span className="text-lg font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">
             {product.price ? `$${product.price}` : '洽詢'}
          </span>
        </div>

        {/* Pin (Overlay Top Left) */}
         <button 
            onClick={() => onPin(product.id)} 
            className={`absolute top-2 left-2 transition-all p-1.5 rounded-full z-10 ${product.isPinned ? 'text-white bg-indigo-500 shadow-md shadow-indigo-500/30' : 'text-slate-300 hover:text-slate-400 opacity-0 group-hover:opacity-100'}`}
          >
            <Pin className={`w-3.5 h-3.5 ${product.isPinned ? 'fill-current' : ''}`} />
          </button>
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
        <div className="hidden lg:flex flex-col text-xs text-slate-500 w-48 shrink-0 border-l border-r border-slate-100 px-4">
           <div className="flex items-center gap-2 mb-1.5">
             <Home className="w-3.5 h-3.5 text-indigo-400" />
             <span className="truncate font-mono" title={product.dimensions.indoor}>{product.dimensions.indoor || '-'}</span>
           </div>
           <div className="flex items-center gap-2">
             <Trees className="w-3.5 h-3.5 text-emerald-400" />
             <span className="truncate font-mono" title={product.dimensions.outdoor}>{product.dimensions.outdoor || '-'}</span>
           </div>
        </div>

        {/* Specs Tags */}
        <div className="hidden md:flex gap-2 flex-wrap w-[25%]">
          <span className="text-xs px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-600 font-medium" style={{color: style.color}}>{style.label}</span>
          <span className="text-xs px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-600 font-medium" style={{color: type.color}}>{type.label}</span>
          <span className="text-xs px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-600 font-medium" style={{color: pipe.color}}>{pipe.label}</span>
        </div>

        {/* Price */}
        <div className="w-16 md:w-28 text-right font-black font-mono text-sm md:text-lg text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600 flex-shrink-0">
           {product.price ? `$${product.price}` : '洽詢'}
        </div>

        {/* Actions */}
        <div className="flex gap-0.5 md:gap-1 w-auto md:w-32 justify-end opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
           <button onClick={() => onToggleCompare(product.id)} className={`p-1.5 md:p-2 rounded-lg transition ${isSelected ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-50'}`} title="加入比較">
            <Scale className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>
          <button onClick={() => onEdit(product)} className="p-1.5 md:p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"><Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4" /></button>
          <button onClick={() => exportToImage(cardId, product.name)} className="hidden sm:block p-1.5 md:p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"><Download className="w-3.5 h-3.5 md:w-4 md:h-4" /></button>
          <button onClick={() => onDelete(product.id)} className="p-1.5 md:p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" /></button>
        </div>
      </div>
    );
  }

  // --- GRID VIEW (Default) ---
  return (
    <div className={`group relative bg-white rounded-3xl shadow-sm hover:shadow-xl border hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden h-full ${isSelected ? 'border-indigo-500 ring-2 ring-indigo-500 ring-offset-2' : 'border-slate-100 hover:border-indigo-100'}`}>
      
      {/* Top Gradient Line */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${product.environment === 'heating' ? 'from-orange-400 to-rose-500' : 'from-cyan-400 to-blue-500'}`}></div>

      {/* Pin Button - Top Left */}
      <button 
        onClick={() => onPin(product.id)} 
        className={`absolute top-4 left-3 transition-all p-1.5 rounded-full z-10 ${product.isPinned ? 'text-white bg-indigo-500 shadow-md shadow-indigo-500/30' : 'text-slate-200 hover:text-slate-300 opacity-0 group-hover:opacity-100'}`}
      >
        <Pin className={`w-4 h-4 ${product.isPinned ? 'fill-current' : ''}`} />
      </button>

      {/* Action Bar */}
      <div className="absolute top-4 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-white/95 p-1.5 rounded-xl shadow-sm backdrop-blur-md border border-slate-100">
         <button onClick={() => onToggleCompare(product.id)} className={`p-1.5 rounded-lg transition ${isSelected ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'}`} title="加入比較">
          <Scale className="w-4 h-4" />
        </button>
        <button onClick={() => onEdit(product)} className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="編輯">
          <Edit2 className="w-4 h-4" />
        </button>
        <button onClick={() => exportToImage(cardId, product.name)} className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition" title="匯出圖檔">
          <Download className="w-4 h-4" />
        </button>
        <button onClick={() => onDelete(product.id)} className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition" title="刪除">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div id={cardId} className="flex flex-col h-full bg-white p-5">
        {/* Header: Environment Icon + Name */}
        <div className="flex justify-between items-start mb-5">
          <div className="flex items-start gap-4">
            <div className={`mt-1 p-3 rounded-2xl flex-shrink-0 shadow-inner border ${envGradientBg} ${envColorClass}`}>
              <EnvIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold tracking-wider uppercase mb-1 opacity-90" style={{ color: brand.color }}>
                {brand.label}
              </div>
              <h3 className="text-lg font-bold text-slate-800 leading-tight">{product.name}</h3>
            </div>
          </div>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5 flex-1">
          <div className="bg-slate-50/80 border border-slate-100 p-3 rounded-xl hover:bg-slate-50 transition-colors">
            <span className="text-xs text-slate-400 block mb-1">樣式</span>
            <span className="font-semibold text-sm" style={{color: style.color}}>{style.label}</span>
          </div>
          <div className="bg-slate-50/80 border border-slate-100 p-3 rounded-xl hover:bg-slate-50 transition-colors">
            <span className="text-xs text-slate-400 block mb-1">種類</span>
            <span className="font-semibold text-sm" style={{color: type.color}}>{type.label}</span>
          </div>
          <div className="bg-slate-50/80 border border-slate-100 p-3 rounded-xl hover:bg-slate-50 transition-colors">
            <span className="text-xs text-slate-400 block mb-1">管徑</span>
            <span className="font-semibold text-sm" style={{color: pipe.color}}>{pipe.label}</span>
          </div>
          
          {/* Dimensions Box */}
          <div className="bg-slate-50/80 border border-slate-100 p-3 rounded-xl flex flex-col justify-center hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2 mb-1.5">
               <Home className="w-3.5 h-3.5 text-indigo-400" />
               <span className="text-xs font-semibold text-slate-700 truncate font-mono">{product.dimensions.indoor || '-'}</span>
            </div>
            <div className="flex items-center gap-2">
               <Trees className="w-3.5 h-3.5 text-emerald-400" />
               <span className="text-xs font-semibold text-slate-700 truncate font-mono">{product.dimensions.outdoor || '-'}</span>
            </div>
          </div>
        </div>

        {/* Footer: Price */}
        <div className="mt-auto pt-4 border-t border-dashed border-slate-200 flex justify-between items-center">
          <span className="text-xs text-slate-400 font-medium">建議售價</span>
          <span className="text-xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">
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
  
  // Modals & UI State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDashboardOpen, setIsDashboardOpen] = useState(true);
  const [isBTUOpen, setIsBTUOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [autoSync, setAutoSync] = useState(false);
  const [showQuotePage, setShowQuotePage] = useState(false);
  
  // Comparison State
  const [compareList, setCompareList] = useState<string[]>([]);

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

  // Handlers
  const handlePin = (id: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, isPinned: !p.isPinned } : p));
  };

  const handleGenerateQuote = () => {
    if (pinnedProducts.length === 0) {
      alert('請先釘選至少一項產品');
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

  const handleGoogleSheetSync = async (urlOverride?: string) => {
    const urlToUse = urlOverride || googleSheetUrl;
    
    if (!urlToUse.trim()) {
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

      // 處理資料
      const newProducts: Product[] = jsonData.map((row: any) => {
        const brandId = findOptionId(row['品牌'], config.brands) || config.brands[0].id;
        const styleId = findOptionId(row['樣式'], config.styles) || config.styles[0].id;
        const typeId = findOptionId(row['種類'], config.types) || config.types[0].id;
        const pipeId = findOptionId(row['管徑'], config.pipes) || config.pipes[0].id;
        
        const indoor = row['室內機尺寸'] || row['尺寸'] || '';
        const outdoor = row['室外機尺寸'] || '';

        return {
          id: generateId(),
          name: row['產品名稱'] || '同步產品',
          brandId,
          styleId,
          typeId,
          pipeId,
          environment: row['環境']?.includes('暖') ? 'heating' : 'cooling',
          dimensions: { indoor, outdoor },
          price: row['建議售價'] || row['價格'] || '',
          remarks: row['備註'] || '',
          isPinned: false,
          createdAt: Date.now()
        };
      });

      // 清除現有資料並替換為新資料
      setProducts(newProducts);
      alert(`成功從 Google 試算表同步 ${newProducts.length} 筆資料\n(已清除舊有資料)`);
      localStorage.setItem('googleSheetUrl', googleSheetUrl);
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
  }, []); // 只在首次載入時執行

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
          products={pinnedProducts}
          config={config}
          onBack={() => setShowQuotePage(false)}
        />
      ) : (
      <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-800 pb-20">
      {/* Navbar */}
      <header className="bg-slate-900 sticky top-0 z-40 shadow-xl shadow-indigo-900/20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-white to-slate-50 p-2 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-400/50 transition-all ring-2 ring-white/20">
              <img src="./icon.png" alt="Logo" className="w-7 h-7 object-contain" />
            </div>
                    <h1 className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-slate-300">
                      AC小隼助手
                    </h1>
          </div>
          
          <div className="flex items-center gap-3">
             {/* BTU Calc Button (New) */}
             <button 
              onClick={() => setIsBTUOpen(true)}
              className="p-2 text-slate-400 hover:text-orange-400 hover:bg-white/10 rounded-full transition"
              title="冷房能力試算"
            >
              <Calculator className="w-5 h-5" />
            </button>

            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition"
              title="選項設定"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button 
              onClick={() => { setEditingProduct(undefined); setIsFormOpen(true); }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2 rounded-full transition font-bold shadow-lg shadow-indigo-500/30 active:scale-95"
            >
              <Plus className="w-4 h-4" />
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
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-indigo-400 group-focus-within:text-indigo-600 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-14 pr-6 py-5 bg-white border-0 ring-1 ring-slate-200 rounded-3xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 shadow-xl shadow-slate-200/60 transition text-lg"
            placeholder="搜尋產品名稱、型號、品牌..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Stats & View Switcher */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
           <div>
             <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-1">產品列表</h2>
             <span className="text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full text-sm">
               共 {filteredProducts.length} 筆
             </span>
           </div>

           {/* View Switcher Controls */}
           <div className="bg-white p-1.5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-1">
             <button 
               onClick={() => setViewMode('grid')}
               className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
               title="卡片檢視"
             >
               <LayoutGrid className="w-5 h-5" />
             </button>
             <button 
               onClick={() => setViewMode('list')}
               className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
               title="條列式"
             >
               <List className="w-5 h-5" />
             </button>
             <button 
               onClick={() => setViewMode('compact')}
               className={`p-2.5 rounded-lg transition-all ${viewMode === 'compact' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
               title="小圖示"
             >
               <Grid3x3 className="w-5 h-5" />
             </button>
           </div>
        </div>

        {/* Product Grid / List / Compact Wrapper */}
        {filteredProducts.length > 0 ? (
          <div className={
            viewMode === 'list' 
              ? "flex flex-col gap-3" 
              : viewMode === 'compact'
              ? "grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-5"
              : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          }>
            {filteredProducts.map(product => (
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
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-100 border border-slate-50">
              <Search className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">沒有找到產品</h3>
            <p className="text-slate-500">試試看搜尋其他關鍵字或點擊上方「新增產品」</p>
          </div>
        )}
      </main>

      {/* Floating Compare Bar */}
      {compareList.length > 0 && (
        <div className="fixed bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 px-4 w-full max-w-2xl">
          <div className="bg-slate-900/90 backdrop-blur-md text-white rounded-2xl sm:rounded-full pl-4 sm:pl-6 pr-2 py-2 sm:py-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-6 shadow-2xl border border-white/10">
            <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 px-2 sm:px-0">
              <span className="font-bold text-sm sm:text-base whitespace-nowrap">已選 {compareList.length} 項</span>
              <span className="text-xs sm:text-sm text-slate-400">(最多 3 項)</span>
            </div>
            <div className="flex gap-2 sm:ml-auto">
              <button 
                onClick={() => setCompareList([])}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 hover:bg-white/10 rounded-full transition text-xs sm:text-sm font-medium"
              >
                清除
              </button>
              <button 
                onClick={() => setIsComparisonOpen(true)}
                className="flex-1 sm:flex-none px-4 sm:px-5 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-full transition text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-1.5 sm:gap-2"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4"/> 
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
          className="group bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-full shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 flex items-center gap-2 font-bold text-sm sm:text-base hover:scale-105 active:scale-95"
          title="生成報價單"
        >
          <FileDown className="w-5 h-5 sm:w-6 sm:h-6 group-hover:animate-bounce" />
          <span className="hidden sm:inline">生成報價單</span>
          <span className="sm:hidden">報價單</span>
          {pinnedProducts.length > 0 && (
            <span className="ml-1 bg-white/20 text-xs px-2 py-0.5 rounded-full">
              {pinnedProducts.length}
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
        onGoogleSheetSync={handleGoogleSheetSync}
        isSyncing={isSyncing}
        autoSync={autoSync}
        setAutoSync={(value) => {
          setAutoSync(value);
          localStorage.setItem('autoSync', value.toString());
        }}
      />
      
      <ProductForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSubmit={handleSaveProduct} 
        initialData={editingProduct} 
        config={config} 
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