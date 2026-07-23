# Importar Google Sheets → Supabase

## Hoja 1 — Productos / compras (para el cotizador)

En Google Sheets, deja columnas con estos nombres exactos (fila 1):

| name | description | price | cost_price | stock | category | sku | supplier | active |
|------|-------------|-------|------------|-------|----------|-----|----------|--------|
| Labial Mate | ... | 38000 | 18000 | 10 | Labios | MC-001 | Proveedor | true |

- `price` = precio de venta (el que usa el cotizador)
- `cost_price` = lo que te costó comprarlo
- `stock` = unidades disponibles

### Pasos
1. Archivo → Descargar → **Valores separados por comas (.csv)**
2. Supabase → Table Editor → `products`
3. Si aún tienes los 8 productos de ejemplo y no los quieres: selecciónalos y bórralos
4. **Insert** → **Import data from CSV** → elige tu archivo
5. Recarga https://mesana-care.vercel.app

## Hoja 2 — Ventas / deudas / pagos

Primero ejecuta en SQL Editor el archivo `migrate-inventory-sales.sql` (crea tablas `sales` y `purchases`).

Columnas CSV para `sales`:

| product_name | client_name | client_phone | quantity | unit_price | total | amount_paid | amount_owed | payment_method | status | sale_date | notes |
|--------------|-------------|--------------|----------|------------|-------|-------------|-------------|----------------|--------|-----------|-------|

`status` debe ser: `pagado`, `parcial` o `pendiente`.

Importa en Table Editor → `sales` → Import CSV.

## Plantillas en este repo

- `supabase/import-productos.csv`
- `supabase/import-ventas.csv`
- `supabase/migrate-inventory-sales.sql`
