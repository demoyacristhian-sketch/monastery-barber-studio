"use client";

import { useState, useEffect } from "react";
import { Send, MessageSquare, Users, TrendingUp, Plus, X, Check, Loader2, Tag } from "lucide-react";
import BackButton from "@/components/admin/BackButton";

type Automatizacion = {
  id: string;
  nombre: string;
  desc: string;
  activa: boolean;
};

type Campana = {
  id: string;
  titulo: string;
  descripcion: string;
  periodo: string;
  badge: string;
  badgeColor: string;
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

const CAMPANIAS_INICIALES: Campana[] = [
  {
    id: "morning_ritual",
    titulo: "Morning Ritual",
    descripcion: "Corte Estándar de 17 € a 14 €",
    periodo: "Lun–Vie · 09:00–14:00",
    badge: "Precio especial",
    badgeColor: "bg-blue-50 text-blue-700",
    activa: true,
  },
  {
    id: "pack_madrugador",
    titulo: "Pack Madrugador",
    descripcion: "Corte Medium de 25 € a 20 €",
    periodo: "Lun–Vie · 09:00–14:00",
    badge: "Pack",
    badgeColor: "bg-purple-50 text-purple-700",
    activa: true,
  },
  {
    id: "verano_monastery",
    titulo: "Verano Monastery",
    descripcion: "Corte Premium de 35 € a 28 €",
    periodo: "Agosto · Lun–Vie",
    badge: "Temporada",
    badgeColor: "bg-orange-50 text-orange-700",
    activa: true,
  },
  {
    id: "bono_verano",
    titulo: "Bono Verano",
    descripcion: "3 cortes + 1 gratis",
    periodo: "Jul–Sep · Lun–Vie",
    badge: "Bono",
    badgeColor: "bg-emerald-50 text-emerald-700",
    activa: true,
  },
  {
    id: "cerveza_verano",
    titulo: "Cerveza de Verano",
    descripcion: "+18 🍺 · Menores 🥤 con cada servicio",
    periodo: "Jul–Ago · Lun–Vie",
    badge: "Regalo",
    badgeColor: "bg-amber-50 text-amber-700",
    activa: true,
  },
  {
    id: "trae_amigo",
    titulo: "Trae un amigo",
    descripcion: "−10% de descuento para el amigo",
    periodo: "Todo el año · Lun–Vie",
    badge: "Referidos",
    badgeColor: "bg-pink-50 text-pink-700",
    activa: true,
  },
  {
    id: "lunes_barba",
    titulo: "Lunes de Barba",
    descripcion: "Solo barba de 12 € a 10 €",
    periodo: "Todos los lunes",
    badge: "Precio especial",
    badgeColor: "bg-blue-50 text-blue-700",
    activa: true,
  },
  {
    id: "upgrade_manerago",
    titulo: "Upgrade Mañanero",
    descripcion: "Upgrade de servicio: +5 € en vez de +8 €",
    periodo: "Lun–Vie · 09:00–14:00",
    badge: "Mejora",
    badgeColor: "bg-indigo-50 text-indigo-700",
    activa: true,
  },
];

function ModalNuevaCampana({ onClose, onCrear }: {
  onClose: () => void;
  onCrear: (c: Campana) => void;
}) {
  const [form, setForm] = useState({ titulo: "", descripcion: "", periodo: "", badge: "Precio especial" });
  const [saving, setSaving] = useState(false);

  const BADGES = ["Precio especial", "Pack", "Temporada", "Bono", "Regalo", "Referidos", "Mejora", "Novedad"];
  const BADGE_COLORS: Record<string, string> = {
    "Precio especial": "bg-blue-50 text-blue-700",
    Pack:              "bg-purple-50 text-purple-700",
    Temporada:         "bg-orange-50 text-orange-700",
    Bono:              "bg-emerald-50 text-emerald-700",
    Regalo:            "bg-amber-50 text-amber-700",
    Referidos:         "bg-pink-50 text-pink-700",
    Mejora:            "bg-indigo-50 text-indigo-700",
    Novedad:           "bg-teal-50 text-teal-700",
  };

  async function crear() {
    if (!form.titulo.trim()) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 300));
    onCrear({
      id:          `custom_${Date.now()}`,
      titulo:      form.titulo.trim(),
      descripcion: form.descripcion.trim(),
      periodo:     form.periodo.trim(),
      badge:       form.badge,
      badgeColor:  BADGE_COLORS[form.badge] ?? "bg-zinc-50 text-zinc-700",
      activa:      true,
    });
    setSaving(false);
  }

  const INPUT = "w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] text-zinc-900 bg-white";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <h3 className="font-semibold text-zinc-900">Nueva campaña</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Título *</label>
            <input autoFocus value={form.titulo}
              onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
              placeholder="Ej. Oferta de verano"
              className={INPUT} />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Descripción</label>
            <input value={form.descripcion}
              onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
              placeholder="Ej. Corte de 25 € a 20 €"
              className={INPUT} />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Periodo de validez</label>
            <input value={form.periodo}
              onChange={e => setForm(p => ({ ...p, periodo: e.target.value }))}
              placeholder="Ej. Jul–Sep · Lun–Vie"
              className={INPUT} />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Tipo de campaña</label>
            <select value={form.badge}
              onChange={e => setForm(p => ({ ...p, badge: e.target.value }))}
              className={INPUT}>
              {BADGES.map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={crear} disabled={saving || !form.titulo.trim()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#C9A84C] hover:bg-[#B8964A] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Crear campaña
          </button>
          <button onClick={onClose}
            className="px-5 py-2.5 border border-zinc-200 text-zinc-500 text-sm rounded-xl hover:bg-zinc-50 transition-colors">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

const LS_AUTS   = "mbs_marketing_auts";
const LS_CAMPS  = "mbs_marketing_campanias";

export default function MarketingPage() {
  const [auts, setAuts]         = useState<Automatizacion[]>(AUTOMATIZACIONES_DEFAULT);
  const [campanias, setCampanias] = useState<Campana[]>(CAMPANIAS_INICIALES);
  const [modalNueva, setModalNueva] = useState(false);
  const [hydrated, setHydrated]   = useState(false);

  // Cargar estado persistido
  useEffect(() => {
    try {
      const savedAuts  = localStorage.getItem(LS_AUTS);
      const savedCamps = localStorage.getItem(LS_CAMPS);
      if (savedAuts)  setAuts(JSON.parse(savedAuts));
      if (savedCamps) setCampanias(JSON.parse(savedCamps));
    } catch {}
    setHydrated(true);
  }, []);

  // Guardar cuando cambia el estado (solo tras hidratación)
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(LS_AUTS, JSON.stringify(auts));
  }, [auts, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(LS_CAMPS, JSON.stringify(campanias));
  }, [campanias, hydrated]);

  const activasCount    = auts.filter(a => a.activa).length;
  const inactivaLabel   = auts.find(a => !a.activa)?.nombre ?? "30 días inactivos";
  const activasCampañas = campanias.filter(c => c.activa).length;

  function toggleAut(id: string) {
    setAuts(prev => prev.map(a => a.id === id ? { ...a, activa: !a.activa } : a));
  }

  function toggleCampana(id: string) {
    setCampanias(prev => prev.map(c => c.id === id ? { ...c, activa: !c.activa } : c));
  }

  return (
    <div className="p-6 space-y-6">

      {modalNueva && (
        <ModalNuevaCampana
          onClose={() => setModalNueva(false)}
          onCrear={nueva => { setCampanias(prev => [nueva, ...prev]); setModalNueva(false); }}
        />
      )}

      {/* ── Cabecera ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <BackButton />
          <h1 className="text-2xl font-bold text-zinc-900">Marketing</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Campañas, automatizaciones y seguimiento</p>
        </div>
        <button
          onClick={() => setModalNueva(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 flex-shrink-0"
          style={{ background: "#C9A84C" }}
        >
          <Plus className="w-4 h-4" /> Nueva campaña
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={Send}          value={String(campanias.length)} label="Campañas totales"  sub="Activas e inactivas" />
        <KPICard icon={MessageSquare} value={String(activasCampañas)}  label="Campañas activas"  sub="Visibles ahora"       />
        <KPICard icon={Users}         value="—"                        label="Destinatarios"     sub="Por configurar"       />
        <KPICard icon={TrendingUp}    value={String(activasCount)}     label="Automatizaciones"  sub="Activas ahora"        />
      </div>

      {/* ── Grid principal ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Campañas recientes */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-zinc-900">Campañas y ofertas</h2>
            <span className="text-xs text-zinc-400">{campanias.length} en total</span>
          </div>
          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {campanias.map(c => (
              <div key={c.id} className={`rounded-xl border border-zinc-100 p-3.5 flex items-start gap-3 transition-opacity ${c.activa ? "" : "opacity-50"}`}>
                <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Tag className="w-4 h-4 text-zinc-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-zinc-900">{c.titulo}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.badgeColor}`}>
                      {c.badge}
                    </span>
                  </div>
                  {c.descripcion && <p className="text-xs text-zinc-500 mt-0.5">{c.descripcion}</p>}
                  {c.periodo && <p className="text-[11px] text-zinc-400 mt-0.5">{c.periodo}</p>}
                </div>
                <Toggle checked={c.activa} onChange={() => toggleCampana(c.id)} />
              </div>
            ))}
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
