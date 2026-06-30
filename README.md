# Monastery Barber Studio — CRM & Web

Sistema completo de gestión para **Monastery Barber Studio** (Valladolid), desarrollado como SaaS a medida por **Nown** (Cristhian De Moya).

**Producción:** https://monastery-barber-studio.vercel.app  
**Admin:** https://monastery-barber-studio.vercel.app/admin

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16.2.9 (App Router, Turbopack) |
| Lenguaje | TypeScript 5 |
| UI | Tailwind CSS 4 + Lucide React |
| Base de datos | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email/password) |
| Storage | Supabase Storage (fotos de clientes) |
| Despliegue | Vercel (producción continua) |
| Runtime | React 19 |

---

## Estructura del proyecto

```
monastery-web/
├── app/
│   ├── (main)/              # Web pública del cliente
│   │   ├── page.tsx         # Landing home
│   │   ├── reservas/        # Sistema de reservas online
│   │   ├── servicios/       # Catálogo de servicios
│   │   ├── equipo/          # Página del equipo
│   │   ├── sedes/           # Localizaciones
│   │   ├── espacio-vip/     # Área VIP privada
│   │   ├── mi-ritual/       # Área personal del cliente
│   │   ├── la-orden/        # Historia de la marca
│   │   └── login/           # Login de clientes
│   ├── admin/               # Panel de administración
│   │   ├── page.tsx         # Dashboard principal
│   │   ├── citas/           # Gestión de reservas
│   │   ├── clientes/        # CRM clientes + ficha individual
│   │   ├── fidelizacion/    # Programa de sellos y membresías
│   │   ├── finanzas/        # Ingresos, KPIs y gráficos
│   │   ├── equipo/          # Barberos y rendimiento
│   │   ├── inventario/      # Control de stock
│   │   ├── marketing/       # Automatizaciones
│   │   └── config/          # Configuración del negocio
│   ├── actions/
│   │   ├── admin.ts         # Server Actions del panel admin
│   │   └── reservas.ts      # Server Actions de reservas
│   ├── api/
│   │   ├── reservas/datos/  # API disponibilidad barberos/servicios
│   │   └── reservas/disponibilidad/ # API huecos libres
│   └── auth/callback/       # Callback OAuth Supabase
├── components/
│   ├── admin/
│   │   ├── AdminNav.tsx     # Sidebar navegación + temas
│   │   ├── AdminTheme.tsx   # Sistema de 8 temas de color
│   │   ├── BackButton.tsx   # Botón volver reutilizable
│   │   ├── CitasAdmin.tsx   # Tabla gestión citas
│   │   ├── ClienteFicha.tsx # Perfil completo del cliente
│   │   ├── ClientesAdmin.tsx # Lista CRM clientes
│   │   ├── ConfigAdmin.tsx  # Configuración del negocio
│   │   ├── DashboardOverview.tsx # KPIs del dashboard
│   │   ├── EquipoAdmin.tsx  # Gestión barberos
│   │   ├── InventarioAdmin.tsx # Gestión inventario
│   │   ├── NuevaCitaModal.tsx # Modal nueva cita
│   │   └── AgendaAdmin.tsx  # Vista de agenda
│   ├── Hero.tsx             # Sección hero pública
│   ├── Navbar.tsx           # Navegación pública
│   ├── Reservas.tsx         # Flujo reservas público
│   ├── Servicios.tsx        # Catálogo servicios público
│   ├── Barberos.tsx         # Sección equipo público
│   ├── Footer.tsx
│   ├── AuthForm.tsx         # Formulario autenticación
│   └── AreaCliente.tsx      # Área privada cliente
├── lib/
│   ├── supabase-admin.ts    # Cliente Supabase con service role (SOLO server)
│   ├── supabase-server.ts   # Cliente Supabase SSR (server)
│   ├── supabase-browser.ts  # Cliente Supabase (browser)
│   └── database.types.ts    # Tipos generados de Supabase
├── supabase/
│   └── seed.sql             # Datos iniciales (sedes, barberos, servicios)
├── public/
│   └── images/logo.svg      # Logo Monastery
└── middleware.ts            # Protección rutas /admin y /espacio-vip
```

