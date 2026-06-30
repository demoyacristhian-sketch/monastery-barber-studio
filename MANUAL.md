# Manual de uso — Monastery Barber Studio

Guía completa para el administrador del sistema. Explica cada sección del panel de control, cómo realizar las operaciones del día a día y cómo sacar el máximo partido al sistema.

---

## Acceso al sistema

### Entrar al panel de administración

1. Abre el navegador y ve a: **monastery-barber-studio.vercel.app/admin**
2. Si no has iniciado sesión, el sistema te redirigirá a la pantalla de login
3. Introduce tu email y contraseña de administrador
4. Haz clic en "Iniciar sesión"

> Nota: Si el botón de login no funciona, comprueba que las credenciales son correctas. El sistema tarda unos segundos en verificar la sesión.

### Cerrar sesión

En la parte inferior izquierda del menú lateral encontrarás tu perfil de administrador. Haz clic en el icono de salida (flecha hacia la derecha) para cerrar sesión de forma segura.

---

## Navegación general

El panel de administración tiene una barra lateral fija a la izquierda con todos los módulos disponibles:

- **Inicio** — Dashboard con el resumen del día
- **Reservas** — Gestión de todas las citas
- **Clientes** — Base de datos de clientes
- **Marketing** — Automatizaciones y campañas
- **Fidelización** — Programa de puntos y membresías
- **Finanzas** — Ingresos y métricas económicas
- **Equipo** — Gestión de barberos
- **Inventario** — Control de productos y stock
- **Mi Web** — Abre la web pública en una pestaña nueva
- **Configuración** — Ajustes del negocio

En la parte inferior del menú lateral puedes cambiar el **tema de color** del panel. Haz clic en "Tema de color" para ver las 8 opciones disponibles.

**Botón "Volver"**: al abrir cualquier sección, en la parte superior izquierda encontrarás un botón con una flecha (← Volver) para regresar a la pantalla anterior.

---

## Módulo 1: Inicio (Dashboard)

Al acceder al panel, el dashboard muestra un resumen instantáneo del negocio:

### Qué ves en el dashboard

**Fila superior — KPIs del día:**
- **Cobrado hoy**: suma de todos los cobros del día (citas completadas)
- **Citas hoy**: número de citas agendadas para hoy
- **Próximas citas**: citas confirmadas en los próximos 30 días
- **Clientes**: total de clientes en la base de datos

**Panel central — Citas de hoy:**
Muestra la lista de todas las citas del día con: hora, nombre del cliente, servicio, barbero asignado, estado y precio.

**Panel derecho — Ingresos de la semana:**
Gráfico de barras con los ingresos de cada día de la semana actual. La barra del día activo aparece resaltada.

Debajo del gráfico aparece un **resumen del día** con el total cobrado y por cobrar.

### Crear una nueva cita desde el dashboard

Haz clic en el botón dorado **"+ Nueva cita"** en la esquina superior derecha. Se abrirá un modal con el formulario de nueva cita (ver sección Reservas para más detalle).

---

## Módulo 2: Reservas

En esta sección gestionas todas las citas del negocio.

### Ver y filtrar citas

La tabla muestra todas las citas ordenadas por hora. Puedes filtrar por estado usando las pestañas superiores:
- **Todas** — Muestra todas las citas
- **Pendientes** — Citas sin confirmar
- **Confirmadas** — Citas confirmadas
- **Completadas** — Servicios realizados y cobrados
- **Canceladas** — Citas canceladas
- **No show** — Cliente no se presentó

También puedes **buscar** por nombre de cliente usando el buscador de la parte superior.

### Cambiar el estado de una cita

1. Localiza la cita en la tabla
2. Haz clic en el desplegable de la columna "Estado"
3. Selecciona el nuevo estado: Confirmada, Completada, Cancelada o No show

El cambio se guarda automáticamente.

### Eliminar una o varias citas

**Una cita**: haz clic en el icono de papelera a la derecha de la fila.

