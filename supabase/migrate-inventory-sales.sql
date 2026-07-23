-- Mesana Care — Extensión de BD para inventario + ventas (desde Google Sheets)
-- Ejecuta en: Supabase → SQL Editor → Run

-- Ampliar productos con costo, stock y proveedor
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS cost_price NUMERIC(12, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stock INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS supplier TEXT,
  ADD COLUMN IF NOT EXISTS purchase_date DATE;

-- Compras / inventario (hoja 1 de tu Sheets: lo que compras)
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
  supplier TEXT,
  purchase_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ventas / clientes (hoja 2: lo que vendes, deudas, pago)
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12, 2) NOT NULL,
  total NUMERIC(12, 2) NOT NULL,
  amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0,
  amount_owed NUMERIC(12, 2) NOT NULL DEFAULT 0,
  payment_method TEXT, -- Efectivo, Transferencia, Nequi, Daviplata, etc.
  status TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (status IN ('pagado', 'parcial', 'pendiente')),
  sale_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sales_client ON sales(client_name);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases(purchase_date DESC);

-- Permisos
GRANT SELECT, INSERT, UPDATE ON TABLE purchases TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE sales TO anon, authenticated;

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leer compras" ON purchases;
DROP POLICY IF EXISTS "Insertar compras" ON purchases;
DROP POLICY IF EXISTS "Leer ventas" ON sales;
DROP POLICY IF EXISTS "Insertar ventas" ON sales;
DROP POLICY IF EXISTS "Actualizar ventas" ON sales;

CREATE POLICY "Leer compras" ON purchases FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Insertar compras" ON purchases FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Leer ventas" ON sales FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Insertar ventas" ON sales FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Actualizar ventas" ON sales FOR UPDATE TO anon, authenticated USING (true);
