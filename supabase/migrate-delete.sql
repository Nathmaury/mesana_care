-- Permisos para borrar cotizaciones y ventas
-- Ejecuta en Supabase → SQL Editor → Run

GRANT DELETE ON TABLE quotes TO anon, authenticated;
GRANT DELETE ON TABLE quote_items TO anon, authenticated;
GRANT DELETE ON TABLE sales TO anon, authenticated;

DROP POLICY IF EXISTS "Borrar cotizaciones" ON quotes;
DROP POLICY IF EXISTS "Borrar items de cotización" ON quote_items;
DROP POLICY IF EXISTS "Borrar ventas" ON sales;

CREATE POLICY "Borrar cotizaciones"
  ON quotes FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "Borrar items de cotización"
  ON quote_items FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "Borrar ventas"
  ON sales FOR DELETE TO anon, authenticated USING (true);
