"use client";

import { AppTabs, type Tab } from "@/components/AppTabs";
import { ClientForm } from "@/components/ClientForm";
import { HistoryPanel } from "@/components/HistoryPanel";
import { InventoryPanel } from "@/components/InventoryPanel";
import { ProductCatalog } from "@/components/ProductCatalog";
import { QuoteActions } from "@/components/QuoteActions";
import { QuoteItemsEditor } from "@/components/QuoteItemsEditor";
import { fetchProducts } from "@/lib/supabase";
import { SAMPLE_PRODUCTS } from "@/lib/sample-products";
import type { Product, QuoteItem } from "@/lib/types";
import { useCallback, useEffect, useState } from "react";

export function CotizadorApp() {
  const [tab, setTab] = useState<Tab>("cotizador");
  const [products, setProducts] = useState<Product[]>(SAMPLE_PRODUCTS);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [usingSupabase, setUsingSupabase] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [inventoryKey, setInventoryKey] = useState(0);

  const reloadProducts = useCallback(() => {
    fetchProducts().then(({ products: data, configured, error }) => {
      if (error) {
        setConnectionError(error);
        setUsingSupabase(false);
        return;
      }
      if (configured && data.length > 0) {
        setProducts(data);
        setUsingSupabase(true);
        setConnectionError(null);
        return;
      }
      if (configured && data.length === 0) {
        setConnectionError(
          "Supabase conectado, pero no hay productos. Ejecuta seed-from-inversion.sql"
        );
      }
    });
  }, []);

  useEffect(() => {
    reloadProducts();
  }, [reloadProducts, inventoryKey]);

  const handleAddProduct = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product, quantity: 1, discountPercent: 0 }];
    });
  }, []);

  const handleUpdateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === productId ? { ...i, quantity } : i
      )
    );
  }, []);

  const handleUpdateDiscount = useCallback(
    (productId: string, discountPercent: number) => {
      setItems((prev) =>
        prev.map((i) =>
          i.product.id === productId ? { ...i, discountPercent } : i
        )
      );
    },
    []
  );

  const handleRemoveItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const handleQuoteSaved = () => {
    setInventoryKey((k) => k + 1);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <AppTabs active={tab} onChange={setTab} />

      {connectionError && tab === "cotizador" && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p className="font-semibold">No se pudo cargar el catálogo</p>
          <p className="mt-1">{connectionError}</p>
        </div>
      )}

      {!usingSupabase && !connectionError && tab === "cotizador" && (
        <div className="mb-6 rounded-2xl border border-brand-200 bg-brand-100/60 px-4 py-3 text-sm text-brand-700">
          Modo demo con productos de ejemplo. Conecta Supabase para usar tu
          catálogo real.
        </div>
      )}

      {tab === "historial" && <HistoryPanel />}
      {tab === "inventario" && <InventoryPanel key={inventoryKey} />}

      {tab === "cotizador" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <ClientForm
              clientName={clientName}
              clientPhone={clientPhone}
              clientEmail={clientEmail}
              notes={notes}
              onClientNameChange={setClientName}
              onClientPhoneChange={setClientPhone}
              onClientEmailChange={setClientEmail}
              onNotesChange={setNotes}
            />
            <ProductCatalog
              products={products}
              onAddProduct={handleAddProduct}
            />
          </div>

          <div className="space-y-6">
            <QuoteItemsEditor
              items={items}
              onUpdateQuantity={handleUpdateQuantity}
              onUpdateDiscount={handleUpdateDiscount}
              onRemoveItem={handleRemoveItem}
            />
            <QuoteActions
              clientName={clientName}
              clientPhone={clientPhone}
              clientEmail={clientEmail}
              notes={notes}
              items={items}
              onSaved={handleQuoteSaved}
            />
          </div>
        </div>
      )}
    </div>
  );
}
