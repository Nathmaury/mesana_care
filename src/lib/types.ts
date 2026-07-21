export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  sku: string | null;
  image_url: string | null;
  active: boolean;
};

export type QuoteItem = {
  product: Product;
  quantity: number;
  discountPercent: number;
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
