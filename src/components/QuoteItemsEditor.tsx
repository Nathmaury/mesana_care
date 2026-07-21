"use client";

import type { QuoteItem } from "@/lib/types";
import {
  calculateItemLine,
  calculateQuoteTotals,
  formatCurrency,
} from "@/lib/types";
import { Minus, Plus, Trash2 } from "lucide-react";

type Props = {
  items: QuoteItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onUpdateDiscount: (productId: string, discount: number) => void;
  onRemoveItem: (productId: string) => void;
};

export function QuoteItemsEditor({
  items,
  onUpdateQuantity,
  onUpdateDiscount,
  onRemoveItem,
}: Props) {
  const totals = calculateQuoteTotals(items);

  if (items.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-brand-300 bg-white/60 p-8 text-center">
        <p className="text-brand-600">
          Agrega productos del catálogo para armar la cotización
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-brand-200/70 bg-white/90 p-4 shadow-lg shadow-brand-200/30 sm:p-6">
      <h2 className="mb-4 text-lg font-semibold text-brand-800">
        Productos en la cotización
      </h2>

      <div className="space-y-3">
        {items.map((item) => {
          const line = calculateItemLine(item);
          return (
            <article
              key={item.product.id}
              className="rounded-2xl border border-brand-100 bg-brand-50/40 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-medium text-brand-900">
                    {item.product.name}
                  </h3>
                  <p className="text-sm text-brand-600">
                    {formatCurrency(item.product.price)} c/u
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.product.id)}
                  className="rounded-lg p-1.5 text-brand-400 transition hover:bg-red-50 hover:text-red-500"
                  aria-label="Eliminar producto"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-brand-600">
                    Cantidad
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateQuantity(
                          item.product.id,
                          Math.max(1, item.quantity - 1)
                        )
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-200 bg-white text-brand-700"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        onUpdateQuantity(
                          item.product.id,
                          Math.max(1, parseInt(e.target.value) || 1)
                        )
                      }
                      className="w-16 rounded-lg border border-brand-200 bg-white px-2 py-1.5 text-center text-sm"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateQuantity(item.product.id, item.quantity + 1)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-200 bg-white text-brand-700"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-brand-600">
                    Descuento (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={item.discountPercent}
                    onChange={(e) =>
                      onUpdateDiscount(
                        item.product.id,
                        Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                      )
                    }
                    className="w-full rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-sm"
                  />
                </div>
              </div>

              <div className="mt-3 flex justify-between text-sm">
                <span className="text-brand-600">Subtotal línea</span>
                <span className="font-semibold text-brand-800">
                  {formatCurrency(line.total)}
                </span>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-6 space-y-2 border-t border-brand-200 pt-4">
        <div className="flex justify-between text-sm text-brand-600">
          <span>Subtotal</span>
          <span>{formatCurrency(totals.subtotal)}</span>
        </div>
        {totals.discountTotal > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Descuentos</span>
            <span>-{formatCurrency(totals.discountTotal)}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold text-brand-800">
          <span>Total</span>
          <span>{formatCurrency(totals.total)}</span>
        </div>
      </div>
    </section>
  );
}
