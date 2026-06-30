import { createAdminClient } from "@/lib/supabase-admin";
import { TrendingUp, DollarSign, Calendar, Users } from "lucide-react";
import BackButton from "@/components/admin/BackButton";

export const dynamic = "force-dynamic";

export default async function FinanzasPage() {
  const admin = createAdminClient();
  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString();
  const inicioAnio = new Date(ahora.getFullYear(), 0, 1).toISOString();
  const hace30 = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: citasMes }, { data: citasAnio }, { data: citasDiarias }] = await Promise.all([
    admin.from("citas").select("id, precio_final, estado, fecha_hora, servicios(nombre), barberos(nombre)")
      .gte("fecha_hora", inicioMes).neq("estado", "cancelada"),
    admin.from("citas").select("id, precio_final, estado")
      .gte("fecha_hora", inicioAnio).eq("estado", "completada"),
    admin.from("citas").select("id, precio_final, estado, fecha_hora")
      .gte("fecha_hora", hace30).eq("estado", "completada"),
  ]);

  const completadasMes = (citasMes ?? []).filter((c: any) => c.estado === "completada");
  const ingresosMes    = completadasMes.reduce((s: number, c: any) => s + (c.precio_final ?? 0), 0);
  const ingresosAnio   = (citasAnio ?? []).reduce((s: number, c: any) => s + (c.precio_final ?? 0), 0);
  const totalCitasMes  = citasMes?.length ?? 0;
  const ticketMedio    = completadasMes.length > 0 ? ingresosMes / completadasMes.length : 0;

  // Ingresos por día (últimos 30 días)
  const porDia: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(ahora.getTime() - i * 24 * 60 * 60 * 1000);
    porDia[d.toISOString().slice(0, 10)] = 0;
  }
  (citasDiarias ?? []).forEach((c: any) => {
    const dia = c.fecha_hora.slice(0, 10);
    if (porDia[dia] !== undefined) porDia[dia] += c.precio_final ?? 0;
  });
  const diasLabels = Object.keys(porDia);
  const maxVal = Math.max(...Object.values(porDia), 1);

  // Por servicio
  const porServicio: Record<string, { count: number; total: number }> = {};
  completadasMes.forEach((c: any) => {
    const s = (c.servicios as any)?.nombre ?? "Sin servicio";
    if (!porServicio[s]) porServicio[s] = { count: 0, total: 0 };
    porServicio[s].count++;
    porServicio[s].total += c.precio_final ?? 0;
  });

  // Por barbero
  const porBarbero: Record<string, { count: number; total: number }> = {};
  completadasMes.forEach((c: any) => {
    const b = (c.barberos as any)?.nombre ?? "Sin asignar";
    if (!porBarbero[b]) porBarbero[b] = { count: 0, total: 0 };
    porBarbero[b].count++;
    porBarbero[b].total += c.precio_final ?? 0;
  });

  function euros(n: number) { return n.toLocaleString("es-ES", { style:"currency", currency:"EUR" }); }
  const mesLabel = ahora.toLocaleDateString("es-ES", { month:"long", year:"numeric" });

  return (
    <div className="p-6 space-y-6">
      <div>
        <BackButton />
        <h1 className="text-2xl font-bold text-zinc-900">Finanzas</h1>
        <p className="text-sm text-zinc-500 mt-0.5 capitalize">{mesLabel}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Ingresos del mes",    value: euros(ingresosMes),    icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Ingresos del año",    value: euros(ingresosAnio),   icon: TrendingUp, color: "text-blue-600",    bg: "bg-blue-50"    },
          { label: "Citas este mes",      value: String(totalCitasMes), icon: Calendar,   color: "text-[#C9A84C]",  bg: "bg-[#C9A84C]/5"  },
          { label: "Ticket medio",        value: euros(ticketMedio),    icon: Users,      color: "text-amber-600",   bg: "bg-amber-50"   },
        ].map(s => (
          <div key={s.label} className="bg-white border border-zinc-200 rounded-2xl px-5 py-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-medium">{s.label}</p>
              <p className="text-xl font-bold text-zinc-900 mt-0.5 tabular-nums">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfica de barras 30 días */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6">
        <h2 className="font-semibold text-zinc-900 mb-1">Ingresos diarios</h2>
        <p className="text-xs text-zinc-400 mb-6">Últimos 30 días (citas completadas)</p>
        <div className="flex items-end gap-1 h-40">
          {diasLabels.map((dia, i) => {
            const val = porDia[dia];
            const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
            const esHoy = dia === ahora.toISOString().slice(0,10);
            return (
              <div key={dia} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div className="absolute bottom-full mb-1 hidden group-hover:flex bg-zinc-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                  {new Date(dia + "T12:00:00").toLocaleDateString("es-ES", { day:"numeric", month:"short" })}: {euros(val)}
                </div>
                <div
                  className={`w-full rounded-t transition-all ${esHoy ? "bg-[#C9A84C]" : val > 0 ? "bg-zinc-800" : "bg-zinc-100"}`}
                  style={{ height: `${Math.max(pct, val > 0 ? 4 : 1)}%` }}
                />
                {(i === 0 || i === 14 || i === 29) && (
                  <span className="text-[9px] text-zinc-400 absolute -bottom-5">
                    {new Date(dia + "T12:00:00").toLocaleDateString("es-ES", { day:"numeric", month:"short" })}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Desglose */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Por servicio */}
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100">
            <h2 className="font-semibold text-zinc-900">Por servicio</h2>
          </div>
          {Object.keys(porServicio).length === 0 ? (
            <p className="px-6 py-8 text-zinc-400 text-sm text-center">Sin datos este mes</p>
          ) : (
            <div className="divide-y divide-zinc-50">
              {Object.entries(porServicio).sort((a,b) => b[1].total - a[1].total).map(([nombre, data]) => (
                <div key={nombre} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-800 font-medium">{nombre}</p>
                    <p className="text-xs text-zinc-400">{data.count} cita{data.count !== 1 ? "s" : ""}</p>
                  </div>
                  <p className="font-semibold text-zinc-900 tabular-nums">{euros(data.total)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Por barbero */}
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100">
            <h2 className="font-semibold text-zinc-900">Por barbero</h2>
          </div>
          {Object.keys(porBarbero).length === 0 ? (
            <p className="px-6 py-8 text-zinc-400 text-sm text-center">Sin datos este mes</p>
          ) : (
            <div className="divide-y divide-zinc-50">
              {Object.entries(porBarbero).sort((a,b) => b[1].total - a[1].total).map(([nombre, data]) => (
                <div key={nombre} className="px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-500">
                      {nombre.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-zinc-800 font-medium">{nombre}</p>
                      <p className="text-xs text-zinc-400">{data.count} cita{data.count !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-zinc-900 tabular-nums">{euros(data.total)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
