"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, RefreshCw, X, AlertCircle, Trash2 } from "lucide-react";
import { confirmarCita, cancelarCita } from "@/app/actions/cliente";

type Cita = {
  id: string;
  fecha_hora: string;
  estado: string;
  barbero_id?: string | null;
  servicio_id?: string | null;
  sede_id?: string | null;
  reagendar_solicitado?: boolean;
  reagendar_motivo?: string;
  servicios?: { nombre: string } | null;
  barberos?: { nombre: string } | null;
  sedes?: { nombre: string } | null;
  precio_final?: number | null;
  notas_cliente?: string | null;
};

function getOfertaTag(notas: string | null | undefined): string | null {
  if (!notas) return null;
  const match = notas.match(/Oferta:\s*([^|]+)/);
  return match ? match[1].trim() : null;
}

const ESTADO_LABEL: Record<string, string> = {
  pendiente: "Pendiente", confirmada: "Confirmada", completada: "Completada",
  cancelada: "Cancelada", no_show: "No asistido",
};

const ESTADO_COLOR: Record<string, string> = {
  pendiente:  "#D97706",
  confirmada: "#3B82F6",
  completada: "#10B981",
  cancelada:  "var(--vip-muted)",
  no_show:    "#EF4444",
};

export default function CitaCardCliente({ cita, pasada = false }: { cita: Cita; pasada?: boolean }) {
  const [pending, startTransition] = useTransition();
  const [modalCancelar, setModalCancelar] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const gold = "#C9A84C";
  const fecha = new Date(cita.fecha_hora);
  const esPasada = fecha < new Date() || pasada;
  const puedeConfirmar = !esPasada && cita.estado === "pendiente" && !cita.reagendar_solicitado;
  const puedeReagendar = !esPasada && !["completada", "cancelada"].includes(cita.estado) && !cita.reagendar_solicitado;
  const puedeCancelar  = !esPasada && !["completada", "cancelada"].includes(cita.estado);

  // Aviso de menos de 3 horas
  const horasRestantes = (fecha.getTime() - Date.now()) / (1000 * 60 * 60);
  const menosDe3Horas = horasRestantes < 3;

  // URL para reagendar (pre-rellena sede/barbero/servicio)
  const reagendarParams = new URLSearchParams({ reagendar: cita.id });
  if (cita.barbero_id)  reagendarParams.set("barbero_id",  cita.barbero_id);
  if (cita.servicio_id) reagendarParams.set("servicio_id", cita.servicio_id);
  if (cita.sede_id)     reagendarParams.set("sede_id",     cita.sede_id);
  const reagendarHref = `/espacio-vip/reservar?${reagendarParams.toString()}`;

  function handleConfirmar() {
    startTransition(async () => {
      const res = await confirmarCita(cita.id);
      setFeedback({ ok: res.ok, msg: res.ok ? "Cita confirmada" : (res.error ?? "Error") });
      setTimeout(() => setFeedback(null), 3000);
    });
  }

  function handleCancelar() {
    startTransition(async () => {
      const res = await cancelarCita(cita.id);
      setFeedback({ ok: res.ok, msg: res.ok ? "Cita cancelada" : (res.error ?? "Error") });
      setModalCancelar(false);
      setTimeout(() => setFeedback(null), 4000);
    });
  }

  const estadoColor = ESTADO_COLOR[cita.estado] ?? "var(--vip-muted)";

  return (
    <>
      <div
        className={`p-5 transition-all ${esPasada ? "opacity-70" : ""}`}
        style={{ border: "1px solid var(--vip-border)", background: "var(--vip-bg-card)" }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          {/* Info */}
          <div className="min-w-0">
            <p className="font-medium text-sm" style={{ color: "var(--vip-text)" }}>
              {cita.servicios?.nombre ?? "Servicio"}
            </p>
            {getOfertaTag(cita.notas_cliente) && (
              <p className="text-[11px] mt-0.5 flex items-center gap-1" style={{ color: gold }}>
                <span>✦</span>
                <span>{getOfertaTag(cita.notas_cliente)}</span>
              </p>
            )}
            <p className="text-xs mt-0.5" style={{ color: "var(--vip-muted)" }}>
              {[cita.barberos?.nombre, cita.sedes?.nombre].filter(Boolean).join(" · ")}
            </p>
            {cita.precio_final != null && (
              <p className="text-xs mt-1 font-medium" style={{ color: gold }}>
                {cita.precio_final} €
              </p>
            )}
            {cita.reagendar_solicitado && (
              <p className="text-xs mt-2 flex items-center gap-1" style={{ color: "#D97706" }}>
                <AlertCircle className="w-3 h-3" />
                Reagendamiento solicitado
              </p>
            )}
          </div>

          {/* Fecha + estado */}
          <div className="text-right shrink-0">
            <p className="text-sm font-medium" style={{ color: "var(--vip-text)" }}>
              {fecha.toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
            </p>
            <p className="text-xs" style={{ color: "var(--vip-muted)" }}>
              {fecha.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
            </p>
            <span
              className="text-[10px] px-2 py-0.5 mt-1.5 inline-block"
              style={{
                color: estadoColor,
                background: `${estadoColor}15`,
                border: `1px solid ${estadoColor}40`,
              }}
            >
              {ESTADO_LABEL[cita.estado] ?? cita.estado}
            </span>
          </div>
        </div>

        {/* Acciones */}
        {!esPasada && (puedeConfirmar || puedeReagendar || puedeCancelar) && (
          <div
            className="flex flex-wrap gap-2 mt-4 pt-4"
            style={{ borderTop: "1px solid var(--vip-border)" }}
          >
            {puedeConfirmar && (
              <button
                onClick={handleConfirmar}
                disabled={pending}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 transition-colors disabled:opacity-50"
                style={{
                  color: gold,
                  background: `${gold}10`,
                  border: `1px solid ${gold}30`,
                }}
              >
                <Check className="w-3.5 h-3.5" />
                Confirmar cita
              </button>
            )}
            {puedeReagendar && (
              <Link
                href={reagendarHref}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 transition-colors"
                style={{
                  color: "var(--vip-muted)",
                  border: "1px solid var(--vip-border)",
                }}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reagendar
              </Link>
            )}
            {puedeCancelar && (
              <button
                onClick={() => setModalCancelar(true)}
                disabled={pending}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 transition-colors disabled:opacity-50 ml-auto"
                style={{
                  color: "#EF4444",
                  background: "rgba(239,68,68,0.06)",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Cancelar
              </button>
            )}
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <p
            className="text-xs mt-3 px-3 py-1.5"
            style={
              feedback.ok
                ? { color: "#10B981", border: "1px solid rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.06)" }
                : { color: "#EF4444", border: "1px solid rgba(239,68,68,0.3)",  background: "rgba(239,68,68,0.06)" }
            }
          >
            {feedback.msg}
          </p>
        )}
      </div>

      {/* Modal cancelar */}
      {modalCancelar && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
          style={{ background: "rgba(0,0,0,0.75)" }}
          onClick={() => setModalCancelar(false)}
        >
          <div
            className="w-full max-w-sm p-6 rounded-xl"
            style={{ background: "var(--vip-bg-card)", border: "1px solid var(--vip-border)" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Cabecera */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-lg" style={{ color: "var(--vip-text)" }}>
                ¿Cancelar la cita?
              </h3>
              <button onClick={() => setModalCancelar(false)} style={{ color: "var(--vip-muted)" }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Aviso de política */}
            <div
              className="rounded-lg p-4 mb-4 text-sm space-y-2"
              style={{
                background: menosDe3Horas ? "rgba(239,68,68,0.06)" : `${gold}08`,
                border: `1px solid ${menosDe3Horas ? "rgba(239,68,68,0.3)" : `${gold}30`}`,
              }}
            >
              <p style={{ color: "var(--vip-text)" }}>
                Te pedimos que canceles con <strong>al menos 3 horas de antelación</strong>.
                Así podemos dar ese espacio a otra persona que lo necesite — te lo agradecemos.
              </p>
              {menosDe3Horas && (
                <p className="text-xs font-medium" style={{ color: "#EF4444" }}>
                  ⚠️ Estás cancelando con menos de 3 horas. Perderás 1 sello de tu tarjeta de fidelidad
                  (necesitas 8 sellos para tu <strong>9.º corte gratis</strong>).
                </p>
              )}
            </div>

            {/* Botones */}
            <div className="flex gap-2">
              <button
                onClick={() => setModalCancelar(false)}
                className="flex-1 text-xs py-2.5 font-medium transition-colors"
                style={{ border: "1px solid var(--vip-border)", color: "var(--vip-text)" }}
              >
                Mantener mi cita
              </button>
              <button
                onClick={handleCancelar}
                disabled={pending}
                className="flex-1 text-xs py-2.5 font-medium transition-colors disabled:opacity-50"
                style={{
                  color: "#EF4444",
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.3)",
                }}
              >
                {pending ? "Cancelando..." : "Sí, cancelar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
