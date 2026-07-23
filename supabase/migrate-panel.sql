-- Panel Mesana Care: estados de pago en cotizaciones + permisos
-- Ejecuta en Supabase → SQL Editor → Run

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS cost_price NUMERIC(12, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stock INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS supplier TEXT,
  ADD COLUMN IF NOT EXISTS purchase_date DATE;

ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pendiente',
  ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS amount_owed NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS stock_applied BOOLEAN NOT NULL DEFAULT false;

-- Restringir estados (si ya hay constraint con otro nombre, ignora el error)
DO $$
BEGIN
  ALTER TABLE quotes
    ADD CONSTRAINT quotes_payment_status_check
    CHECK (payment_status IN ('pagado', 'parcial', 'pendiente'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12, 2) NOT NULL,
  total NUMERIC(12, 2) NOT NULL,
  amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0,
  amount_owed NUMERIC(12, 2) NOT NULL DEFAULT 0,
  payment_method TEXT,
  status TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (status IN ('pagado', 'parcial', 'pendiente')),
  sale_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quotes_payment_status ON quotes(payment_status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_quote_id ON sales(quote_id);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);

GRANT SELECT, INSERT, UPDATE ON TABLE quotes TO anon, authenticated;
GRANT SELECT, INSERT ON TABLE quote_items TO anon, authenticated;
GRANT SELECT, UPDATE ON TABLE products TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE sales TO anon, authenticated;

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leer cotizaciones" ON quotes;
DROP POLICY IF EXISTS "Insertar cotizaciones" ON quotes;
DROP POLICY IF EXISTS "Actualizar cotizaciones" ON quotes;
DROP POLICY IF EXISTS "Leer items de cotización" ON quote_items;
DROP POLICY IF EXISTS "Insertar items de cotización" ON quote_items;
DROP POLICY IF EXISTS "Productos activos visibles para todos" ON products;
DROP POLICY IF EXISTS "Actualizar productos" ON products;
DROP POLICY IF EXISTS "Leer ventas" ON sales;
DROP POLICY IF EXISTS "Insertar ventas" ON sales;
DROP POLICY IF EXISTS "Actualizar ventas" ON sales;

CREATE POLICY "Leer cotizaciones" ON quotes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Insertar cotizaciones" ON quotes FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Actualizar cotizaciones" ON quotes FOR UPDATE TO anon, authenticated USING (true);

CREATE POLICY "Leer items de cotización" ON quote_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Insertar items de cotización" ON quote_items FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Productos activos visibles para todos"
  ON products FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "Actualizar productos"
  ON products FOR UPDATE TO anon, authenticated USING (true);

CREATE POLICY "Leer ventas" ON sales FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Insertar ventas" ON sales FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Actualizar ventas" ON sales FOR UPDATE TO anon, authenticated USING (true);