**Varias citas a la vez**:
1. Marca los checkboxes de las citas que quieres eliminar
2. Aparecerá una barra de acciones en la parte inferior
3. Haz clic en "Eliminar seleccionadas"

### Crear una nueva cita

Haz clic en **"+ Nueva cita"**. El modal tiene tres pasos:

**Paso 1 — Cliente:**
- Busca un cliente existente escribiendo su nombre o teléfono
- O crea uno nuevo rellenando nombre, teléfono y email

**Paso 2 — Servicio:**
- Selecciona el servicio de la lista desplegable
- Selecciona el barbero asignado
- Selecciona la sede

**Paso 3 — Fecha y precio:**
- Elige la fecha y hora de la cita
- Establece el precio final (se rellena automáticamente con el precio del servicio)
- Añade notas opcionales
- Selecciona el estado inicial (Pendiente o Confirmada)

Haz clic en **"Crear cita"** para guardar.

---

## Módulo 3: Clientes

### Lista de clientes

La página principal muestra todos los clientes con:
- **Total clientes**: número total en la base de datos
- **Clientes activos**: clientes con estado activo
- Buscador por nombre o teléfono
- Tabla con: avatar, nombre, teléfono, email, última visita, número de visitas, nivel de membresía y estado VIP

Haz clic en el nombre de cualquier cliente para abrir su ficha completa.

### Crear un nuevo cliente

Haz clic en **"+ Nuevo cliente"** en la esquina superior derecha. Rellena:
- Nombre (obligatorio)
- Teléfono
- Email
- Notas iniciales

Haz clic en "Guardar" para crear el cliente.

### Ficha individual del cliente

Al acceder a la ficha de un cliente verás:

**Cabecera:**
- Avatar circular con las iniciales y el color de su nivel (dorado para Gold, negro para Black, plateado para Silver)
- Nombre, teléfono y email
- Badge de nivel de membresía y VIP si corresponde
- Botón "Editar perfil" para modificar sus datos

**Editar datos del cliente:**
1. Haz clic en "Editar perfil"
2. Modifica nombre, teléfono, email o notas
3. Haz clic en "Guardar"

**Tarjeta de fidelidad:**
Muestra los 10 sellos del programa de puntos. Los sellos conseguidos aparecen como círculos negros con una estrella dorada; los pendientes como círculos grises.

- **Añadir/quitar sellos manualmente**: usa los botones "+" y "-" para ajustar el número de sellos
- **Canjear corte gratis**: cuando el cliente tiene 10 sellos, aparece el botón "Canjear corte gratis". Al hacer clic, los sellos se resetean a 0 y el cliente recibe la marca de VIP permanente

**Nivel de membresía:**
Usa el selector para asignar el nivel Silver, Gold o Black al cliente. Esto actualiza automáticamente los contadores del módulo de Fidelización.

**Toggle VIP:**
Activa o desactiva el estado VIP del cliente de forma manual, independientemente del canje de sellos.

**Toggle activo/inactivo:**
Marca al cliente como inactivo si ya no acude al negocio. Los clientes inactivos siguen en la base de datos pero se pueden filtrar.

**Historial de citas:**
Lista de todas las visitas del cliente con fecha, servicio, barbero, estado y precio cobrado.

**Galería de fotos:**
- Haz clic en el área de fotos para subir una nueva imagen del cliente
- Las fotos se almacenan de forma segura en la nube
- Haz clic en cualquier foto para verla a pantalla completa
- Haz clic en el icono de papelera sobre una foto para eliminarla

---

## Módulo 4: Fidelización

### Programa de sellos

Los clientes acumulan sellos con cada visita. Al llegar a 10 sellos pueden canjear un corte gratis. Puedes gestionar los sellos desde la ficha individual de cada cliente.

### Membresías

El negocio ofrece tres planes de membresía mensual:

| Plan | Precio | Cortes incluidos |
|------|--------|-----------------|
| Silver | 29 €/mes | 2 cortes |
| Gold | 49 €/mes | 4 cortes |
| Black | 79 €/mes | 8 cortes |

