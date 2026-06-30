# DESARROLLO — Monastery Barber Studio

Registro técnico completo de todo el desarrollo del proyecto desde el inicio hasta el estado actual (Junio 2026).

---

## Fase 1 — Arquitectura inicial y bootstrap

### Punto de partida

El proyecto se inició con `create-next-app` usando Next.js 16.2.9 con App Router, TypeScript y Tailwind CSS 4. Se eligió Supabase como backend por su capacidad de gestionar autenticación, base de datos PostgreSQL y almacenamiento de ficheros desde una sola plataforma.

### Configuración de Supabase

Se crearon tres clientes de Supabase con distintos niveles de acceso:

**`lib/supabase-admin.ts`** — Cliente con `SUPABASE_SERVICE_ROLE_KEY`. Omite Row Level Security y permite operaciones privilegiadas. Solo se invoca en Server Actions y API Routes (nunca en el cliente).

**`lib/supabase-server.ts`** — Cliente SSR para componentes de servidor que respetan RLS.

**`lib/supabase-browser.ts`** — Cliente para componentes cliente (`"use client"`) usando la anon key pública.

### Diseño de base de datos

Se definieron las tablas iniciales en Supabase:

```sql
-- Tablas base
sedes          (id, nombre, direccion, ciudad, activa, telefono)
barberos       (id, nombre, sede_id, activo, email, cargo, comision)
servicios      (id, nombre, categoria, precio, duracion_minutos, activo)
horarios_barbero (barbero_id, dia_semana, hora_inicio, hora_fin, activo)
clientes       (id, nombre, email, telefono, created_at)
citas          (id, cliente_id, barbero_id, servicio_id, sede_id, fecha_hora, estado)
```

Se ejecutó `supabase/seed.sql` para poblar las sedes (San Quirce y Recoletos), barberos iniciales y el catálogo completo de 29 servicios organizados en categorías: corte, barba, tratamiento, estetica y pack.

### Middleware de autenticación

`middleware.ts` protege las rutas `/admin/*` y `/espacio-vip`. Verifica la sesión de Supabase Auth y redirige a `/login` si no está autenticada. Las rutas públicas como `/reservas`, `/servicios` y `/equipo` pasan sin verificación.

---

## Fase 2 — Web pública

### Landing page

Se construyó la landing principal con los siguientes componentes:
- `Hero.tsx` — Cabecera con CTA de reservas y banner de marca
- `Servicios.tsx` — Catálogo de servicios por categoría con precios
- `Barberos.tsx` — Cards del equipo de barberos
- `Sedes.tsx` — Mapa y datos de contacto de cada sede
- `Footer.tsx` — Footer con links e información legal

### Sistema de reservas online

El flujo de reserva funciona en varios pasos:
1. El cliente selecciona sede
2. Elige el barbero disponible en esa sede
3. Elige el servicio
4. Selecciona fecha y hora disponible
5. Introduce sus datos (nombre, teléfono, email)
6. Confirma la reserva

La disponibilidad se calcula en tiempo real a través de dos API Routes:
- `/api/reservas/datos` — devuelve servicios y barberos activos
- `/api/reservas/disponibilidad` — devuelve huecos libres cruzando `horarios_barbero` con `citas` existentes

La acción `crearCitaConCliente` en `app/actions/reservas.ts` crea o recupera al cliente por teléfono y luego inserta la cita.

### Área cliente

Páginas privadas accesibles solo con login de Supabase Auth:
- `/espacio-vip` — Contenido exclusivo para miembros VIP
- `/mi-ritual` — Área personal con historial de citas
- `/la-orden` — Historia y filosofía de la marca

---

## Fase 3 — Panel de administración

### Layout y navegación

`app/admin/layout.tsx` estructura el panel con:
- Sidebar fijo (`AdminNav.tsx`) con los 8 módulos de navegación
- Área de contenido principal scrollable

`AdminNav.tsx` incluye:
- Logo de Monastery con enlace al dashboard
- Navegación principal: Inicio, Reservas, Clientes, Marketing, Fidelización, Finanzas, Equipo, Inventario
- Navegación secundaria: Mi Web (link externo), Configuración
- Selector de 8 temas de color (persiste en localStorage)
- Botón de cerrar sesión con `supabase.auth.signOut()`
- Adaptación responsive con menú hamburguesa en mobile

### Sistema de temas

