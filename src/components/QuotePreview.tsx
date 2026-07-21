"use client";

import { BRAND } from "@/lib/sample-products";
import type { QuoteItem } from "@/lib/types";
import {
  calculateItemLine,
  calculateQuoteTotals,
  formatCurrency,
} from "@/lib/types";
import { forwardRef } from "react";

type Props = {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  notes: string;
  items: QuoteItem[];
  quoteNumber?: string;
};

export const QuotePreview = forwardRef<HTMLDivElement, Props>(
  function QuotePreview(
    {
      clientName,
      clientPhone,
      clientEmail,
      notes,
      items,
      quoteNumber,
    },
    ref
  ) {
    const totals = calculateQuoteTotals(items);
    const date = new Date().toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return (
      <div
        ref={ref}
        className="mx-auto w-full max-w-[210mm] bg-white p-6 text-brand-900 sm:p-8"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        {/* Header */}
        <div className="mb-6 flex items-start justify-between border-b-2 border-brand-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-700">{BRAND.name}</h1>
            <p className="text-sm text-brand-500">{BRAND.tagline}</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-bold uppercase tracking-wider text-brand-600">
              Cotización
            </p>
            {quoteNumber && (
              <p className="text-brand-800">No. {quoteNumber.slice(0, 8)}</p>
            )}
            <p className="text-brand-600">{date}</p>
          </div>
        </div>

        {/* Client info */}
        <div className="mb-6 rounded-xl bg-brand-50 p-4">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-500">
            Cliente
          </h2>
          <p className="font-semibold">{clientName || "—"}</p>
          {clientPhone && <p className="text-sm text-brand-700">{clientPhone}</p>}
          {clientEmail && <p className="text-sm text-brand-700">{clientEmail}</p>}
        </div>

        {/* Items table */}
        <table className="mb-6 w-full text-sm">
          <thead>
            <tr className="border-b border-brand-200 text-left text-xs uppercase tracking-wide text-brand-500">
              <th className="pb-2 pr-2">Producto</th>
              <th className="pb-2 pr-2 text-center">Cant.</th>
              <th className="pb-2 pr-2 text-right">Precio</th>
              <th className="pb-2 pr-2 text-right">Desc.</th>
              <th className="pb-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const line = calculateItemLine(item);
              return (
                <tr key={item.product.id} className="border-b border-brand-100">
                  <td className="py-2.5 pr-2">
                    <p className="font-medium">{item.product.name}</p>
                    {item.product.sku && (
                      <p className="text-xs text-brand-500">{item.product.sku}</p>
                    )}
                  </td>
                  <td className="py-2.5 pr-2 text-center">{item.quantity}</td>
                  <td className="py-2.5 pr-2 text-right">
                    {formatCurrency(item.product.price)}
                  </td>
                  <td className="py-2.5 pr-2 text-right">
                    {item.discountPercent > 0
                      ? `${item.discountPercent}%`
                      : "—"}
                  </td>
                  <td className="py-2.5 text-right font-medium">
                    {formatCurrency(line.total)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totals */}
        <div className="mb-6 ml-auto max-w-xs space-y-1 text-sm">
          <div className="flex justify-between text-brand-600">
            <span>Subtotal</span>
            <span>{formatCurrency(totals.subtotal)}</span>
          </div>
          {totals.discountTotal > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Descuentos</span>
              <span>-{formatCurrency(totals.discountTotal)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-brand-200 pt-2 text-lg font-bold text-brand-800">
            <span>Total</span>
            <span>{formatCurrency(totals.total)}</span>
          </div>
        </div>

        {notes && (
          <div className="mb-6 rounded-xl border border-brand-100 bg-brand-50/50 p-4">
            <h3 className="mb-1 text-xs font-bold uppercase text-brand-500">
              Notas
            </h3>
            <p className="text-sm text-brand-700">{notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-brand-200 pt-4 text-center text-xs text-brand-500">
          <p>{BRAND.phone} · {BRAND.email}</p>
          <p className="mt-1">{BRAND.instagram}</p>
          <p className="mt-2 italic">
            Cotización válida por 7 días. Precios sujetos a disponibilidad.
          </p>
        </div>
      </div>
    );
  }
);
