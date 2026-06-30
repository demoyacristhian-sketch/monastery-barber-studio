"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp, Calendar, Users, AlertCircle, Bell,
  Sparkles, ChevronRight, Clock, Scissors,
} from "lucide-react";
import Link from "next/link";
import NuevaCitaModal from "./NuevaCitaModal";

type Cita = {
  id: string;
  fecha_hora: string;
  estado: string;
  precio_final: number | null;
  clientes:  { nombre: string } | null;
  servicios: { nombre: string } | null;
  barberos:  { nombre: string } | null;
};

type KPIs = {
  ingresosHoy:         number;
  reservadosHoy:       number;
  ingresosSemana:      number;
  totalClientes:       number;
  citasPendientes:     number;
  totalCitasHoy:       number;
  cancelacionesSemana: number;
  proximasCitas:       number;
};

const BADGE: Record<string, { label: string; cls: string }> = {
  pendiente:  { label: "Pendiente",  cls: "bg-amber-50 text-amber-700 ring-1 ring-amber-200"       },
  confirmada: { label: "Confirmada", cls: "bg-blue-50 text-blue-700 ring-1 ring-blue-200"           },
  completada: { label: "Completada", cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"  },
  cancelada:  { label: "Cancelada",  cls: "bg-zinc-100 text-zinc-500 ring-1 ring-zinc-200"          },
  no_show:    { label: "No asistió", cls: "bg-red-50 text-red-600 ring-1 ring-red-200"              },
};

// Formatea hora local extrayendo HH:MM directamente del ISO (evita desfase UTC)
function horaFmt(iso: string) {
  return new Date(iso).toLocaleTimeString("es-ES", {
    hour: "2-digit", minute: "2-digit", timeZone: "Europe/Madrid",
  });
}

function fechaFmt(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    weekday: "short", day: "numeric", month: "short", timeZone: "Europe/Madrid",
  });
}

function euros(n: number) {
  return n.toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
}