---

## Base de datos (Supabase)

### Tablas principales

| Tabla | Descripción |
|---|---|
| `sedes` | Localizaciones del negocio (San Quirce, Recoletos) |
| `barberos` | Equipo de barberos con sede y horarios |
| `servicios` | Catálogo de servicios con precio y duración |
| `horarios_barbero` | Disponibilidad por día y franja horaria |
| `clientes` | CRM completo: datos, sellos VIP, nivel membresía |
| `citas` | Reservas vinculando cliente + servicio + barbero |
| `inventario` | Control de stock de productos |

### Columnas extendidas en `clientes`

Añadidas con `ALTER TABLE` tras el diseño inicial:
- `sellos` (int) — puntos del programa de fidelidad (0-10)
- `vip` (boolean) — cliente VIP (canjeó corte gratis)
- `nivel` (text) — membresía: `silver` | `gold` | `black`
- `activo` (boolean) — cliente activo/inactivo
- `notas` (text) — notas internas del administrador

### Columnas extendidas en `citas`

- `notas` (text) — observaciones de la cita
- `precio_final` (numeric) — precio cobrado
- `duracion_minutos` (int) — duración del servicio

---

## Configuración de entorno

Crea un archivo `.env.local` en la raíz con:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

> **Importante:** `SUPABASE_SERVICE_ROLE_KEY` NUNCA debe exponerse al cliente. Solo se usa en `lib/supabase-admin.ts` y en Server Actions/API Routes.

---

## Instalación y desarrollo local

```bash
# Clonar el repositorio
git clone https://github.com/cristhiandm/monastery-barber-studio.git
cd monastery-barber-studio

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.local.example .env.local
# → Editar con tus claves de Supabase

# Iniciar servidor de desarrollo
npm run dev
```

Abre http://localhost:3000

---

## Despliegue en Vercel

```bash
vercel --prod --yes
```

---

## Marca y diseño

| Token | Valor |
|---|---|
| Color principal | `#C9A84C` (dorado Monastery) |
| Color hover | `#B8964A` |
| Color navy | `#0D1F3C` |
| Fuente | Geist (Next.js default) |
| Sidebar | 8 temas de color seleccionables |

---

## Funcionalidades principales

### Web pública
- Landing page con hero, servicios, equipo y sedes
- Sistema de reservas online con selección de barbero, servicio y franja horaria
- Área cliente privada con historial de citas
- Espacio VIP para clientes premium
- Zona "Mi Ritual" — rituales y filosofía de la marca

### Panel Admin (`/admin`)
- **Dashboard** — KPIs diarios: cobrado, citas del día, próximas citas, clientes activos
- **Reservas** — Tabla con filtros, cambio de estado, eliminación masiva, modal nueva cita
- **Clientes** — CRM: búsqueda, ficha individual, historial de visitas, galería de fotos, sellos, VIP, membresías
- **Fidelización** — Programa de sellos 0-10 (10 = corte gratis), membresías Silver/Gold/Black con MRR
- **Finanzas** — Ingresos mensuales/anuales, ticket medio, gráfico de barras 30 días, top servicios y barberos
- **Equipo** — Rendimiento mensual por barbero, comisiones, creación y edición
- **Inventario** — CRUD completo de productos, alertas de stock mínimo
- **Marketing** — Panel de automatizaciones con toggles de activación
- **Configuración** — Info del negocio, horarios semanales, servicios/precios (CRUD), equipo, sedes

---

## Seguridad

- Rutas `/admin/*` protegidas por middleware (verificación de sesión Supabase Auth)
- `SUPABASE_SERVICE_ROLE_KEY` exclusivo de server-side a través de `createAdminClient()`
- Las fotos de clientes se almacenan en Supabase Storage con acceso controlado
- Row Level Security configurado en todas las tablas de Supabase

---

## Créditos

Desarrollado por **Nown** — Cristhian De Moya  
Cliente: **Monastery Barber Studio** — Valladolid, España  
Año: 2026
