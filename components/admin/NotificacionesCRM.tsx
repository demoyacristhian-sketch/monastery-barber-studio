"use client";

import { useState, useTransition } from "react";
import { Bell, X, RefreshCw, Check, ChevronDown, ChevronUp } from "lucide-react";
import { marcarNotificacionesLeidas } from "@/app/actions/cliente";

type Notif = {
  id: string;
  tipo: string;
  mensaje: string;
  leida: boolean;
  created_at: string;
  cita_id: string | null;
  clientes?: { nombre: string } | null;
};

const TIPO_CONFIG: Record<string, { icon: typeof RefreshCw; color: string; label: string }> = {
  solicitud_reagendar:  { icon: RefreshCw, color: "text-amber-600",  label: "Solicita reagendar" },
  confirmacion_cliente: { icon: Check,     color: "text-emerald-600",label: "Cita confirmada"    },
};

export default function NotificacionesCRM({ notificaciones }: { notificaciones: Notif[] }) {
  const [expandido, setExpandido] = useState(true);
  const [pending, startTransition] = useTransition();
  const [marcadas, setMarcadas] = useState(false);

  if (notificaciones.length === 0 || marcadas) return null;

  const reagendares  = notificaciones.filter(n => n.tipo === "solicitud_reagendar");
  const confirmadas  = notificaciones.filter(n => n.tipo === "confirmacion_cliente");

  function handleMarcarLeidas() {
    startTransition(async () => {
      await marcarNotificacionesLeidas();
      setMarcadas(true);
    });
  }

  return (
    <div className="mx-6 mt-6 border border-amber-200/60 bg-amber-50/80 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3">
        <button
          onClick={() => setExpandido(v => !v)}
          className="flex items-center gap-2 text-amber-800 font-medium text-sm"
        >
          <Bell className="w-4 h-4" />
          <span>{notificaciones.length} notificación{notificaciones.length !== 1 ? "es" : ""} de clientes</span>
          {reagendares.length > 0 && (
            <span className="bg-amber-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {reagendares.length} reagendar
            </span>
          )}
          {expandido ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarcarLeidas}
            disabled={pending}
            className="text-amber-700 text-xs hover:text-amber-900 flex items-center gap-1 disabled:opacity-50"
          >
            <X className="w-3 h-3" />
            {pending ? "Marcando..." : "Marcar todas como leídas"}
          </button>
        </div>
      </div>

      {/* Lista */}
      {expandido && (
        <div className="border-t border-amber-200/60 divide-y divide-amber-200/40 max-h-72 overflow-y-auto">
          {notificaciones.map(n => {
            const config = TIPO_CONFIG[n.tipo] ?? { icon: Bell, color: "text-zinc-600", label: n.tipo };
            const Icon = config.icon;
            const fecha = new Date(n.created_at);
            return (
              <div key={n.id} className="flex items-start gap-3 px-5 py-3">
                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${config.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-amber-800">{config.label}</p>
                  <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">{n.mensaje}</p>
                </div>
                <span className="text-[10px] text-amber-500 shrink-0 whitespace-nowrap">
                  {fecha.toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                  {" "}
                  {fecha.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
