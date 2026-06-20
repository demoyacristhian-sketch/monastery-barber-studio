import { createAdminClient } from "@/lib/supabase-admin";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard | Admin Monastery" };
export const revalidate = 60;

async function getStats() {
  const admin = createAdminClient();
  const hoy   = new Date().toISOString().slice(0, 10);
  const lunes  = (() => {
    const d = new Date();
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d.toISOString().slice(0, 10);
  })();
  const mesInicio = new Date().toISOString().slice(0, 7) + "-01";

  const [
    { count: citasHoy },
    { count: citasPendientes },
    { count: totalClientes },
    { count: clientesSemana },
    citasMes,
    ultimasCitas,
  ] = await Promise.all([
    admin.from("citas").select("*", { count: "exact", head: true })
      .gte("fecha_hora", `${hoy}T00:00:00`).lte("fecha_hora", `${hoy}T23:59:59`),
    admin.from("citas").select("*", { count: "exact", head: true })
      .eq("estado", "pendiente"),
    admin.from("clientes").select("*", { count: "exact", head: true }),
    admin.from("clientes").select("*", { count: "exact", head: true })
      .gte("created_at", `${lunes}T00:00:00`),
    admin.from("citas").select("precio_final")
      .eq("estado", "completada")
      .gte("fecha_hora", `${mesInicio}T00:00:00`),
    admin.from("citas")
      .select("id, fecha_hora, estado, precio_final, clientes(nombre), barberos(nombre), servicios(nombre)")
      .order("fecha_hora", { ascending: false })
      .limit(8),
  ]);

  const ingresosMes = (citasMes.data ?? []).reduce((s: number, c: any) => s + (c.precio_final ?? 0), 0);

  return {
    citasHoy:        citasHoy ?? 0,
    citasPendientes: citasPendientes ?? 0,
    totalClientes:   totalClientes ?? 0,
    clientesSemana:  clientesSemana ?? 0,
    ingresosMes,
    ultimasCitas:    ultimasCitas.data ?? [],
  };
}

const ESTADO_ESTILOS: Record<string, string> = {
  pendiente:  "text-yellow-400 bg-yellow-950/30",
  confirmada: "text-blue-400 bg-blue-950/30",
  completada: "text-green-400 bg-green-950/30",
  cancelada:  "text-red-400 bg-red-950/30",
  no_show:    "text-gray-400 bg-gray-950/30",
};

export default async function AdminDashboard() {
  const { citasHoy, citasPendientes, totalClientes, clientesSemana, ingresosMes, ultimasCitas } = await getStats();

  const stats = [
    { label: "Citas hoy",        value: citasHoy,        sub: "programadas"         },
    { label: "Pendientes",       value: citasPendientes, sub: "por confirmar",  alert: citasPendientes > 0 },
    { label: "Clientes totales", value: totalClientes,   sub: "registrados"         },
    { label: "Nuevos esta semana",value: clientesSemana, sub: "desde el lunes"      },
    { label: "Ingresos del mes", value: `${ingresosMes}€`, sub: "citas completadas" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-[#444] text-sm mt-1">
          {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className={`p-5 border ${s.alert ? "border-yellow-600/40 bg-yellow-950/10" : "border-[#111] bg-[#0a0a0a]"}`}>
            <p className={`text-2xl font-bold mb-1 ${s.alert ? "text-yellow-400" : "text-white"}`}>{s.value}</p>
            <p className="text-[#888] text-xs font-medium">{s.label}</p>
            <p className="text-[#444] text-[10px] mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Últimas citas */}
      <div className="border border-[#111] bg-[#0a0a0a]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#111]">
          <h2 className="text-sm font-medium text-white">Últimas citas</h2>
          <a href="/admin/citas" className="text-xs text-[#C9A84C] hover:underline">Ver todas →</a>
        </div>
        <div className="divide-y divide-[#0f0f0f]">
          {ultimasCitas.length === 0 ? (
            <p className="px-6 py-8 text-[#444] text-sm text-center">Sin citas registradas aún.</p>
          ) : (
            ultimasCitas.map((cita: any) => (
              <div key={cita.id} className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-white text-sm font-medium">{(cita.clientes as any)?.nombre ?? "—"}</p>
                  <p className="text-[#555] text-xs mt-0.5">
                    {(cita.servicios as any)?.nombre} · {(cita.barberos as any)?.nombre}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-[#555] text-xs">
                    {new Date(cita.fecha_hora).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                    {" "}
                    {new Date(cita.fecha_hora).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  {cita.precio_final && (
                    <p className="text-[#888] text-xs">{cita.precio_final}€</p>
                  )}
                  <span className={`text-[10px] px-2 py-0.5 ${ESTADO_ESTILOS[cita.estado] ?? "text-[#555]"}`}>
                    {cita.estado}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
