"use client";

import { useState } from "react";
import { Send, MessageSquare, Users, TrendingUp, Sparkles, Plus } from "lucide-react";
import BackButton from "@/components/admin/BackButton";

type Automatizacion = {
  id: string;
  nombre: string;
  desc: string;
  activa: boolean;
};

const AUTOMATIZACIONES_DEFAULT: Automatizacion[] = [
  { id: "recordatorio", nombre: "Recordatorio 24h antes",      desc: "Se envía automáticamente 24h antes de cada cita",       activa: true  },
  { id: "postcita",     nombre: "Post-cita + reseña",          desc: "Agradecimiento y solicitud de reseña tras cada servicio", activa: true  },
  { id: "resena",       nombre: "Solicitud de reseña",         desc: "Pide una valoración en Google tras cada visita",          activa: true  },
  { id: "inact21",      nombre: "Clientes 21 días inactivos",  desc: "Mensaje de recuperación tras 21 días sin visita",         activa: true  },
  { id: "inact30",      nombre: "Clientes 30 días inactivos",  desc: "Oferta especial tras 30 días sin visita",                 activa: false },
  { id: "cumpleanos",   nombre: "Cumpleaños",                  desc: "Descuento especial el día del cumpleaños del cliente",    activa: true  },
];

export default function MarketingPage() {
  const [auts, setAuts] = useState<Automatizacion[]>(AUTOMATIZACIONES_DEFAULT);
  const activasCount = auts.filter(a => a.activa).length;
  const inactivaLabel = auts.find(a => !a.activa)?.nombre ?? "30 días inactivos";

  function toggleAut(id: string) {
    setAuts(prev => prev.map(a => a.id === id ? { ...a, activa: !a.activa } : a));
  }

  return (
    <div className="p-6 space-y-6">

      {/* ── Cabecera ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <BackButton />
          <h1 className="text-2xl font-bold text-zinc-900">Marketing</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Campañas, automatizaciones y seguimiento</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 flex-shrink-0"
          style={{ background: "#C9A84C" }}
        >
          <Plus className="w-4 h-4" /> Nueva campaña
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={Send}          value="0"                    label="Mensajes enviados"  sub="Total campañas"  />
        <KPICard icon={MessageSquare} value="0"                    label="Campañas activas"   sub="Enviadas"        />
        <KPICard icon={Users}         value="0"                    label="Destinatarios"      sub="Alcance total"   />
        <KPICard icon={TrendingUp}    value={String(activasCount)} label="Automatizaciones"   sub="Activas ahora"   />
      </div>

      {/* ── Banner IA ── */}
      <div
        className="rounded-2xl p-5 flex items-center gap-4"
        style={{ background: "linear-gradient(135deg, #18181b 0%, #27272a 100%)" }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(201,168,76,0.15)" }}
        >
          <Sparkles className="w-5 h-5" style={{ color: "#C9A84C" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm">Sugerencia de la IA</p>
          <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
            Tienes {activasCount} automatizaciones activas. Activa la de &quot;{inactivaLabel}&quot; con una oferta especial para recuperar clientes perdidos.
          </p>
        </div>
        <button className="flex-shrink-0 px-4 py-2 bg-white rounded-xl text-sm font-semibold text-zinc-900 hover:bg-zinc-100 transition-colors whitespace-nowrap">
          Crear campaña
        </button>
      </div>

      {/* ── Grid principal ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Campañas recientes */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6">
          <h2 className="font-bold text-zinc-900 mb-5">Campañas recientes</h2>
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-zinc-400">No hay campañas creadas</p>
          </div>
        </div>

        {/* Automatizaciones */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6">
          <h2 className="font-bold text-zinc-900 mb-5">Automatizaciones</h2>
          <div className="space-y-5">
            {auts.map((a, i) => (
              <div key={a.id}>
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-900">{a.nombre}</p>
                    <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{a.desc}</p>
                  </div>
                  <Toggle checked={a.activa} onChange={() => toggleAut(a.id)} />
                </div>
                {i < auts.length - 1 && <div className="border-b border-zinc-50 mt-5" />}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

function KPICard({
  icon: Icon, value, label, sub,
}: {
  icon: React.ElementType; value: string; label: string; sub: string;
}) {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl px-5 py-4">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
        style={{ background: "rgba(201,168,76,0.1)" }}
      >
        <Icon className="w-4 h-4" style={{ color: "#C9A84C" }} />
      </div>
      <p className="text-2xl font-bold text-zinc-900">{value}</p>
      <p className="text-sm text-zinc-600 mt-0.5">{label}</p>
      <p className="text-xs text-zinc-400 mt-0.5">{sub}</p>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className="relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 focus:outline-none"
      style={{ background: checked ? "#C9A84C" : "#e4e4e7" }}
      aria-checked={checked}
      role="switch"
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200"
        style={{ transform: checked ? "translateX(1.25rem)" : "translateX(0)" }}
      />
    </button>
  );
}
