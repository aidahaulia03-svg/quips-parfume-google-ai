import { Product, Transaction, Expense, StockLog, StoreSettings } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Quips Sweet Sakura',
    category: 'Premium Lavender',
    price: 35000,
    costPrice: 15000,
    stock: 45,
    minStock: 10,
    unit: '250ml (Spray)',
    scentType: 'Fruity',
    popularity: 124
  },
  {
    id: 'prod-2',
    name: 'Quips Lavender Purple',
    category: 'Minyak Wangi',
    price: 45000,
    costPrice: 18000,
    stock: 4, // Low stock on purpose
    minStock: 10,
    unit: '500ml',
    scentType: 'Floral',
    popularity: 98
  },
  {
    id: 'prod-3',
    name: 'Quips Ocean Fresh',
    category: 'Standard Series',
    price: 30000,
    costPrice: 12000,
    stock: 28,
    minStock: 8,
    unit: '250ml (Spray)',
    scentType: 'Fresh',
    popularity: 76
  },
  {
    id: 'prod-4',
    name: 'Quips Rose Velvet',
    category: 'Exclusive Series',
    price: 65000,
    costPrice: 25000,
    stock: 2, // Low stock on purpose
    minStock: 5,
    unit: '500ml',
    scentType: 'Elegant',
    popularity: 112
  },
  {
    id: 'prod-5',
    name: 'Quips Vanilla Baby',
    category: 'Standard Series',
    price: 32000,
    costPrice: 13000,
    stock: 12,
    minStock: 5,
    unit: '250ml (Spray)',
    scentType: 'Sweet',
    popularity: 88
  },
  {
    id: 'prod-6',
    name: 'Quips Jasmine Soft',
    category: 'Regular Series',
    price: 28000,
    costPrice: 12000,
    stock: 50,
    minStock: 10,
    unit: '250ml (Spray)',
    scentType: 'Floral',
    popularity: 42
  },
  {
    id: 'prod-7',
    name: 'Quips Citrus Bloom',
    category: 'Daily Fresh',
    price: 85000,
    costPrice: 38000,
    stock: 18,
    minStock: 5,
    unit: '1 Liter (Refill)',
    scentType: 'Fruity',
    popularity: 55
  }
];

