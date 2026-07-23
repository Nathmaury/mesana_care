"use client";

import { BRAND } from "@/lib/sample-products";
import type { QuoteItem } from "@/lib/types";
import {
  calculateItemLine,
  calculateQuoteTotals,
  formatCurrency,
} from "@/lib/types";
import { forwardRef } from "react";

/** Colores hex fijos: html-to-image falla con oklch de Tailwind v4 */
const c = {
  white: "#ffffff",
  text: "#4c1d95",
  muted: "#7e22ce",
  soft: "#a855f7",
  line: "#e9d5ff",
  lineSoft: "#f3e8ff",
  bg: "#faf5ff",
  green: "#16a34a",
};

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
        style={{
          fontFamily: "Arial, Helvetica, sans-serif",
          backgroundColor: c.white,
          color: c.text,
          width: "794px",
          maxWidth: "100%",
          margin: "0 auto",
          padding: "32px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            borderBottom: `2px solid ${c.line}`,
            paddingBottom: "16px",
            marginBottom: "24px",
            gap: "16px",
          }}
        >
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={BRAND.logoHorizontal}
              alt={BRAND.name}
              width={220}
              height={64}
              style={{
                display: "block",
                width: "220px",
                height: "auto",
                maxWidth: "100%",
              }}
              crossOrigin="anonymous"
            />
          </div>
          <div style={{ textAlign: "right", fontSize: "13px", flexShrink: 0 }}>
            <p
              style={{
                margin: 0,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: c.muted,
              }}
            >
              Cotización
            </p>
            {quoteNumber && (
              <p style={{ margin: "4px 0 0", color: c.text }}>
                No. {quoteNumber.slice(0, 8)}
              </p>
            )}
            <p style={{ margin: "4px 0 0", color: c.muted }}>{date}</p>
          </div>
        </div>

        <div
          style={{
            backgroundColor: c.bg,
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "24px",
          }}
        >
          <h2
            style={{
              margin: "0 0 8px",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: c.soft,
            }}
          >
            Cliente
          </h2>
          <p style={{ margin: 0, fontWeight: 600 }}>{clientName || "—"}</p>
          {clientPhone && (
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: c.muted }}>
              {clientPhone}
            </p>
          )}
          {clientEmail && (
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: c.muted }}>
              {clientEmail}
            </p>
          )}
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "24px",
            fontSize: "13px",
          }}
        >
          <thead>
            <tr style={{ borderBottom: `1px solid ${c.line}`, textAlign: "left" }}>
              <th
                style={{
                  paddingBottom: "8px",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  color: c.soft,
                }}
              >
                Producto
              </th>
              <th
                style={{
                  paddingBottom: "8px",
                  textAlign: "center",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  color: c.soft,
                }}
              >
                Cant.
              </th>
              <th
                style={{
                  paddingBottom: "8px",
                  textAlign: "right",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  color: c.soft,
                }}
              >
                Precio
              </th>
              <th
                style={{
                  paddingBottom: "8px",
                  textAlign: "right",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  color: c.soft,
                }}
              >
                Desc.
              </th>
              <th
                style={{
                  paddingBottom: "8px",
                  textAlign: "right",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  color: c.soft,
                }}
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const line = calculateItemLine(item);
              return (
                <tr
                  key={item.product.id}
                  style={{ borderBottom: `1px solid ${c.lineSoft}` }}
                >
                  <td style={{ padding: "10px 8px 10px 0" }}>
                    <p style={{ margin: 0, fontWeight: 600 }}>
                      {item.product.name}
                    </p>
                    {item.product.sku && (
                      <p
                        style={{
                          margin: "2px 0 0",
                          fontSize: "11px",
                          color: c.soft,
                        }}
                      >
                        {item.product.sku}
                      </p>
                    )}
                  </td>
                  <td style={{ padding: "10px 8px", textAlign: "center" }}>
                    {item.quantity}
                  </td>
                  <td style={{ padding: "10px 8px", textAlign: "right" }}>
                    {formatCurrency(item.product.price)}
                  </td>
                  <td style={{ padding: "10px 8px", textAlign: "right" }}>
                    {item.discountPercent > 0
                      ? `${item.discountPercent}%`
                      : "—"}
                  </td>
                  <td
                    style={{
                      padding: "10px 0 10px 8px",
                      textAlign: "right",
                      fontWeight: 600,
                    }}
                  >
                    {formatCurrency(line.total)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div
          style={{
            marginLeft: "auto",
            maxWidth: "240px",
            marginBottom: "24px",
            fontSize: "13px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              color: c.muted,
              marginBottom: "4px",
            }}
          >
            <span>Subtotal</span>
            <span>{formatCurrency(totals.subtotal)}</span>
          </div>
          {totals.discountTotal > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                color: c.green,
                marginBottom: "4px",
              }}
            >
              <span>Descuentos</span>
              <span>-{formatCurrency(totals.discountTotal)}</span>
            </div>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              borderTop: `1px solid ${c.line}`,
              paddingTop: "8px",
              fontSize: "18px",
              fontWeight: 700,
              color: c.text,
            }}
          >
            <span>Total</span>
            <span>{formatCurrency(totals.total)}</span>
          </div>
        </div>

        {notes && (
          <div
            style={{
              borderRadius: "12px",
              border: `1px solid ${c.lineSoft}`,
              backgroundColor: c.bg,
              padding: "16px",
              marginBottom: "24px",
            }}
          >
            <h3
              style={{
                margin: "0 0 4px",
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                color: c.soft,
              }}
            >
              Notas
            </h3>
            <p style={{ margin: 0, fontSize: "13px", color: c.muted }}>
              {notes}
            </p>
          </div>
        )}

        <div
          style={{
            borderTop: `1px solid ${c.line}`,
            paddingTop: "16px",
            textAlign: "center",
            fontSize: "11px",
            color: c.soft,
          }}
        >
          <p style={{ margin: 0 }}>
            {BRAND.phone} · {BRAND.email}
          </p>
          <p style={{ margin: "4px 0 0" }}>{BRAND.instagram}</p>
          <p style={{ margin: "8px 0 0", fontStyle: "italic" }}>
            Cotización válida por 7 días. Precios sujetos a disponibilidad.
          </p>
        </div>
      </div>
    );
  }
);
