import React, { useState, useMemo } from 'react';
import { Product, StockLog } from '../types';
import { 
  PlusCircle, 
  History, 
  Search, 
  Package, 
  Edit, 
  Trash2, 
  Plus, 
  ChevronRight, 
  X,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  Flower2,
  Droplets,
  Heart,
  Apple,
  Gem
} from 'lucide-react';

interface ProdukTabProps {
  products: Product[];
  stockLogs: StockLog[];
  onAddProduct: (newProd: Omit<Product, 'id' | 'popularity'>) => void;
  onUpdateProduct: (updatedProd: Product) => void;
  onDeleteProduct: (prodId: string) => void;
  onAddStockLog: (productId: string, quantity: number, type: 'In' | 'Out', note: string) => void;
}

export default function ProdukTab({
  products,
  stockLogs,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAddStockLog
}: ProdukTabProps) {
  const [activeTab, setActiveTab] = useState<'catalog' | 'logs'>('catalog');
  const [search, setSearch] = useState('');
  
  // Modal controllers
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState(10);
  const [restockNote, setRestockNote] = useState('Restok berkala');

  // New/Editing Product form inputs
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Premium Series');
  const [formPrice, setFormPrice] = useState(30000);
  const [formCostPrice, setFormCostPrice] = useState(12000);
  const [formStock, setFormStock] = useState(20);
  const [formMinStock, setFormMinStock] = useState(5);
  const [formUnit, setFormUnit] = useState('250ml (Spray)');
  const [formScentType, setFormScentType] = useState<'Sweet' | 'Fresh' | 'Floral' | 'Fruity' | 'Elegant'>('Fresh');

  const formatIDR = (num: number) => {
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  const formatDate = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit',
      minute: '2-digit'
    }) + ' WIB';
  };

  // Filter products by query search
  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.scentType.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  // Open modal to add product
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory('Premium Series');
    setFormPrice(30000);
    setFormCostPrice(12000);
    setFormStock(20);
    setFormMinStock(5);
    setFormUnit('250ml (Spray)');
    setFormScentType('Fresh');
    setIsProductModalOpen(true);
  };

  // Open modal to edit product
  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormPrice(p.price);
    setFormCostPrice(p.costPrice);
    setFormStock(p.stock);
    setFormMinStock(p.minStock);
    setFormUnit(p.unit);
    setFormScentType(p.scentType);
    setIsProductModalOpen(true);
  };

  // Open modal to restock product ("Stok Masuk")
  const handleOpenRestockModal = (p: Product) => {
    setRestockProduct(p);
    setRestockQty(10);
    setRestockNote('Restok berkala supplier');
    setIsRestockModalOpen(true);
  };

  // Save product details
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Nama parfum wajib dicantumkan!');
      return;
    }

    if (editingProduct) {
      onUpdateProduct({
        ...editingProduct,
        name: formName,
        category: formCategory,
        price: formPrice,
        costPrice: formCostPrice,
        stock: formStock,
        minStock: formMinStock,
        unit: formUnit,
        scentType: formScentType
      });
    } else {
      onAddProduct({
        name: formName,
        category: formCategory,
        price: formPrice,
        costPrice: formCostPrice,
        stock: formStock,
        minStock: formMinStock,
        unit: formUnit,
        scentType: formScentType
      });
    }
    setIsProductModalOpen(false);
  };

  // Submit Inventory Restock ("Stok Masuk")
  const handleSaveRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockProduct) return;
    if (restockQty <= 0) {
      alert('Jumlah restok harus bernilai positif!');
      return;
    }

    onAddStockLog(restockProduct.id, restockQty, 'In', restockNote);
    setIsRestockModalOpen(false);
    alert(`Berhasil restok ${restockQty} unit untuk ${restockProduct.name}!`);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus produk "${name}"?`)) {
      onDeleteProduct(id);
    }
  };

  const renderScentIcon = (scent: string) => {
    switch(scent) {
      case 'Sweet':
        return (
          <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100/60 flex items-center justify-center text-rose-500 shadow-2xs">
            <Heart className="w-4.5 h-4.5 fill-rose-500/20" />
          </div>
        );
      case 'Fresh':
        return (
          <div className="w-10 h-10 rounded-full bg-sky-50 border border-sky-100/60 flex items-center justify-center text-sky-500 shadow-2xs">
            <Droplets className="w-4.5 h-4.5" />
          </div>
        );
      case 'Floral':
        return (
          <div className="w-10 h-10 rounded-full bg-purple-50 border border-purple-100/60 flex items-center justify-center text-purple-500 shadow-2xs">
            <Flower2 className="w-4.5 h-4.5" />
          </div>
        );
      case 'Fruity':
        return (
          <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-100/60 flex items-center justify-center text-[#C27D7F] shadow-2xs">
            <Apple className="w-4.5 h-4.5" />
          </div>
        );
      case 'Elegant':
        return (
          <div className="w-10 h-10 rounded-full bg-yellow-50 border border-yellow-100/60 flex items-center justify-center text-yellow-600 shadow-2xs">
            <Gem className="w-4.5 h-4.5 fill-yellow-600/10" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100/60 flex items-center justify-center text-gray-500 shadow-2xs">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
        );
    }
  };

  return (
    <div className="flex-1 pb-24 text-[#2D2D2D]">
      {/* Title with dual toggle navigation views */}
      <div className="p-4 bg-linear-to-b from-[#FAF7F6] to-transparent flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="text-[#C27D7F] w-4 h-4 fill-[#C27D7F]/20" />
              <h2 className="text-base font-serif italic text-gray-800">Inventori & Stok</h2>
            </div>
            <p className="text-[10px] text-[#A58E8E] uppercase tracking-wider">Atur ketersediaan botol Quips</p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1 bg-[#C27D7F] hover:bg-[#b16d6f] text-white text-[9px] font-bold tracking-widest uppercase px-3 py-2 rounded-xl shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Produk Baru
          </button>
        </div>

        {/* View Selection Toggle */}
        <div className="bg-[#FAF7F6] p-1 rounded-xl flex border border-[#E5D1D0]">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex-1 py-1.5 text-[10px] font-bold tracking-widest uppercase rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'catalog' ? 'bg-[#C27D7F] text-white shadow-2xs' : 'text-[#A58E8E] hover:text-[#C27D7F]'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            Varian Parfum
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 py-1.5 text-[10px] font-bold tracking-widest uppercase rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'logs' ? 'bg-[#C27D7F] text-white shadow-2xs' : 'text-[#A58E8E] hover:text-[#C27D7F]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Riwayat Stok Masuk
          </button>
        </div>
      </div>

      {activeTab === 'catalog' ? (
        /* CATALOG TABVIEW BUILDER */
        <div className="px-4 space-y-4">
          {/* Scent search engine */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C27D7F]" />
            <input
              type="text"
              placeholder="Cari parfum, kategori atau aroma..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white rounded-xl py-2 pl-9 pr-4 text-xs font-semibold border border-[#E5D1D0] placeholder-[#A58E8E] text-[#2D2D2D] focus:outline-hidden focus:ring-1 focus:ring-[#C27D7F]/30"
            />
          </div>

          {/* ITEM ROW ACCORDIONS */}
          <div className="space-y-3">
            {filteredProducts.map(p => {
              const isLow = p.stock <= p.minStock;
              return (
                <div 
                  key={p.id}
                  className={`bg-white p-3.5 rounded-2xl border transition-all flex items-center justify-between shadow-2xs ${
                    isLow ? 'border-amber-200 bg-amber-50/20' : 'border-[#E5D1D0]/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Big Icon Circular Badge */}
                    {renderScentIcon(p.scentType)}

                    <div>
                      <h4 className="text-xs font-bold text-gray-800 tracking-tight font-serif italic">{p.name}</h4>
                      <p className="text-[9px] text-[#A58E8E] leading-3 mt-0.5">{p.category} · {p.unit}</p>
                      
                      {/* Pricing Tag details */}
                      <div className="flex gap-2.5 mt-1.5 text-[9.5px]">
                        <span className="text-[#C27D7F] font-semibold font-mono">Jual: {formatIDR(p.price)}</span>
                        <span className="text-gray-400 font-mono">Modal: {formatIDR(p.costPrice)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stock Counters / Restock / Edit Shortcuts */}
                  <div className="text-right flex flex-col items-end gap-2.5">
                    {/* Stock counter */}
                    <div className="flex items-center gap-1">
                      {isLow && (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                      )}
                      <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md ${
                        p.stock === 0 
                          ? 'bg-rose-50 text-rose-700' 
                          : isLow ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'
                      }`}>
                        {p.stock} Pcs
                      </span>
                    </div>

                    {/* Stock action trigger bar */}
                    <div className="flex gap-1.5">
                      {/* Stok Masuk shortcut */}
                      <button
                        onClick={() => handleOpenRestockModal(p)}
                        className="p-1 px-2.5 bg-[#FAF7F6] border border-[#E5D1D0] text-[9px] font-bold text-[#C27D7F] hover:bg-[#F2E4E4] rounded-md transition-colors cursor-pointer uppercase tracking-tight"
                        title="Tambah Stok Masuk"
                      >
                        + Stok Masuk
                      </button>

                      {/* Edit click */}
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        className="p-1.5 bg-slate-50 text-slate-500 hover:text-[#C27D7F] rounded-md border border-slate-200/50 cursor-pointer"
                        title="Ubah Produk"
                      >
                        <Edit className="w-3 h-3" />
                      </button>

                      {/* Delete click */}
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-1.5 bg-rose-50 text-rose-400 hover:text-rose-600 rounded-md border border-rose-200/25 cursor-pointer"
                        title="Hapus Produk"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredProducts.length === 0 && (
              <div className="text-center py-10 bg-white rounded-2xl border border-[#E5D1D0]/70">
                <p className="text-xs text-[#A58E8E] font-serif italic">Belum ada parfum laundry yang didaftarkan.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* INSTANT STOCK WORKFLOW LOGS TABVIEW */
        <div className="px-4 space-y-3.5">
          <div className="p-3 bg-[#FAF7F6] border border-[#E5D1D0] rounded-2xl">
            <h4 className="text-[11px] font-bold text-[#C27D7F] flex items-center gap-1 uppercase tracking-widest font-serif italic">
              <TrendingUp className="w-3.5 h-3.5 text-[#C27D7F]" />
              Catat Keluar Masuk Otomatis
            </h4>
            <p className="text-[9.5px] text-[#A58E8E] mt-1">
              Sistem mencatat transaksi POS ("Out") serta penambahan manual ("In" / Stok Masuk) untuk transparansi stok parfum laundry Anda.
            </p>
          </div>

          <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
            {stockLogs.map(log => {
              const isIn = log.type === 'In';
              return (
                <div key={log.id} className="p-3 bg-white rounded-2xl border border-[#E5D1D0]/60 flex items-center justify-between hover:bg-white transition-all shadow-3xs">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase ${
                        isIn ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}>
                        {isIn ? 'Stok Masuk' : 'Stok Keluar'}
                      </span>
                      <span className="text-[8px] text-[#A58E8E] font-mono">{formatDate(log.date)}</span>
                    </div>

                    <h5 className="text-xs font-bold text-gray-800 mt-1.5 font-serif italic">{log.productName}</h5>
                    <p className="text-[9px] text-[#A58E8E] italic mt-0.5">Catatan: "{log.note}"</p>
                  </div>

                  <span className={`text-xs font-bold font-mono ${isIn ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {isIn ? '+' : '-'}{log.quantity}
                  </span>
                </div>
              );
            })}

            {stockLogs.length === 0 && (
              <div className="text-center py-12 text-[#A58E8E]">
                <p className="text-xs font-serif italic">Belum ada riwayat aktivitas mutasi stok parfum.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: ADD OR EXTRUDE PRODUCTS SHADED WIDGET */}
      {isProductModalOpen && (
        <div className="absolute inset-0 bg-black/60 z-50 rounded-b-[40px] flex flex-col justify-end animate-fade-in pointer-events-auto">
          <div className="bg-white rounded-t-[32px] p-5 pb-8 shadow-2xl overflow-y-auto max-h-[90%]">
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-800 font-serif italic">
                {editingProduct ? 'Ubah Informasi Parfum' : 'Tambah Parfum Baru Quips'}
              </h3>
              <button 
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-full bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs font-medium">
              
              {/* Scent Name */}
              <div>
                <label className="block text-[9px] uppercase font-bold tracking-widest text-[#C27D7F] mb-1">Nama Parfum</label>
                <input
                  type="text"
                  placeholder="Contoh: Quips Orchid Black"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-white border border-[#E5D1D0] rounded-xl py-2 px-3 text-[11px] text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-[#C27D7F]/30"
                />
              </div>

              {/* Tag/Category */}
              <div>
                <label className="block text-[9px] uppercase font-bold tracking-widest text-[#C27D7F] mb-1">Kategori Label</label>
                <input
                  type="text"
                  placeholder="Contoh: Premium Series, Daily Fresh"
                  required
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-white border border-[#E5D1D0] rounded-xl py-2 px-3 text-[11px] text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-[#C27D7F]/30"
                />
              </div>

              {/* Scent Type Grid */}
              <div>
                <label className="block text-[9px] uppercase font-bold tracking-widest text-[#C27D7F] mb-1">Jenis Karakter Aroma</label>
                <div className="grid grid-cols-5 gap-1">
                  {(['Sweet', 'Fresh', 'Floral', 'Fruity', 'Elegant'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormScentType(type)}
                      className={`py-2 rounded-lg text-[9px] font-bold text-center border cursor-pointer transition-all ${
                        formScentType === type 
                          ? 'border-[#C27D7F] bg-[#FAF7F6] text-[#C27D7F] font-extrabold shadow-2xs' 
                          : 'border-gray-100 bg-gray-50/50 text-gray-500'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Botol Unit scale */}
              <div>
                <label className="block text-[9px] uppercase font-bold tracking-widest text-[#C27D7F] mb-1">Kemasan / Unit Ukuran</label>
                <input
                  type="text"
                  placeholder="Contoh: 250ml (Spray), 500ml, 1 Liter"
                  required
                  value={formUnit}
                  onChange={(e) => setFormUnit(e.target.value)}
                  className="w-full bg-white border border-[#E5D1D0] rounded-xl py-2 px-3 text-[11px] text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-[#C27D7F]/30"
                />
              </div>

              {/* Double column pricing fields */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] uppercase font-bold tracking-widest text-[#C27D7F] mb-1">Harga Jual Toko (Rp)</label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-white border border-[#E5D1D0] rounded-xl py-2 px-3 text-[11px] font-bold text-[#C27D7F] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold tracking-widest text-[#C27D7F] mb-1">Harga Modal Pokok (Rp)</label>
                  <input
                    type="number"
                    required
                    value={formCostPrice}
                    onChange={(e) => setFormCostPrice(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-white border border-[#E5D1D0] rounded-xl py-2 px-3 text-[11px] font-semibold text-gray-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Stock controls */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] uppercase font-bold tracking-widest text-[#C27D7F] mb-1">Sediaan Stok Awal</label>
                  <input
                    type="number"
                    required
                    disabled={!!editingProduct} // Cannot directly edit quantity to enforce stock-in logs
                    value={formStock}
                    onChange={(e) => setFormStock(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-white border border-[#E5D1D0] rounded-xl py-2 px-3 text-[11px] text-gray-800 focus:outline-hidden disabled:opacity-50"
                  />
                  {editingProduct && (
                    <span className="text-[8px] text-[#A58E8E] block mt-0.5 font-serif italic">*Edit stok via tombol '+ Stok Masuk'</span>
                  )}
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold tracking-widest text-[#C27D7F] mb-1">Batas Minimal Stok</label>
                  <input
                    type="number"
                    required
                    value={formMinStock}
                    onChange={(e) => setFormMinStock(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-white border border-[#E5D1D0] rounded-xl py-2 px-3 text-[11px] text-gray-800 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Submit trigger */}
              <button
                type="submit"
                className="w-full bg-[#C27D7F] hover:bg-[#b16d6f] py-3 rounded-xl text-white font-bold tracking-widest text-[10px] uppercase mt-4 shadow-xs cursor-pointer"
              >
                Simpan Parfum
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: STOK MASUK WIDGET DESIGNED SPECIFICALLY */}
      {isRestockModalOpen && restockProduct && (
        <div className="absolute inset-0 bg-black/60 z-50 rounded-b-[40px] flex flex-col justify-end animate-fade-in pointer-events-auto">
          <div className="bg-white rounded-t-[32px] p-5 pb-8 shadow-2xl">
            
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-[#C27D7F] fill-[#C27D7F]/20" />
                <h3 className="text-sm font-bold text-gray-800 font-serif italic">Sistem Stok Masuk (Restock)</h3>
              </div>
              <button 
                onClick={() => setIsRestockModalOpen(false)}
                className="p-1 rounded-full bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRestock} className="space-y-4 text-xs font-semibold">
              <div className="bg-[#FAF7F6] p-3 rounded-xl border border-[#E5D1D0]">
                <p className="text-[#A58E8E] text-[8px] uppercase tracking-wider">Memasok Produk</p>
                <h4 className="text-sm font-bold text-[#C27D7F] font-serif italic mt-1">{restockProduct.name}</h4>
                <p className="text-[10px] text-gray-500 font-mono mt-0.5">Sisa stok gudang: {restockProduct.stock} unit</p>
              </div>

              {/* Restock Quantity */}
              <div>
                <label className="block text-[9px] uppercase font-bold tracking-widest text-[#C27D7F] mb-1.5">Jumlah Botol Masuk (Pcs)</label>
                <input
                  type="number"
                  required
                  value={restockQty}
                  onChange={(e) => setRestockQty(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full bg-white border border-[#E5D1D0] rounded-xl py-2.5 px-3 text-sm font-bold text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-[#C27D7F]/30"
                />
              </div>

              {/* Note / Comments */}
              <div>
                <label className="block text-[9px] uppercase font-bold tracking-widest text-[#C27D7F] mb-1.5">Keterangan / Catatan Inventori</label>
                <input
                  type="text"
                  placeholder="Contoh: Kiriman Supplier Batch B"
                  value={restockNote}
                  onChange={(e) => setRestockNote(e.target.value)}
                  className="w-full bg-white border border-[#E5D1D0] rounded-xl py-2 px-3 text-xs text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-[#C27D7F]/30"
                />
              </div>

              {/* Submit restock */}
              <button
                type="submit"
                className="w-full bg-[#C27D7F] hover:bg-[#b16d6f] py-3 rounded-xl text-white font-bold tracking-widest text-[10px] uppercase mt-2 shadow-xs cursor-pointer"
              >
                ✓ Simpan Stok Masuk
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
