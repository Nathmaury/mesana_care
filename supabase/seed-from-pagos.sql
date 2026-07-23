-- Importa ventas/pagos desde "13 JUNIO - Pagos"
-- Ejecuta DESPUÉS de migrate-panel.sql en Supabase → SQL Editor → Run

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

GRANT SELECT, INSERT, UPDATE ON TABLE sales TO anon, authenticated;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Leer ventas" ON sales;
DROP POLICY IF EXISTS "Insertar ventas" ON sales;
DROP POLICY IF EXISTS "Actualizar ventas" ON sales;
CREATE POLICY "Leer ventas" ON sales FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Insertar ventas" ON sales FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Actualizar ventas" ON sales FOR UPDATE TO anon, authenticated USING (true);

-- Evita duplicar si vuelves a correr el script
DELETE FROM sales WHERE notes = 'import-pagos-junio';

INSERT INTO sales (
  product_name, client_name, quantity, unit_price, total,
  amount_paid, amount_owed, payment_method, status, notes, sale_date
) VALUES
  ('Pimple patch', 'Teresa Serje', 1, 12000, 12000, 12000, 0, 'Nequi', 'pagado', 'import-pagos-junio', '2025-06-13'),
  ('Lip gloss engoll', 'Yorli', 1, 11000, 11000, 11000, 0, 'Nequi', 'pagado', 'import-pagos-junio', '2025-06-13'),
  ('Molde hielo', 'Sara Maury', 1, 14000, 14000, 0, 14000, NULL, 'pendiente', 'import-pagos-junio', '2025-06-13'),
  ('Toallas desmaquillantes', 'Abuela Susana', 1, 5000, 5000, 5000, 0, 'Efectivo', 'pagado', 'import-pagos-junio', '2025-06-13'),
  ('Contorno ojos crema', 'Abuela Susana', 1, 12000, 12000, 12000, 0, 'Efectivo', 'pagado', 'import-pagos-junio', '2025-06-13'),
  ('Toallas desmaquillantes', 'Tia Kathe', 1, 5000, 5000, 5000, 0, 'Efectivo', 'pagado', 'import-pagos-junio', '2025-06-13'),
  ('Serum nicotinamida', 'Dany', 1, 12000, 12000, 12000, 0, 'Nequi', 'pagado', 'import-pagos-junio', '2025-06-13'),
  ('Lip gloss', 'Dany', 1, 10000, 10000, 10000, 0, 'Nequi', 'pagado', 'import-pagos-junio', '2025-06-13'),
  ('Toallas desmaquillantes', 'Abuelo Lubin', 1, 5000, 5000, 5000, 0, 'Nequi', 'pagado', 'import-pagos-junio', '2025-06-13'),
  ('Molde hielo', 'Tia Kelly', 1, 14000, 14000, 14000, 0, 'Nequi', 'pagado', 'import-pagos-junio', '2025-06-13'),
  ('Papel arroz', 'Tia Kelly', 1, 6000, 6000, 6000, 0, 'Nequi', 'pagado', 'import-pagos-junio', '2025-06-13'),
  ('Velo facial', 'Teresa', 1, 3000, 3000, 0, 3000, NULL, 'pendiente', 'import-pagos-junio', '2025-06-13'),
  ('Velo facial', 'Tia Kelly', 1, 3000, 3000, 3000, 0, 'Nequi', 'pagado', 'import-pagos-junio', '2025-06-13'),
  ('Toallas desmaquillantes', 'Tia Kelly', 1, 5000, 5000, 5000, 0, 'Nequi', 'pagado', 'import-pagos-junio', '2025-06-13'),
  ('Sellador', 'Sadday', 1, 20000, 20000, 0, 20000, NULL, 'pendiente', 'import-pagos-junio', '2025-06-13'),
  ('Pimple patch', 'Adriana', 1, 12000, 12000, 12000, 0, 'Nequi', 'pagado', 'import-pagos-junio', '2025-06-13'),
  ('Velo facial', 'Caro', 2, 6000, 6000, 6000, 0, 'Nequi', 'pagado', 'import-pagos-junio', '2025-06-13'),
  ('Toallas desmaquillantes', 'Adriana', 1, 5000, 5000, 5000, 0, 'Nequi', 'pagado', 'import-pagos-junio', '2025-06-13'),
  ('Lip gloss engoll', 'Pau', 1, 11000, 11000, 11000, 0, 'Nequi', 'pagado', 'import-pagos-junio', '2025-06-13'),
  ('Acido glicolico', 'Marinella', 1, 35000, 35000, 0, 35000, NULL, 'pendiente', 'import-pagos-junio', '2025-06-13'),
  ('Kit Boiaqua', 'Marinella', 1, 60000, 60000, 0, 60000, NULL, 'pendiente', 'import-pagos-junio', '2025-06-13'),
  ('Contorno ojos crema', 'Paula', 1, 7000, 7000, 7000, 0, 'Nequi', 'pagado', 'import-pagos-junio', '2025-06-13'),
  ('Kit viajero', 'Abuela Susana', 1, 15000, 15000, 15000, 0, 'Efectivo', 'pagado', 'import-pagos-junio', '2025-06-13'),
  ('Contorno ojos crema', 'Kemi', 1, 7000, 7000, 7000, 0, 'Nequi', 'pagado', 'import-pagos-junio', '2025-06-13'),
  ('Papel arroz', 'Kemi', 1, 6000, 6000, 6000, 0, 'Nequi', 'pagado', 'import-pagos-junio', '2025-06-13'),
  ('Sellador', 'Jeferson', 1, 20000, 20000, 0, 20000, NULL, 'pendiente', 'import-pagos-junio', '2025-06-13'),
  ('Pimple patch', 'Pau', 1, 12000, 12000, 12000, 0, 'Nequi', 'pagado', 'import-pagos-junio', '2025-06-13'),
  ('Toallas desmaquillantes', 'Jeferson', 1, 5000, 5000, 0, 5000, NULL, 'pendiente', 'import-pagos-junio', '2025-06-13'),
  ('Papel arroz', 'Jeferson', 1, 6000, 6000, 0, 6000, NULL, 'pendiente', 'import-pagos-junio', '2025-06-13'),
  ('Kit viajero', 'Karen', 1, 15000, 15000, 15000, 0, 'Nequi', 'pagado', 'import-pagos-junio', '2025-06-13'),
  ('Papel arroz', 'Karen', 1, 6000, 6000, 6000, 0, 'Nequi', 'pagado', 'import-pagos-junio', '2025-06-13'),
  ('Tónico de rosas', 'Karen', 1, 13000, 13000, 13000, 0, 'Nequi', 'pagado', 'import-pagos-junio', '2025-06-13');
