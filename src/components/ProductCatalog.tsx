"use client";

import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/types";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

type Props = {
  products: Product[];
  onAddProduct: (product: Product) => void;
};

export function ProductCatalog({ products, onAddProduct }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return ["Todos", ...Array.from(cats).sort()];
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        (p.sku?.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchesCategory = category === "Todos" || p.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  return (
    <section className="rounded-3xl border border-brand-200/70 bg-white/90 p-4 shadow-lg shadow-brand-200/30 sm:p-6">
      <h2 className="mb-4 text-lg font-semibold text-brand-800">
        Catálogo de productos
      </h2>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-400" />
          <input
            type="search"
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-brand-200 bg-brand-50/50 py-2.5 pl-10 pr-4 text-sm text-brand-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-brand-200 bg-brand-50/50 px-4 py-2.5 text-sm text-brand-800 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="grid max-h-[420px] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
        {filtered.length === 0 ? (
          <p className="col-span-full py-8 text-center text-sm text-brand-500">
            No se encontraron productos
          </p>
        ) : (
          filtered.map((product) => (
            <article
              key={product.id}
              className="flex items-start justify-between gap-3 rounded-2xl border border-brand-100 bg-gradient-to-br from-white to-brand-50/80 p-4 transition hover:border-brand-300 hover:shadow-md"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-brand-500">
                  {product.category}
                </p>
                <h3 className="font-semibold text-brand-900">{product.name}</h3>
                {product.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-brand-600">
                    {product.description}
                  </p>
                )}
                <p className="mt-2 text-sm font-bold text-brand-700">
                  {formatCurrency(product.price)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onAddProduct(product)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white shadow-md shadow-brand-400/30 transition hover:bg-brand-600 active:scale-95"
                aria-label={`Agregar ${product.name}`}
              >
                <Plus className="h-4 w-4" />
              </button>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
