import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type {
  PaymentStatus,
  Product,
  QuoteItemRecord,
  QuoteRecord,
  SaleRecord,
} from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured =
  supabaseUrl.length > 0 &&
  supabaseAnonKey.length > 0 &&
  !supabaseUrl.includes("tu-proyecto");

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey);
  }
  return client;
}

function mapProduct(row: Record<string, unknown>): Product {
  return {
    ...(row as unknown as Product),
    price: Number(row.price) || 0,
    cost_price: row.cost_price != null ? Number(row.cost_price) : null,
    stock: row.stock != null ? Number(row.stock) : null,
  };
}

export type FetchProductsResult = {
  products: Product[];
  configured: boolean;
  error: string | null;
};

export async function fetchProducts(): Promise<FetchProductsResult> {
  const supabase = getSupabase();
  if (!supabase) {
    return {
      products: [],
      configured: false,
      error:
        "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local",
    };
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching products:", error.message);
    return { products: [], configured: true, error: error.message };
  }

  return {
    products: (data ?? []).map((row) => mapProduct(row as Record<string, unknown>)),
    configured: true,
    error: null,
  };
}

export type SaveQuoteInput = {
  client_name: string;
  client_phone: string;
  client_email: string;
  notes: string;
  subtotal: number;
  discount_total: number;
  total: number;
  payment_status: PaymentStatus;
  amount_paid: number;
  amount_owed: number;
  payment_method: string;
  items: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    discount_percent: number;
    line_total: number;
  }>;
};

export async function saveQuote(
  quote: SaveQuoteInput
): Promise<{ id: string | null; error: string | null }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { id: null, error: "Supabase no configurado" };
  }

  const applyStock =
    quote.payment_status === "pagado" || quote.payment_status === "parcial";

  const { data: quoteRow, error: quoteError } = await supabase
    .from("quotes")
    .insert({
      client_name: quote.client_name,
      client_phone: quote.client_phone,
      client_email: quote.client_email,
      notes: quote.notes,
      subtotal: quote.subtotal,
      discount_total: quote.discount_total,
      total: quote.total,
      payment_status: quote.payment_status,
      amount_paid: quote.amount_paid,
      amount_owed: quote.amount_owed,
      payment_method: quote.payment_method || null,
      stock_applied: applyStock,
    })
    .select("id")
    .single();

  if (quoteError || !quoteRow) {
    console.error("Error saving quote:", quoteError?.message);
    return { id: null, error: quoteError?.message ?? "No se pudo guardar" };
  }

  const quoteItems = quote.items.map((item) => ({
    quote_id: quoteRow.id,
    ...item,
  }));

  const { error: itemsError } = await supabase
    .from("quote_items")
    .insert(quoteItems);

  if (itemsError) {
    console.error("Error saving quote items:", itemsError.message);
  }

  // Registrar ventas y descontar stock si ya hay pago (total o parcial)
  if (applyStock) {
    const salesRows = quote.items.map((item) => {
      const share =
        quote.total > 0 ? item.line_total / quote.total : 1 / quote.items.length;
      return {
        quote_id: quoteRow.id,
        product_id: item.product_id,
        product_name: item.product_name,
        client_name: quote.client_name,
        client_phone: quote.client_phone || null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.line_total,
        amount_paid: Math.round(quote.amount_paid * share),
        amount_owed: Math.round(quote.amount_owed * share),
        payment_method: quote.payment_method || null,
        status: quote.payment_status,
        notes: quote.notes || null,
      };
    });

    await supabase.from("sales").insert(salesRows);

    for (const item of quote.items) {
      const { data: product } = await supabase
        .from("products")
        .select("stock")
        .eq("id", item.product_id)
        .single();

      if (product) {
        const current = Number(product.stock) || 0;
        await supabase
          .from("products")
          .update({ stock: Math.max(0, current - item.quantity) })
          .eq("id", item.product_id);
      }
    }
  }

  return { id: quoteRow.id as string, error: null };
}

