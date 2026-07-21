-- Mesana Care — Esquema de base de datos para Supabase
-- Ejecuta esto en: Supabase Dashboard → SQL Editor → New query

-- Tabla de productos (tu catálogo desde Excel)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  category TEXT NOT NULL DEFAULT 'General',
  sku TEXT,
  image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de cotizaciones
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  client_phone TEXT,
  client_email TEXT,
  notes TEXT,
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
  discount_total NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Detalle de cada cotización
CREATE TABLE IF NOT EXISTS quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12, 2) NOT NULL,
  discount_percent NUMERIC(5, 2) NOT NULL DEFAULT 0,
  line_total NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quote_items_quote_id ON quote_items(quote_id);

-- Habilitar Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;

-- Políticas: lectura pública de productos activos, escritura autenticada (ajusta según necesites)
CREATE POLICY "Productos activos visibles para todos"
  ON products FOR SELECT
  USING (active = true);

CREATE POLICY "Insertar cotizaciones"
  ON quotes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Leer cotizaciones"
  ON quotes FOR SELECT
  USING (true);

CREATE POLICY "Insertar items de cotización"
  ON quote_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Leer items de cotización"
  ON quote_items FOR SELECT
  USING (true);

-- Productos de ejemplo (opcional — borra si importas desde Excel)
INSERT INTO products (name, description, price, category, sku) VALUES
  ('Base Líquida Matte', 'Cobertura media-alta, acabado mate', 85000, 'Rostro', 'MC-BASE-001'),
  ('Corrector Creamy', 'Alta cobertura para ojeras', 45000, 'Rostro', 'MC-CORR-002'),
  ('Paleta Sombras Nude', '12 tonos neutros y shimmer', 120000, 'Ojos', 'MC-SOMB-003'),
  ('Máscara de Pestañas Volumen', 'Volumen extremo sin grumos', 55000, 'Ojos', 'MC-MASC-004'),
  ('Labial Líquido Mate', 'Larga duración, no transfiere', 38000, 'Labios', 'MC-LAB-005'),
  ('Brillo Labial Hidratante', 'Brillo suave con vitamina E', 32000, 'Labios', 'MC-BRIL-006'),
  ('Rubor en Polvo', 'Color natural, fácil difuminado', 48000, 'Rostro', 'MC-RUB-007'),
  ('Kit Brochas Esenciales', 'Set de 5 brochas profesionales', 95000, 'Accesorios', 'MC-BRO-008');
