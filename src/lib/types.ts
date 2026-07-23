export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  cost_price?: number | null;
  stock?: number | null;
  category: string;
  sku: string | null;
  image_url: string | null;
  supplier?: string | null;
  active: boolean;
};

export type PaymentStatus = "pagado" | "parcial" | "pendiente";

export type QuoteItem = {
  product: Product;
  quantity: number;
  discountPercent: number;
};

export type QuoteRecord = {
  id: string;
  client_name: string;
  client_phone: string | null;
  client_email: string | null;
  notes: string | null;
  subtotal: number;
  discount_total: number;
  total: number;
  payment_status: PaymentStatus;
  amount_paid: number;
  amount_owed: number;
  payment_method: string | null;
  stock_applied: boolean;
  created_at: string;
  quote_items?: QuoteItemRecord[];
};

export type QuoteItemRecord = {
  id: string;
  quote_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  line_total: number;
};

export type Quote = {
  id?: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  notes: string;
  items: QuoteItem[];
  createdAt: Date;
};

export type QuoteTotals = {
  subtotal: number;
  discountTotal: number;
  total: number;
};

export function calculateItemLine(item: QuoteItem): {
  subtotal: number;
  discount: number;
  total: number;
} {
  const subtotal = item.product.price * item.quantity;
  const discount = subtotal * (item.discountPercent / 100);
  return { subtotal, discount, total: subtotal - discount };
}

export function calculateQuoteTotals(items: QuoteItem[]): QuoteTotals {
  return items.reduce(
    (acc, item) => {
      const line = calculateItemLine(item);
      return {
        subtotal: acc.subtotal + line.subtotal,
        discountTotal: acc.discountTotal + line.discount,
        total: acc.total + line.total,
      };
    },
    { subtotal: 0, discountTotal: 0, total: 0 }
  );
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function paymentStatusLabel(status: PaymentStatus): string {
  switch (status) {
    case "pagado":
      return "Pagado";
    case "parcial":
      return "Pago parcial";
    default:
      return "Por pagar";
  }
}
