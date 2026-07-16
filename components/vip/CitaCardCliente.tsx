"use client";

import { useState, useTransition } from "react";
import { Check, RefreshCw, X, AlertCircle } from "lucide-react";
import { confirmarCita, solicitarReagendar } from "@/app/actions/cliente";

type Cita = {
  id: string;
  fecha_hora: string;
  estado: string;
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

const ESTADO_STYLES: Record<string, string> = {
  pendiente:  "text-amber-400 bg-amber-950/30 border-amber-900/40",
  confirmada: "text-blue-400 bg-blue-950/30 border-blue-900/40",
  completada: "text-emerald-400 bg-emerald-950/30 border-emerald-900/40",
  cancelada:  "text-[#999] bg-[#111] border-[#1a1a1a]",
  no_show:    "text-red-400 bg-red-950/30 border-red-900/40",
};

const ESTADO_LABEL: Record<string, string> = {
  pendiente: "Pendiente", confirmada: "Confirmada", completada: "Completada",
  cancelada: "Cancelada", no_show: "No asistido",
};

export default function CitaCardCliente({ cita, pasada = false }: { cita: Cita; pasada?: boolean }) {
  const [pending, startTransition] = useTransition();
  const [modalReagendar, setModalReagendar] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const fecha = new Date(cita.fecha_hora);
  const esPasada = fecha < new Date() || pasada;
  const puedeConfirmar = !esPasada && cita.estado === "pendiente" && !cita.reagendar_solicitado;
  const puedeReagendar = !esPasada && !["completada", "cancelada"].includes(cita.estado) && !cita.reagendar_solicitado;

  function handleConfirmar() {
    startTransition(async () => {
      const res = await confirmarCita(cita.id);
      setFeedback({ ok: res.ok, msg: res.ok ? "Cita confirmada" : (res.error ?? "Error") });
      setTimeout(() => setFeedback(null), 3000);
    });
  }

  function handleReagendar() {
    startTransition(async () => {
      const res = await solicitarReagendar(cita.id, motivo);
      setFeedback({ ok: res.ok, msg: res.ok ? "Solicitud enviada al equipo" : (res.error ?? "Error") });
      setModalReagendar(false);
      setMotivo("");
      setTimeout(() => setFeedback(null), 4000);
    });
  }

  return (
    <>
      <div className={`border p-5 transition-all ${esPasada ? "border-[#111] opacity-70" : "border-[#1a1a1a]"}`}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          {/* Info */}
          <div className="min-w-0">
            <p className="text-white font-medium text-sm">{cita.servicios?.nombre ?? "Servicio"}</p>
            {getOfertaTag(cita.notas_cliente) && (
              <p className="text-[#C9A84C] text-[11px] mt-0.5 flex items-center gap-1">
                <span>✦</span>
                <span>{getOfertaTag(cita.notas_cliente)}</span>
              </p>
            )}
            <p className="text-[#999] text-xs mt-0.5">
              {[cita.barberos?.nombre, cita.sedes?.nombre].filter(Boolean).join(" · ")}
            </p>
            {cita.precio_final != null && (
              <p className="text-[#C9A84C] text-xs mt-1 font-medium">{cita.precio_final} €</p>
            )}
            {cita.reagendar_solicitado && (
              <p className="text-amber-400 text-xs mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Reagendamiento solicitado
              </p>
            )}
          </div>

          {/* Fecha + estado */}
          <div className="text-right shrink-0">
            <p className="text-white text-sm font-medium">
              {fecha.toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
            </p>
            <p className="text-[#999] text-xs">
              {fecha.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
            </p>
            <span className={`text-[10px] px-2 py-0.5 mt-1.5 inline-block border ${ESTADO_STYLES[cita.estado] ?? "text-[#999]"}`}>
              {ESTADO_LABEL[cita.estado] ?? cita.estado}
            </span>
          </div>
        </div>

        {/* Acciones */}
        {!esPasada && (puedeConfirmar || puedeReagendar) && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-[#111]">
            {puedeConfirmar && (
              <button
                onClick={handleConfirmar}
                disabled={pending}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/30 hover:bg-[#C9A84C]/20 transition-colors disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                Confirmar cita
              </button>
            )}
            {puedeReagendar && (
              <button
                onClick={() => setModalReagendar(true)}
                disabled={pending}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#111] text-[#999] border border-[#1a1a1a] hover:text-[#888] hover:border-[#333] transition-colors disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reagendar
              </button>
            )}
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <p className={`text-xs mt-3 px-3 py-1.5 border ${feedback.ok ? "text-emerald-400 border-emerald-900/40 bg-emerald-950/20" : "text-red-400 border-red-900/40 bg-red-950/20"}`}>
            {feedback.msg}
          </p>
        )}
      </div>

      {/* Modal reagendar */}
      {modalReagendar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4" onClick={() => setModalReagendar(false)}>
          <div className="bg-[#050505] border border-[#1a1a1a] w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-lg">Solicitar reagendamiento</h3>
              <button onClick={() => setModalReagendar(false)} className="text-[#999] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[#999] text-xs mb-4">
              El equipo de Monastery recibirá tu solicitud y te contactará para buscar una nueva fecha.
            </p>
            <label className="block text-[#aaa] text-xs mb-1.5 uppercase tracking-wider">
              Motivo (opcional)
            </label>
            <textarea
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              placeholder="Ej: No puedo acudir por motivos de trabajo..."
              rows={3}
              className="w-full bg-[#0a0a0a] border border-[#222] text-white text-sm px-3 py-2 resize-none outline-none focus:border-[#C9A84C]/40 placeholder:text-[#777]"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleReagendar}
                disabled={pending}
                className="flex-1 btn-gold text-xs py-2 disabled:opacity-50"
              >
                {pending ? "Enviando..." : "Enviar solicitud →"}
              </button>
              <button
                onClick={() => setModalReagendar(false)}
                className="px-4 text-xs text-[#999] border border-[#1a1a1a] hover:text-white transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
