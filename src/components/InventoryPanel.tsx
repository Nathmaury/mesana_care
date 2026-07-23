"use client";

import { fetchProducts } from "@/lib/supabase";
import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/types";
import { Loader2, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

export function InventoryPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { products: data, error: err } = await fetchProducts();
    if (err) setError(err);
    else setError(null);
    setProducts(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.sku?.toLowerCase().includes(q) ?? false)
    );
  }, [products, search]);

  const summary = useMemo(() => {
    return products.reduce(
      (acc, p) => {
        const stock = p.stock ?? 0;
        const cost = p.cost_price ?? 0;
        return {
          units: acc.units + stock,
          investment: acc.investment + stock * cost,
          retailValue: acc.retailValue + stock * p.price,
        };
      },
      { units: 0, investment: 0, retailValue: 0 }
    );
  }, [products]);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-brand-200/70 bg-white/90 p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-500">
            Unidades en stock
          </p>
          <p className="mt-1 text-lg font-bold text-brand-800">{summary.units}</p>
        </div>
        <div className="rounded-2xl border border-brand-200/70 bg-white/90 p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-500">
            Inversión (costo)
          </p>
          <p className="mt-1 text-lg font-bold text-brand-800">
            {formatCurrency(summary.investment)}
          </p>
        </div>
        <div className="rounded-2xl border border-brand-200/70 bg-white/90 p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-500">
            Valor a precio venta
          </p>
          <p className="mt-1 text-lg font-bold text-brand-800">
            {formatCurrency(summary.retailValue)}
          </p>
        </div>
      </div>

      <section className="rounded-3xl border border-brand-200/70 bg-white/90 p-4 shadow-lg shadow-brand-200/30 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-brand-800">Inventario</h2>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-200 px-3 py-2 text-sm text-brand-700 hover:bg-brand-50"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </button>
        </div>

        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar producto…"
          className="mb-4 w-full rounded-xl border border-brand-200 bg-brand-50/50 px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
        />

        {error && (
          <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-brand-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            Cargando inventario…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-brand-200 text-xs uppercase tracking-wide text-brand-500">
                  <th className="pb-2 pr-2">Producto</th>
                  <th className="pb-2 pr-2">Categoría</th>
                  <th className="pb-2 pr-2 text-right">Costo</th>
                  <th className="pb-2 pr-2 text-right">Venta</th>
                  <th className="pb-2 pr-2 text-right">Stock</th>
                  <th className="pb-2 text-right">Valor stock</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const stock = p.stock ?? 0;
                  const low = stock <= 1;
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-brand-100 text-brand-800"
                    >
                      <td className="py-3 pr-2 font-medium">{p.name}</td>
                      <td className="py-3 pr-2 text-brand-600">{p.category}</td>
                      <td className="py-3 pr-2 text-right">
                        {formatCurrency(p.cost_price ?? 0)}
                      </td>
                      <td className="py-3 pr-2 text-right">
                        {formatCurrency(p.price)}
                      </td>
                      <td
                        className={`py-3 pr-2 text-right font-semibold ${low ? "text-rose-600" : ""}`}
                      >
                        {stock}
                      </td>
                      <td className="py-3 text-right">
                        {formatCurrency(stock * p.price)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
