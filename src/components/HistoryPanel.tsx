"use client";

import {
  deleteQuote,
  deleteSale,
  fetchQuotes,
  fetchSales,
  updateQuotePayment,
  updateSalePayment,
} from "@/lib/supabase";
import type { PaymentStatus, QuoteRecord, SaleRecord } from "@/lib/types";
import {
  formatCurrency,
  paymentStatusLabel,
} from "@/lib/types";
import { Loader2, RefreshCw, Trash2 } from "lucide-react";
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

type View = "ventas" | "cotizaciones";

export function HistoryPanel() {
  const [view, setView] = useState<View>("ventas");
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [filter, setFilter] = useState<"todos" | PaymentStatus>("todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [q, s] = await Promise.all([fetchQuotes(), fetchSales()]);
    if (q.error && s.error) setError(q.error);
    else if (s.error) setError(s.error);
    else if (q.error) setError(q.error);
    setQuotes(q.quotes);
    setSales(s.sales);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredSales = useMemo(() => {
    if (filter === "todos") return sales;
    return sales.filter((s) => s.status === filter);
  }, [sales, filter]);

  const filteredQuotes = useMemo(() => {
    if (filter === "todos") return quotes;
    return quotes.filter((q) => q.payment_status === filter);
  }, [quotes, filter]);

  const saleTotals = useMemo(() => {
    return sales.reduce(
      (acc, s) => ({
        count: acc.count + 1,
        sold: acc.sold + s.total,
        paid: acc.paid + s.amount_paid,
        owed: acc.owed + s.amount_owed,
      }),
      { count: 0, sold: 0, paid: 0, owed: 0 }
    );
  }, [sales]);

  const markSalePaid = async (sale: SaleRecord, method: "Nequi" | "Efectivo") => {
    setUpdatingId(sale.id);
    setMessage(null);
    const err = await updateSalePayment({
      saleId: sale.id,
      status: "pagado",
      amount_paid: sale.total,
      amount_owed: 0,
      payment_method: method,
    });
    if (err) setMessage(`Error: ${err}`);
    else {
      setMessage(`Venta de ${sale.client_name} marcada como pagada por ${method}`);
      await load();
    }
    setUpdatingId(null);
  };

  const markQuotePaid = async (
    quote: QuoteRecord,
    method: "Nequi" | "Efectivo"
  ) => {
    setUpdatingId(quote.id);
    setMessage(null);
    const applyStock = !quote.stock_applied;
    const err = await updateQuotePayment({
      quoteId: quote.id,
      payment_status: "pagado",
      amount_paid: quote.total,
      amount_owed: 0,
      payment_method: method,
      applyStock,
      items: quote.quote_items ?? [],
      client_name: quote.client_name,
      client_phone: quote.client_phone,
    });
    if (err) setMessage(`Error: ${err}`);
    else {
      setMessage(
        applyStock
          ? `Cotización marcada pagada por ${method} e inventario descontado`
          : `Cotización marcada pagada por ${method}`
      );
      await load();
    }
    setUpdatingId(null);
  };

  const handleDeleteQuote = async (quote: QuoteRecord) => {
    const ok = window.confirm(
      `¿Borrar la cotización de ${quote.client_name}?\nTambién se quitará de Ventas/pagos` +
        (quote.stock_applied ? " y se devolverá el stock." : ".")
    );
    if (!ok) return;
    setUpdatingId(quote.id);
    setMessage(null);
    const err = await deleteQuote(quote);
    if (err) setMessage(`Error al borrar: ${err}`);
    else {
      setMessage("Cotización borrada");
      await load();
    }
    setUpdatingId(null);
  };

  const handleDeleteSale = async (sale: SaleRecord) => {
    const ok = window.confirm(
      `¿Borrar la venta de ${sale.client_name} — ${sale.product_name}?`
    );
    if (!ok) return;
    setUpdatingId(sale.id);
    setMessage(null);
    const err = await deleteSale(sale.id);
    if (err) setMessage(`Error al borrar: ${err}`);
    else {
      setMessage("Venta borrada");
      await load();
    }
    setUpdatingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-4">
        <StatCard label="Ventas" value={String(saleTotals.count)} />
        <StatCard label="Total vendido" value={formatCurrency(saleTotals.sold)} />
        <StatCard label="Cobrado" value={formatCurrency(saleTotals.paid)} />
        <StatCard label="Por cobrar" value={formatCurrency(saleTotals.owed)} />
      </div>

      <section className="rounded-3xl border border-brand-200/70 bg-white/90 p-4 shadow-lg shadow-brand-200/30 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2 rounded-xl bg-brand-50 p-1">
            <button
              type="button"
              onClick={() => setView("ventas")}
              className={
                view === "ventas"
                  ? "rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white"
                  : "rounded-lg px-3 py-1.5 text-sm font-medium text-brand-700"
              }
            >
              Ventas / pagos
            </button>
            <button
              type="button"
              onClick={() => setView("cotizaciones")}
              className={
                view === "cotizaciones"
                  ? "rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white"
                  : "rounded-lg px-3 py-1.5 text-sm font-medium text-brand-700"
              }
            >
              Cotizaciones
            </button>
          </div>
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
              ["pendiente", "Por pagar (DEBE)"],
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
            {error}. Ejecuta <code>migrate-panel.sql</code> y{" "}
            <code>seed-from-pagos.sql</code> en Supabase.
          </p>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-brand-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            Cargando historial…
          </div>
        ) : view === "ventas" ? (
          filteredSales.length === 0 ? (
            <p className="py-10 text-center text-sm text-brand-500">
              No hay ventas. Ejecuta seed-from-pagos.sql o registra ventas desde
              cotizaciones.
            </p>
          ) : (
            <div className="space-y-3">
              {filteredSales.map((sale) => (
                <article
                  key={sale.id}
                  className="rounded-2xl border border-brand-100 bg-brand-50/40 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-brand-900">
                        {sale.client_name}
                      </p>
                      <p className="text-sm text-brand-700">
                        {sale.quantity}× {sale.product_name}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(sale.status)}`}
                    >
                      {paymentStatusLabel(sale.status)}
                      {sale.payment_method ? ` · ${sale.payment_method}` : ""}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-brand-200/60 pt-3">
                    <div className="text-sm">
                      <p className="font-bold text-brand-800">
                        {formatCurrency(sale.total)}
                      </p>
                      {sale.amount_owed > 0 && (
                        <p className="text-rose-600">
                          Debe {formatCurrency(sale.amount_owed)}
                        </p>
                      )}
                      {sale.amount_paid > 0 && sale.status === "pagado" && (
                        <p className="text-xs text-green-700">
                          Pagó {formatCurrency(sale.amount_paid)}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {sale.status !== "pagado" && (
                        <>
                          <button
                            type="button"
                            disabled={updatingId === sale.id}
                            onClick={() => markSalePaid(sale, "Nequi")}
                            className="rounded-xl bg-purple-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                          >
                            {updatingId === sale.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              "Pagó Nequi"
                            )}
                          </button>
                          <button
                            type="button"
                            disabled={updatingId === sale.id}
                            onClick={() => markSalePaid(sale, "Efectivo")}
                            className="rounded-xl bg-green-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                          >
                            Pagó Efectivo
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        disabled={updatingId === sale.id}
                        onClick={() => handleDeleteSale(sale)}
                        className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 disabled:opacity-50"
                        aria-label="Borrar venta"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Borrar
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )
        ) : filteredQuotes.length === 0 ? (
          <p className="py-10 text-center text-sm text-brand-500">
            Aún no hay cotizaciones guardadas.
          </p>
        ) : (
          <div className="space-y-3">
            {filteredQuotes.map((quote) => (
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
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(quote.payment_status)}`}
                  >
                    {paymentStatusLabel(quote.payment_status)}
                    {quote.payment_method ? ` · ${quote.payment_method}` : ""}
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
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {quote.payment_status !== "pagado" && (
                      <>
                        <button
                          type="button"
                          disabled={updatingId === quote.id}
                          onClick={() => markQuotePaid(quote, "Nequi")}
                          className="rounded-xl bg-purple-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                        >
                          Pagó Nequi
                        </button>
                        <button
                          type="button"
                          disabled={updatingId === quote.id}
                          onClick={() => markQuotePaid(quote, "Efectivo")}
                          className="rounded-xl bg-green-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                        >
                          Pagó Efectivo
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      disabled={updatingId === quote.id}
                      onClick={() => handleDeleteQuote(quote)}
                      className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 disabled:opacity-50"
                    >
                      {updatingId === quote.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      Borrar
                    </button>
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
