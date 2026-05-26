import React, { useState } from 'react';
import { Transaction, StoreSettings } from '../types';
import { X, Send, Printer, Copy, Check, Share2, AlertCircle, ShoppingBag, Sparkles } from 'lucide-react';

interface ReceiptModalProps {
  transaction: Transaction | null;
  settings: StoreSettings;
  onClose: () => void;
}

export default function ReceiptModal({ transaction, settings, onClose }: ReceiptModalProps) {
  const [copied, setCopied] = useState(false);
  const [printed, setPrinted] = useState(false);

  if (!transaction) return null;

  const formatIDR = (num: number) => {
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  const formatDate = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' WIB';
  };

  // GENERATE THE HIGH-FIDELITY TEXT FOR WHATSAPP MESSAGING
  const generateWhatsAppMessage = () => {
    let msg = `*✨ ${settings.brandName.toUpperCase()} ✨*\n`;
    msg += `_Specialist Laundry Perfume Premium_\n`;
    msg += `===============================\n\n`;
    msg += `*NOTA PENJUALAN*\n`;
    msg += `No. Nota: *${transaction.id}*\n`;
    msg += `Tanggal : ${formatDate(transaction.date)}\n`;
    msg += `Kasir   : Quips Admin\n`;
    msg += `Pelanggan: *${transaction.customerName}*\n`;
    msg += `WhatsApp : ${transaction.customerWhatsApp}\n`;
    msg += `---------------------------------------------------------\n\n`;

    transaction.items.forEach((item, index) => {
      msg += `*${index + 1}. ${item.name}*\n`;
      msg += `   ${item.quantity} x ${formatIDR(item.price)}  =  *${formatIDR(item.subtotal)}*\n`;
    });

    msg += `\n---------------------------------------------------------\n`;
    msg += `Subtotal  : ${formatIDR(transaction.subtotal)}\n`;
    if (transaction.discount > 0) {
      msg += `Diskon () : -${formatIDR(transaction.discount)}\n`;
    }
    msg += `Pajak (2%): ${formatIDR(transaction.tax)}\n`;
    msg += `===============================\n`;
    msg += `*TOTAL BAYAR: ${formatIDR(transaction.total)}*\n`;
    msg += `Metode    : *${transaction.paymentMethod}* [LUNAS]\n\n`;
    msg += `---------------------------------------------------------\n`;
    msg += `_${settings.receiptFooter || 'Terima kasih telah berbelanja aromatis di Quips!'}_ ✨\n`;
    
    return encodeURIComponent(msg);
  };

  // COPY TEXT TO CLIPBOARD FOR GENERAL USE
  const handleCopyText = () => {
    const decodedMessage = decodeURIComponent(generateWhatsAppMessage());
    navigator.clipboard.writeText(decodedMessage).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // REDIRECT TO WHATSAPP API CLICK-TO-CHAT
  const handleSendWhatsApp = () => {
    let rawPhone = transaction.customerWhatsApp.trim();
    if (!rawPhone) {
      alert('Sistem tidak mendeteksi nomor Whatsapp pelanggan!');
      return;
    }

    // Format Indonesian number format to international prefix 62
    if (rawPhone.startsWith('0')) {
      rawPhone = '62' + rawPhone.slice(1);
    } else if (rawPhone.startsWith('8')) {
      rawPhone = '62' + rawPhone;
    } else if (rawPhone.startsWith('+62')) {
      rawPhone = rawPhone.slice(1);
    }

    const waUrl = `https://api.whatsapp.com/send?phone=${rawPhone}&text=${generateWhatsAppMessage()}`;
    window.open(waUrl, '_blank');
  };

  const handlePrint = () => {
    setPrinted(true);
    setTimeout(() => {
      window.print();
      setPrinted(false);
    }, 400);
  };

  return (
    <div className="absolute inset-0 bg-neutral-950/70 backdrop-blur-md z-50 flex flex-col justify-end p-4 animate-fade-in unique-receipt-container">
      {/* Container Card */}
      <div className="bg-white rounded-3xl p-5 max-w-sm mx-auto w-full border border-[#E5D1D0] shadow-2xl flex flex-col max-h-[92%] overflow-y-auto">
        
        {/* Modal Top bar closer */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#C27D7F]" />
            <span className="text-[10px] font-bold text-[#C27D7F] uppercase tracking-widest">Struk Transaksi Selesai</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-gray-105 text-gray-400 hover:text-gray-600 transition-colors pointer-events-auto cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* ELEGANT PAPER-STYLE INVOICE DESIGN */}
        <div 
          id="invoice-paper"
          className="bg-linear-to-b from-[#FAF7F6] to-white p-5 rounded-2xl border border-[#E5D1D0]/80 shadow-inner relative overflow-hidden select-text text-neutral-800 font-mono tracking-tight text-[11px]"
        >
          {/* Glass glare overlay */}
          <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
          
          {/* Circular punch hole cuts left & right */}
          <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-r border-[#E5D1D0]/60 rounded-full" />
          <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-l border-[#E5D1D0]/60 rounded-full" />
 
          {/* BRANDHEADER DETAILS */}
          <div className="text-center pb-4 border-b border-dashed border-neutral-300">
            <h3 className="text-sm font-extrabold text-[#C27D7F] uppercase tracking-wide">
              {settings.brandName}
            </h3>
            <p className="text-[9px] text-gray-500 mt-0.5 font-sans leading-3">
              {settings.receiptHeader || 'Est. Laundry Perfume Premium'}
            </p>
            <p className="text-[8px] text-gray-400 mt-1 font-sans leading-3 max-w-[180px] mx-auto">
              {settings.address}
            </p>
          </div>

          {/* METADATA INFO */}
          <div className="py-3 border-b border-dashed border-gray-300 space-y-1 text-gray-500 text-[9px]">
            <div className="flex justify-between">
              <span>No. Nota :</span>
              <span className="font-bold text-gray-800">{transaction.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Sesi Waktu:</span>
              <span>{formatDate(transaction.date)}</span>
            </div>
            <div className="flex justify-between">
              <span>Pelanggan:</span>
              <span className="font-bold text-gray-800">{transaction.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span>Admin   :</span>
              <span>Quips Cashier</span>
            </div>
          </div>

          {/* ITEM ENTRIES */}
          <div className="py-3.5 space-y-3">
            {transaction.items.map((item, id) => (
              <div key={id} className="space-y-0.5">
                <div className="flex justify-between font-bold text-gray-800">
                  <span>{id + 1}. {item.name}</span>
                  <span>{formatIDR(item.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[9px] text-gray-400">
                  <span>Scent Quantity: {item.quantity} x {formatIDR(item.price)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* SUM TOTAL CALCULATIONS */}
          <div className="pt-3 border-t border-dashed border-gray-300 space-y-1 text-[10px]">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal Penjualan</span>
              <span>{formatIDR(transaction.subtotal)}</span>
            </div>
            
            {transaction.discount > 0 && (
              <div className="flex justify-between text-rose-500 font-bold">
                <span>Diskon Promo Outlet</span>
                <span>-{formatIDR(transaction.discount)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-gray-500">
              <span>Pajak Outlet (2%)</span>
              <span>{formatIDR(transaction.tax)}</span>
            </div>

            <div className="border-t border-gray-205 my-1.5" />
            
            <div className="flex justify-between text-xs font-bold text-[#C27D7F]">
              <span>TOTAL ORDER</span>
              <span className="font-mono">{formatIDR(transaction.total)}</span>
            </div>
            
            <div className="flex justify-between text-[9px] pt-1.5 text-gray-500">
              <span>Status Pembayaran :</span>
              <span className="font-bold text-emerald-600 uppercase">
                [{transaction.paymentMethod} - LUNAS]
              </span>
            </div>
          </div>

          {/* FOOTER WISH */}
          <div className="mt-5 pt-3.5 border-t border-dashed border-gray-300 text-center font-sans">
            <p className="text-[8px] text-gray-400 leading-3 max-w-[200px] mx-auto italic">
              "{settings.receiptFooter}"
            </p>
            <div className="mt-3 bg-[#FAF7F6] text-[#C27D7F] border border-[#E5D1D0] text-[8px] font-bold py-1 px-2.5 rounded-full w-fit mx-auto flex items-center gap-1 justify-center">
              <Sparkles className="w-2.5 h-2.5 text-[#C27D7F] fill-[#C27D7F]/20" />
              <span>WANGI SEGAR TAHAN LAMA</span>
            </div>
          </div>
        </div>

        {/* ESTHETIC ACTION HUB BUTTONS */}
        <div className="mt-5 space-y-2">
          {/* Kirim Whatsapp Button */}
          <button
            onClick={handleSendWhatsApp}
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 transition-all text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <Send className="w-4.5 h-4.5 fill-white text-emerald-600" />
            Kirim Struk via WhatsApp
          </button>

          <div className="grid grid-cols-2 gap-2">
            {/* Salin Teks */}
            <button
              onClick={handleCopyText}
              className={`py-2 px-3 rounded-xl text-[10px] font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                copied 
                  ? 'bg-[#FAF7F6] text-[#C27D7F] border-[#E5D1D0]' 
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#C27D7F]" />
                  Kopi Berhasil
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-gray-400" />
                  Salin Teks WA
                </>
              )}
            </button>

            {/* Simulasi Cetak printer */}
            <button
              onClick={handlePrint}
              className={`py-2 px-3 rounded-xl text-[10px] font-bold border bg-white flex items-center justify-center gap-1.5 transition-all hover:bg-gray-50 cursor-pointer ${
                printed ? 'text-[#C27D7F] border-[#E5D1D0]' : 'text-gray-600 border-gray-200'
              }`}
            >
              <Printer className="w-3.5 h-3.5 text-gray-400" />
              Cetak Thermal
            </button>
          </div>

          {/* Return Home */}
          <button
            onClick={onClose}
            className="w-full mt-1 py-2.5 rounded-xl text-[9px] font-bold tracking-widest uppercase bg-[#FAF7F6] text-[#C27D7F] border border-[#E5D1D0] hover:bg-[#F2E4E4] transition-all cursor-pointer"
          >
            Selesai & Tutup Nota
          </button>
        </div>

      </div>
    </div>
  );
}
