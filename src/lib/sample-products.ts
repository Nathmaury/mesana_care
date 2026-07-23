import type { Product } from "./types";

/** Catálogo local de respaldo (misma data que supabase/seed-from-inversion.sql) */
export const SAMPLE_PRODUCTS: Product[] = [
  { id: "1", name: "Toallas desmaquillantes", description: null, price: 5000, cost_price: 2000, stock: 6, category: "Cuidado", sku: "MC-INV-001", image_url: null, active: true },
  { id: "2", name: "Kit Boiaqua", description: null, price: 60000, cost_price: 30000, stock: 1, category: "Kits", sku: "MC-INV-002", image_url: null, active: true },
  { id: "3", name: "Tónico Ordinary", description: null, price: 33000, cost_price: 16500, stock: 1, category: "Cuidado", sku: "MC-INV-003", image_url: null, active: true },
  { id: "4", name: "Serum nicotinamida", description: null, price: 12000, cost_price: 3800, stock: 1, category: "Cuidado", sku: "MC-INV-004", image_url: null, active: true },
  { id: "5", name: "Lip gloss", description: null, price: 10000, cost_price: 4700, stock: 3, category: "Labios", sku: "MC-INV-005", image_url: null, active: true },
  { id: "6", name: "Papel arroz", description: null, price: 6000, cost_price: 2800, stock: 6, category: "Rostro", sku: "MC-INV-006", image_url: null, active: true },
  { id: "7", name: "Sellador", description: null, price: 20000, cost_price: 10000, stock: 2, category: "Rostro", sku: "MC-INV-007", image_url: null, active: true },
  { id: "8", name: "Lip gloss engoll", description: null, price: 11000, cost_price: 5500, stock: 3, category: "Labios", sku: "MC-INV-008", image_url: null, active: true },
  { id: "9", name: "Velo facial", description: null, price: 3000, cost_price: 800, stock: 6, category: "Cuidado", sku: "MC-INV-009", image_url: null, active: true },
  { id: "10", name: "Pimple patch", description: null, price: 12000, cost_price: 6000, stock: 3, category: "Cuidado", sku: "MC-INV-010", image_url: null, active: true },
  { id: "11", name: "Kit viajero", description: null, price: 15000, cost_price: 7500, stock: 2, category: "Kits", sku: "MC-INV-011", image_url: null, active: true },
  { id: "12", name: "Molde hielo", description: null, price: 14000, cost_price: 7000, stock: 3, category: "Accesorios", sku: "MC-INV-012", image_url: null, active: true },
  { id: "13", name: "Tónico de rosas", description: null, price: 13000, cost_price: 6500, stock: 2, category: "Cuidado", sku: "MC-INV-013", image_url: null, active: true },
  { id: "14", name: "Contorno ojos crema", description: null, price: 7000, cost_price: 2600, stock: 5, category: "Cuidado", sku: "MC-INV-014", image_url: null, active: true },
  { id: "15", name: "Tinta benefit", description: null, price: 30000, cost_price: 15000, stock: 2, category: "Rostro", sku: "MC-INV-015", image_url: null, active: true },
];

export const BRAND = {
  name: process.env.NEXT_PUBLIC_BRAND_NAME ?? "Mesana Care",
  tagline: "Makeup Store",
  phone: process.env.NEXT_PUBLIC_BRAND_PHONE ?? "+57 300 000 0000",
  email: process.env.NEXT_PUBLIC_BRAND_EMAIL ?? "contacto@mesanacare.com",
  instagram: "@mesanacare",
  logoHorizontal: "/logo-horizontal.png",
  logoVertical: "/logo-vertical.png",
  logoIcon: "/logo-icon.png",
};
