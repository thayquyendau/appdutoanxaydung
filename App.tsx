
import React, { useState, useEffect } from 'react';
import { 
  CalculationInputs, 
  CalculationResult, 
  FoundationType, 
  BasementType, 
  RoofType, 
  PackageTier
} from './types';
import { LABELS, DEFAULT_FOUNDATION_COEFFS, DEFAULT_BASEMENT_COEFFS, DEFAULT_ROOF_COEFFS, PACKAGE_PRICES } from './constants';
import { calculateEstimate, formatCurrency, formatArea } from './services/calculationService';

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  
  // State for prices of each tier
  const [tierPrices, setTierPrices] = useState<Record<PackageTier, number>>({
    ...PACKAGE_PRICES,
    [PackageTier.ROUGH]: 3500000,
  });

  const [inputs, setInputs] = useState<CalculationInputs>({
    width: 5,
    length: 12,
    foundation: FoundationType.SINGLE,
    foundationCoeff: DEFAULT_FOUNDATION_COEFFS[FoundationType.SINGLE],
    basement: BasementType.NONE,
    basementCoeff: 0,
    numFloors: 2,
    floorCoeff: 100,
    hasTerrace: false,
    terraceCoeff: 50,
    roof: RoofType.CONCRETE,
    roofCoeff: DEFAULT_ROOF_COEFFS[RoofType.CONCRETE],
    packageTier: PackageTier.STANDARD,
    customUnitPrice: 6000000,
  });

  const [result, setResult] = useState<CalculationResult | null>(null);

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    if (inputs.width > 0 && inputs.length > 0 && inputs.numFloors > 0) {
      // Use the price from our state instead of constants
      const currentTierPrice = tierPrices[inputs.packageTier];
      setResult(calculateEstimate({
          ...inputs,
          customUnitPrice: currentTierPrice,
          packageTier: PackageTier.CUSTOM // Force custom so service uses customUnitPrice
      }));
    } else {
      setResult(null);
    }
  }, [inputs, tierPrices]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let val: any = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    if (['width', 'length', 'numFloors', 'foundationCoeff', 'basementCoeff', 'floorCoeff', 'terraceCoeff', 'roofCoeff', 'customUnitPrice'].includes(name)) {
      val = value === '' ? 0 : Number(value);
    }

    setInputs(prev => {
      const next = { ...prev, [name]: val };
      if (e.target.tagName === 'SELECT') {
        if (name === 'foundation') next.foundationCoeff = DEFAULT_FOUNDATION_COEFFS[val as FoundationType];
        if (name === 'basement') next.basementCoeff = DEFAULT_BASEMENT_COEFFS[val as BasementType];
        if (name === 'roof') next.roofCoeff = DEFAULT_ROOF_COEFFS[val as RoofType];
      }
      return next;
    });
  };

  const handlePriceChange = (tier: PackageTier, value: number) => {
    setTierPrices(prev => ({ ...prev, [tier]: value }));
  };

  // Helper to calculate total for a specific tier using current inputs
  const getTierTotal = (tier: PackageTier) => {
    if (!inputs.width || !inputs.length || !inputs.numFloors) return 0;
    const res = calculateEstimate({
      ...inputs,
      packageTier: PackageTier.CUSTOM,
      customUnitPrice: tierPrices[tier]
    });
    return res.totalCost;
  };

  return (
    <div className="main-container px-4 py-8 md:px-6 lg:px-8">
      {/* Header with Theme Toggle */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-[#7b1016] rounded-xl flex items-center justify-center text-white shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
             </div>
             <h1 className="text-xl font-black uppercase tracking-tight hidden sm:block">Dự toán Xây dựng</h1>
        </div>
        <button 
          onClick={() => setIsDark(!isDark)}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
        
        {/* LEFT COLUMN: INPUTS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card">
            <div className="title-with-icon">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              <span>Thông Tin Công Trình</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="input-group">
                <label className="label">Chiều rộng (m)</label>
                <input name="width" type="number" step="0.1" value={inputs.width || ''} onChange={handleInputChange} className="input" />
              </div>
              <div className="input-group">
                <label className="label">Chiều dài (m)</label>
                <input name="length" type="number" step="0.1" value={inputs.length || ''} onChange={handleInputChange} className="input" />
              </div>
            </div>

            <div className="input-group mb-8">
              <div className="flex justify-between items-center mb-4">
                <label className="label !mb-0">Số tầng (bao gồm trệt)</label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-blue-500 uppercase">Hệ số: 100%</span>
                  <span className="text-xl font-black text-blue-600">{inputs.numFloors}</span>
                </div>
              </div>
              <input name="numFloors" type="range" min="1" max="10" step="1" value={inputs.numFloors} onChange={handleInputChange} className="accent-[#7b1016]" />
            </div>

            <div className="input-group">
              <label className="label">Móng</label>
              <div className="flex gap-2">
                <select name="foundation" value={inputs.foundation} onChange={handleInputChange} className="input flex-1">
                  {Object.entries(LABELS.foundation).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <div className="relative w-24">
                  <input name="foundationCoeff" type="number" value={inputs.foundationCoeff} onChange={handleInputChange} className="input pr-8 text-right" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">Gợi ý: Đơn (30-40%), Cọc (40-50%), Băng (50-70%)</p>
            </div>

            <div className="input-group">
              <label className="label">Tầng Hầm</label>
              <div className="flex gap-2">
                <select name="basement" value={inputs.basement} onChange={handleInputChange} className="input flex-1">
                  {Object.entries(LABELS.basement).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <div className="relative w-24">
                  <input name="basementCoeff" type="number" value={inputs.basementCoeff} onChange={handleInputChange} className="input pr-8 text-right" disabled={inputs.basement === BasementType.NONE} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">Gợi ý: &lt; 1.5m (150%), 1.5-1.7m (170%), &gt; 1.7m (200%)</p>
            </div>

            <div className="input-group">
              <div className="flex justify-between items-center mb-2">
                <label className={`checkbox-card flex-1 !mb-0 ${inputs.hasTerrace ? 'checked' : ''}`}>
                  <input name="hasTerrace" type="checkbox" checked={inputs.hasTerrace} onChange={handleInputChange} className="hidden" />
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${inputs.hasTerrace ? 'bg-[#7b1016] border-[#7b1016]' : 'border-slate-300'}`}>
                    {inputs.hasTerrace && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span className="text-sm">Sân Thượng</span>
                </label>
                <div className="relative w-24 ml-2">
                  <input name="terraceCoeff" type="number" value={inputs.terraceCoeff} onChange={handleInputChange} className="input pr-8 text-right" disabled={!inputs.hasTerrace} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                </div>
              </div>
            </div>

            <div className="input-group mb-6">
              <label className="label">Mái</label>
              <div className="flex gap-2">
                <select name="roof" value={inputs.roof} onChange={handleInputChange} className="input flex-1">
                  {Object.entries(LABELS.roof).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <div className="relative w-24">
                  <input name="roofCoeff" type="number" value={inputs.roofCoeff} onChange={handleInputChange} className="input pr-8 text-right" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">Gợi ý: Tole (30%), BTCT (50%), Kèo sắt (70%), Ngói (100%)</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: RESULTS */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="card h-full">
            <div className="title-with-icon">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <span>Bảng Dự Toán Chi Phí</span>
            </div>

            {/* Quick Package Selectors - Now with 4 cards and editable prices */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
               {[PackageTier.BASIC, PackageTier.STANDARD, PackageTier.PREMIUM, PackageTier.ROUGH].map(tier => (
                 <div 
                  key={tier}
                  onClick={() => setInputs(p => ({...p, packageTier: tier}))}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${inputs.packageTier === tier ? 'border-blue-500 bg-blue-50/10' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                >
                   {inputs.packageTier === tier && <span className="absolute -top-3 right-4 bg-blue-500 text-white text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest shadow-lg z-10">Đang chọn</span>}
                   <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase">{LABELS.package[tier]}</div>
                   <div className="text-[16px] font-black text-slate-800 tracking-tight mb-2 truncate">
                     {formatCurrency(getTierTotal(tier))}
                   </div>
                   
                   <div className="flex items-center gap-1 group/price">
                      <input 
                        type="number" 
                        value={tierPrices[tier]} 
                        onChange={(e) => handlePriceChange(tier, Number(e.target.value))}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-transparent border-b border-dashed border-slate-200 text-[10px] font-bold text-blue-600 outline-none focus:border-blue-400"
                      />
                      <span className="text-[8px] font-bold text-slate-400 uppercase shrink-0">đ/m²</span>
                   </div>
                 </div>
               ))}
            </div>

            {/* Main Black Summary Card */}
            <div className="bg-[#111827] rounded-[1.5rem] p-8 md:p-12 text-center relative overflow-hidden group mb-8">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-blue-500"></div>
               <div className="relative z-10">
                  <p className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] text-slate-500 mb-4">DỰ TOÁN TRỌN GÓI - {LABELS.package[inputs.packageTier].toUpperCase()}</p>
                  <div className="text-4xl md:text-6xl font-black text-emerald-500 tracking-tighter transition-all">
                    {result ? formatCurrency(result.totalCost) : '0 ₫'}
                  </div>
                  <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-10 mt-8 pt-8 border-t border-white/5">
                     <div>
                        <span className="text-[10px] text-slate-500 uppercase font-black block mb-1">Diện tích quy đổi</span>
                        <span className="text-white font-black text-lg">{result ? formatArea(result.totalWeightedArea) : '--'}</span>
                     </div>
                     <div className="hidden md:block w-px bg-white/5"></div>
                     <div>
                        <span className="text-[10px] text-slate-500 uppercase font-black block mb-1">Đơn giá áp dụng</span>
                        <span className="text-white font-black text-lg">{result ? formatCurrency(tierPrices[inputs.packageTier]).replace('₫', '') : '--'}</span>
                     </div>
                  </div>
               </div>
               <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
            </div>

            {/* Detailed Breakdown Table */}
            <div className="mt-8 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
              <table className="data-table min-w-[600px]">
                <thead>
                  <tr>
                    <th>Hạng mục</th>
                    <th className="text-center">Diện tích sàn</th>
                    <th className="text-center">Hệ số</th>
                    <th className="text-right">DT quy đổi</th>
                  </tr>
                </thead>
                <tbody>
                  {result && result.breakdown.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/50">
                        <td className="py-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{item.label}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Hệ số {item.coeff * 100}%</div>
                        </td>
                        <td className="text-center text-slate-600 dark:text-slate-400 font-medium">{formatArea(item.coeff > 0 ? item.area / item.coeff : 0)}</td>
                        <td className="text-center text-slate-500 dark:text-slate-400 font-bold">{item.coeff * 100}%</td>
                        <td className="text-right font-black text-slate-900 dark:text-white text-lg">{formatArea(item.area)}</td>
                    </tr>
                  ))}
                  
                  <tr className="total-row">
                    <td>Tổng quy đổi</td>
                    <td></td>
                    <td></td>
                    <td className="text-right font-black">{result ? formatArea(result.totalWeightedArea) : '--'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-10 pt-10 border-t border-slate-100 dark:border-slate-800">
               <div className="flex flex-col md:flex-row items-center gap-10">
                    <div className="flex-1 space-y-4">
                        <h4 className="text-sm font-black uppercase tracking-widest text-[#7b1016]">Cấu trúc diện tích chi tiết</h4>
                        <div className="flex flex-wrap gap-4 pt-2">
                           {result && result.breakdown.map((item, idx) => (
                             <div key={idx} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-sm shadow-sm" style={{backgroundColor: item.color}}></div>
                                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{item.label}</span>
                             </div>
                           ))}
                        </div>
                    </div>
                    <div className="relative w-40 h-40 shrink-0">
                        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                           {result && result.breakdown.map((item, idx) => {
                             const totalArea = result.totalWeightedArea;
                             let offset = 0;
                             for(let i=0; i<idx; i++) offset += (result.breakdown[i].area / totalArea) * 100;
                             const percent = (item.area / totalArea) * 100;
                             
                             const dashArray = `${percent * 2.51} 251`; 
                             const dashOffset = `-${offset * 2.51}`;
                             
                             return (
                               <circle 
                                 key={idx}
                                 cx="50" cy="50" r="40" 
                                 fill="transparent" 
                                 stroke={item.color} 
                                 strokeWidth="12" 
                                 strokeDasharray={dashArray} 
                                 strokeDashoffset={dashOffset}
                                 className="transition-all duration-1000"
                               />
                             );
                           })}
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                           <div className="text-center">
                                <span className="text-lg font-black text-[#7b1016]">{result ? result.totalWeightedArea.toFixed(0) : '--'} m²</span>
                           </div>
                        </div>
                    </div>
               </div>
            </div>

          </div>
        </div>
      </div>
     
    </div>
  );
};

export default App;
