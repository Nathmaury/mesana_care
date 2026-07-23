"use client";

import {
  fetchQuotes,
  updateQuotePayment,
} from "@/lib/supabase";
import type { PaymentStatus, QuoteRecord } from "@/lib/types";
import {
  formatCurrency,
  paymentStatusLabel,
} from "@/lib/types";
import { Loader2, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

function statusClass(status: PaymentStatus) {
  switch (status) {
    case "pagado":
      return "bg-green-100 text-green-700";
    case "parcial":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-rose-100 text-rose-700";
  }
}

export function HistoryPanel() {
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [filter, setFilter] = useState<"todos" | PaymentStatus>("todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { quotes: data, error: err } = await fetchQuotes();
    if (err) setError(err);
    setQuotes(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (filter === "todos") return quotes;
    return quotes.filter((q) => q.payment_status === filter);
  }, [quotes, filter]);

  const totals = useMemo(() => {
    return quotes.reduce(
      (acc, q) => ({
        count: acc.count + 1,
        sold: acc.sold + q.total,
        paid: acc.paid + q.amount_paid,
        owed: acc.owed + q.amount_owed,
      }),
      { count: 0, sold: 0, paid: 0, owed: 0 }
    );
  }, [quotes]);

  const markPaid = async (quote: QuoteRecord) => {
    setUpdatingId(quote.id);
    setMessage(null);
    const applyStock = !quote.stock_applied;
    const err = await updateQuotePayment({
      quoteId: quote.id,
      payment_status: "pagado",
      amount_paid: quote.total,
      amount_owed: 0,
      payment_method: quote.payment_method ?? "Efectivo",
      applyStock,
      items: quote.quote_items ?? [],
      client_name: quote.client_name,
      client_phone: quote.client_phone,
    });
    if (err) {
      setMessage(`Error: ${err}`);
    } else {
      setMessage(
        applyStock
          ? "Marcado como pagado e inventario descontado"
          : "Marcado como pagado"
      );
      await load();
    }
    setUpdatingId(null);
  };

  const markPending = async (quote: QuoteRecord) => {
    setUpdatingId(quote.id);
    setMessage(null);
    const err = await updateQuotePayment({
      quoteId: quote.id,
      payment_status: "pendiente",
      amount_paid: 0,
      amount_owed: quote.total,
      payment_method: quote.payment_method ?? "",
      applyStock: false,
      items: quote.quote_items ?? [],
      client_name: quote.client_name,
      client_phone: quote.client_phone,
    });
    if (err) setMessage(`Error: ${err}`);
    else {
      setMessage("Marcado como por pagar");
      await load();
    }
    setUpdatingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-4">
        <StatCard label="Cotizaciones" value={String(totals.count)} />
        <StatCard label="Total cotizado" value={formatCurrency(totals.sold)} />
        <StatCard label="Cobrado" value={formatCurrency(totals.paid)} />
        <StatCard label="Por cobrar" value={formatCurrency(totals.owed)} />
      </div>

      <section className="rounded-3xl border border-brand-200/70 bg-white/90 p-4 shadow-lg shadow-brand-200/30 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-brand-800">
            Historial de cotizaciones
          </h2>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-200 px-3 py-2 text-sm text-brand-700 hover:bg-brand-50"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {(
            [
              ["todos", "Todos"],
              ["pendiente", "Por pagar"],
              ["parcial", "Parcial"],
              ["pagado", "Pagado"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={
                filter === id
                  ? "rounded-full bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white"
                  : "rounded-full bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700"
              }
            >
              {label}
            </button>
          ))}
        </div>

        {message && (
          <p className="mb-4 rounded-xl bg-brand-100 px-4 py-3 text-sm text-brand-700">
            {message}
          </p>
        )}
        {error && (
          <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}. Ejecuta <code>supabase/migrate-panel.sql</code> en Supabase.
          </p>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-brand-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            Cargando historial…
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-brand-500">
            Aún no hay cotizaciones en este filtro.
          </p>
        ) : (
          <div className="space-y-3">
            {filtered.map((quote) => (
              <article
                key={quote.id}
                className="rounded-2xl border border-brand-100 bg-brand-50/40 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-brand-900">
                      {quote.client_name}
                    </p>
                    <p className="text-xs text-brand-500">
                      {new Date(quote.created_at).toLocaleString("es-CO")}
                      {quote.client_phone ? ` · ${quote.client_phone}` : ""}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(quote.payment_status)}`}
                  >
                    {paymentStatusLabel(quote.payment_status)}
                  </span>
                </div>

                <ul className="mt-3 space-y-1 text-sm text-brand-700">
                  {(quote.quote_items ?? []).map((item) => (
                    <li key={item.id} className="flex justify-between gap-2">
                      <span>
                        {item.quantity}× {item.product_name}
                      </span>
                      <span>{formatCurrency(item.line_total)}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-brand-200/60 pt-3">
                  <div className="text-sm">
                    <p className="font-bold text-brand-800">
                      Total {formatCurrency(quote.total)}
                    </p>
                    {quote.amount_owed > 0 && (
                      <p className="text-rose-600">
                        Debe {formatCurrency(quote.amount_owed)}
                      </p>
                    )}
                    {quote.payment_method && (
                      <p className="text-xs text-brand-500">
                        {quote.payment_method}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {quote.payment_status !== "pagado" && (
                      <button
                        type="button"
                        disabled={updatingId === quote.id}
                        onClick={() => markPaid(quote)}
                        className="rounded-xl bg-green-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        {updatingId === quote.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          "Marcar pagado"
                        )}
                      </button>
                    )}
                    {quote.payment_status !== "pendiente" && (
                      <button
                        type="button"
                        disabled={updatingId === quote.id}
                        onClick={() => markPending(quote)}
                        className="rounded-xl border border-brand-200 bg-white px-3 py-2 text-xs font-semibold text-brand-700 disabled:opacity-50"
                      >
                        Por pagar
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-brand-200/70 bg-white/90 p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-brand-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold text-brand-800">{value}</p>
    </div>
  );
}
