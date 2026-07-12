# CLAUDE.md — Monastery Barber Studio

Manual de procedimientos, arquitectura y ejecuciones del proyecto.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16.2.9 — App Router |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS 4 |
| Backend / Auth / DB | Supabase (PostgreSQL + Auth + Storage) |
| Despliegue | Vercel (scope: cdmlabs) |
| Dominio | monasterybarbers.es |
| Repositorio | github.com/demoyacristhian-sketch/monastery-barber-studio |

---

## Estructura de rutas

```
app/
├── (main)/           # Web pública
│   ├── page.tsx      # Landing — Hero + Servicios + Membresías + Ofertas + Sedes + Footer
│   ├── servicios/    # Catálogo completo de servicios
│   ├── productos/    # Catálogo de productos premium (implementado jul-2026)
│   ├── sedes/        # Información de las dos sedes de Valladolid
│   ├── equipo/       # Barberos del equipo
│   └── reservas/     # Sistema de reserva online (multi-step)
├── (vip)/            # Espacio VIP para clientes miembros
│   ├── espacio-vip/  # Dashboard del cliente VIP
│   ├── perfil/       # Perfil y tarjeta de sellos
│   └── citas/        # Historial de citas del cliente
├── admin/            # Panel de administración CRM (protegido por rol staff)
│   ├── page.tsx      # Dashboard con KPIs del día
│   ├── citas/        # Gestión de todas las citas
│   ├── clientes/     # Lista y fichas individuales de clientes
│   ├── fidelizacion/ # Programa de membresías y sellos
│   ├── finanzas/     # Ingresos, gráficos, top servicios/barberos
│   ├── equipo/       # Rendimiento y gestión de barberos
│   ├── inventario/   # Gestión de stock de productos
│   ├── marketing/    # Automatizaciones de comunicación
│   └── configuracion/# Configuración general del negocio
├── (login)/
│   ├── login/        # Login para Espacio VIP (clientes)
│   └── admin-login/  # Login exclusivo para administradores (staff)
└── api/
    ├── reservas/datos/          # Servicios y barberos activos
    ├── reservas/disponibilidad/ # Huecos libres calculados en tiempo real
    ├── reservas/oferta-contador/
    └── reservas/perfil/
```

---

## Autenticación y seguridad

### Clientes de Supabase (tres niveles)

- **`lib/supabase-admin.ts`** — Usa `SUPABASE_SERVICE_ROLE_KEY`. Omite RLS. Solo en Server Actions y API Routes. **NUNCA exponer al browser.**
- **`lib/supabase-server.ts`** — Cliente SSR que respeta RLS. Para componentes de servidor.
- **`lib/supabase-browser.ts`** — Usa la anon key pública. Para componentes cliente (`"use client"`).

### Middleware (`middleware.ts`)

Protege dos grupos de rutas:

```
/admin/*        → requiere app_metadata.role === "staff"
                  → redirige a /admin-login si no autorizado

/espacio-vip/*  → requiere sesión activa de Supabase Auth
                  → redirige a /login si no autenticado
```

Las rutas públicas (/, /servicios, /productos, /sedes, /equipo, /reservas, /login, /admin-login) pasan sin verificación.

### Variables de entorno requeridas

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # solo server-side, nunca al cliente
```

---

## Despliegue en producción

### Comando de despliegue

```bash
cd /Users/cristhiandaviddemoyallanos/monastery-web
vercel --prod --scope cdmlabs
```

### Verificar rutas tras despliegue

```bash
for path in / /servicios /productos /sedes /equipo /reservas /login /admin-login /espacio-vip /admin; do
  code=$(curl -s -o /dev/null -w "%{http_code}" -L "https://www.monasterybarbers.es${path}")
  echo "$code  $path"
done
```

Respuestas esperadas:
- `200` → todas las rutas públicas
- `307` → /espacio-vip y /admin (redirigen al login si no autenticado — correcto)

---

## Base de datos Supabase

### Tablas principales

```sql
sedes             (id, nombre, direccion, ciudad, activa, telefono)
barberos          (id, nombre, sede_id, activo, email, cargo, comision)
servicios         (id, nombre, categoria, precio, duracion_minutos, activo)
horarios_barbero  (barbero_id, dia_semana, hora_inicio, hora_fin, activo)
clientes          (id, nombre, email, telefono, fecha_nacimiento, created_at)
citas             (id, cliente_id, barbero_id, servicio_id, sede_id, fecha_hora, estado, precio, notas)
inventario        (id, nombre, categoria, descripcion, precio_venta, precio_compra,
                   stock_actual, stock_minimo, unidad, activo, created_at)
