# Mesana Care — Cotizador

App web responsive (PC y móvil) para crear cotizaciones de maquillaje, descargarlas en **PDF** o **imagen**, y guardarlas en **Supabase**.

## Características

- Catálogo de productos con búsqueda y filtros por categoría
- Cotizador con cantidades y descuentos por producto
- Datos del cliente (nombre, teléfono, email, notas)
- Vista previa de cotización con colores pasteles lila de la marca
- Exportar a PDF o PNG
- Guardar cotizaciones en Supabase
- Instalable como PWA en el teléfono



## Estructura del proyecto

```
mesana-care/
├── src/
│   ├── app/              # Páginas Next.js
│   ├── components/       # UI del cotizador
│   └── lib/              # Supabase, export PDF, tipos
├── supabase/
│   └── schema.sql        # Script de base de datos
├── public/
│   ├── manifest.json     # PWA
│   └── icon.svg
└── .env.example          # Variables de entorno
```

---

## Colores de marca

| Token | Color | Uso |
|-------|-------|-----|
| brand-50 | `#faf5ff` | Fondo |
| brand-200 | `#e9d5ff` | Bordes |
| brand-400 | `#c084fc` | Acentos |
| brand-500 | `#a855f7` | Botones |
| brand-700 | `#7e22ce` | Texto principal |

---
