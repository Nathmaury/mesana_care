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

---

## Paso 1 — Instalar y probar en local

```bash
cd mesana-care
npm install
cp .env.example .env.local
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Sin Supabase configurado, la app funciona en **modo demo** con productos de ejemplo.

---

## Paso 2 — Crear la base de datos en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta gratuita.
2. Clic en **New Project** → elige nombre (`mesana-care`), contraseña y región.
3. Espera ~2 minutos a que se cree el proyecto.
4. Ve a **SQL Editor** → **New query**.
5. Copia y pega todo el contenido de `supabase/schema.sql` y ejecuta (**Run**).
6. Ve a **Project Settings** → **API** y copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
7. Pega esos valores en tu archivo `.env.local`.

Reinicia el servidor (`npm run dev`). El banner de "modo demo" desaparecerá cuando detecte productos en Supabase.

### Importar productos desde Excel

**Opción A — Manual (recomendada para empezar)**

1. En Excel, organiza columnas así:

   | name | description | price | category | sku |
   |------|-------------|-------|----------|-----|
   | Base Líquida | ... | 85000 | Rostro | MC-001 |

2. Guarda como **CSV (UTF-8)**.
3. En Supabase → **Table Editor** → tabla `products` → **Import data from CSV**.

**Opción B — Desde Supabase directamente**

1. **Table Editor** → `products` → **Insert row** para agregar uno a uno.

**Cuando me pases tu Excel/imagen**, actualizo `sample-products.ts` o te genero el CSV listo para importar.

---

## Paso 3 — Subir el repo a GitHub

### 3.1 Crear cuenta y repositorio

1. Crea cuenta en [github.com](https://github.com) si no tienes.
2. Clic en **+** → **New repository**.
3. Nombre: `mesana-care`
4. Visibilidad: **Private** (recomendado) o Public.
5. **No** marques "Add README" (ya tenemos uno).
6. Clic en **Create repository**.

### 3.2 Subir el código desde tu PC

Abre terminal en la carpeta del proyecto:

```bash
cd mesana-care

git init
git add .
git commit -m "Initial commit: cotizador Mesana Care"

git branch -M main
git remote add origin https://github.com/TU-USUARIO/mesana-care.git
git push -u origin main
```

> Reemplaza `TU-USUARIO` con tu usuario de GitHub. Te pedirá login (usuario + token personal).

### Crear un Personal Access Token (si GitHub lo pide)

1. GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**.
2. **Generate new token** → marca `repo`.
3. Copia el token y úsalo como contraseña al hacer `git push`.

---

## Paso 4 — Desplegar en Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión con tu cuenta de **GitHub**.
2. Clic en **Add New** → **Project**.
3. Importa el repositorio `mesana-care`.
4. Vercel detecta Next.js automáticamente. No cambies nada en Build Settings.
5. En **Environment Variables**, agrega:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | tu URL de Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | tu anon key |
   | `NEXT_PUBLIC_BRAND_NAME` | Mesana Care |
   | `NEXT_PUBLIC_BRAND_PHONE` | tu WhatsApp |
   | `NEXT_PUBLIC_BRAND_EMAIL` | tu email |

6. Clic en **Deploy**.
7. En ~1 minuto tendrás una URL como `mesana-care.vercel.app`.

### Dominio personalizado (opcional)

En Vercel → tu proyecto → **Settings** → **Domains** → agrega `cotizador.mesanacare.com` (o el que uses).

---

## Paso 5 — Usar en el teléfono

1. Abre la URL de Vercel en Chrome/Safari del teléfono.
2. **Android (Chrome):** menú ⋮ → "Agregar a pantalla de inicio".
3. **iPhone (Safari):** botón compartir → "Agregar a pantalla de inicio".

La app se abre como una app nativa gracias al `manifest.json`.

---

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

## Próximos pasos sugeridos

- [ ] Pasarme tu Excel para cargar productos reales
- [ ] Agregar logo de Mesana Care en `public/logo.png`
- [ ] Panel admin para editar productos sin Supabase UI
- [ ] Enviar cotización por WhatsApp con un clic

---

## Soporte

Si algo falla en el deploy, revisa:
1. Variables de entorno en Vercel
2. Que `schema.sql` se ejecutó sin errores en Supabase
3. Logs en Vercel → **Deployments** → **View Function Logs**
