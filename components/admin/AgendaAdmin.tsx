"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Cita = {
  id: string;
  fecha_hora: string;
  estado: string;
  precio_final: number | null;
  clientes: { nombre: string } | null;
  barberos: { id: string; nombre: string } | null;
  servicios: { nombre: string; duracion_minutos: number } | null;
};

const ESTADO_COLOR: Record<string, string> = {
  pendiente:  "border-l-amber-400 bg-amber-50",
  confirmada: "border-l-blue-400 bg-blue-50",
  completada: "border-l-emerald-500 bg-emerald-50",
  cancelada:  "border-l-zinc-300 bg-zinc-100 opacity-50",
  no_show:    "border-l-zinc-400 bg-zinc-100 opacity-50",
};

const ESTADO_TEXT: Record<string, string> = {
  pendiente:  "text-amber-800",
  confirmada: "text-blue-800",
  completada: "text-emerald-800",
  cancelada:  "text-zinc-500",
  no_show:    "text-zinc-500",
};

const HORAS = Array.from({ length: 13 }, (_, i) => i + 9);
const DIAS_LABEL = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function AgendaAdmin({
  citas, barberos, lunes, filtrosBarbero,
}: {
  citas: Cita[];
  barberos: { id: string; nombre: string }[];
  lunes: string;
  filtrosBarbero?: string;
}) {
  const router     = useRouter();
  const lunesDate  = new Date(lunes);

  const dias = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(lunesDate);
    d.setDate(lunesDate.getDate() + i);
    return d;
  });

  function nav(offset: number) {
    const d = new Date(lunesDate);
    d.setDate(d.getDate() + offset);
    const q = new URLSearchParams();
    q.set("semana", d.toISOString().slice(0, 10));
    if (filtrosBarbero) q.set("barbero", filtrosBarbero);
    router.push(`/admin/agenda?${q.toString()}`);
  }

  const citasF = filtrosBarbero
    ? citas.filter(c => c.barberos?.id === filtrosBarbero)
    : citas;

  const hoy = new Date().toISOString().slice(0, 10);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Agenda</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          {lunesDate.toLocaleDateString("es-ES", { day:"numeric", month:"long" })}
          {" — "}
          {dias[5].toLocaleDateString("es-ES", { day:"numeric", month:"long", year:"numeric" })}
        </p>
      </div>

      {/* Controles */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => nav(-7)}
            className="p-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => router.push("/admin/agenda")}
            className="px-3 py-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 text-xs font-medium transition-colors"
          >
            Hoy
          </button>
          <button
            onClick={() => nav(7)}
            className="p-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <select
          value={filtrosBarbero ?? ""}
          onChange={e => {
            const q = new URLSearchParams();
            q.set("semana", lunesDate.toISOString().slice(0,10));
            if (e.target.value) q.set("barbero", e.target.value);
            router.push(`/admin/agenda?${q.toString()}`);
          }}
          className="px-3 py-2 text-sm border border-zinc-200 rounded-lg bg-white text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]"
        >
          <option value="">Todos los barberos</option>
          {barberos.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
        </select>
      </div>

      {/* Grid */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden overflow-x-auto">
        {/* Cabecera días */}
        <div className="grid grid-cols-7 border-b border-zinc-100 min-w-[700px]">
          <div className="px-3 py-3 text-xs text-zinc-400" />
          {dias.map((d, i) => {
            const dStr   = d.toISOString().slice(0, 10);
            const esHoy  = dStr === hoy;
            const cc     = citasF.filter(c => c.fecha_hora.slice(0,10) === dStr);
            return (
              <div key={i} className={`px-3 py-3 border-l border-zinc-100 text-center ${esHoy ? "bg-[#C9A84C]/5" : ""}`}>
                <p className={`text-xs font-medium ${esHoy ? "text-[#C9A84C]" : "text-zinc-500"}`}>{DIAS_LABEL[i]}</p>
                <p className={`text-lg font-bold mt-0.5 ${esHoy ? "text-zinc-900" : "text-zinc-400"}`}>{d.getDate()}</p>
                {cc.length > 0 && (
                  <p className="text-[10px] text-zinc-400 mt-0.5">{cc.length} cita{cc.length > 1 ? "s" : ""}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Filas hora */}
        <div className="min-w-[700px]">
          {HORAS.map(hora => (
            <div key={hora} className="grid grid-cols-7 border-b border-zinc-50 min-h-[56px]">
              <div className="px-3 py-2 text-xs text-zinc-400 pt-3 flex-shrink-0">{hora}:00</div>
              {dias.map((d, i) => {
                const dStr  = d.toISOString().slice(0, 10);
                const esHoy = dStr === hoy;
                const cc    = citasF.filter(c => {
                  const ch = new Date(c.fecha_hora);
                  return c.fecha_hora.slice(0,10) === dStr && ch.getHours() === hora;
                });
                return (
                  <div key={i} className={`border-l border-zinc-50 px-1.5 py-1 space-y-1 ${esHoy ? "bg-[#C9A84C]/3" : ""}`}>
                    {cc.map(cita => (
                      <div
                        key={cita.id}
                        className={`border-l-2 pl-2 pr-1 py-1 rounded-r text-[10px] leading-tight ${ESTADO_COLOR[cita.estado] ?? ""}`}
                      >
                        <p className={`font-semibold truncate ${ESTADO_TEXT[cita.estado] ?? "text-zinc-800"}`}>
                          {cita.clientes?.nombre ?? "—"}
                        </p>
                        <p className="text-zinc-500 truncate">{cita.servicios?.nombre}</p>
                        {cita.barberos && (
                          <p className="text-zinc-400 truncate">{cita.barberos.nombre}</p>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
