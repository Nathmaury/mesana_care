import type { QuoteItem } from "@/lib/types";
import {
  calculateItemLine,
  calculateQuoteTotals,
  formatCurrency,
} from "@/lib/types";
import { BRAND } from "@/lib/sample-products";
import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "image/png";
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

async function loadLogoDataUrl(): Promise<string | null> {
  try {
    const res = await fetch(BRAND.logoHorizontal);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function exportQuoteAsImage(
  element: HTMLElement,
  filename: string
): Promise<void> {
  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: "#ffffff",
    // Evita fallos con fuentes externas / CORS en Vercel
    skipFonts: true,
  });

  triggerDownload(dataUrlToBlob(dataUrl), `${filename}.png`);
}

type PdfQuoteInput = {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  notes: string;
  items: QuoteItem[];
  quoteNumber?: string;
};

/** PDF generado con texto (más fiable en móvil/Vercel que capturar HTML) */
export async function exportQuoteAsPdf(
  data: PdfQuoteInput,
  filename: string
): Promise<void> {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const ensureSpace = (needed: number) => {
    const pageHeight = pdf.internal.pageSize.getHeight();
    if (y + needed > pageHeight - margin) {
      pdf.addPage();
      y = margin;
    }
  };

  // Header con logo
  const logoDataUrl = await loadLogoDataUrl();
  if (logoDataUrl) {
    pdf.addImage(logoDataUrl, "PNG", margin, y - 2, 52, 16);
    y += 16;
  } else {
    pdf.setTextColor(126, 34, 206);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.text(BRAND.name, margin, y);
    y += 6;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(147, 51, 234);
    pdf.text(BRAND.tagline, margin, y);
    y += 4;
  }

  const date = new Date().toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  pdf.setTextColor(107, 33, 168);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("COTIZACIÓN", pageWidth - margin, margin, { align: "right" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(120, 80, 160);
  if (data.quoteNumber) {
    pdf.text(`No. ${data.quoteNumber.slice(0, 8)}`, pageWidth - margin, margin + 5, {
      align: "right",
    });
  }
  pdf.text(date, pageWidth - margin, margin + (data.quoteNumber ? 10 : 5), {
    align: "right",
  });

  y += 6;
  pdf.setDrawColor(233, 213, 255);
  pdf.setLineWidth(0.5);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Cliente
  ensureSpace(28);
  pdf.setFillColor(250, 245, 255);
  pdf.roundedRect(margin, y, contentWidth, 24, 2, 2, "F");
  pdf.setTextColor(168, 85, 247);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.text("CLIENTE", margin + 4, y + 6);
  pdf.setTextColor(76, 29, 149);
  pdf.setFontSize(11);
  pdf.text(data.clientName || "—", margin + 4, y + 12);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(107, 70, 140);
  let clientY = y + 17;
  if (data.clientPhone) {
    pdf.text(data.clientPhone, margin + 4, clientY);
    clientY += 4;
  }
  if (data.clientEmail) {
    pdf.text(data.clientEmail, margin + 4, clientY);
  }
  y += 30;

  // Tabla header
  ensureSpace(12);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(168, 85, 247);
  const cols = {
    product: margin,
    qty: margin + contentWidth * 0.52,
    price: margin + contentWidth * 0.62,
    disc: margin + contentWidth * 0.76,
    total: pageWidth - margin,
  };
  pdf.text("PRODUCTO", cols.product, y);
  pdf.text("CANT.", cols.qty, y);
  pdf.text("PRECIO", cols.price, y);
  pdf.text("DESC.", cols.disc, y);
  pdf.text("TOTAL", cols.total, y, { align: "right" });
  y += 2;
  pdf.setDrawColor(233, 213, 255);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 6;

  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(55, 30, 80);

  for (const item of data.items) {
    const line = calculateItemLine(item);
    const nameLines = pdf.splitTextToSize(item.product.name, contentWidth * 0.48);
    const blockHeight = Math.max(8, nameLines.length * 4 + (item.product.sku ? 4 : 0));
    ensureSpace(blockHeight + 4);

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.text(nameLines, cols.product, y);
    if (item.product.sku) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.setTextColor(140, 100, 180);
      pdf.text(item.product.sku, cols.product, y + nameLines.length * 4);
      pdf.setTextColor(55, 30, 80);
    }

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text(String(item.quantity), cols.qty, y);
    pdf.text(formatCurrency(item.product.price), cols.price, y);
    pdf.text(
      item.discountPercent > 0 ? `${item.discountPercent}%` : "—",
      cols.disc,
      y
    );
    pdf.setFont("helvetica", "bold");
    pdf.text(formatCurrency(line.total), cols.total, y, { align: "right" });

    y += blockHeight;
    pdf.setDrawColor(245, 240, 255);
    pdf.line(margin, y - 2, pageWidth - margin, y - 2);
  }

  // Totales
  const totals = calculateQuoteTotals(data.items);
  y += 6;
  ensureSpace(28);
  const totalsX = pageWidth - margin;
  const labelX = totalsX - 55;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(107, 70, 140);
  pdf.text("Subtotal", labelX, y);
  pdf.text(formatCurrency(totals.subtotal), totalsX, y, { align: "right" });
  y += 5;

  if (totals.discountTotal > 0) {
    pdf.setTextColor(22, 163, 74);
    pdf.text("Descuentos", labelX, y);
    pdf.text(`-${formatCurrency(totals.discountTotal)}`, totalsX, y, {
      align: "right",
    });
    y += 5;
  }

  pdf.setDrawColor(233, 213, 255);
  pdf.line(labelX, y, totalsX, y);
  y += 6;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(76, 29, 149);
  pdf.text("Total", labelX, y);
  pdf.text(formatCurrency(totals.total), totalsX, y, { align: "right" });
  y += 10;

  if (data.notes.trim()) {
    ensureSpace(20);
    pdf.setFillColor(250, 245, 255);
    const noteLines = pdf.splitTextToSize(data.notes, contentWidth - 8);
    const boxH = 10 + noteLines.length * 4;
    pdf.roundedRect(margin, y, contentWidth, boxH, 2, 2, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(168, 85, 247);
    pdf.text("NOTAS", margin + 4, y + 5);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(76, 29, 149);
    pdf.text(noteLines, margin + 4, y + 10);
    y += boxH + 6;
  }

  ensureSpace(16);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(140, 100, 180);
  pdf.text(`${BRAND.phone}  ·  ${BRAND.email}`, pageWidth / 2, y, {
    align: "center",
  });
  y += 4;
  pdf.text(BRAND.instagram, pageWidth / 2, y, { align: "center" });
  y += 5;
  pdf.setFont("helvetica", "italic");
  pdf.text(
    "Cotización válida por 7 días. Precios sujetos a disponibilidad.",
    pageWidth / 2,
    y,
    { align: "center" }
  );

  pdf.save(`${filename}.pdf`);
}
