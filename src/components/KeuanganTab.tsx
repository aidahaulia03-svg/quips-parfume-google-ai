import React, { useState, useMemo } from 'react';
import { Expense, Transaction, ExpenseCategory, PaymentMethod } from '../types';
import { 
  PlusCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Coins, 
  Calendar, 
  Search, 
  DollarSign, 
  X,
  CreditCard,
  Sparkles,
  Layers,
  TrendingDown,
  Download,
  FileSpreadsheet
} from 'lucide-react';

interface KeuanganTabProps {
  expenses: Expense[];
  transactions: Transaction[];
  onAddExpense: (newExp: Omit<Expense, 'id'>) => void;
}

export default function KeuanganTab({ expenses, transactions, onAddExpense }: KeuanganTabProps) {
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<'All' | 'Income' | 'Expense'>('All');
  const [search, setSearch] = useState('');

  const handleExportTransactionsCSV = () => {
    const headers = [
      'No. Nota',
      'Tanggal',
      'Nama Pelanggan',
      'No WhatsApp',
      'Item Terjual',
      'Subtotal',
      'Diskon',
      'Pajak',
      'Total',
      'Laba',
      'Metode Pembayaran',
      'Catatan'
    ];

    const rows = transactions.map(tx => {
      const itemsStr = tx.items.map(item => `${item.quantity}x ${item.name} (${formatIDR(item.price)})`).join('; ');
      const dateFormatted = new Date(tx.date).toLocaleString('id-ID');
      
      return [
        tx.id,
        dateFormatted,
        tx.customerName,
        tx.customerWhatsApp || '',
        itemsStr,
        tx.subtotal,
        tx.discount,
        tx.tax,
        tx.total,
        tx.profit,
        tx.paymentMethod,
        tx.notes || ''
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => {
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_Transaksi_Quips_Parfume_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExpensesCSV = () => {
    const headers = [
      'ID Pengeluaran',
      'Tanggal',
      'Keterangan',
      'Kategori',
      'Jumlah',
      'Metode Pembayaran'
    ];

    const rows = expenses.map(exp => {
      const dateFormatted = new Date(exp.date).toLocaleString('id-ID');
      return [
        exp.id,
        dateFormatted,
        exp.description,
        exp.category,
        exp.amount,
        exp.paymentMethod
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => {
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_Pengeluaran_Quips_Parfume_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Form Fields
  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState<number>(50000);
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('Bahan Parfum');
  const [expMethod, setExpMethod] = useState<PaymentMethod>('Cash');

  const formatIDR = (num: number) => {
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  const formatDate = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  // CALCULATIONS
  const totalIncome = transactions.reduce((acc, tx) => acc + tx.total, 0);
  const totalExpense = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const profitMargin = totalIncome - totalExpense;

  // MERGING SALES INCOME AND OPERATIONAL EXPENSES INTO A SINGLE CHRONOLOGICAL LEDGER LIST
  const unifiedLedger = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      subtitle: string;
      amount: number;
      date: string;
      type: 'Income' | 'Expense';
      paymentMethod: string;
    }> = [];

    // Map transaction sales
    transactions.forEach(tx => {
      list.push({
        id: tx.id,
        title: `Penjualan - ${tx.customerName}`,
        subtitle: `${tx.items.length} varian parfum`,
        amount: tx.total,
        date: tx.date,
        type: 'Income',
        paymentMethod: tx.paymentMethod
      });
    });

    // Map bills/expenses
    expenses.forEach(exp => {
      list.push({
        id: exp.id,
        title: exp.description,
        subtitle: exp.category,
        amount: exp.amount,
        date: exp.date,
        type: 'Expense',
        paymentMethod: exp.paymentMethod
      });
    });

    // Sort chronologically (newest first)
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, expenses]);

  // FILTERED LEDGER
  const filteredLedger = useMemo(() => {
    return unifiedLedger.filter(item => {
      const matchSearch = item.title.toLowerCase().includes(search.toLowerCase()) || 
                          item.subtitle.toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === 'All' || item.type === filterType;
      return matchSearch && matchType;
    });
  }, [unifiedLedger, search, filterType]);

  // SUBMIT OPERATIONAL BORDER EXPENSE
  const handleCheckoutExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expDesc.trim()) {
      alert('Keterangan pengeluaran wajib diisi!');
      return;
    }
    if (expAmount <= 0) {
      alert('Jumlah pengeluaran harus positif!');
      return;
    }

    onAddExpense({
      description: expDesc,
      amount: expAmount,
      category: expCategory,
      date: new Date().toISOString(),
      paymentMethod: expMethod
    });

    // Reset formulation
    setExpDesc('');
    setExpAmount(50000);
    setExpCategory('Bahan Parfum');
    setIsExpenseModalOpen(false);
    alert('Pengeluaran berhasil terekam dalam pembukuan!');
  };

  // COLOR STYLING HELPERS
  const expCategories: ExpenseCategory[] = [
    'Bahan Parfum', 'Kemasan/Botol', 'Sewa Tempat', 'Listrik & Air', 'Gaji & Operasional', 'Pemasaran', 'Lainnya'
  ];

  return (
    <div className="flex-1 pb-24 text-[#2D2D2D]">
      {/* Upper header navigation */}
      <div className="p-4 bg-linear-to-b from-[#FAF7F6] to-transparent flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="text-[#C27D7F] w-4 h-4 fill-[#C27D7F]/20" />
              <h2 className="text-base font-serif italic text-gray-800">Alur Buku Keuangan</h2>
            </div>
            <p className="text-[10px] text-[#A58E8E] uppercase tracking-wider">Arus masuk, keluar, dan laba operasional</p>
          </div>

          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-1 bg-[#C27D7F] hover:bg-[#b16d6f] text-white text-[9px] font-bold tracking-widest uppercase px-3 py-2 rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Catat Pengeluaran
          </button>
        </div>

        {/* Dynamic Financial Overview card widgets */}
        <div className="p-4 bg-white border border-[#E5D1D0] rounded-3xl shadow-2xs space-y-4">
          <div className="grid grid-cols-2 gap-2 text-center border-b border-[#E5D1D0]/50 pb-3">
            <div>
              <p className="text-[8px] font-bold text-[#A58E8E] uppercase tracking-widest flex items-center justify-center gap-0.5">
                <ArrowUpRight className="text-emerald-600 w-3 h-3" />
                Semua Pemasukan (Omset)
              </p>
              <p className="text-sm font-bold font-mono text-gray-800 mt-1">{formatIDR(totalIncome)}</p>
            </div>
            <div>
              <p className="text-[8px] font-bold text-[#A58E8E] uppercase tracking-widest flex items-center justify-center gap-0.5">
                <ArrowDownRight className="text-rose-600 w-3 h-3" />
                Biaya Pengeluaran
              </p>
              <p className="text-sm font-bold font-mono text-gray-800 mt-1">{formatIDR(totalExpense)}</p>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs font-semibold px-2">
            <span className="text-[#A58E8E] font-serif italic">LABA OUTLET BERSIH:</span>
            <span className={`text-[15px] font-bold font-mono ${profitMargin >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {formatIDR(profitMargin)}
            </span>
          </div>
        </div>
      </div>

      {/* EXPORT REPORTS TO CSV SECTION */}
      <div className="mx-4 mb-4 bg-white border border-[#E5D1D0] rounded-3xl p-4 shadow-3xs space-y-3">
        <div className="flex items-center gap-1.5">
          <FileSpreadsheet className="w-4 h-4 text-[#C27D7F]" />
          <h4 className="text-[10px] font-extrabold text-gray-800 uppercase tracking-widest">Unduh Laporan Toko (.CSV / Excel)</h4>
        </div>
        <p className="text-[9.5px] text-[#A58E8E] leading-relaxed">
          Unduh laporan pembukuan toko Anda dalam format .CSV yang kompatibel dengan Microsoft Excel atau Google Sheets.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleExportTransactionsCSV}
            className="flex items-center justify-center gap-1.5 bg-[#FAF7F6] hover:bg-[#f3ecea] border border-[#E5D1D0] text-gray-800 text-[9px] font-bold uppercase tracking-widest py-2.5 rounded-xl transition-all cursor-pointer shadow-3xs active:scale-98"
          >
            <Download className="w-3.5 h-3.5 text-[#C27D7F]" />
            Ekspor Transaksi
          </button>
          <button
            onClick={handleExportExpensesCSV}
            className="flex items-center justify-center gap-1.5 bg-[#FAF7F6] hover:bg-[#f3ecea] border border-[#E5D1D0] text-gray-850 text-[9px] font-bold uppercase tracking-widest py-2.5 rounded-xl transition-all cursor-pointer shadow-3xs active:scale-98"
          >
            <Download className="w-3.5 h-3.5 text-[#C27D7F]" />
            Ekspor Pengeluaran
          </button>
        </div>
      </div>

      {/* FILTER SEARCH OR DUAL TABS SYSTEM */}
      <div className="px-4 space-y-4">
        <div className="flex gap-2.5 items-center">
          {/* Search bar inside ledger */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#C27D7F]" />
            <input
              type="text"
              placeholder="Cari transaksi ledger..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white rounded-xl py-2 pl-9 pr-2 text-[10px] font-semibold border border-[#E5D1D0] placeholder-[#A58E8E] text-[#2D2D2D] focus:outline-hidden focus:ring-1 focus:ring-[#C27D7F]/30"
            />
          </div>

          {/* Quick tab types select */}
          <div className="bg-[#FAF7F6] p-1 rounded-xl flex border border-[#E5D1D0]">
            {(['All', 'Income', 'Expense'] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-lg text-[9px] font-bold tracking-wider transition-all uppercase cursor-pointer ${
                  filterType === type ? 'bg-[#C27D7F] text-white shadow-3xs' : 'text-[#A58E8E] hover:text-[#C27D7F]'
                }`}
              >
                {type === 'All' ? 'Semua' : type === 'Income' ? 'Masuk' : 'Keluar'}
              </button>
            ))}
          </div>
        </div>

        {/* CHRONOLOGICAL LIST LEDGER SCROLLER */}
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {filteredLedger.map((item, idx) => {
            const isInc = item.type === 'Income';
            return (
              <div 
                key={item.id + '-' + idx} 
                className="p-3 bg-white rounded-2xl border border-[#E5D1D0]/60 shadow-3xs flex items-center justify-between hover:bg-white transition-all"
              >
                <div className="flex items-center gap-3">
                  {/* Decorative circle with Arrow indicator */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center border ${
                    isInc 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                      : 'bg-[#FAF7F6] text-[#C27D7F] border-[#E5D1D0]'
                  }`}>
                    {isInc ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <h5 className="text-[11.5px] font-bold text-gray-800 font-serif italic truncate max-w-[140px]">{item.title}</h5>
                    <div className="flex gap-2 items-center mt-0.5 text-[9px] text-[#A58E8E]">
                      <span>{item.subtitle}</span>
                      <span>•</span>
                      <span>By {item.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[11px] font-bold font-mono ${isInc ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {isInc ? '+' : '-'}{formatIDR(item.amount)}
                  </span>
                  <p className="text-[8px] text-[#A58E8E] font-mono mt-1 flex items-center gap-0.5 justify-end">
                    <Calendar className="w-2.5 h-2.5" />
                    {formatDate(item.date)}
                  </p>
                </div>
              </div>
            );
          })}

          {filteredLedger.length === 0 && (
            <div className="text-center py-12 text-[#A58E8E] bg-white border border-[#E5D1D0]/60 rounded-3xl">
              <p className="text-xs font-serif italic">Belum ada transaksi pembukuan keuangan.</p>
            </div>
          )}
        </div>
      </div>

      {/* EXPENSE ENTRY SHEET MODAL DRAWER */}
      {isExpenseModalOpen && (
        <div className="absolute inset-0 bg-black/60 z-50 rounded-b-[40px] flex flex-col justify-end animate-fade-in pointer-events-auto">
          <div className="bg-white rounded-t-[32px] p-5 pb-8 shadow-2xl">
            
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-[#C27D7F]" />
                <h3 className="text-sm font-bold text-gray-800 font-serif italic">Catat Pengeluaran Operasional</h3>
              </div>
              <button 
                onClick={() => setIsExpenseModalOpen(false)}
                className="p-1 rounded-full bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCheckoutExpense} className="space-y-4 text-xs font-semibold">
              
              {/* Expense description */}
              <div>
                <label className="block text-[9px] uppercase font-bold tracking-widest text-[#C27D7F] mb-1">Keterangan Biaya</label>
                <input
                  type="text"
                  placeholder="Contoh: Beli botol kaca 100pcs, beli essens"
                  required
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="w-full bg-white border border-[#E5D1D0] rounded-xl py-2.5 px-3 text-[11px] text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-[#C27D7F]/30"
                />
              </div>

              {/* Expense Amount */}
              <div>
                <label className="block text-[9px] uppercase font-bold tracking-widest text-[#C27D7F] mb-1">Jumlah Pengeluaran (Rp)</label>
                <input
                  type="number"
                  required
                  value={expAmount || ''}
                  onChange={(e) => setExpAmount(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full bg-white border border-[#E5D1D0] rounded-xl py-2.5 px-3 text-sm font-bold text-rose-700 font-mono focus:outline-hidden focus:ring-1 focus:ring-[#C27D7F]/30"
                />
              </div>

              {/* Expense category mapping lists */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] uppercase font-bold tracking-widest text-[#C27D7F] mb-1">Kategori Biaya</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value as ExpenseCategory)}
                    className="w-full bg-white border border-[#E5D1D0] rounded-xl py-2 px-3 text-[11px] text-gray-800 focus:outline-hidden cursor-pointer"
                  >
                    {expCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                {/* Method */}
                <div>
                  <label className="block text-[9px] uppercase font-bold tracking-widest text-[#C27D7F] mb-1">Cara Pembayaran</label>
                  <select
                    value={expMethod}
                    onChange={(e) => setExpMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-white border border-[#E5D1D0] rounded-xl py-2 px-3 text-[11px] text-gray-800 focus:outline-hidden cursor-pointer"
                  >
                    <option value="Cash">Cash / Tunai</option>
                    <option value="QRIS">QRIS / E-Money</option>
                    <option value="Transfer">Transfer Bank</option>
                  </select>
                </div>
              </div>

              {/* Submit trigger */}
              <button
                type="submit"
                className="w-full bg-[#C27D7F] hover:bg-[#b16d6f] text-white font-bold py-3.5 rounded-xl shadow-xs text-[10px] uppercase tracking-widest mt-3 cursor-pointer"
              >
                Simpan & Catat Laporan Cash Flow
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