function titleCase(str: string) {
  return str.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function WeekBarChart({ ingresosPorDia }: { ingresosPorDia: number[] }) {
  const dias  = ["L", "M", "X", "J", "V", "S", "D"];
  const max   = Math.max(...ingresosPorDia, 1);
  const diaSemana = new Date().getDay();
  const hoyIdx    = diaSemana === 0 ? 6 : diaSemana - 1;

  return (
    <div className="flex items-end gap-1.5 h-14">
      {ingresosPorDia.map((val, i) => {
        const pct   = Math.max((val / max) * 100, 6);
        const esHoy = i === hoyIdx;
        return (
          <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
            <div className="w-full flex items-end" style={{ height: 40 }}>
              <div className="w-full rounded-t-sm transition-all"
                style={{ height: `${pct}%`, background: esHoy ? "#C9A84C" : "#e4e4e7" }} />
            </div>
            <span className={`text-[10px] ${esHoy ? "font-bold text-zinc-900" : "text-zinc-400"}`}>
              {dias[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardOverview({
  citasHoy,
  citasProximas,
  kpis,
  ingresosPorDia,
  nombreNegocio,
}: {
  citasHoy:       Cita[];
  citasProximas:  Cita[];
  kpis:           KPIs;
  ingresosPorDia: number[];
  nombreNegocio:  string;
}) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const router = useRouter();
  const ahora = new Date();
  const hora  = ahora.getHours();
  const saludo = hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches";

  const fechaStr = ahora.toLocaleDateString("es-ES", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const fecha = titleCase(fechaStr);

  return (
    <div className="p-6 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{saludo} <span>👋</span></h1>
          <p className="text-sm text-zinc-500 mt-0.5">{fecha} · {nombreNegocio}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button className="w-9 h-9 rounded-xl border border-zinc-200 bg-white flex items-center justify-center hover:bg-zinc-50 transition-colors">
            <Bell className="w-4 h-4 text-zinc-500" />
          </button>
          <button onClick={() => setModalAbierto(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "#C9A84C" }}>
            + Nueva cita
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Cobrado hoy"
          value={euros(kpis.ingresosHoy)}
          sub={kpis.reservadosHoy > 0 ? `+ ${euros(kpis.reservadosHoy)} reservado` : `${kpis.totalCitasHoy} citas hoy`}
          icon={TrendingUp} iconColor="text-violet-600" iconBg="bg-violet-50"
        />
        <KPICard
          label="Citas hoy"
          value={String(kpis.totalCitasHoy)}
          sub={`${kpis.citasPendientes} pendientes/confirmadas`}
          icon={Calendar} iconColor="text-blue-600" iconBg="bg-blue-50"
        />
        <KPICard
          label="Próximas citas"
          value={String(kpis.proximasCitas)}
          sub="en los próximos 30 días"
          icon={Clock} iconColor="text-amber-600" iconBg="bg-amber-50"
        />
        <KPICard
          label="Clientes"
          value={String(kpis.totalClientes)}
          sub={`${kpis.cancelacionesSemana} cancelaciones esta semana`}
          icon={Users} iconColor="text-emerald-600" iconBg="bg-emerald-50"
        />
      </div>

      {/* ── Grid principal ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Citas de hoy */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-zinc-400" />
              <h2 className="font-semibold text-zinc-900">Citas de hoy</h2>
              {kpis.totalCitasHoy > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-zinc-100 rounded-full text-xs font-medium text-zinc-600">
                  {kpis.totalCitasHoy}
                </span>
              )}
            </div>
            <Link href="/admin/citas"
              className="flex items-center gap-0.5 text-xs font-medium hover:opacity-80 transition-opacity"
              style={{ color: "#C9A84C" }}>
              Ver todas <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {citasHoy.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <Scissors className="w-8 h-8 text-zinc-200 mx-auto mb-3" />
              <p className="text-zinc-400 text-sm">No hay citas para hoy</p>
              <button onClick={() => setModalAbierto(true)}
                className="mt-3 text-xs font-medium hover:opacity-80"
                style={{ color: "#C9A84C" }}>
                + Crear primera cita del día
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-zinc-50/60">
                    {["Hora", "Cliente", "Servicio", "Barbero", "Estado", "Precio"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wide whitespace-nowrap first:px-6 last:px-6">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {citasHoy.map(c => {
                    const badge   = BADGE[c.estado] ?? BADGE.pendiente;
                    const inicial = (c.clientes?.nombre ?? "?").charAt(0).toUpperCase();
                    return (
                      <tr key={c.id} className="hover:bg-zinc-50/60 transition-colors">
                        <td className="px-6 py-3 font-medium tabular-nums text-zinc-900 whitespace-nowrap">{horaFmt(c.fecha_hora)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px] font-semibold text-zinc-500">{inicial}</span>
                            </div>
                            <span className="text-zinc-800 font-medium whitespace-nowrap">{c.clientes?.nombre ?? "—"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">{c.servicios?.nombre ?? "—"}</td>
                        <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">{c.barberos?.nombre  ?? "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${badge.cls}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-zinc-900 font-semibold tabular-nums whitespace-nowrap">
                          {c.precio_final != null ? euros(c.precio_final) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Panel derecho */}
        <div className="space-y-4">

          {/* Esta semana */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-zinc-900">Ingresos semana</h3>
              <span className="text-xs font-medium text-emerald-600">completadas</span>
            </div>
            <WeekBarChart ingresosPorDia={ingresosPorDia} />
            <div className="mt-4 pt-3 border-t border-zinc-100">
              <p className="text-xl font-bold text-zinc-900">{euros(kpis.ingresosSemana)}</p>
              <p className="text-xs text-zinc-400 mt-0.5">cobrado esta semana</p>
            </div>
          </div>

          {/* Próximas citas */}
          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <h3 className="font-semibold text-zinc-900 text-sm">Próximas citas</h3>
              </div>
              <Link href="/admin/citas" className="text-xs font-medium" style={{ color: "#C9A84C" }}>
                Ver todas
              </Link>
            </div>
            {citasProximas.length === 0 ? (
              <div className="px-5 py-6 text-center text-sm text-zinc-400">
                No hay citas programadas
              </div>
            ) : (
              <div className="divide-y divide-zinc-50">
                {citasProximas.slice(0, 6).map(c => {
                  const badge = BADGE[c.estado] ?? BADGE.pendiente;
                  return (
                    <div key={c.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="flex-shrink-0 text-center w-10">
                        <p className="text-xs font-bold text-zinc-900 tabular-nums">{horaFmt(c.fecha_hora)}</p>
                        <p className="text-[10px] text-zinc-400">{fechaFmt(c.fecha_hora)}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-zinc-900 truncate">{c.clientes?.nombre ?? "—"}</p>
                        <p className="text-[10px] text-zinc-400 truncate">{c.servicios?.nombre ?? "—"} · {c.barberos?.nombre ?? "—"}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {c.precio_final != null && (
                          <span className="text-xs font-semibold text-zinc-700 tabular-nums">{euros(c.precio_final)}</span>
                        )}
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sugerencia IA */}
          <div className="rounded-2xl p-5" style={{ background: "#f5f0ff" }}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4" style={{ color: "#7c3aed" }} />
              <span className="text-sm font-semibold" style={{ color: "#7c3aed" }}>Resumen del día</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "#6d28d9" }}>
              {kpis.totalCitasHoy > 0
                ? `Hoy tienes ${kpis.totalCitasHoy} cita${kpis.totalCitasHoy > 1 ? "s" : ""}. Cobrado: ${euros(kpis.ingresosHoy)}${kpis.reservadosHoy > 0 ? ` · Por cobrar: ${euros(kpis.reservadosHoy)}` : ""}.`
                : `Sin citas hoy. Tienes ${kpis.proximasCitas} citas en los próximos 30 días.`}
            </p>
          </div>

        </div>
      </div>

      {/* Modal Nueva Cita */}
      <NuevaCitaModal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        onExito={() => { setModalAbierto(false); router.refresh(); }}
      />
    </div>
  );
}

function KPICard({ label, value, sub, icon: Icon, iconColor, iconBg }: {
  label: string; value: string; sub: string;
  icon: React.ElementType; iconColor: string; iconBg: string;
}) {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-zinc-500 truncate">{label}</p>
          <p className="text-2xl font-bold text-zinc-900 mt-1.5 tabular-nums">{value}</p>
          <p className="text-xs text-zinc-500 mt-1">{sub}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}