`AdminTheme.tsx` define 8 paletas de fondo para el panel admin, seleccionables desde el sidebar. El tema se persiste en `localStorage` y se aplica a todo el layout mediante un `Context`.

---

## Fase 4 — Módulos del panel admin

### Dashboard (`/admin`)

`DashboardOverview.tsx` muestra:
- KPIs del día: cobrado, citas, próximas citas, clientes totales
- Tabla "Citas de hoy" con hora, cliente, servicio, barbero y estado
- Gráfico semanal de ingresos (barras por día L-D)
- Panel "Próximas citas" (sidebar derecho)
- Resumen del día con IA (texto generado dinámicamente)
- Botón "+ Nueva cita" prominente

### Módulo Reservas (`/admin/citas`)

`CitasAdmin.tsx` gestiona todas las citas con:
- Tabla con columnas: hora, cliente, servicio, barbero, sede, estado, precio
- Filtros por estado: todas, pendientes, confirmadas, completadas, canceladas, no_show
- Búsqueda por nombre de cliente
- Cambio de estado individual por dropdown
- Selección múltiple con checkbox para eliminación masiva
- Modal "+ Nueva cita" (`NuevaCitaModal.tsx`) que permite:
  - Buscar cliente existente o crear uno nuevo
  - Seleccionar servicio, barbero, sede, fecha/hora
  - Establecer precio y notas

Server Actions usados: `actualizarEstadoCita`, `eliminarCita`, `eliminarCitas`, `crearCitaConCliente`.

### Módulo Clientes (`/admin/clientes`)

**Lista principal** (`ClientesAdmin.tsx`):
- KPIs: total clientes, clientes activos, cancelaciones
- Buscador por nombre o teléfono
- Tabla con: avatar de iniciales, nombre, teléfono, email, última visita, total visitas, nivel membresía, estado VIP
- Acceso a la ficha individual

**Ficha individual** (`/admin/clientes/[id]` → `ClienteFicha.tsx`):
- Header con gradiente dorado, botón "Editar perfil" y botón "Volver"
- Avatar circular con color según nivel (dorado Gold, negro Black, plateado Silver)
- Badge de nivel y VIP
- Editor inline de nombre, email, teléfono, notas
- Tarjeta de fidelidad: 10 sellos visuales (círculos negros con estrella dorada), botón "Canjear corte gratis"
- Toggle VIP manual
- Selector de nivel de membresía (Silver / Gold / Black)
- Historial de citas con estado y precio
- Galería de fotos (subida y eliminación desde Supabase Storage)
- Toggle activo/inactivo

Server Actions: `actualizarCliente`, `actualizarSellosCliente`, `canjearCorteGratis`, `toggleVipCliente`, `toggleActivoCliente`, `subirFotoCliente`, `eliminarFotoCliente`.

### Módulo Fidelización (`/admin/fidelizacion`)

Página servidor con datos en tiempo real:
- **KPIs**: membresías activas, tarjetas con sellos, cortes gratis canjeados, MRR (ingresos recurrentes de membresías)
- **Planes de membresía**: Silver (29€/2 cortes), Gold (49€/4 cortes), Black (79€/8 cortes) con contador de miembros activos por plan
- **Tarjetas de sellos**: top 5 clientes con sus sellos visualizados, badge "🎁 Corte gratis" cuando llegan a 10
- **Clientes sin actividad**: tabla de clientes sin sellos como alerta de riesgo
- **Diseño de sellos**: círculo negro `bg-zinc-900` con estrella dorada `fill-[#C9A84C]` para sellos activos; círculo gris `bg-zinc-200` para vacíos
- Botón "Configurar programa" (placeholder para futura configuración)

### Módulo Finanzas (`/admin/finanzas`)

Página servidor con cálculos en tiempo real:
- **KPIs**: ingresos del mes, ingresos del año, citas del mes, ticket medio
- **Gráfico de barras** de los últimos 30 días (ingresos diarios, altura proporcional al máximo)
- **Top servicios**: los 5 servicios con más ingresos ese mes
- **Top barberos**: los 5 barberos con más ingresos ese mes, con número de citas completadas

### Módulo Equipo (`/admin/equipo`)

`EquipoAdmin.tsx`:
- Cards de KPIs: barberos activos, citas este mes, ingresos del mes, comisión media
- Tabla de rendimiento mensual: barbero, citas completadas, ingresos generados, ticket medio, comisión estimada
- Modal "+ Nuevo barbero": nombre, email, sede, cargo
- Toggle activo/inactivo por barbero

