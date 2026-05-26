import React, { useState, useEffect } from 'react';
import { StoreSettings } from '../types';
import { isSupabaseConfigured } from '../lib/supabase';
import { 
  Settings, 
  Building, 
  Phone, 
  MapPin, 
  FileText, 
  RotateCcw, 
  CheckCircle,
  Sparkles,
  Database,
  RefreshCw,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';

interface SetelanTabProps {
  settings: StoreSettings;
  onUpdateSettings: (updatedSet: StoreSettings) => void;
  onResetDatabase: () => void;
  onReloadMockDatabase: () => void;
  onSyncWithSupabase?: () => Promise<void>;
}

export default function SetelanTab({
  settings,
  onUpdateSettings,
  onResetDatabase,
  onReloadMockDatabase,
  onSyncWithSupabase
}: SetelanTabProps) {
  const [brandName, setBrandName] = useState(settings.brandName);
  const [phone, setPhone] = useState(settings.phone);
  const [address, setAddress] = useState(settings.address);
  const [receiptHeader, setReceiptHeader] = useState(settings.receiptHeader);
  const [receiptFooter, setReceiptFooter] = useState(settings.receiptFooter);

  const [saved, setSaved] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [showSql, setShowSql] = useState(false);

  useEffect(() => {
    setIsConfigured(isSupabaseConfigured());
  }, []);

  const handleManualSync = async () => {
    if (!onSyncWithSupabase) {
      setSyncMessage('Koneksi Supabase belum aktif atau method sync tidak terdaftar.');
      return;
    }
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      await onSyncWithSupabase();
      setSyncMessage('Sukses! Semua data terkirim & tersinkronisasi sempurna dengan Supabase Cloud Ledger.');
      setTimeout(() => setSyncMessage(null), 8000);
    } catch (err: any) {
      console.error('Manual error:', err);
      // provide a very helpful explanation for the user
      let errMsg = err?.message || 'Koneksi error';
      if (errMsg.includes('relation') || errMsg.includes('does not exist') || errMsg.includes('42P01')) {
        errMsg = `Error: Tabel belum terbuat di Supabase! Silakan salin Kode SQL Schema di bawah dan masuk ke SQL Editor Supabase Anda untuk menjalankannya.`;
      }
      setSyncMessage(errMsg);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      brandName: brandName.trim() || 'Quips Perfume',
      phone: phone.trim() || '628123456789',
      address: address.trim() || 'Bandung, Jawa Barat',
      receiptHeader: receiptHeader.trim(),
      receiptFooter: receiptFooter.trim(),
      currency: 'Rp'
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    if (confirm('⚠️ PERINGATAN: Ini akan menghapus semua produk, riwayat stok, penjualan, dan pengeluaran! Lanjutkan?')) {
      onResetDatabase();
      alert('Sistem berhasil di-reset bersih!');
      window.location.reload();
    }
  };

  const handleReload = () => {
    if (confirm('Ini akan menimpa data saat ini dengan simulasi data dummy Quips Perfume. Lanjutkan?')) {
      onReloadMockDatabase();
      alert('Data simulasi Quips Perfume berhasil di-load!');
      window.location.reload();
    }
  };

  return (
    <div className="flex-1 pb-24 px-4 space-y-5 text-[#2D2D2D]">
      
      {/* Tab Header Banner */}
      <div className="py-4 border-b border-[#E5D1D0]/60">
        <div className="flex items-center gap-1.5 mb-1 text-gray-800">
          <Settings className="w-5 h-5 text-[#C27D7F]" />
          <h2 className="text-base font-serif italic text-gray-800">Pengaturan Toko Quips</h2>
        </div>
        <p className="text-[10px] text-[#A58E8E] uppercase tracking-wider">Sesuaikan info nota struk dan manajemen basis data</p>
      </div>

      {/* FORM CONFIG SETTINGS */}
      <form onSubmit={handleSaveSettings} className="bg-white p-4 rounded-3xl border border-[#E5D1D0] shadow-2xs space-y-4">
        
        {/* Brand Outlet Name */}
        <div>
          <label className="text-[9px] uppercase font-bold tracking-widest text-[#C27D7F] mb-1.5 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-[#C27D7F]" />
            Nama Brand Perfume
          </label>
          <input
            type="text"
            required
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            className="w-full bg-white border border-[#E5D1D0] rounded-xl py-2 px-3 text-xs text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-[#C27D7F]/30"
          />
        </div>

        {/* Brand Phone (WhatsApp) */}
        <div>
          <label className="text-[9px] uppercase font-bold tracking-widest text-[#C27D7F] mb-1.5 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-[#C27D7F]" />
            Nomor Telepon Outlet
          </label>
          <input
            type="text"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-white border border-[#E5D1D0] rounded-xl py-2 px-3 text-xs text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-[#C27D7F]/30"
          />
        </div>

        {/* Address */}
        <div>
          <label className="text-[9px] uppercase font-bold tracking-widest text-[#C27D7F] mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#C27D7F]" />
            Alamat Outlet Fisik
          </label>
          <textarea
            required
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-white border border-[#E5D1D0] rounded-xl py-2 px-3 text-xs text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-[#C27D7F]/30 resize-none animate-none"
          />
        </div>

        {/* Custom Header */}
        <div>
          <label className="text-[9px] uppercase font-bold tracking-widest text-[#C27D7F] mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#C27D7F]" />
            Slogan Struk Stempel Atas
          </label>
          <input
            type="text"
            value={receiptHeader}
            onChange={(e) => setReceiptHeader(e.target.value)}
            className="w-full bg-white border border-[#E5D1D0] rounded-xl py-2 px-3 text-xs text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-[#C27D7F]/30"
          />
        </div>

        {/* Custom Footer */}
        <div>
          <label className="text-[9px] uppercase font-bold tracking-widest text-[#C27D7F] mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#C27D7F]" />
            Pesan Penutup Struk Stempel Bawah
          </label>
          <textarea
            rows={2}
            value={receiptFooter}
            onChange={(e) => setReceiptFooter(e.target.value)}
            className="w-full bg-white border border-[#E5D1D0] rounded-xl py-2 px-3 text-xs text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-[#C27D7F]/30 resize-none italic"
          />
        </div>

        {/* Save feedback indicator */}
        <button
          type="submit"
          className="w-full bg-[#C27D7F] hover:bg-[#b16d6f] py-3 rounded-xl text-white font-bold tracking-wider text-[10px] uppercase shadow-xs transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
        >
          {saved ? (
            <>
              <CheckCircle className="w-4 h-4 text-emerald-300 fill-emerald-800" />
              Tersimpan Berhasil!
            </>
          ) : (
            '✓ Update Profil Quips'
          )}
        </button>
      </form>

      {/* SUPABASE CLOUD BACKEND SYNC PANEL */}
      <div className="bg-white p-4 rounded-3xl border border-[#E5D1D0] shadow-2xs space-y-4">
        <div>
          <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5 uppercase tracking-wider font-serif italic">
            <Database className="w-4 h-4 text-[#C27D7F]" />
            Integrasi Server Supabase
          </h4>
          <p className="text-[9.5px] text-[#A58E8E] mt-1">
            Nyambungkan kasir Anda ke Cloud Database Supabase untuk backup real-time agar aman & tidak hilang datanya.
          </p>
        </div>

        {/* Configuration status alert */}
        {isConfigured ? (
          <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100 flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-[10px] text-emerald-800 font-bold leading-3">
                Kredensial Terdeteksi!
              </div>
              <p className="text-[8.5px] text-emerald-700/85 mt-0.5 leading-3">
                Server & Webhook Supabase siap sinkronisasi data kasir Anda.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-[#FAF7F6] p-3 rounded-2xl border border-[#E5D1D0] flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#C27D7F] shrink-0" />
              <div className="text-[10px] text-gray-800 font-bold leading-3">
                Koneksi Supabase Belum Terhubung
              </div>
            </div>
            <p className="text-[9px] text-[#A58E8E] leading-relaxed">
              Silakan masukkan variabel environment <code className="font-mono text-[8.5px] bg-red-50 text-[#C27D7F] px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> dan <code className="font-mono text-[8.5px] bg-red-50 text-[#C27D7F] px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code> di menu Settings / Environment untuk mengaktifkan sinkronisasi otomatis.
            </p>
          </div>
        )}

        {/* Sync trigger button */}
        <button
          type="button"
          onClick={handleManualSync}
          disabled={isSyncing || !onSyncWithSupabase}
          className="w-full bg-[#C27D7F] hover:bg-[#b16d6f] disabled:opacity-50 py-2.5 rounded-xl text-white font-bold tracking-wider text-[9.5px] uppercase shadow-xs transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Sinkronisasi Berlangsung...' : 'Push & Sinkron Database Supabase'}
        </button>

        {syncMessage && (
          <div className={`p-2.5 rounded-xl text-[9.5px] font-semibold leading-relaxed ${syncMessage.includes('Error') || syncMessage.includes('gagal') || syncMessage.includes('belum') ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-150'}`}>
            {syncMessage}
          </div>
        )}

        {/* Copyable SQL details */}
        <div className="pt-2 border-t border-[#E5D1D0]/45">
          <button
            type="button"
            onClick={() => setShowSql(!showSql)}
            className="w-full text-left text-[9px] text-[#C27D7F] hover:underline font-bold uppercase tracking-wider flex items-center justify-between cursor-pointer"
          >
            <span className="flex items-center gap-1.5 font-bold">
              <Database className="w-3.5 h-3.5" />
              {showSql ? 'Sembunyikan' : 'Lihat'} Struktur SQL Supabase
            </span>
            <span>{showSql ? '▲' : '▼'}</span>
          </button>
          
          {showSql && (
            <div className="mt-2 bg-[#FAF7F6] border border-[#E5D1D0] rounded-xl p-2.5 space-y-2 select-text">
              <p className="text-[8.5px] text-[#A58E8E] leading-normal">
                <b>PENTING:</b> Salin kode SQL di bawah ini, lalu jalankan di menu <b>SQL Editor</b> (klik "New Query") di dashboard web Supabase Anda untuk membuat tabel otomatis dengan benar agar data bisa masuk.
              </p>
              <pre className="text-[8px] font-mono text-gray-700 bg-white p-2 border border-[#E5D1D0]/70 rounded-lg overflow-x-auto max-h-[180px] leading-relaxed">
{`-- 1. Buat Tabel Produk
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  price NUMERIC NOT NULL,
  costPrice NUMERIC NOT NULL,
  stock INTEGER NOT NULL,
  minStock INTEGER NOT NULL,
  unit TEXT,
  scentType TEXT,
  popularity INTEGER DEFAULT 0
);

-- ENABLE Row Level Security (RLS) / BYPASS
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- 2. Buat Tabel Transaksi
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  customerName TEXT NOT NULL,
  customerWhatsApp TEXT,
  date TEXT NOT NULL,
  items TEXT NOT NULL,
  subtotal NUMERIC NOT NULL,
  discount NUMERIC NOT NULL,
  tax NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  profit NUMERIC NOT NULL,
  paymentMethod TEXT NOT NULL,
  notes TEXT
);

ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- 3. Buat Tabel Pengeluaran
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT,
  date TEXT NOT NULL,
  paymentMethod TEXT NOT NULL
);

ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;

-- 4. Buat Tabel Riwayat Stok Log
CREATE TABLE IF NOT EXISTS stock_logs (
  id TEXT PRIMARY KEY,
  productId TEXT NOT NULL,
  productName TEXT NOT NULL,
  type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  date TEXT NOT NULL,
  note TEXT
);

ALTER TABLE stock_logs DISABLE ROW LEVEL SECURITY;

-- 5. Buat Tabel Settings
CREATE TABLE IF NOT EXISTS store_settings (
  id TEXT PRIMARY KEY,
  brandName TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  receiptHeader TEXT,
  receiptFooter TEXT,
  currency TEXT DEFAULT 'Rp'
);

ALTER TABLE store_settings DISABLE ROW LEVEL SECURITY;`}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* DATABASE CONTROLLERS PANEL */}
      <div className="bg-white p-4 rounded-3xl border border-[#E5D1D0] shadow-2xs space-y-4">
        <div>
          <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5 uppercase tracking-wider font-serif italic">
            <RotateCcw className="w-4 h-4 text-[#C27D7F]" />
            Manajemen Basis Data
          </h4>
          <p className="text-[9.5px] text-[#A58E8E] mt-1">Gunakan alat ini untuk testing atau memulai dari database kosong</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Reload demo database button */}
          <button
            onClick={handleReload}
            className="py-2.5 px-3 rounded-xl border border-[#E5D1D0] text-[#C27D7F] bg-[#FAF7F6] hover:bg-[#F2E4E4] text-[9.5px] font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all text-center"
          >
            Load Simulasi Quips
          </button>

          {/* Wipe reset database */}
          <button
            onClick={handleReset}
            className="py-2.5 px-3 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100/50 text-[9.5px] font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all text-center"
          >
            Reset Bersih (Wipe All)
          </button>
        </div>
      </div>

      {/* FOOTER SYSTEM CREDITS */}
      <div className="text-center py-4 font-mono text-[9px] text-[#A58E8E]">
        <p className="font-bold text-[#C27D7F] uppercase tracking-wider">Quips Perfume Cashier · v1.2</p>
        <p className="mt-1">Secured local data. Handcrafted with care</p>
      </div>

    </div>
  );
}
