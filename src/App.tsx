import { useState, useEffect } from 'react';
import { Product, Transaction, Expense, StockLog, StoreSettings } from './types';
import { 
  INITIAL_PRODUCTS, 
  generateMockTransactions, 
  INITIAL_EXPENSES, 
  INITIAL_STOCK_LOGS, 
  DEFAULT_SETTINGS 
} from './data/mockData';
import { getSupabase, isSupabaseConfigured } from './lib/supabase';
// @ts-ignore
import quipsLogo from './assets/images/quips_logo_1779788808955.png';

import PhoneWrapper from './components/PhoneWrapper';
import DashboardTab from './components/DashboardTab';
import KasirTab from './components/KasirTab';
import ProdukTab from './components/ProdukTab';
import KeuanganTab from './components/KeuanganTab';
import SetelanTab from './components/SetelanTab';
import ReceiptModal from './components/ReceiptModal';

import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Wallet, 
  Settings, 
  Sparkles,
  Heart
} from 'lucide-react';

export default function App() {
  // STATE DIRECTORIES
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [isCloud, setIsCloud] = useState(false);

  // NAVIGATION & VIEW SWITCHER STATE
  const [activeTab, setActiveTab] = useState<'dashboard' | 'kasir' | 'produk' | 'keuangan' | 'setelan'>('dashboard');
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedTxForReceipt, setSelectedTxForReceipt] = useState<Transaction | null>(null);

  // FIRST TIME STORAGE CHECK & LOAD
  useEffect(() => {
    setIsCloud(isSupabaseConfigured());
    const storedProducts = localStorage.getItem('quips_products');
    const storedTransactions = localStorage.getItem('quips_transactions');
    const storedExpenses = localStorage.getItem('quips_expenses');
    const storedStockLogs = localStorage.getItem('quips_stock_logs');
    const storedSettings = localStorage.getItem('quips_settings');

    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      setProducts(INITIAL_PRODUCTS);
      localStorage.setItem('quips_products', JSON.stringify(INITIAL_PRODUCTS));
    }

    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    } else {
      const gMock = generateMockTransactions();
      setTransactions(gMock);
      localStorage.setItem('quips_transactions', JSON.stringify(gMock));
    }

    if (storedExpenses) {
      setExpenses(JSON.parse(storedExpenses));
    } else {
      setExpenses(INITIAL_EXPENSES);
      localStorage.setItem('quips_expenses', JSON.stringify(INITIAL_EXPENSES));
    }

    if (storedStockLogs) {
      setStockLogs(JSON.parse(storedStockLogs));
    } else {
      setStockLogs(INITIAL_STOCK_LOGS);
      localStorage.setItem('quips_stock_logs', JSON.stringify(INITIAL_STOCK_LOGS));
    }

    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    } else {
      setSettings(DEFAULT_SETTINGS);
      localStorage.setItem('quips_settings', JSON.stringify(DEFAULT_SETTINGS));
    }
  }, []);

  // SILENT BACKGROUND SYNC TRIGGER WITH DEBOUNCE
  useEffect(() => {
    if (!isCloud || products.length === 0) return;
    
    const delayTimer = setTimeout(() => {
      handleSyncWithSupabase().catch((err) => {
        console.warn('Silent Background Supabase sync error suppressed:', err);
      });
    }, 2500); // 2.5s debounce and batch

    return () => clearTimeout(delayTimer);
  }, [products, transactions, expenses, stockLogs, settings, isCloud]);

  // MASTER HANDLERS: ADD SALES TRANSACTION (POS POSITIVE FLOW)
  const handleAddTransaction = (newTxData: Omit<Transaction, 'id' | 'date'>): string => {
    const generatedId = `INV-${1000 + transactions.length + 1}`;
    const generatedDate = new Date().toISOString();

    const finalizedTx: Transaction = {
      ...newTxData,
      id: generatedId,
      date: generatedDate
    };

    // 1. UPDATE TRANSACTION LEDGER STATE
    const updatedTxs = [finalizedTx, ...transactions];
    setTransactions(updatedTxs);
    localStorage.setItem('quips_transactions', JSON.stringify(updatedTxs));

    // 2. DEDUCT SELLER PRODUCTS QUANTITIES IN STATE AND LOCALSTORAGE
    // Create inventory stock logs for transparency
    const newStockLogs: StockLog[] = [];
    const updatedProds = products.map(p => {
      const matchInCart = newTxData.items.find(itm => itm.productId === p.id);
      if (matchInCart) {
        newStockLogs.push({
          id: `log-${Date.now()}-${p.id}`,
          productId: p.id,
          productName: p.name,
          type: 'Out',
          quantity: matchInCart.quantity,
          date: generatedDate,
          note: `Penjualan ${generatedId} (${newTxData.customerName})`
        });
        return {
          ...p,
          stock: Math.max(0, p.stock - matchInCart.quantity)
        };
      }
      return p;
    });

    setProducts(updatedProds);
    localStorage.setItem('quips_products', JSON.stringify(updatedProds));

    // 3. LOG INVENTORY LOGS
    const updatedLogs = [...newStockLogs, ...stockLogs];
    setStockLogs(updatedLogs);
    localStorage.setItem('quips_stock_logs', JSON.stringify(updatedLogs));

    return generatedId;
  };

  // OPEN RECEIPT SHORTCUT
  const handleTriggerReceiptByTxId = (txId: string) => {
    // Find transaction object matching ID
    const found = transactions.find(t => t.id === txId);
    if (found) {
      setSelectedTxForReceipt(found);
      setIsReceiptModalOpen(true);
    } else {
      // Try looking at latest transaction directly
      const latest = transactions[0];
      if (latest) {
        setSelectedTxForReceipt(latest);
        setIsReceiptModalOpen(true);
      }
    }
  };

  // INSTANT RESTOCK ("Stok Masuk" shortcuts done from dashboards or inventory boards)
  const handleAddStockLogAndQuantity = (productId: string, qty: number, type: 'In' | 'Out', note: string) => {
    const generatedLog: StockLog = {
      id: `log-${Date.now()}`,
      productId,
      productName: products.find(p => p.id === productId)?.name || 'Unknown Product',
      type,
      quantity: qty,
      date: new Date().toISOString(),
      note
    };

    // Update quantity
    const updatedProds = products.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          stock: type === 'In' ? (p.stock + qty) : Math.max(0, p.stock - qty)
        };
      }
      return p;
    });

    setProducts(updatedProds);
    localStorage.setItem('quips_products', JSON.stringify(updatedProds));

    const updatedLogs = [generatedLog, ...stockLogs];
    setStockLogs(updatedLogs);
    localStorage.setItem('quips_stock_logs', JSON.stringify(updatedLogs));
  };

  // PRODUCT CRUD CONTROLLERS
  const handleAddProduct = (newProdData: Omit<Product, 'id' | 'popularity'>) => {
    const createdProd: Product = {
      ...newProdData,
      id: `prod-${Date.now()}`,
      popularity: 0
    };

    const updatedProds = [createdProd, ...products];
    setProducts(updatedProds);
    localStorage.setItem('quips_products', JSON.stringify(updatedProds));

    // Record initial stock entry
    handleAddStockLogAndQuantity(
      createdProd.id, 
      createdProd.stock, 
      'In', 
      'Pendaftaran aroma baru di sistem Quips'
    );
  };

  const handleUpdateProduct = (updatedProd: Product) => {
    const updatedProds = products.map(p => p.id === updatedProd.id ? updatedProd : p);
    setProducts(updatedProds);
    localStorage.setItem('quips_products', JSON.stringify(updatedProds));
  };

  const handleDeleteProduct = (prodId: string) => {
    const updatedProds = products.filter(p => p.id !== prodId);
    setProducts(updatedProds);
    localStorage.setItem('quips_products', JSON.stringify(updatedProds));
  };

  // BOOKKEEPING OPERATIONAL EXPENSES
  const handleAddExpense = (newExpData: Omit<Expense, 'id'>) => {
    const finalizedExp: Expense = {
      ...newExpData,
      id: `exp-${Date.now()}`
    };

    const updatedExpenses = [finalizedExp, ...expenses];
    setExpenses(updatedExpenses);
    localStorage.setItem('quips_expenses', JSON.stringify(updatedExpenses));
  };

  // APP PROPERTIES CONFIGURATION SETTINGS
  const handleUpdateSettings = (updatedSets: StoreSettings) => {
    setSettings(updatedSets);
    localStorage.setItem('quips_settings', JSON.stringify(updatedSets));
  };

  // RESET DATABASE CONTROLLER
  const handleResetDatabase = () => {
    localStorage.removeItem('quips_products');
    localStorage.removeItem('quips_transactions');
    localStorage.removeItem('quips_expenses');
    localStorage.removeItem('quips_stock_logs');
    localStorage.removeItem('quips_settings');
    
    setProducts([]);
    setTransactions([]);
    setExpenses([]);
    setStockLogs([]);
    setSettings(DEFAULT_SETTINGS);
  };

  // REPOPULATE DUMMY SELECTIONS
  const handleReloadMockDatabase = () => {
    localStorage.removeItem('quips_products');
    localStorage.removeItem('quips_transactions');
    localStorage.removeItem('quips_expenses');
    localStorage.removeItem('quips_stock_logs');
    localStorage.removeItem('quips_settings');
  };

  // SYNC ALL LOCAL STATE RECORDS WITH SUPABASE CLOUD TABLES
  const handleSyncWithSupabase = async () => {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase client is not initialized. Mohon setel VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di environment variables.');
    }

    try {
      // 1. Sync Products (if non-empty)
      if (products.length > 0) {
        const { error: prodErr } = await supabase
          .from('products')
          .upsert(products.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category,
            price: p.price,
            costPrice: p.costPrice,
            stock: p.stock,
            minStock: p.minStock,
            unit: p.unit,
            scentType: p.scentType,
            popularity: p.popularity
          })));
        if (prodErr) throw prodErr;
      }

      // 2. Sync Transactions (if non-empty)
      if (transactions.length > 0) {
        const { error: txErr } = await supabase
          .from('transactions')
          .upsert(transactions.map(t => ({
            id: t.id,
            customerName: t.customerName,
            customerWhatsApp: t.customerWhatsApp,
            date: t.date,
            items: JSON.stringify(t.items), // Safe format representation for JSONB
            subtotal: t.subtotal,
            discount: t.discount,
            tax: t.tax,
            total: t.total,
            profit: t.profit,
            paymentMethod: t.paymentMethod,
            notes: t.notes || ''
          })));
        if (txErr) throw txErr;
      }

      // 3. Sync Expenses (if non-empty)
      if (expenses.length > 0) {
        const { error: expErr } = await supabase
          .from('expenses')
          .upsert(expenses.map(e => ({
            id: e.id,
            description: e.description,
            amount: e.amount,
            category: e.category,
            date: e.date,
            paymentMethod: e.paymentMethod
          })));
        if (expErr) throw expErr;
      }

      // 4. Sync Stock Logs (if non-empty)
      if (stockLogs.length > 0) {
        const { error: logErr } = await supabase
          .from('stock_logs')
          .upsert(stockLogs.map(l => ({
            id: l.id,
            productId: l.productId,
            productName: l.productName,
            type: l.type,
            quantity: l.quantity,
            date: l.date,
            note: l.note
          })));
        if (logErr) throw logErr;
      }

      // 5. Sync Settings
      const { error: setErr } = await supabase
        .from('store_settings')
        .upsert({
          id: 'default',
          brandName: settings.brandName,
          phone: settings.phone,
          address: settings.address,
          receiptHeader: settings.receiptHeader,
          receiptFooter: settings.receiptFooter,
          currency: settings.currency || 'Rp'
        });
      if (setErr) throw setErr;

    } catch (err: any) {
      console.error('Supabase Sync error:', err);
      throw new Error(err?.message || 'Gagal tersambung ke server database Supabase. Periksa kembali struktur tabel Anda.');
    }
  };

  // CHOSEN TAB VIEWER ROUTER
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardTab
            products={products}
            transactions={transactions}
            expenses={expenses}
            onNavigate={(tab) => setActiveTab(tab)}
            onRestockFromDashboard={(pId, amt) => {
              handleAddStockLogAndQuantity(pId, amt, 'In', 'Restok cepat dari Dashboard utama');
              alert(`Berhasil restok cepat +${amt} pcs!`);
            }}
          />
        );
      case 'kasir':
        return (
          <KasirTab
            products={products}
            onAddTransaction={handleAddTransaction}
            onTriggerReceipt={handleTriggerReceiptByTxId}
          />
        );
      case 'produk':
        return (
          <ProdukTab
            products={products}
            stockLogs={stockLogs}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onAddStockLog={handleAddStockLogAndQuantity}
          />
        );
      case 'keuangan':
        return (
          <KeuanganTab
            expenses={expenses}
            transactions={transactions}
            onAddExpense={handleAddExpense}
          />
        );
      case 'setelan':
        return (
          <SetelanTab
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onResetDatabase={handleResetDatabase}
            onReloadMockDatabase={handleReloadMockDatabase}
            onSyncWithSupabase={handleSyncWithSupabase}
          />
        );
      default:
        return null;
    }
  };

  return (
    <PhoneWrapper>
      {/* BRAND STATIC GORGEOUS HEADER BAR */}
      <div className="bg-[#FAF7F6]/95 backdrop-blur-md px-5 py-4 flex items-center justify-between border-b border-[#E5D1D0] z-35 flex-none relative">
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-xl font-serif italic text-[#C27D7F] tracking-tight flex items-center gap-1.5 font-medium">
              {settings.brandName || 'Quips Perfume'}
              <Sparkles className="w-4.5 h-4.5 text-[#C27D7F] fill-[#C27D7F]/20" />
            </h1>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[9.5px] text-[#A58E8E] uppercase font-bold tracking-widest">
              Specialist Laundry Perfume POS
            </span>
            <span className="text-[8px] font-bold text-[#E5D1D0]">•</span>
            {isCloud ? (
              <span className="inline-flex items-center gap-1 text-[8px] text-emerald-600 bg-emerald-50/70 border border-emerald-100 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider scale-95 origin-left">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                Cloud
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[8px] text-[#A58E8E] bg-[#FAF7F6] border border-[#E5D1D0]/70 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider scale-95 origin-left">
                Local Sandbox
              </span>
            )}
          </div>
        </div>

        {/* Brand visual flower symbol */}
        <div className="w-10 h-10 rounded-full border border-[#E5D1D0] overflow-hidden bg-white shadow-xs">
          <img src={quipsLogo} alt="Quips Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
      </div>

      {/* CORE SCREEN TAB PORTAL */}
      <div className="flex-grow overflow-y-auto pb-28 p-4 relative z-10">
        {renderActiveTab()}
      </div>

      {/* FEMININE NAVIGATION BAR DECK (Anchored Bottom Menu) */}
      <div className="absolute bottom-0 inset-x-0 h-20 bg-[#FAF7F6]/95 backdrop-blur-lg border-t border-[#E5D1D0]/50 flex items-center justify-around px-2 z-40">
        {/* Tab Buttons matches Expesix/Wallet presentation with capsule highlights */}
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'kasir', label: 'Kasir', icon: ShoppingBag },
          { id: 'produk', label: 'Produk/Stok', icon: Package },
          { id: 'keuangan', label: 'Keuangan', icon: Wallet },
          { id: 'setelan', label: 'Setelan', icon: Settings }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className="flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-300 relative group cursor-pointer"
            >
              {/* Active glow backing capsule bubble */}
              {isActive && (
                <div className="absolute inset-0 bg-[#F2E4E4] rounded-xl -z-10 animate-scale-up" />
              )}
              
              <Icon 
                className={`w-5 h-5 transition-all group-hover:scale-110 ${
                  isActive 
                    ? 'text-[#C27D7F] scale-105 stroke-[2.2px]' 
                    : 'text-[#A58E8E] stroke-[1.8px]'
                }`} 
              />
              
              <span className={`text-[10px] font-semibold mt-1 tracking-tight transition-colors uppercase font-sans ${
                isActive ? 'text-[#C27D7F] font-bold' : 'text-[#A58E8E]'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* GLOBAL MODALS POPUP: INVOICE GENERATOR WITH WA SHARING */}
      {isReceiptModalOpen && selectedTxForReceipt && (
        <ReceiptModal
          transaction={selectedTxForReceipt}
          settings={settings}
          onClose={() => {
            setIsReceiptModalOpen(false);
            setSelectedTxForReceipt(null);
          }}
        />
      )}
    </PhoneWrapper>
  );
}