### Módulo Inventario (`/admin/inventario`)

`InventarioAdmin.tsx`:
- KPIs: total productos, productos en stock, alertas de stock mínimo, valor total
- Tabla de productos con: nombre, categoría, stock actual, stock mínimo, precio de venta, estado activo
- Fila de alerta visual (fondo rojo tenue) cuando `stock_actual < stock_minimo`
- Modal "+ Nuevo producto": nombre, categoría, descripción, precio compra/venta, stock actual/mínimo, unidad
- Modal de edición por producto
- Eliminación de productos
- Estado vacío explicativo cuando la tabla `inventario` no existe aún en la BD

### Módulo Marketing (`/admin/marketing`)

Panel de automatizaciones con estado en cliente (pendiente integración real):
- KPIs: campañas activas, clientes en programa, tasa de apertura, conversión
- Lista de automatizaciones con toggle on/off:
  - Recordatorio 24h antes de la cita
  - Post-cita + solicitud de reseña
  - Clientes 21 días inactivos (reactivación)
  - Clientes 30 días inactivos (oferta especial)
  - Felicitación de cumpleaños con descuento
- Botón "+ Nueva campaña" (placeholder)
- Sección de métricas de rendimiento

### Módulo Configuración (`/admin/config`)

`ConfigAdmin.tsx` con varias secciones:

**Información del negocio**: formulario con 6 campos (nombre, teléfono, email, dirección, Instagram, WhatsApp). Guarda en la tabla `sedes` via `actualizarSede`.

**Horarios de apertura**: 7 toggles (uno por día de la semana) con selectores de hora de apertura y cierre. Se persiste en `localStorage` (pendiente migración a BD).

**Grid de accesos rápidos**: 4 tarjetas (Landing pública, Notificaciones, Facturación, Servicios y precios).

**Servicios y precios** (CRUD completo):
- Tabla unificada con `table-fixed` para alineación perfecta entre categorías
- Columnas: Nombre (42%), Precio (16%), Duración (16%), Estado (16%), Editar (10%)
- Cabeceras de categoría embebidas como filas separadoras dentro de la misma tabla
- Botón de lápiz por fila (visible al hover) abre modal de edición
- Modal con campos: nombre, precio €, duración min, categoría
- Botón "+ Añadir servicio" en la cabecera de la sección
- Toggle activo/inactivo inline
- Actualización optimista en Supabase via `actualizarServicio` y `crearServicio`

**Equipo**: lista de barberos con edición inline de nombre y email, toggle activo, modal para añadir nuevo barbero.

**Sedes**: lista de sedes con edición inline de nombre y dirección, toggle activa/inactiva.

---

## Fase 5 — Mejoras de UI y experiencia

### Botón BackButton

Se creó `components/admin/BackButton.tsx` — componente cliente reutilizable que ejecuta `router.back()`. Se añadió en la cabecera de todas las secciones del admin:
- Reservas, Clientes, Marketing, Fidelización, Finanzas, Equipo, Inventario, Configuración
- La ficha de cliente (`ClienteFicha.tsx`) ya tenía su propio botón "Volver" independiente

### Corrección de colores

El rediseño de algunas secciones (Fidelización, Equipo, Inventario, Finanzas, Configuración) había introducido erroneamente colores violeta (`#7C3AED`, clases `violet-*`) en lugar del dorado de marca (`#C9A84C`). Se corrigió con reemplazos masivos via `sed` en los 5 ficheros afectados.

### Diseño de sellos de fidelidad

Los sellos del programa de fidelidad se rediseñaron para mostrar:
- **Sello activo**: círculo negro (`bg-zinc-900`) con estrella dorada (`fill-[#C9A84C]`)
- **Sello vacío**: círculo gris plano (`bg-zinc-200`) sin icono

### Eliminación del banner de plan

Se eliminó el banner "Plan Business / Gestionar" que aparecía tanto en `ConfigAdmin.tsx` como en el sidebar de `AdminNav.tsx`, ya que no corresponde al modelo de negocio actual.

---

## Fase 6 — Server Actions y gestión de datos

### Patrón de Server Actions

Todas las mutaciones de datos del admin se realizan via Next.js Server Actions en `app/actions/admin.ts`. El patrón:

```typescript
"use server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase-admin";

export async function actualizarX(id: string, data: {...}) {
  const admin = createAdminClient();
  const { error } = await (admin.from("tabla") as any).update(data).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/ruta");
  return { ok: true };
}
```

