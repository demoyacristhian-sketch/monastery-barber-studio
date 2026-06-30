import { createAdminClient } from "@/lib/supabase-admin";
import DashboardOverview from "@/components/admin/DashboardOverview";

export const dynamic = "force-dynamic";

function startOfWeek(d: Date) {
  const day  = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const lunes = new Date(d);
  lunes.setDate(d.getDate() + diff);
  lunes.setHours(0, 0, 0, 0);
  return lunes;
}

export default async function AdminDashboard() {
  const admin  = createAdminClient();
  const ahora  = new Date();

  // Rango de hoy en UTC (el servidor corre en UTC, los timestamps de Supabase son UTC)
  const hoyStr    = ahora.toISOString().slice(0, 10);
  const mananaStr = new Date(ahora.getTime() + 86_400_000).toISOString().slice(0, 10);

  // Próximos 30 días para citas futuras
  const en30Dias = new Date(ahora.getTime() + 30 * 86_400_000).toISOString();

  const lunes  = startOfWeek(ahora);
  const domingo = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);
  domingo.setHours(23, 59, 59, 999);

  const [
    { data: citasHoy },
    { data: clientes },
    { data: citasSemana },
    { data: citasProximas },
    { data: sedes },
  ] = await Promise.all([
    admin
      .from("citas")
      .select("id, estado, precio_final, fecha_hora, clientes(nombre), servicios(nombre), barberos(nombre)")
      .gte("fecha_hora", `${hoyStr}T00:00:00`)
      .lte("fecha_hora", `${hoyStr}T23:59:59`)
      .order("fecha_hora"),
    admin.from("clientes").select("id"),
    admin
      .from("citas")
      .select("id, precio_final, estado, fecha_hora")
      .gte("fecha_hora", lunes.toISOString())
      .lte("fecha_hora", domingo.toISOString()),
    // Citas de mañana en adelante (próximos 30 días)
    admin
      .from("citas")
      .select("id, estado, precio_final, fecha_hora, clientes(nombre), servicios(nombre), barberos(nombre)")
      .gte("fecha_hora", `${mananaStr}T00:00:00`)
      .lte("fecha_hora", en30Dias)
      .neq("estado", "cancelada")
      .order("fecha_hora")
      .limit(50),
    admin.from("sedes").select("nombre").limit(1),
  ]);

  const citasHoyArr      = (citasHoy      ?? []) as any[];
  const citasSemanaArr   = (citasSemana   ?? []) as any[];
  const citasProximasArr = (citasProximas ?? []) as any[];

  // Ingresos: completadas = confirmado/cobrado; reservados = pendiente+confirmada
  const ingresosHoy = citasHoyArr
    .filter(c => c.estado === "completada")
    .reduce((s: number, c) => s + (c.precio_final ?? 0), 0);

  const reservadosHoy = citasHoyArr
    .filter(c => c.estado === "confirmada" || c.estado === "pendiente")
    .reduce((s: number, c) => s + (c.precio_final ?? 0), 0);

  const pendientes = citasHoyArr
    .filter(c => c.estado === "pendiente" || c.estado === "confirmada").length;

  const cancelacionesSemana = citasSemanaArr
    .filter(c => c.estado === "cancelada").length;

  const ingresosPorDia = Array(7).fill(0);
  citasSemanaArr
    .filter(c => c.estado === "completada")
    .forEach(c => {
      const dia = new Date(c.fecha_hora).getDay();
      const idx = dia === 0 ? 6 : dia - 1;
      ingresosPorDia[idx] += c.precio_final ?? 0;
    });

  const ingresosSemana = ingresosPorDia.reduce((s: number, v: number) => s + v, 0);
  const nombreNegocio  = (sedes as any)?.[0]?.nombre ?? "Monastery Barber Studio";

  return (
    <DashboardOverview
      citasHoy={citasHoyArr}
      citasProximas={citasProximasArr}
      nombreNegocio={nombreNegocio}
      ingresosPorDia={ingresosPorDia}
      kpis={{
        ingresosHoy,
        reservadosHoy,
        ingresosSemana,
        totalClientes:   clientes?.length ?? 0,
        citasPendientes: pendientes,
        totalCitasHoy:   citasHoy?.length ?? 0,
        cancelacionesSemana,
        proximasCitas:   citasProximasArr.length,
      }}
    />
  );
}