```

### Scripts SQL en `/supabase/`

- `seed.sql` — Datos iniciales: sedes, barberos, servicios
- `fix_completo_proyecto_correcto.sql` — Correcciones y migraciones acumuladas
- `fix_servicios_barberos.sql` — Ajustes de servicios y barberos
- `sedes_update.sql` — Actualización de datos de sedes

---

## Catálogo de productos (`/productos`)

### Imágenes

Las imágenes de producto están en `/public/images/shop/` (directorio lowercase — crítico en Vercel/Linux):

```
beard-care-oil.jpg                 (Morfose Ossion — 12€)
beard-serum.jpg                    (Morfose Ossion — 10€)
hair-styling-powder.jpg            (Morfose Ossion — 13€)
spray-voluminador.jpg              (Tahe Nº333 oscuro — 17€)
spray-voluminador-transparente.jpg (Tahe Nº331 transparente — 17€)
```

> ⚠️ El directorio `/public/images/Productos/` (P mayúscula) contiene los originales pero el componente usa `/images/shop/`. No cambiar: macOS es case-insensitive pero Vercel (Linux) es case-sensitive — usar siempre `/images/shop/`.

### Componente

`components/Productos.tsx` — Catálogo con:
- Grid responsive: 1 col (mobile) → 2 col (sm) → 3+2 centrados en desktop (CSS grid 6 columnas)
- Cards con hover animado, badge de categoría (dorado, fuera de la imagen), precio y descripción
- CTA de WhatsApp con mensaje pre-rellenado: `wa.me/34642861499`
- Sección informativa de pago (Bizum o efectivo) y recogida en sede

### Inventario CRM

Los 5 productos están en la tabla `inventario` de Supabase con `stock_actual: 0`. El admin actualiza las unidades desde `/admin/inventario`.

---

## Correcciones críticas

### 1. Logout de admin redirigía al login VIP

- **Archivo:** `components/admin/AdminNav.tsx`
- **Causa:** `router.push("/login")` apuntaba a la Zona VIP.
- **Fix:** Cambiado a `router.push("/admin-login")`.

### 2. Imágenes 404 en producción (Vercel)

- **Causa:** macOS es case-insensitive — `Productos` y `productos` son el mismo directorio. Vercel (Linux, case-sensitive) devuelve 404 si el path no coincide exactamente.
- **Fix:** Nuevo directorio `public/images/shop/` (lowercase sin ambigüedad). Imágenes exportadas con `sips`. Componente actualizado a `/images/shop/`.

### 3. Badges superpuestos sobre las imágenes

- **Causa:** `position: absolute; top: 4; left: 4` sobre la imagen, ilegible.
- **Fix:** Badge movido al área de contenido (debajo del separador dorado), con línea dorada + texto uppercase `#C9A84C`.

---

## Convenciones de código

- **Componentes servidor:** sin directiva, acceden a Supabase directamente con `createServerClient()` o `createAdminClient()`.
- **Componentes cliente:** `"use client"` obligatorio para cualquier hook.
- **Server Actions** (`app/actions/`): usar `createAdminClient()` para operaciones privilegiadas.
- **Rutas API** en tiempo real: añadir `export const dynamic = "force-dynamic"` para evitar caché de Vercel.
- **Imágenes en public:** siempre lowercase en nombre de directorio y fichero — nunca depender de la insensibilidad de macOS.

---

## Comandos del proyecto

```bash
# Desarrollo local
cd /Users/cristhiandaviddemoyallanos/monastery-web
npm run dev          # localhost:3000

# Build
npm run build

# Deploy producción
vercel --prod --scope cdmlabs

# Git
git add <archivos>
git commit -m "feat: descripción"
git push origin main
```

---

## Historial de implementaciones

| Fecha | Implementación |
|-------|---------------|
| Jun 2026 | Bootstrap Next.js + Supabase, landing pública, sistema de reservas online multi-step |
| Jun 2026 | Panel admin CRM completo: dashboard, citas, clientes, finanzas, equipo, inventario, marketing |
| Jun 2026 | Espacio VIP: login, historial de citas, tarjeta de sellos del cliente |
| Jun 2026 | Módulo de fidelización: membresías Silver/Gold/Black, tarjetas de 10 sellos |
| Jun 2026 | Campo fecha de nacimiento en reservas + descuento cumpleaños 50% |
| Jun 2026 | Política de privacidad RGPD + checkbox obligatorio en reservas |
| Jun 2026 | Membresías en home, ofertas L-V, fix redirección infinita admin, fix caché API |
| Jul 2026 | Sección /productos: catálogo de 5 productos premium con fotos, precios, CTA WhatsApp |
| Jul 2026 | Integración inventario CRM: 5 productos cargados en tabla inventario de Supabase |
| Jul 2026 | Fix: logout admin redirigía a /login (VIP) → corregido a /admin-login |
| Jul 2026 | Fix: imágenes productos 404 en Vercel por case-sensitivity → directorio /images/shop/ |
| Jul 2026 | Fix: badges de producto rediseñados — movidos fuera de imagen, legibles y profesionales |
