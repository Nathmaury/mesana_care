import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Product } from "./types";

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

export async function fetchProducts(): Promise<Product[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("category")
    .order("name");

  if (error) {
    console.error("Error fetching products:", error.message);
    return [];
  }

  return (data ?? []) as Product[];
}

export async function saveQuote(quote: {
  client_name: string;
  client_phone: string;
  client_email: string;
  notes: string;
  subtotal: number;
  discount_total: number;
  total: number;
  items: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    discount_percent: number;
    line_total: number;
  }>;
}): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

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
    })
    .select("id")
    .single();

  if (quoteError || !quoteRow) {
    console.error("Error saving quote:", quoteError?.message);
    return null;
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

  return quoteRow.id as string;
}
