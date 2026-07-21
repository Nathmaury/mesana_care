"use client";

import { exportQuoteAsImage, exportQuoteAsPdf } from "@/lib/export-quote";
import { saveQuote } from "@/lib/supabase";
import type { QuoteItem } from "@/lib/types";
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
};

export function QuoteActions({
  clientName,
  clientPhone,
  clientEmail,
  notes,
  items,
}: Props) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const canExport = clientName.trim().length > 0 && items.length > 0;

  const getFilename = () => {
    const slug = clientName.trim().replace(/\s+/g, "-").toLowerCase();
    const date = new Date().toISOString().slice(0, 10);
    return `cotizacion-mesana-${slug}-${date}`;
  };

  const handleExportPdf = async () => {
    if (!previewRef.current || !canExport) return;
    setIsExporting(true);
    setShowPreview(true);
    await new Promise((r) => setTimeout(r, 300));
    try {
      await exportQuoteAsPdf(previewRef.current, getFilename());
      setMessage("PDF descargado correctamente");
    } catch {
      setMessage("Error al generar el PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportImage = async () => {
    if (!previewRef.current || !canExport) return;
    setIsExporting(true);
    setShowPreview(true);
    await new Promise((r) => setTimeout(r, 300));
    try {
      await exportQuoteAsImage(previewRef.current, getFilename());
      setMessage("Imagen descargada correctamente");
    } catch {
      setMessage("Error al generar la imagen");
    } finally {
      setIsExporting(false);
    }
  };

  const handleSave = async () => {
    if (!canExport) return;
    setIsSaving(true);
    const totals = calculateQuoteTotals(items);

    const id = await saveQuote({
      client_name: clientName,
      client_phone: clientPhone,
      client_email: clientEmail,
      notes,
      subtotal: totals.subtotal,
      discount_total: totals.discountTotal,
      total: totals.total,
      items: items.map((item) => ({
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price,
        discount_percent: item.discountPercent,
        line_total: calculateItemLine(item).total,
      })),
    });

    if (id) {
      setSavedId(id);
      setMessage("Cotización guardada en la base de datos");
    } else {
      setMessage("Modo demo: conecta Supabase para guardar cotizaciones");
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

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            disabled={!canExport || isExporting}
            onClick={() => {
              setShowPreview(true);
              handleExportPdf();
            }}
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
            onClick={() => {
              setShowPreview(true);
              handleExportImage();
            }}
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
            Guardar cotización
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

      {showPreview && canExport && (
        <div className="mt-6 overflow-hidden rounded-3xl border border-brand-200 shadow-xl">
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
