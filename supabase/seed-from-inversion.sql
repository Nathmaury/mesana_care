-- Reemplaza productos de ejemplo con tu inventario (13 JUNIO - Inversion)
-- Ejecuta en Supabase → SQL Editor → Run

-- Asegura columnas de inventario
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS cost_price NUMERIC(12, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stock INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS supplier TEXT,
  ADD COLUMN IF NOT EXISTS purchase_date DATE;

-- Limpia catálogo anterior (no borra cotizaciones)
DELETE FROM products;

INSERT INTO products (name, description, price, cost_price, stock, category, sku, active) VALUES
  ('Toallas desmaquillantes', 'Inventario Mesana Care', 5000, 2000, 6, 'Cuidado', 'MC-INV-001', true),
  ('Kit Boiaqua', 'Inventario Mesana Care', 60000, 30000, 1, 'Kits', 'MC-INV-002', true),
  ('Tónico Ordinary', 'Inventario Mesana Care', 33000, 16500, 1, 'Cuidado', 'MC-INV-003', true),
  ('Serum nicotinamida', 'Inventario Mesana Care', 12000, 3800, 1, 'Cuidado', 'MC-INV-004', true),
  ('Lip gloss', 'Inventario Mesana Care', 10000, 4700, 3, 'Labios', 'MC-INV-005', true),
  ('Papel arroz', 'Inventario Mesana Care', 6000, 2800, 6, 'Rostro', 'MC-INV-006', true),
  ('Sellador', 'Inventario Mesana Care', 20000, 10000, 2, 'Rostro', 'MC-INV-007', true),
  ('Lip gloss engoll', 'Inventario Mesana Care', 11000, 5500, 3, 'Labios', 'MC-INV-008', true),
  ('Velo facial', 'Inventario Mesana Care', 3000, 800, 6, 'Cuidado', 'MC-INV-009', true),
  ('Pimple patch', 'Inventario Mesana Care', 12000, 6000, 3, 'Cuidado', 'MC-INV-010', true),
  ('Kit viajero', 'Inventario Mesana Care', 15000, 7500, 2, 'Kits', 'MC-INV-011', true),
  ('Molde hielo', 'Inventario Mesana Care', 14000, 7000, 3, 'Accesorios', 'MC-INV-012', true),
  ('Tónico de rosas', 'Inventario Mesana Care', 13000, 6500, 2, 'Cuidado', 'MC-INV-013', true),
  ('Contorno ojos crema', 'Inventario Mesana Care', 7000, 2600, 5, 'Cuidado', 'MC-INV-014', true),
  ('Tinta benefit', 'Inventario Mesana Care', 30000, 15000, 2, 'Rostro', 'MC-INV-015', true);
