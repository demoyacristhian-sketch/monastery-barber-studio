"use client";

import { useRouter } from "next/navigation";

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
  pendiente:  "border-l-yellow-500 bg-yellow-950/20",
  confirmada: "border-l-blue-500 bg-blue-950/20",
  completada: "border-l-green-600 bg-green-950/20",
  cancelada:  "border-l-[#333] bg-[var(--admin-surface)] opacity-40",
  no_show:    "border-l-[#555] bg-[var(--admin-surface)] opacity-40",
};

const HORAS = Array.from({ length: 13 }, (_, i) => i + 9); // 9h–21h

export default function AgendaAdmin({
  citas,
  barberos,
  lunes,
  filtrosBarbero,
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

  const semanaAnterior = () => {
    const d = new Date(lunesDate);
    d.setDate(d.getDate() - 7);
    router.push(`/admin/agenda?semana=${d.toISOString().slice(0, 10)}${filtrosBarbero ? `&barbero=${filtrosBarbero}` : ""}`);
  };
  const semanaSiguiente = () => {
    const d = new Date(lunesDate);
    d.setDate(d.getDate() + 7);
    router.push(`/admin/agenda?semana=${d.toISOString().slice(0, 10)}${filtrosBarbero ? `&barbero=${filtrosBarbero}` : ""}`);
  };

  const citasFiltradas = filtrosBarbero
    ? citas.filter((c) => c.barberos?.id === filtrosBarbero)
    : citas;

  function citasDelDia(dia: Date) {
    const dStr = dia.toISOString().slice(0, 10);
    return citasFiltradas.filter((c) => c.fecha_hora.slice(0, 10) === dStr);
  }

  const DIAS_LABEL = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const hoy = new Date().toISOString().slice(0, 10);

  return (
    <div className="p-8">
      {/* Cabecera */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">Agenda</h1>
          <p className="text-[#444] text-sm mt-1">
            {lunesDate.toLocaleDateString("es-ES", { day: "numeric", month: "long" })}
            {" — "}
            {dias[5].toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filtrosBarbero ?? ""}
            onChange={(e) =>
              router.push(`/admin/agenda?semana=${lunesDate.toISOString().slice(0, 10)}${e.target.value ? `&barbero=${e.target.value}` : ""}`)
            }
            className="bg-[var(--admin-surface)] border border-[var(--admin-border)] text-[#888] text-sm px-3 py-2 focus:outline-none focus:border-[#C9A84C]"
          >
            <option value="">Todos los barberos</option>
            {barberos.map((b) => (
              <option key={b.id} value={b.id}>{b.nombre}</option>
            ))}
          </select>
          <button
            onClick={semanaAnterior}
            className="px-4 py-2 border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[#555] hover:text-white text-sm transition-colors"
          >
            ←
          </button>
          <button
            onClick={() => router.push("/admin/agenda")}
            className="px-4 py-2 border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[#555] hover:text-white text-xs transition-colors"
          >
            Hoy
          </button>
          <button
            onClick={semanaSiguiente}
            className="px-4 py-2 border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[#555] hover:text-white text-sm transition-colors"
          >
            →
          </button>
        </div>
      </div>

      {/* Grid semanal */}
      <div className="border border-[var(--admin-border)] overflow-x-auto">
        {/* Cabecera días */}
        <div className="grid grid-cols-7 border-b border-[var(--admin-border)]">
          <div className="px-3 py-3 text-[#333] text-xs"></div>
          {dias.map((d, i) => {
            const dStr   = d.toISOString().slice(0, 10);
            const esHoy  = dStr === hoy;
            const cc     = citasDelDia(d);
            return (
              <div key={i} className={`px-3 py-3 border-l border-[var(--admin-border)] text-center ${esHoy ? "bg-[#C9A84C]/5" : ""}`}>
                <p className={`text-xs font-medium ${esHoy ? "text-[#C9A84C]" : "text-[#555]"}`}>{DIAS_LABEL[i]}</p>
                <p className={`text-lg font-bold mt-0.5 ${esHoy ? "text-white" : "text-[#333]"}`}>{d.getDate()}</p>
                {cc.length > 0 && (
                  <p className="text-[10px] text-[#555] mt-0.5">{cc.length} cita{cc.length > 1 ? "s" : ""}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Filas por hora */}
        {HORAS.map((hora) => (
          <div key={hora} className="grid grid-cols-7 border-b border-[#0d0d0d] min-h-[52px]">
            <div className="px-3 py-2 text-[#333] text-xs flex items-start pt-2.5">
              {hora}:00
            </div>
            {dias.map((d, i) => {
              const dStr  = d.toISOString().slice(0, 10);
              const esHoy = dStr === hoy;
              const cc    = citasFiltradas.filter((c) => {
                const ch = new Date(c.fecha_hora);
                return c.fecha_hora.slice(0, 10) === dStr && ch.getHours() === hora;
              });

              return (
                <div key={i} className={`border-l border-[#0d0d0d] px-1.5 py-1 space-y-1 ${esHoy ? "bg-[#C9A84C]/3" : ""}`}>
                  {cc.map((cita) => (
                    <div
                      key={cita.id}
                      className={`border-l-2 pl-2 pr-1 py-1 text-[10px] leading-tight ${ESTADO_COLOR[cita.estado] ?? ""}`}
                    >
                      <p className="text-white font-medium truncate">{cita.clientes?.nombre ?? "—"}</p>
                      <p className="text-[#555] truncate">{cita.servicios?.nombre}</p>
                      {cita.barberos && (
                        <p className="text-[#444] truncate">{cita.barberos.nombre}</p>
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
  );
}
