"use client";

import { exportQuoteAsImage, exportQuoteAsPdf } from "@/lib/export-quote";
import { saveQuote } from "@/lib/supabase";
import type { PaymentStatus, QuoteItem } from "@/lib/types";
import {
  calculateItemLine,
  calculateQuoteTotals,
} from "@/lib/types";
import {
  Download,
  FileImage,
  FileText,
  Loader2,
  Save,
} from "lucide-react";
import { useRef, useState } from "react";
import { QuotePreview } from "./QuotePreview";

type Props = {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  notes: string;
  items: QuoteItem[];
  onSaved?: () => void;
};

export function QuoteActions({
  clientName,
  clientPhone,
  clientEmail,
  notes,
  items,
  onSaved,
}: Props) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] =
    useState<PaymentStatus>("pendiente");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [amountPaid, setAmountPaid] = useState("");

  const canExport = clientName.trim().length > 0 && items.length > 0;
  const totals = calculateQuoteTotals(items);

  const getFilename = () => {
    const slug = clientName.trim().replace(/\s+/g, "-").toLowerCase();
    const date = new Date().toISOString().slice(0, 10);
    return `cotizacion-mesana-${slug}-${date}`;
  };

  const waitForPreviewPaint = () =>
    new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve());
      });
    });

  const handleExportPdf = async () => {
    if (!canExport) return;
    setIsExporting(true);
    setShowPreview(true);
    setMessage(null);
    try {
      await exportQuoteAsPdf(
        {
          clientName,
          clientPhone,
          clientEmail,
          notes,
          items,
          quoteNumber: savedId ?? undefined,
        },
        getFilename()
      );
      setMessage("PDF descargado correctamente");
    } catch (err) {
      console.error(err);
      setMessage(
        err instanceof Error
          ? `Error al generar el PDF: ${err.message}`
          : "Error al generar el PDF"
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportImage = async () => {
    if (!canExport) return;
    setIsExporting(true);
    setShowPreview(true);
    setMessage(null);
    try {
      await waitForPreviewPaint();
      await new Promise((r) => setTimeout(r, 150));
      const el = previewRef.current;
      if (!el) throw new Error("No se encontró la vista previa para capturar");
      await exportQuoteAsImage(el, getFilename());
      setMessage("Imagen descargada correctamente");
    } catch (err) {
      console.error(err);
      setMessage(
        err instanceof Error
          ? `Error al generar la imagen: ${err.message}`
          : "Error al generar la imagen"
      );
    } finally {
      setIsExporting(false);
    }
  };

  const resolveAmounts = () => {
    if (paymentStatus === "pagado") {
      return { paid: totals.total, owed: 0 };
    }
    if (paymentStatus === "pendiente") {
      return { paid: 0, owed: totals.total };
    }
    const paid = Math.min(
      totals.total,
      Math.max(0, Number(amountPaid.replace(/\D/g, "")) || 0)
    );
    return { paid, owed: Math.max(0, totals.total - paid) };
  };

  const handleSave = async () => {
    if (!canExport) return;
    setIsSaving(true);
    setMessage(null);
    const { paid, owed } = resolveAmounts();

    const result = await saveQuote({
      client_name: clientName,
      client_phone: clientPhone,
      client_email: clientEmail,
      notes,
      subtotal: totals.subtotal,
      discount_total: totals.discountTotal,
      total: totals.total,
      payment_status: paymentStatus,
      amount_paid: paid,
      amount_owed: owed,
      payment_method: paymentMethod,
      items: items.map((item) => ({
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price,
        discount_percent: item.discountPercent,
        line_total: calculateItemLine(item).total,
      })),
    });

    if (result.id) {
      setSavedId(result.id);
      const stockNote =
        paymentStatus === "pagado" || paymentStatus === "parcial"
          ? " Inventario descontado."
          : "";
      setMessage(`Cotización guardada en el historial.${stockNote}`);
      onSaved?.();
    } else {
      setMessage(
        result.error
          ? `No se pudo guardar: ${result.error}. Ejecuta migrate-panel.sql en Supabase.`
          : "No se pudo guardar. Revisa la conexión con Supabase."
      );
    }
    setIsSaving(false);
  };

  return (
    <>
      <section className="rounded-3xl border border-brand-200/70 bg-white/90 p-4 shadow-lg shadow-brand-200/30 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-brand-800">
          Acciones
        </h2>

        {!canExport && (
          <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Ingresa el nombre del cliente y agrega al menos un producto para
            generar la cotización.
          </p>
        )}

        <div className="mb-4 space-y-3 rounded-2xl border border-brand-100 bg-brand-50/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
            Estado de pago al guardar
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {(
              [
                ["pendiente", "Por pagar"],
                ["parcial", "Pago parcial"],
                ["pagado", "Pagado"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                disabled={!canExport}
                onClick={() => setPaymentStatus(value)}
                className={
                  paymentStatus === value
                    ? "rounded-xl bg-brand-600 px-3 py-2 text-sm font-semibold text-white"
                    : "rounded-xl border border-brand-200 bg-white px-3 py-2 text-sm text-brand-700"
                }
              >
                {label}
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-brand-600">
                Método de pago
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full rounded-xl border border-brand-200 bg-white px-3 py-2 text-sm"
              >
                <option value="">Sin especificar</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Nequi">Nequi</option>
                <option value="Daviplata">Daviplata</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            {paymentStatus === "parcial" && (
              <div>
                <label className="mb-1 block text-xs font-medium text-brand-600">
                  Monto pagado
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder={`Máx ${totals.total}`}
                  className="w-full rounded-xl border border-brand-200 bg-white px-3 py-2 text-sm"
                />
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            disabled={!canExport || isExporting}
            onClick={handleExportPdf}
            className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            Descargar PDF
          </button>

          <button
            type="button"
            disabled={!canExport || isExporting}
            onClick={handleExportImage}
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-brand-400 bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileImage className="h-4 w-4" />
            )}
            Descargar imagen
          </button>

          <button
            type="button"
            disabled={!canExport || isSaving}
            onClick={handleSave}
            className="flex items-center justify-center gap-2 rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Guardar en historial
          </button>

          <button
            type="button"
            disabled={!canExport}
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center justify-center gap-2 rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm font-medium text-brand-600 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2"
          >
            <Download className="h-4 w-4" />
            {showPreview ? "Ocultar vista previa" : "Ver vista previa"}
          </button>
        </div>

        {message && (
          <p className="mt-4 rounded-xl bg-brand-100 px-4 py-3 text-sm text-brand-700">
            {message}
          </p>
        )}
      </section>

      {canExport && (
        <div
          className={
            showPreview
              ? "mt-6 overflow-hidden rounded-3xl border border-brand-200 shadow-xl"
              : "pointer-events-none fixed top-0 left-[-10000px] w-[794px] opacity-0"
          }
          aria-hidden={!showPreview}
        >
          <QuotePreview
            ref={previewRef}
            clientName={clientName}
            clientPhone={clientPhone}
            clientEmail={clientEmail}
            notes={notes}
            items={items}
            quoteNumber={savedId ?? undefined}
          />
        </div>
      )}
    </>
  );
}
