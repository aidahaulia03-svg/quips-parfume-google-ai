import React, { useState } from 'react';
import { StoreSettings } from '../types';
import { 
  Settings, 
  Building, 
  Phone, 
  MapPin, 
  FileText, 
  RotateCcw, 
  CheckCircle,
  Sparkles
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
  onReloadMockDatabase
}: SetelanTabProps) {
  const [brandName, setBrandName] = useState(settings.brandName);
  const [phone, setPhone] = useState(settings.phone);
  const [address, setAddress] = useState(settings.address);
  const [receiptHeader, setReceiptHeader] = useState(settings.receiptHeader);
  const [receiptFooter, setReceiptFooter] = useState(settings.receiptFooter);

  const [saved, setSaved] = useState(false);

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