El MRR (ingresos recurrentes mensuales) se calcula automáticamente en base al número de clientes en cada plan.

### Panel de Fidelización

La página muestra:
- **Membresías activas**: total de clientes con plan activo
- **Tarjetas de sellos**: clientes con al menos 1 sello
- **Cortes gratis canjeados**: histórico total
- **MRR estimado**: ingresos fijos mensuales por membresías
- **Top 5 clientes** con más sellos y su progreso visual
- **Clientes sin actividad**: clientes sin sellos como señal de alerta

---

## Módulo 5: Finanzas

### Qué muestra el módulo

**KPIs principales:**
- Ingresos del mes actual (solo citas completadas)
- Ingresos del año en curso
- Total de citas del mes
- Ticket medio por cita

**Gráfico de los últimos 30 días:**
Barras que representan los ingresos de cada día. Pasa el ratón sobre cada barra para ver el detalle.

**Top servicios del mes:**
Los 5 servicios que más ingresos han generado este mes.

**Top barberos del mes:**
Los 5 barberos con más ingresos generados, con el número de citas completadas.

> Nota: Solo se contabilizan las citas con estado "completada".

---

## Módulo 6: Equipo

### Ver el equipo

La página muestra:
- **Barberos activos**: número de miembros del equipo activos
- **Citas del mes**: total de citas realizadas por el equipo este mes
- **Ingresos del mes**: suma de ingresos de todas las citas completadas
- **Comisión media**: media de las comisiones configuradas por barbero

**Tabla de rendimiento:**
Cada fila muestra para el mes en curso: nombre del barbero, citas completadas, ingresos generados, ticket medio y comisión estimada.

### Añadir un nuevo barbero

1. Haz clic en **"+ Añadir barbero"**
2. Rellena el nombre (obligatorio), email y selecciona la sede
3. Haz clic en "Guardar"

El nuevo barbero aparece en la lista y queda disponible para asignar citas.

### Desactivar un barbero

Usa el toggle "Activo/Inactivo" a la derecha de cada barbero para desactivarlo. Un barbero inactivo no aparece en el sistema de reservas pero conserva su historial.

---

## Módulo 7: Inventario

### Gestionar productos

La página muestra todos los productos con:
- Nombre y categoría
- Stock actual vs stock mínimo
- Precio de venta
- Estado activo/inactivo

Las filas con stock por debajo del mínimo se resaltan visualmente como alerta.

### Añadir un producto

1. Haz clic en **"+ Nuevo producto"**
2. Rellena: nombre, categoría, descripción (opcional), precio de compra, precio de venta, stock actual, stock mínimo y unidad de medida
3. Haz clic en "Guardar"

### Editar un producto

Haz clic en el icono de lápiz a la derecha de cualquier producto para editarlo en un modal.

### Eliminar un producto

Haz clic en el icono de papelera. Se pedirá confirmación antes de eliminar.

> Nota: Si aparece un mensaje de error al cargar el inventario, puede que la tabla no esté creada en la base de datos. Contacta con el desarrollador para configurarla.

---

## Módulo 8: Marketing

### Automatizaciones activas

El panel muestra las automatizaciones configuradas para el negocio:

| Automatización | Qué hace |
|---|---|
| Recordatorio 24h | Avisa al cliente 24 horas antes de su cita |
| Post-cita + reseña | Envía un mensaje de agradecimiento y pide una valoración en Google |
| Solicitud de reseña | Campaña específica para conseguir reseñas |
| 21 días inactivo | Contacta a clientes que llevan 3 semanas sin visitar |
| 30 días inactivo | Oferta especial para clientes con un mes de inactividad |
| Cumpleaños | Descuento especial el día del cumpleaños |

### Activar o desactivar una automatización

Usa el toggle a la derecha de cada automatización para activarla o desactivarla. El cambio es inmediato.

> Nota: Las automatizaciones están en modo de configuración. La integración con WhatsApp Business y el envío real de mensajes se activará en la siguiente fase del proyecto.