export async function fetchQuotes(): Promise<{
  quotes: QuoteRecord[];
  error: string | null;
}> {
  const supabase = getSupabase();
  if (!supabase) return { quotes: [], error: "Supabase no configurado" };

  const { data, error } = await supabase
    .from("quotes")
    .select("*, quote_items(*)")
    .order("created_at", { ascending: false });

  if (error) {
    return { quotes: [], error: error.message };
  }

  const quotes = (data ?? []).map((row) => ({
    ...row,
    subtotal: Number(row.subtotal) || 0,
    discount_total: Number(row.discount_total) || 0,
    total: Number(row.total) || 0,
    amount_paid: Number(row.amount_paid) || 0,
    amount_owed: Number(row.amount_owed) || 0,
    payment_status: (row.payment_status ?? "pendiente") as PaymentStatus,
    stock_applied: Boolean(row.stock_applied),
    quote_items: ((row.quote_items as QuoteItemRecord[]) ?? []).map((item) => ({
      ...item,
      quantity: Number(item.quantity) || 0,
      unit_price: Number(item.unit_price) || 0,
      discount_percent: Number(item.discount_percent) || 0,
      line_total: Number(item.line_total) || 0,
    })),
  })) as QuoteRecord[];

  return { quotes, error: null };
}

export async function updateQuotePayment(params: {
  quoteId: string;
  payment_status: PaymentStatus;
  amount_paid: number;
  amount_owed: number;
  payment_method: string;
  applyStock: boolean;
  items: QuoteItemRecord[];
  client_name: string;
  client_phone: string | null;
}): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return "Supabase no configurado";

  const { error } = await supabase
    .from("quotes")
    .update({
      payment_status: params.payment_status,
      amount_paid: params.amount_paid,
      amount_owed: params.amount_owed,
      payment_method: params.payment_method || null,
      ...(params.applyStock ? { stock_applied: true } : {}),
    })
    .eq("id", params.quoteId);

  if (error) return error.message;

  if (params.applyStock) {
    const lineSum = params.items.reduce((s, i) => s + i.line_total, 0) || 1;
    const salesRows = params.items.map((item) => {
      const share = item.line_total / lineSum;
      return {
        quote_id: params.quoteId,
        product_id: item.product_id,
        product_name: item.product_name,
        client_name: params.client_name,
        client_phone: params.client_phone,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.line_total,
        amount_paid: Math.round(params.amount_paid * share),
        amount_owed: Math.round(params.amount_owed * share),
        payment_method: params.payment_method || null,
        status: params.payment_status,
      };
    });

    await supabase.from("sales").insert(salesRows);

    for (const item of params.items) {
      if (!item.product_id) continue;
      const { data: product } = await supabase
        .from("products")
        .select("stock")
        .eq("id", item.product_id)
        .single();
      if (product) {
        const current = Number(product.stock) || 0;
        await supabase
          .from("products")
          .update({ stock: Math.max(0, current - item.quantity) })
          .eq("id", item.product_id);
      }
    }
  }

  return null;
}

export async function fetchSales(): Promise<{
  sales: SaleRecord[];
  error: string | null;
}> {
  const supabase = getSupabase();
  if (!supabase) return { sales: [], error: "Supabase no configurado" };

  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return { sales: [], error: error.message };

  const sales = (data ?? []).map((row) => ({
    ...row,
    quantity: Number(row.quantity) || 0,
    unit_price: Number(row.unit_price) || 0,
    total: Number(row.total) || 0,
    amount_paid: Number(row.amount_paid) || 0,
    amount_owed: Number(row.amount_owed) || 0,
    status: (row.status ?? "pendiente") as PaymentStatus,
  })) as SaleRecord[];

  return { sales, error: null };
}

export async function updateSalePayment(params: {
  saleId: string;
  status: PaymentStatus;
  amount_paid: number;
  amount_owed: number;
  payment_method: string;
}): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return "Supabase no configurado";

  const { error } = await supabase
    .from("sales")
    .update({
      status: params.status,
      amount_paid: params.amount_paid,
      amount_owed: params.amount_owed,
      payment_method: params.payment_method || null,
    })
    .eq("id", params.saleId);

  return error?.message ?? null;
}
