import React, { useState, useMemo } from 'react';
import { Product, CartItem, PaymentMethod, Transaction } from '../types';
import { 
  Search, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  X, 
  User, 
  Phone, 
  CreditCard,
  Percent,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface KasirTabProps {
  products: Product[];
  onAddTransaction: (newTx: Omit<Transaction, 'id' | 'date'>) => string; // returns generated TX ID
  onTriggerReceipt: (txId: string) => void;
}

export default function KasirTab({ products, onAddTransaction, onTriggerReceipt }: KasirTabProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Checkout Form States
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [discount, setDiscount] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const formatIDR = (num: number) => {
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  // CATEGORY LIST
  const scentCategories = ['All', 'Sweet', 'Fresh', 'Floral', 'Fruity', 'Elegant'];

  // FILTERED PRODUCTS
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.category.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCategory === 'All' || p.scentType === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [products, search, selectedCategory]);

  // CART LOGIC
  const addToCart = (product: Product) => {
    // Check if item is already in cart
    const existing = cart.find(item => item.product.id === product.id);
    const currentQty = existing ? existing.quantity : 0;

    // Check stock limit
    if (currentQty >= product.stock) {
      alert(`Maaf, stok ${product.name} hanya sisa ${product.stock} pcs!`);
      return;
    }

    if (existing) {
      setCart(cart.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    const existing = cart.find(item => item.product.id === productId);
    if (!existing) return;

    const newQty = existing.quantity + delta;

    // If decreases to 0, remove
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    // Check stock limit when increasing
    if (delta > 0 && newQty > existing.product.stock) {
      alert(`Stok maksimal ${existing.product.name} tercapai (${existing.product.stock} pcs).`);
      return;
    }

    setCart(cart.map(item => 
      item.product.id === productId 
        ? { ...item, quantity: newQty }
        : item
    ));
  };

  // FINANCIAL SUMS
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  }, [cart]);

  const tax = useMemo(() => {
    return Math.round(subtotal * 0.02); // 2% laundry tax
  }, [subtotal]);

  const total = useMemo(() => {
    const sum = subtotal - discount + tax;
    return sum > 0 ? sum : 0;
  }, [subtotal, discount, tax]);

  // SUBMIT TRANSACTION
  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert('Keranjang belanja masih kosong!');
      return;
    }

    if (!customerName.trim()) {
      alert('Nama pelanggan wajib diisi!');
      return;
    }

    // Map cart items
    const txItems = cart.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity
    }));

    // Calculate total cost and dynamic transaction profit
    const totalCost = cart.reduce((acc, item) => acc + (item.product.costPrice * item.quantity), 0);
    const profit = total - totalCost;

    // Call callback to store in state
    const generatedTxId = onAddTransaction({
      customerName,
      customerWhatsApp: customerPhone || 'Tanpa WA',
      items: txItems,
      subtotal,
      discount,
      tax,
      total,
      profit,
      paymentMethod,
      notes: notes.trim() || undefined
    });

    // Reset checkout sheet & cart
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setDiscount(0);
    setNotes('');
    setIsCartOpen(false);

    // Open receipt modal right away
    onTriggerReceipt(generatedTxId);
  };

  // CATEGORY CHIP COLOR UTILITIES
  const categoryBg = (type: string) => {
    switch(type) {
      case 'Sweet': return 'bg-[#FAF7F6] border border-[#E5D1D0] text-[#C27D7F]';
      case 'Fresh': return 'bg-sky-50 text-[#C27D7F] border border-sky-100';
      case 'Floral': return 'bg-[#F9F0F0] text-[#C27D7F] border border-[#E5D1D0]/30';
      case 'Fruity': return 'bg-[#F2E4E4] text-[#2D2D2D]';
      case 'Elegant': return 'bg-[#FAF7F6] text-[#A58E8E] border border-[#E5D1D0]';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="flex-1 flex flex-col pb-28 text-[#2D2D2D]">
      {/* Search and Header Section */}
      <div className="p-4 bg-linear-to-b from-[#FAF7F6] to-transparent">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Sparkles className="w-4 h-4 text-[#C27D7F] fill-[#C27D7F]/30" />
          <h2 className="text-base font-serif italic text-gray-800">Kasir Quips Perfume</h2>
        </div>
        <p className="text-[10px] text-[#A58E8E] uppercase tracking-wider mb-4">Pilih aroma parfum laundry untuk transaksi cepat</p>

        {/* Dynamic Search bar with Lucide icon */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C27D7F]" />
          <input
            type="text"
            placeholder="Cari Aroma Premium... (Sakura, Lavender dll)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold border border-[#E5D1D0] placeholder-[#A58E8E] text-[#2D2D2D] focus:outline-hidden focus:ring-1 focus:ring-[#C27D7F]/30"
          />
        </div>
      </div>

      {/* Scent Categories Ribbon */}
      <div className="px-4 mb-4 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {scentCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all uppercase tracking-widest cursor-pointer ${
              selectedCategory === cat 
                ? 'bg-[#C27D7F] text-white shadow-xs' 
                : 'bg-white text-[#C27D7F] border border-[#E5D1D0] hover:bg-[#F9F0F0]/50'
            }`}
          >
            {cat === 'All' ? 'Semua Aroma' : cat}
          </button>
        ))}
      </div>

      {/* PRODUCT GRID LIST */}
      <div className="flex-1 px-4 grid grid-cols-2 gap-3 overflow-y-auto max-h-[420px] pb-10">
        {filteredProducts.map((prod) => {
          const isOutOfStock = prod.stock <= 0;
          const isLowStock = prod.stock <= prod.minStock && !isOutOfStock;

          return (
            <div 
              key={prod.id}
              onClick={() => !isOutOfStock && addToCart(prod)}
              className={`bg-white rounded-2xl p-3.5 border border-[#E5D1D0] flex flex-col justify-between hover:shadow-xs transition-all cursor-pointer relative select-none transform hover:scale-[1.01] active:scale-99 overflow-hidden group ${
                isOutOfStock ? 'opacity-40 bg-gray-50/40 cursor-not-allowed' : ''
              }`}
            >
              {/* Scent Color Circle Decoration */}
              <div className="absolute top-[-20px] right-[-20px] w-14 h-14 bg-[#FAF7F6] rounded-full group-hover:scale-125 transition-all duration-500" />

              <div>
                {/* Category & Unit Indicator */}
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-tight ${categoryBg(prod.scentType)}`}>
                    {prod.scentType}
                  </span>
                  <span className="text-[9px] font-mono text-[#A58E8E] truncate max-w-[50px]">{prod.unit}</span>
                </div>

                {/* Scent Name */}
                <h4 className="text-[12px] font-bold text-gray-800 tracking-tight leading-4 mb-1 group-hover:text-[#C27D7F] transition-colors font-serif italic">
                  {prod.name}
                </h4>

                {/* Scent Price */}
                <p className="text-[11px] font-bold text-[#C27D7F]">{formatIDR(prod.price)}</p>
              </div>

              {/* Stock Status Pill */}
              <div className="mt-3 flex items-center justify-between">
                {isOutOfStock ? (
                  <span className="text-[8px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-sm uppercase">Habis</span>
                ) : isLowStock ? (
                  <span className="text-[8px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-sm uppercase animate-pulse">Sisa {prod.stock} Pcs</span>
                ) : (
                  <span className="text-[8.5px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded-sm">Stok {prod.stock}</span>
                )}

                {/* Add Indicator Icon */}
                <div className="bg-[#FAF7F6] text-[#C27D7F] border border-[#E5D1D0]/40 group-hover:bg-[#C27D7F] group-hover:text-white p-1 rounded-lg transition-colors shadow-2xs">
                  <Plus className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}

        {filteredProducts.length === 0 && (
          <div className="col-span-2 text-center py-12">
            <p className="text-xs text-[#A58E8E] font-serif">Aroma parfum yang dicari tidak tersedia.</p>
          </div>
        )}
      </div>

      {/* FLOATING CART AND ACTION BAR */}
      {cart.length > 0 && (
        <div className="fixed bottom-22 left-1/2 -translate-x-1/2 w-full max-w-[400px] px-4 z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-[#C27D7F] text-white p-3.5 rounded-2xl shadow-lg hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-between border-t border-white/25 relative overflow-hidden"
          >
            <div className="flex items-center gap-2.5 relative z-10">
              <div className="bg-white/15 p-1.5 rounded-lg">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-[11px] font-bold uppercase tracking-wider">{cart.length} Aroma di Keranjang</p>
                <p className="text-[9px] text-[#F2E4E4] uppercase">Buka Lembar Pembayaran & Detail</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 relative z-10 font-serif italic font-medium">
              <span className="text-[13px]">{formatIDR(subtotal)}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* DETAILED CART DRAWER & CHECKOUT FORMSHEET OVERLAY */}
      {isCartOpen && (
        <div className="absolute inset-x-0 bottom-0 bg-black/60 z-50 rounded-b-[40px] flex flex-col justify-end animate-fade-in">
          <div className="bg-white rounded-t-[32px] max-h-[90%] overflow-y-auto p-5 pb-8 shadow-2xl flex flex-col">
            
            {/* Header Drag Line */}
            <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-4" />

            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-1.5">
                <ShoppingBag className="w-4.5 h-4.5 text-[#C27D7F]" />
                <h3 className="text-sm font-bold text-gray-800 font-serif italic">Keranjang Checkout</h3>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-1 px-1.5 rounded-full bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* CART ITEM ITERATION */}
            <div className="space-y-3 mb-5 max-h-40 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F6] border border-[#E5D1D0]/50">
                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className="text-xs font-bold text-gray-800 truncate font-serif italic">{item.product.name}</h4>
                    <p className="text-[9px] text-[#A58E8E] mt-0.5">{item.product.unit} · {formatIDR(item.product.price)} · sisa: {item.product.stock}</p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {/* Quantity Selector buttons */}
                    <div className="flex items-center gap-1.5 bg-white px-1.5 py-1 rounded-lg border border-[#E5D1D0]">
                      <button 
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="text-gray-500 hover:text-rose-600 active:scale-95 px-1 font-bold text-xs"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="text-xs font-bold text-gray-800 px-1.5">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="text-gray-500 hover:text-[#C27D7F] active:scale-95 px-1 font-bold text-xs"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    <p className="text-xs font-bold text-gray-800 min-w-[65px] text-right font-mono">
                      {formatIDR(item.product.price * item.quantity)}
                    </p>

                    <button 
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1.5 text-gray-300 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* FORM: CUSTOMER LEDGER AND OPTIONS */}
            <form onSubmit={handleCheckout} className="space-y-4">
              
              {/* Customer Inputs */}
              <div>
                <label className="block text-[9px] uppercase font-bold tracking-widest text-[#C27D7F] mb-1.5">Informasi Pelanggan</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#C27D7F]" />
                    <input
                      type="text"
                      placeholder="Nama Pelanggan"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-white border border-[#E5D1D0] rounded-xl py-2 pl-8 pr-2 text-[11px] font-semibold text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-[#C27D7F]/30"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#C27D7F]" />
                    <input
                      type="number"
                      placeholder="WA (cth: 62812...)"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-white border border-[#E5D1D0] rounded-xl py-2 pl-8 pr-2 text-[11px] font-semibold text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-[#C27D7F]/30"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Selector */}
              <div>
                <label className="block text-[9px] uppercase font-bold tracking-widest text-[#C27D7F] mb-1.5">Model Pembayaran</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Cash', 'QRIS', 'Transfer'] as PaymentMethod[]).map(meth => (
                    <button
                      key={meth}
                      type="button"
                      onClick={() => setPaymentMethod(meth)}
                      className={`py-2 rounded-xl text-[10px] font-bold text-center border transition-all cursor-pointer ${
                        paymentMethod === meth 
                          ? 'border-[#C27D7F] bg-[#FAF7F6] text-[#C27D7F] font-extrabold shadow-2xs' 
                          : 'border-gray-100 bg-gray-50/45 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {meth}
                    </button>
                  ))}
                </div>
              </div>

              {/* Discount Promo and Custom Note fields */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] uppercase font-bold tracking-widest text-[#C27D7F] mb-1 flex items-center gap-1">
                    <Percent className="w-3 h-3 text-[#C27D7F]" /> Diskon (Rp)
                  </label>
                  <input
                    type="number"
                    placeholder="Contoh: 5000"
                    value={discount || ''}
                    onChange={(e) => setDiscount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-white border border-[#E5D1D0] rounded-xl py-2 px-3 text-[11px] font-bold text-rose-700 focus:outline-hidden focus:ring-1 focus:ring-[#C27D7F]/30"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold tracking-widest text-[#C27D7F] mb-1">Catatan Struk</label>
                  <input
                    type="text"
                    placeholder="Wewangian laundry..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-white border border-[#E5D1D0] rounded-xl py-2 px-3 text-[11px] font-semibold text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-[#C27D7F]/30"
                  />
                </div>
              </div>

              {/* PRICE DETAIL SLATE */}
              <div className="bg-[#FAF7F6] p-3.5 rounded-2xl border border-[#E5D1D0] text-xs font-semibold space-y-1.5 mt-4 text-[#2D2D2D]">
                <div className="flex justify-between">
                  <span className="text-[#A58E8E] font-medium">Subtotal</span>
                  <span className="font-mono">{formatIDR(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-rose-700 font-bold">
                    <span>Diskon Outlet</span>
                    <span className="font-mono">-{formatIDR(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#A58E8E] font-medium">Pajak Local (2%)</span>
                  <span className="font-mono">{formatIDR(tax)}</span>
                </div>
                <hr className="border-[#E5D1D0]/40 my-1" />
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-gray-800">TOTAL BAYAR</span>
                  <span className="text-[#C27D7F] font-serif italic text-base">{formatIDR(total)}</span>
                </div>
              </div>

              {/* CHECKOUT MASTER BUTTON */}
              <button
                type="submit"
                className="w-full bg-[#C27D7F] hover:bg-[#b16d6f] text-white font-bold text-xs py-3 rounded-xl shadow-xs mt-2 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-widest"
              >
                <CreditCard className="w-4 h-4" />
                Proses & Cetak Struk Estetik
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
