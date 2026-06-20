"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { actualizarEstadoCita } from "@/app/actions/admin";

type Cita = {
  id: string;
  fecha_hora: string;
  estado: string;
  precio_final: number | null;
  notas_cliente: string | null;
  notas_barbero: string | null;
  clientes: { id: string; nombre: string; telefono: string | null; email: string } | null;
  barberos: { id: string; nombre: string } | null;
  servicios: { nombre: string; duracion_minutos: number } | null;
  sedes: { nombre: string } | null;
};

const ESTADO_BADGE: Record<string, string> = {
  pendiente:  "text-yellow-400 bg-yellow-950/30",
  confirmada: "text-blue-400 bg-blue-950/30",
  completada: "text-green-400 bg-green-950/30",
  cancelada:  "text-red-400 bg-red-950/30",
  no_show:    "text-gray-400 bg-gray-800/40",
};

const ACCIONES: Record<string, { label: string; siguiente: "confirmada" | "completada" | "cancelada" | "no_show" }[]> = {
  pendiente:  [{ label: "Confirmar", siguiente: "confirmada" }, { label: "Cancelar", siguiente: "cancelada" }],
  confirmada: [{ label: "Completar", siguiente: "completada" }, { label: "No show", siguiente: "no_show" }, { label: "Cancelar", siguiente: "cancelada" }],
  completada: [],
  cancelada:  [],
  no_show:    [],
};

export default function CitasAdmin({
  citas,
  barberos,
  filtros,
}: {
  citas: Cita[];
  barberos: { id: string; nombre: string }[];
  filtros: { fecha?: string; barbero?: string; estado?: string };
}) {
  const router      = useRouter();
  const sp          = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [accionId, setAccionId]    = useState<string | null>(null);
  const [detalle, setDetalle]      = useState<string | null>(null);

  function actualizarFiltro(key: string, val: string) {
    const params = new URLSearchParams(sp.toString());
    if (val) params.set(key, val);
    else     params.delete(key);
    router.push(`/admin/citas?${params.toString()}`);
  }

  function accion(citaId: string, estado: "confirmada" | "completada" | "cancelada" | "no_show") {
    setAccionId(citaId);
    startTransition(async () => {
      await actualizarEstadoCita(citaId, estado);
      setAccionId(null);
    });
  }

  const ESTADOS_LISTA = ["pendiente", "confirmada", "completada", "cancelada", "no_show"];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-white">Citas</h1>
        <p className="text-[#444] text-sm mt-1">{citas.length} citas mostradas</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="date"
          defaultValue={filtros.fecha ?? ""}
          onChange={(e) => actualizarFiltro("fecha", e.target.value)}
          className="bg-[var(--admin-surface)] border border-[var(--admin-border)] text-white text-sm px-3 py-2 focus:outline-none focus:border-[#C9A84C]"
        />
        <select
          defaultValue={filtros.barbero ?? ""}
          onChange={(e) => actualizarFiltro("barbero", e.target.value)}
          className="bg-[var(--admin-surface)] border border-[var(--admin-border)] text-[#888] text-sm px-3 py-2 focus:outline-none focus:border-[#C9A84C]"
        >
          <option value="">Todos los barberos</option>
          {barberos.map((b) => (
            <option key={b.id} value={b.id}>{b.nombre}</option>
          ))}
        </select>
        <select
          defaultValue={filtros.estado ?? ""}
          onChange={(e) => actualizarFiltro("estado", e.target.value)}
          className="bg-[var(--admin-surface)] border border-[var(--admin-border)] text-[#888] text-sm px-3 py-2 focus:outline-none focus:border-[#C9A84C]"
        >
          <option value="">Todos los estados</option>
          {ESTADOS_LISTA.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
        {(filtros.fecha || filtros.barbero || filtros.estado) && (
          <button
            onClick={() => router.push("/admin/citas")}
            className="text-xs text-[#555] hover:text-[#999] px-3 py-2 border border-[var(--admin-border)] bg-[var(--admin-surface)]"
          >
            Limpiar filtros ×
          </button>
        )}
      </div>

      {/* Lista */}
      <div className="border border-[var(--admin-border)] divide-y divide-[var(--admin-border)]">
        {citas.length === 0 ? (
          <p className="px-6 py-10 text-[#444] text-sm text-center">No hay citas con estos filtros.</p>
        ) : (
          citas.map((cita) => {
            const esDetalle = detalle === cita.id;
            const acciones  = ACCIONES[cita.estado] ?? [];

            return (
              <div key={cita.id} className="bg-[var(--admin-surface)]">
                <div
                  className="px-6 py-4 flex items-start justify-between gap-4 flex-wrap cursor-pointer hover:bg-[var(--admin-border)] transition-colors"
                  onClick={() => setDetalle(esDetalle ? null : cita.id)}
                >
                  {/* Info principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="text-white text-sm font-medium">{cita.clientes?.nombre ?? "—"}</p>
                      <span className={`text-[10px] px-2 py-0.5 ${ESTADO_BADGE[cita.estado] ?? ""}`}>{cita.estado}</span>
                    </div>
                    <p className="text-[#555] text-xs mt-1">
                      {cita.servicios?.nombre} · {cita.barberos?.nombre} · {cita.sedes?.nombre}
                    </p>
                    <p className="text-[#444] text-xs mt-0.5">
                      {cita.clientes?.telefono ?? cita.clientes?.email}
                    </p>
                  </div>

                  {/* Fecha + precio */}
                  <div className="text-right shrink-0">
                    <p className="text-[#888] text-sm">
                      {new Date(cita.fecha_hora).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                      {" · "}
                      {new Date(cita.fecha_hora).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    {cita.precio_final != null && (
                      <p className="text-[#C9A84C] text-xs mt-1">{cita.precio_final}€</p>
                    )}
                    <p className="text-[#333] text-xs mt-1">{cita.servicios?.duracion_minutos} min</p>
                  </div>
                </div>

                {/* Panel expandido */}
                {esDetalle && (
                  <div className="px-6 pb-5 border-t border-[var(--admin-border)] pt-4 space-y-4">
                    {cita.notas_cliente && (
                      <div>
                        <p className="text-[#444] text-xs uppercase tracking-widest mb-1">Notas del cliente</p>
                        <p className="text-[#777] text-sm">{cita.notas_cliente}</p>
                      </div>
                    )}
                    {cita.notas_barbero && (
                      <div>
                        <p className="text-[#444] text-xs uppercase tracking-widest mb-1">Notas internas</p>
                        <p className="text-[#777] text-sm">{cita.notas_barbero}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-[#444] text-xs uppercase tracking-widest mb-1">ID de cita</p>
                      <p className="text-[#333] text-xs font-mono">{cita.id}</p>
                    </div>

                    {acciones.length > 0 && (
                      <div className="flex gap-2 flex-wrap pt-1">
                        {acciones.map(({ label, siguiente }) => (
                          <button
                            key={siguiente}
                            disabled={pending && accionId === cita.id}
                            onClick={() => accion(cita.id, siguiente)}
                            className={`text-xs px-4 py-2 border transition-colors ${
                              siguiente === "cancelada" || siguiente === "no_show"
                                ? "border-red-900/50 text-red-400 hover:bg-red-950/30"
                                : siguiente === "completada"
                                ? "border-green-900/50 text-green-400 hover:bg-green-950/30"
                                : "border-[#C9A84C]/30 text-[#C9A84C] hover:bg-[#C9A84C]/10"
                            } disabled:opacity-40`}
                          >
                            {pending && accionId === cita.id ? "..." : label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