---

## Módulo 9: Configuración

### Información del negocio

Puedes actualizar los datos del negocio:
- **Nombre del negocio**: nombre que aparece en la web y comunicaciones
- **Teléfono**: número principal de contacto
- **Email**: email de contacto
- **Dirección**: dirección física de la sede principal
- **Instagram**: usuario sin @
- **WhatsApp**: número con código de país (ej: 34612345678)

Haz clic en **"Guardar cambios"** para aplicar.

### Horarios de apertura

Configura el horario semanal del negocio:
1. Activa o desactiva cada día con el toggle azul/gris
2. Para los días activos, establece la hora de apertura y cierre
3. Haz clic en **"Guardar horarios"**

### Servicios y precios

Esta sección muestra el catálogo completo de servicios organizado por categorías (Corte, Barba, Tratamiento, etc.) en una tabla alineada.

**Editar un servicio existente:**
1. Pasa el ratón sobre la fila del servicio que quieres editar
2. Haz clic en el icono de lápiz que aparece a la derecha
3. En el modal, modifica: nombre, precio, duración y/o categoría
4. Haz clic en **"Guardar cambios"**

**Activar o desactivar un servicio:**
Usa el toggle de la columna "Estado" para activar o desactivar un servicio. Los servicios inactivos no aparecen en el sistema de reservas ni en la web pública.

**Añadir un nuevo servicio:**
1. Haz clic en **"+ Añadir servicio"** en la parte superior derecha
2. Rellena: nombre (obligatorio), precio, duración en minutos y categoría
3. Haz clic en **"Guardar"**

> Consejo: Usa la misma categoría exacta (incluyendo mayúsculas) para que el servicio aparezca agrupado con los demás de esa categoría.

### Equipo (desde Configuración)

Muestra la lista de barberos con opciones de edición inline.

**Editar nombre o email**: haz clic directamente sobre el texto para editarlo. Aparecerá un campo de texto. Pulsa Enter o el icono de check para guardar.

**Añadir nuevo barbero**: haz clic en **"+ Añadir barbero"** y rellena el formulario.

### Sedes

Lista de las sedes activas con opciones de edición.

**Editar nombre o dirección**: haz clic sobre el texto para editarlo inline.

**Activar/desactivar sede**: usa el toggle de la derecha.

---

## Preguntas frecuentes

**¿Por qué no se guardan los horarios cuando recargo la página?**  
Los horarios actualmente se guardan en el navegador (localStorage). Si cambias de dispositivo o abres en modo incógnito, no los verás. Próximamente se guardarán en la base de datos de forma permanente.

**¿Puedo añadir fotos de los clientes desde el móvil?**  
Sí. La web es responsive. En la ficha del cliente puedes hacer una foto desde el móvil o seleccionar una de la galería y subirla directamente.

**¿Qué pasa si marco un cliente como VIP?**  
El cliente verá el badge 👑 VIP en su ficha. Cuando se loguea en la web, tiene acceso al Espacio VIP con contenido exclusivo.

**¿Puedo recuperar una cita eliminada?**  
No. La eliminación de citas es permanente. Asegúrate antes de eliminar.

**¿Qué diferencia hay entre "Cancelada" y "No show"?**  
"Cancelada" significa que el cliente o el negocio canceló la cita con antelación. "No show" significa que el cliente no se presentó sin avisar.

**¿Los precios del catálogo de servicios se actualizan en la web pública automáticamente?**  
Sí. Cuando editas un precio en Configuración → Servicios y precios, la web pública lo refleja en tiempo real.

**¿Cómo se calcula el MRR?**  
MRR (Monthly Recurring Revenue) = (N.º clientes Silver × 29€) + (N.º clientes Gold × 49€) + (N.º clientes Black × 79€)

---

## Contacto y soporte

Para dudas técnicas, errores o nuevas funcionalidades, contacta con:

**Nown — Cristhian De Moya**  
Email: demoyacristhian@gmail.com  
Proyecto: Monastery Barber Studio CRM  
