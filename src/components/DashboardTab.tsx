import React, { useState } from 'react';
import { Product, Transaction, Expense } from '../types';
import { 
  TrendingUp, 
  Wallet, 
  Coins, 
  AlertTriangle, 
  Sparkles, 
  ArrowUpRight, 
  Calendar,
  Layers,
  ShoppingBag,
  ArrowRight,
  Plus
} from 'lucide-react';

interface DashboardTabProps {
  products: Product[];
  transactions: Transaction[];
  expenses: Expense[];
  onNavigate: (tab: 'dashboard' | 'kasir' | 'produk' | 'keuangan' | 'setelan') => void;
  onRestockFromDashboard: (prodId: string, amount: number) => void;
}

export default function DashboardTab({ 
  products, 
  transactions, 
  expenses, 
  onNavigate,
  onRestockFromDashboard
}: DashboardTabProps) {
  const [chartMode, setChartMode] = useState<'revenue' | 'profit'>('revenue');

  // Format currency helpers
  const formatIDR = (num: number) => {
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  // CALCULATING MAIN STATS
  const totalOmset = transactions.reduce((acc, tx) => acc + tx.total, 0);
  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  
  // Total profit inside transactions is: Total - Cost price of items.
  // Net Profit = (Sum of profits of each transaction) - (manual expenses)
  const salesProfit = transactions.reduce((acc, tx) => acc + tx.profit, 0);
  const netProfit = salesProfit - totalExpenses;

  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  // PREPARING 7-DAY HISTORICAL DATA FOR CHART
  const getLast7DaysData = () => {
    const list = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toDateString();
      const dateShort = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      const dayName = d.toLocaleDateString('id-ID', { weekday: 'short' });

      // Sum revenue for this day
      const dayTxs = transactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate.toDateString() === dateStr;
      });

      const revenue = dayTxs.reduce((sum, tx) => sum + tx.total, 0);
      const profit = dayTxs.reduce((sum, tx) => sum + tx.profit, 0);

      list.push({
        label: `${dayName} ${d.getDate()}`,
        dateShort,
        revenue,
        profit
      });
    }
    return list;
  };

  const chartData = getLast7DaysData();
  const maxVal = Math.max(...chartData.map(d => chartMode === 'revenue' ? d.revenue : d.profit), 100000);

  // BEST SELLING PRODUCTS (Total quantity sold + popularity offset)
  const getBestSellers = () => {
    // Map productId to sold count
    const soldCounts: Record<string, number> = {};
    transactions.forEach(tx => {
      tx.items.forEach(itm => {
        soldCounts[itm.productId] = (soldCounts[itm.productId] || 0) + itm.quantity;
      });
    });

    return products.map(p => {
      const soldQty = soldCounts[p.id] || 0;
      const score = (soldQty * 10) + p.popularity; // weighted score
      return {
        ...p,
        soldQty,
        score
      };
    }).sort((a, b) => b.score - a.score).slice(0, 3);
  };

  const bestSellers = getBestSellers();

  return (
    <div className="flex-1 pb-24 text-[#2D2D2D]/95">
      {/* Dynamic Splash Greeting / Brand Intro */}
      <div className="bg-[#F9F0F0]/60 p-5 rounded-3xl border border-[#E5D1D0] mb-6 relative overflow-hidden">
        <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-[#C27D7F]/10 rounded-full blur-2xl" />
        <div className="absolute left-[-20px] bottom-[-20px] w-32 h-32 bg-[#E5D1D0]/25 rounded-full blur-2xl" />
        
        <div className="relative flex justify-between items-start">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#FAF7F6] text-[#C27D7F] text-[10px] font-bold tracking-widest px-2.5 py-0.5 rounded-full uppercase mb-1.5 border border-[#E5D1D0]">
              <Sparkles className="w-3 h-3 text-[#C27D7F] fill-[#C27D7F]/40" />
              QUIPS PERFUMERIE
            </div>
            <h1 className="text-2xl font-serif italic font-medium text-[#C27D7F] tracking-tight">Halo, Pemilik Quips!</h1>
            <p className="text-xs text-[#2D2D2D]/75 mt-1 max-w-[250px]">
              Pantau arus keuangan parfum laundry kesayanganmu hari ini dengan visualisasi anggun.
            </p>
          </div>
          
          <button 
            onClick={() => onNavigate('kasir')}
            className="flex items-center gap-1.5 bg-[#C27D7F] hover:bg-[#b16d6f] text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer transform hover:scale-103"
          >
            <Plus className="w-4 h-4" />
            Kasir Baru
          </button>
        </div>
      </div>

      {/* METRIC CARD BENTO BUBBLES */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {/* Omset Card */}
        <div className="bg-white p-4 rounded-3xl border border-[#E5D1D0] shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute -right-3 -top-3 w-12 h-12 bg-[#F9F0F0] rounded-full group-hover:scale-110 transition-transform" />
          <div className="p-1.5 bg-[#FAF7F6] text-[#C27D7F] border border-[#E5D1D0]/50 rounded-lg w-fit mb-3">
            <TrendingUp className="w-4.5 h-4.5" />
          </div>
          <p className="text-[10px] font-semibold text-[#A58E8E] uppercase tracking-widest">Total Omset</p>
          <p className="text-lg font-serif text-[#2D2D2D] mt-1.5 tracking-tight truncate">
            {formatIDR(totalOmset)}
          </p>
          <div className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-emerald-700 mt-1 uppercase tracking-wider">
            <ArrowUpRight className="w-2.5 h-2.5" />
            Live Penjualan
          </div>
        </div>

        {/* Keuntungan Bersih Card */}
        <div className="bg-white p-4 rounded-3xl border border-[#E5D1D0] shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute -right-3 -top-3 w-12 h-12 bg-[#F2E4E4] rounded-full group-hover:scale-110 transition-transform" />
          <div className="p-1.5 bg-[#FAF7F6] text-[#C27D7F] border border-[#E5D1D0]/50 rounded-lg w-fit mb-3">
            <Coins className="w-4.5 h-4.5" />
          </div>
          <p className="text-[10px] font-semibold text-[#A58E8E] uppercase tracking-widest">Laba Bersih</p>
          <p className={`text-lg font-serif mt-1.5 tracking-tight truncate ${netProfit >= 0 ? 'text-[#2D2D2D]' : 'text-rose-700'}`}>
            {formatIDR(netProfit)}
          </p>
          <div className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-[#A58E8E] mt-1 uppercase">
            Setelah pengeluaran
          </div>
        </div>

        {/* Pengeluaran Card */}
        <div className="bg-white p-4 rounded-3xl border border-[#E5D1D0] shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute -right-3 -top-3 w-12 h-12 bg-[#FAF7F6] rounded-full group-hover:scale-110 transition-transform" />
          <div className="p-1.5 bg-[#FAF7F6] text-[#A58E8E] border border-[#E5D1D0]/50 rounded-lg w-fit mb-3">
            <Wallet className="w-4.5 h-4.5" />
          </div>
          <p className="text-[10px] font-semibold text-[#A58E8E] uppercase tracking-widest">Pengeluaran</p>
          <p className="text-lg font-serif text-[#2D2D2D] mt-1.5 tracking-tight truncate">
            {formatIDR(totalExpenses)}
          </p>
          <button 
            onClick={() => onNavigate('keuangan')}
            className="text-[9px] font-bold text-[#C27D7F] mt-1 flex items-center gap-0.5 hover:underline decoration-[#C27D7F] uppercase tracking-wider cursor-pointer"
          >
            Kelola Biaya
            <ArrowRight className="w-2.5 h-2.5" />
          </button>
        </div>

        {/* Stok Menipis Warning */}
        <div className={`bg-white p-4 rounded-3xl border transition-all relative overflow-hidden group ${lowStockProducts.length > 0 ? 'border-amber-200 shadow-xs' : 'border-[#E5D1D0]'}`}>
          <div className="absolute -right-3 -top-3 w-12 h-12 bg-amber-50 rounded-full group-hover:scale-110 transition-transform" />
          <div className={`p-1.5 rounded-lg w-fit mb-3 border ${lowStockProducts.length > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
            <AlertTriangle className="w-4.5 h-4.5" />
          </div>
          <p className="text-[10px] font-semibold text-[#A58E8E] uppercase tracking-widest">Stok Menipis</p>
          <p className="text-lg font-serif text-[#2D2D2D] mt-1.5 tracking-tight">
            {lowStockProducts.length} <span className="text-xs font-sans font-normal text-[#A58E8E]">Produk</span>
          </p>
          <button 
            onClick={() => onNavigate('produk')}
            className={`text-[9px] font-bold mt-1 flex items-center gap-0.5 hover:underline uppercase tracking-wider cursor-pointer ${lowStockProducts.length > 0 ? 'text-amber-700' : 'text-green-700'}`}
          >
            {lowStockProducts.length > 0 ? 'Segera Restok' : 'Cek Inventori'}
            <ArrowRight className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      {/* GRAPH CHART CONSOLE */}
      <div className="bg-white p-5 rounded-3xl border border-[#E5D1D0] shadow-xs mb-6">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-sm font-serif font-semibold text-[#2D2D2D]">weekly report flow</h3>
            <p className="text-[10px] text-[#A58E8E] uppercase tracking-wider">Laporan performa outlet Quips</p>
          </div>

          {/* Toggle Button */}
          <div className="bg-[#FAF7F6] p-1 rounded-full flex gap-1 border border-[#E5D1D0]">
            <button
              onClick={() => setChartMode('revenue')}
              className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all cursor-pointer ${chartMode === 'revenue' ? 'bg-[#C27D7F] text-white' : 'text-[#A58E8E]'}`}
            >
              Omset
            </button>
            <button
              onClick={() => setChartMode('profit')}
              className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all cursor-pointer ${chartMode === 'profit' ? 'bg-[#C27D7F] text-white' : 'text-[#A58E8E]'}`}
            >
              Laba
            </button>
          </div>
        </div>

        {/* CUSTOM HAND-DRAWN HIGH-FIDELITY CHIC CHARTS USING DYNAMIC SVG */}
        <div className="relative w-full h-44 rounded-2xl bg-[#FAF7F6] border border-[#E5D1D0]/40 p-2 flex items-end">
          {/* Subtle Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between py-6 pointer-events-none">
            <div className="border-b border-[#E5D1D0]/15 w-full" />
            <div className="border-b border-[#E5D1D0]/15 w-full" />
            <div className="border-b border-[#E5D1D0]/15 w-full" />
            <div className="border-b border-[#E5D1D0]/15 w-full" />
          </div>

          {/* Rendering responsive bar visual columns */}
          <div className="w-full h-full flex items-end justify-between px-2 pt-6 relative z-10">
            {chartData.map((d, index) => {
              const currentVal = chartMode === 'revenue' ? d.revenue : d.profit;
              const fillPct = maxVal > 0 ? (currentVal / maxVal) * 82 : 2; // caps height percentage safely
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center h-full justify-end group px-1">
                  {/* Tooltip Hover Value */}
                  <div className="opacity-0 group-hover:opacity-100 absolute bottom-32 bg-[#2D2D2D] text-white text-[9px] md:text-[10px] px-2.5 py-1 rounded-lg pointer-events-none transition-all duration-300 shadow-md border border-[#E5D1D0]/20 z-40">
                    {formatIDR(currentVal)}
                  </div>

                  {/* Flow Bar Column */}
                  <div 
                    className="w-full rounded-t-lg transition-all duration-700 relative overflow-hidden"
                    style={{ 
                      height: `${fillPct}%`,
                      // Render dynamic soft gradient bases
                      backgroundColor: '#C27D7F'
                    }}
                  >
                    {/* Glowing highlight inside bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-white/30" />
                  </div>

                  {/* Short Date Label */}
                  <span className="text-[10px] font-semibold text-[#A58E8E] mt-2 truncate max-w-full">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-4 mt-3 justify-center text-[10px] font-semibold text-[#A58E8E] uppercase tracking-widest">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#C27D7F]" />
            Baris Aliran Keuangan
          </div>
        </div>
      </div>

      {/* DETAILED STATS ROW 2: FAVORITE PRODUCTS & CRITICAL STOCKS ROW */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* PRODUK FAVORIT (BEST SELLERS) */}
        <div className="bg-white p-5 rounded-3xl border border-[#E5D1D0] shadow-xs relative">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-1.5">
              <div className="p-1.5 bg-[#F2E4E4] text-[#C27D7F] rounded-lg">
                <Sparkles className="w-3.5 h-3.5 fill-[#C27D7F]" />
              </div>
              <h3 className="text-xs font-extrabold text-[#2D2D2D] uppercase tracking-widest">
                🏆 Aroma Terfavorit
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {bestSellers.map((prod, idx) => {
              return (
                <div key={prod.id} className="flex items-center justify-between p-3 rounded-2xl bg-[#F9F0F0]/50 border border-[#E5D1D0]/30 hover:bg-[#F9F0F0]/90 transition-all">
                  <div className="flex items-center gap-3">
                    {/* Position Medallion */}
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white font-serif italic text-xs bg-[#C27D7F] shadow-2xs">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-[#2D2D2D] tracking-tight">{prod.name}</h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] bg-[#F2E4E4] text-[#C27D7F] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-tight">
                          {prod.scentType}
                        </span>
                        <span className="text-[9px] text-[#A58E8E]">{prod.unit}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-extrabold text-[#C27D7F] bg-[#F2E4E4]/60 px-2.5 py-1 rounded-full">
                      {prod.soldQty} Terjual
                    </span>
                    <p className="text-[10px] text-[#A58E8E] mt-1">{formatIDR(prod.price)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* STOK PRODUK YANG MENIPIS */}
        <div className="bg-white p-5 rounded-3xl border border-[#E5D1D0] shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-extrabold text-[#2D2D2D] uppercase tracking-widest flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" />
              Peringatan Stok Menipis
            </h3>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Sisa &lt; Batas
            </span>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="p-6 text-center bg-emerald-50/20 border border-emerald-100/30 rounded-2xl">
              <p className="text-xs font-semibold text-emerald-700 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/10" />
                Semua stok Quips aman!
              </p>
              <p className="text-[10px] text-[#A58E8E] mt-1">Belum ada produk aroma yang menipis.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {lowStockProducts.map(prod => (
                <div key={prod.id} className="p-3 rounded-2xl bg-amber-50/20 border border-amber-100 flex items-center justify-between hover:bg-amber-50/40 transition-all">
                  <div>
                    <h4 className="text-xs font-bold text-[#2D2D2D]">{prod.name}</h4>
                    <p className="text-[10px] text-gray-500 mt-1">Sisa stok: <span className="text-rose-600 font-extrabold">{prod.stock}</span> {prod.unit}</p>
                  </div>

                  {/* Inline Fast restock buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onRestockFromDashboard(prod.id, 10)}
                      className="text-[9px] font-bold bg-white text-amber-800 hover:bg-amber-100 px-2 py-1.5 rounded-lg border border-amber-200/50 shadow-2xs transition-all active:scale-95 cursor-pointer"
                    >
                      +10 Pcs
                    </button>
                    <button
                      onClick={() => onRestockFromDashboard(prod.id, 50)}
                      className="text-[9px] font-bold bg-amber-600 hover:bg-amber-700 text-white px-2 py-1.5 rounded-lg shadow-2xs transition-all active:scale-95 cursor-pointer"
                    >
                      +50 Pcs
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