El cast `as any` se usa en columnas añadidas con `ALTER TABLE` que aún no están en el caché de PostgREST. Para actualizar el caché: `NOTIFY pgrst, 'reload schema'` en el SQL Editor de Supabase.

### Server Actions implementadas

| Acción | Descripción |
|---|---|
| `actualizarEstadoCita` | Cambia estado de una cita |
| `eliminarCita` / `eliminarCitas` | Elimina una o varias citas |
| `crearCitaConCliente` | Crea cita + cliente si no existe |
| `actualizarCliente` | Edita datos del cliente |
| `crearCliente` | Crea nuevo cliente |
| `toggleActivoCliente` | Activa/desactiva cliente |
| `actualizarSellosCliente` | Actualiza sellos de fidelidad |
| `canjearCorteGratis` | Canjea 10 sellos → resetea + marca VIP |
| `toggleVipCliente` | Toggle VIP manual |
| `subirFotoCliente` | Sube foto a Supabase Storage |
| `obtenerFotosCliente` | Lista fotos del cliente |
| `eliminarFotoCliente` | Elimina foto de Storage |
| `actualizarServicio` | Edita servicio |
| `crearServicio` | Crea nuevo servicio |
| `actualizarBarbero` | Edita barbero |
| `crearBarbero` | Crea nuevo barbero |
| `actualizarSede` | Edita sede (nombre, dirección, contacto) |
| `crearProducto` | Crea producto de inventario |
| `actualizarProducto` | Edita producto |
| `eliminarProducto` | Elimina producto |
| `buscarClientes` | Búsqueda de clientes (para modal nueva cita) |
| `obtenerDatosFormularioCita` | Carga servicios, barberos y sedes para el modal |

---

## Estado actual del proyecto (Junio 2026)

### Funcionalidades completadas

- [x] Web pública completa con reservas online
- [x] Sistema de autenticación para clientes y admin
- [x] Dashboard admin con KPIs en tiempo real
- [x] CRM completo de clientes con ficha individual
- [x] Programa de fidelización con sellos y membresías
- [x] Módulo de finanzas con gráficos
- [x] Gestión de equipo con rendimiento mensual
- [x] Control de inventario con alertas
- [x] Panel de automatizaciones de marketing
- [x] Configuración completa del negocio
- [x] CRUD completo de servicios y precios
- [x] Galería de fotos por cliente
- [x] Temas de color personalizables
- [x] Responsive design (mobile + desktop)
- [x] Botón de navegación atrás en todas las secciones

### Pendiente / Roadmap

- [ ] Migrar horarios de apertura de `localStorage` a tabla en BD
- [ ] Notificaciones reales por WhatsApp (integración con Twilio/WhatsApp Business API)
- [ ] Automatizaciones reales (triggers en Supabase o cron jobs)
- [ ] Módulo de facturación y generación de tickets
- [ ] App móvil nativa para el administrador
- [ ] Multi-tenant (soporte para múltiples peluquerías con la misma plataforma)

---

## Decisiones técnicas clave

### Por qué `(admin.from("tabla") as any)`

PostgREST (la API de Supabase) genera un esquema de tipos en base al esquema de la BD en el momento de la conexión. Cuando se añaden columnas con `ALTER TABLE` sin reiniciar PostgREST, el cliente TypeScript no reconoce las nuevas columnas y lanza errores de tipos. El cast `as any` es el workaround hasta que se recarga el caché con `NOTIFY pgrst, 'reload schema'`.

### Por qué `export const dynamic = "force-dynamic"`

Las páginas del admin leen datos de Supabase en tiempo real. Sin esta directiva, Next.js podría cachear las respuestas en build time y mostrar datos desactualizados. `force-dynamic` garantiza que cada petición renderiza la página con datos frescos.

### Por qué Server Actions en lugar de API Routes

Los Server Actions de Next.js permiten ejecutar código servidor directamente desde componentes cliente sin crear un endpoint HTTP explícito. Simplifican el flujo de datos, manejan automáticamente la serialización y permiten usar `revalidatePath` para invalidar el caché de Next.js tras una mutación.

### Separación admin/browser del cliente Supabase

La `SUPABASE_SERVICE_ROLE_KEY` tiene acceso irrestricto a toda la BD (bypasa RLS). Exponer esta clave en el cliente sería una vulnerabilidad crítica. Por eso se mantiene tres ficheros de cliente distintos, y el cliente admin solo se instancia en contextos de servidor.