// Generates simulated historical transactions for the last 7 days
export const generateMockTransactions = (): Transaction[] => {
  const list: Transaction[] = [];
  const today = new Date();
  
  // Set accurate dates for past 7 days
  const buyers = [
    { name: 'Siti Rahma', phone: '6281234567890' },
    { name: 'Ani Wijaya', phone: '6287890123456' },
    { name: 'Budi Santoso', phone: '6285678901234' },
    { name: 'Saraswati', phone: '6281122334455' },
    { name: 'Mega Utami', phone: '6282233445566' },
    { name: 'Indah Kusuma', phone: '6289988776655' },
    { name: 'Dewi Lestari', phone: '6285432109876' },
    { name: 'Rani Safitri', phone: '6281357924680' },
    { name: 'Amalia Siregar', phone: '628112340987' },
    { name: 'Vina Pandu', phone: '628522334411' }
  ];

  // Map of transactions over 7 days to build a real chart
  const itemsPreset = [
    [
      { id: 'prod-1', qty: 2 },
      { id: 'prod-3', qty: 1 }
    ],
    [
      { id: 'prod-2', qty: 1 },
      { id: 'prod-4', qty: 1 }
    ],
    [
      { id: 'prod-5', qty: 3 }
    ],
    [
      { id: 'prod-1', qty: 1 },
      { id: 'prod-2', qty: 1 },
      { id: 'prod-6', qty: 2 }
    ],
    [
      { id: 'prod-7', qty: 1 },
      { id: 'prod-3', qty: 2 }
    ],
    [
      { id: 'prod-1', qty: 3 },
      { id: 'prod-4', qty: 1 }
    ],
    [
      { id: 'prod-2', qty: 2 },
      { id: 'prod-5', qty: 1 }
    ],
  ];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString();
    
    // Add 1 to 3 transactions per day
    const numSales = 1 + (i % 3);
    for (let s = 0; s < numSales; s++) {
      const idx = (i * 2 + s) % buyers.length;
      const b = buyers[idx];
      const itemsIdx = (i + s) % itemsPreset.length;
      const selectedItems = itemsPreset[itemsIdx];

      const txItems = selectedItems.map(preset => {
        const prod = INITIAL_PRODUCTS.find(p => p.id === preset.id)!;
        return {
          productId: prod.id,
          name: prod.name,
          price: prod.price,
          quantity: preset.qty,
          subtotal: prod.price * preset.qty,
          costPrice: prod.costPrice
        };
      });

      const subtotal = txItems.reduce((acc, item) => acc + item.subtotal, 0);
      const discount = i % 4 === 0 ? 5000 : 0;
      const tax = Math.round(subtotal * 0.02); // 2% local store tax
      const total = subtotal - discount + tax;

      // Profit calculations
      const totalCost = selectedItems.reduce((acc, preset) => {
        const prod = INITIAL_PRODUCTS.find(p => p.id === preset.id)!;
        return acc + (prod.costPrice * preset.qty);
      }, 0);
      const profit = total - totalCost;

      list.push({
        id: `INV-${1000 + list.length + 1}`,
        customerName: b.name,
        customerWhatsApp: b.phone,
        date: dateStr,
        items: txItems.map(it => ({
          productId: it.productId,
          name: it.name,
          price: it.price,
          quantity: it.quantity,
          subtotal: it.subtotal
        })),
        subtotal,
        discount,
        tax,
        total,
        profit,
        paymentMethod: s % 3 === 0 ? 'QRIS' : (s % 3 === 1 ? 'Cash' : 'Transfer'),
        notes: s % 5 === 0 ? 'Harap kirim struk secepatnya' : undefined
      });
    }
  }

  return list;
};

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    description: 'Beli Bahan Essence Sakura & Vanilla',
    amount: 120000,
    category: 'Bahan Parfum',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    paymentMethod: 'Transfer'
  },
  {
    id: 'exp-2',
    description: 'Beli Botol Spray 250ml kosong 100pcs',
    amount: 85000,
    category: 'Kemasan/Botol',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    paymentMethod: 'Cash'
  },
  {
    id: 'exp-3',
    description: 'Minyak Wangi Solvent (Alkohol Medis)',
    amount: 45000,
    category: 'Bahan Parfum',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    paymentMethod: 'QRIS'
  },
  {
    id: 'exp-4',
    description: 'Biaya Cetak Stiker Brand Quips',
    amount: 30000,
    category: 'Pemasaran',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    paymentMethod: 'Cash'
  },
  {
    id: 'exp-5',
    description: 'Iklan Instagram Ads Toko',
    amount: 50000,
    category: 'Pemasaran',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    paymentMethod: 'Transfer'
  }
];

export const INITIAL_STOCK_LOGS: StockLog[] = [
  {
    id: 'log-1',
    productId: 'prod-1',
    productName: 'Quips Sweet Sakura',
    type: 'In',
    quantity: 50,
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    note: 'Restock Batch #A01'
  },
  {
    id: 'log-2',
    productId: 'prod-2',
    productName: 'Quips Lavender Purple',
    type: 'In',
    quantity: 10,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    note: 'Restock Batch #A02'
  },
  {
    id: 'log-3',
    productId: 'prod-4',
    productName: 'Quips Rose Velvet',
    type: 'In',
    quantity: 5,
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    note: 'Minyak premium harum terbatas'
  }
];

export const DEFAULT_SETTINGS: StoreSettings = {
  brandName: 'Quips Perfume',
  phone: '628123456789',
  address: 'Jl. Melati Indah No. 42, RT 02/RW 05, Bandung, Jawa Barat',
  receiptHeader: '🌸 SPECIALIST LAUNDRY PARFUME 🌸',
  receiptFooter: 'Terima kasih telah berbelanja wewangian laundry di Quips Perfume! Wangi segar tahan lama sepanjang hari.',
  currency: 'Rp'
};
