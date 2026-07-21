-- Ejecuta esto en Supabase → SQL Editor → Run
-- Arregla permisos para que la app pueda leer productos con la anon key

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON TABLE products TO anon, authenticated;
GRANT SELECT, INSERT ON TABLE quotes TO anon, authenticated;
GRANT SELECT, INSERT ON TABLE quote_items TO anon, authenticated;

-- Asegura la política de lectura (si ya existe, ignora el error)
DROP POLICY IF EXISTS "Productos activos visibles para todos" ON products;
CREATE POLICY "Productos activos visibles para todos"
  ON products FOR SELECT
  TO anon, authenticated
  USING (active = true);
