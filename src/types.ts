export type PaymentMethod = 'Cash' | 'QRIS' | 'Transfer';

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  costPrice: number; // For real profit calculation
  stock: number;
  minStock: number; // To trigger warning when stock is low
  unit: string; // e.g., '100ml', '250ml', '1L', '5L'
  scentType: 'Sweet' | 'Fresh' | 'Floral' | 'Fruity' | 'Elegant';
  popularity: number; // to calculate favorites
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type TransactionItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
};

export type Transaction = {
  id: string; // e.g., INV-001
  customerName: string;
  customerWhatsApp: string;
  date: string; // ISO date string
  items: TransactionItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  profit: number; // computed from total - (costPrice * quantity)
  paymentMethod: PaymentMethod;
  notes?: string;
};

export type ExpenseCategory = 'Bahan Parfum' | 'Kemasan/Botol' | 'Sewa Tempat' | 'Listrik & Air' | 'Gaji & Operasional' | 'Pemasaran' | 'Lainnya';

export type Expense = {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  paymentMethod: PaymentMethod;
};

export type StockLog = {
  id: string;
  productId: string;
  productName: string;
  type: 'In' | 'Out';
  quantity: number;
  date: string;
  note: string; // e.g., 'Restock batch #4', 'Penjualan KAS-123'
};

export type StoreSettings = {
  brandName: string;
  phone: string;
  address: string;
  receiptHeader: string;
  receiptFooter: string;
  currency: string;
};
