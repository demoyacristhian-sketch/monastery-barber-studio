"use client";

import { useState, useTransition, useEffect } from "react";
import {
  Pencil, Check, X, Plus, Loader2, ToggleLeft, ToggleRight,
  Globe, Bell, CreditCard, Palette, Scissors, Clock, Trash2,
  AlertTriangle, CalendarX, ShieldAlert,
} from "lucide-react";
import {
  actualizarServicio, crearServicio, eliminarServicio,
  actualizarBarbero, crearBarbero, actualizarSede,
  guardarHorarioSede, crearCierreEspecial, eliminarCierreEspecial,
  type HorarioDia,
} from "@/app/actions/admin";
import BackButton from "./BackButton";

type Sede     = { id: string; nombre: string; direccion: string; activa: boolean; cerrada_emergencia?: boolean; telefono?: string | null; email?: string | null; instagram?: string | null; whatsapp?: string | null };
type CierreEspecial = { id: string; sede_id: string; fecha_inicio: string; fecha_fin: string; motivo?: string | null; created_at?: string };
type Barbero  = { id: string; nombre: string; email: string; activo: boolean; sede_id: string | null };
type Servicio = { id: string; nombre: string; precio: number; duracion_minutos: number; categoria: string | null; activo: boolean };

const DIAS = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"] as const;

const HORARIO_DEFAULT = DIAS.map((dia, i) => ({
  dia, abierto: i < 6, apertura: "10:00", cierre: i === 5 ? "19:00" : "20:00",
}));

// ── Campo editable inline ──────────────────────────────────────────────────
function Campo({ value, type = "text", onSave, prefix = "", suffix = "", className = "" }: {
  value: string | number; type?: string; prefix?: string; suffix?: string;
  onSave: (v: string) => Promise<void>; className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal]         = useState(String(value));
  const [saving, setSaving]   = useState(false);

  async function save() {
    setSaving(true);
    await onSave(val);
    setSaving(false);
    setEditing(false);
  }

  if (!editing) return (
    <button onClick={() => setEditing(true)}
      className={`group flex items-center gap-1.5 text-left hover:text-zinc-900 transition-colors ${className}`}>
      {prefix}<span>{value}</span>{suffix}
      <Pencil className="w-3 h-3 text-zinc-300 group-hover:text-[#C9A84C]/70 opacity-0 group-hover:opacity-100 transition-all" />
    </button>
  );

  return (
    <div className="flex items-center gap-1.5">
      {prefix}
      <input autoFocus type={type} value={val} onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") { setVal(String(value)); setEditing(false); } }}
        className="border border-zinc-300 rounded px-2 py-0.5 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/30 bg-white text-zinc-900 w-32" />
      {suffix}
      {saving ? <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" /> : (
        <>
          <button onClick={save} className="p-1 rounded hover:bg-emerald-50 text-emerald-600"><Check className="w-3.5 h-3.5" /></button>
          <button onClick={() => { setVal(String(value)); setEditing(false); }} className="p-1 rounded hover:bg-red-50 text-red-400"><X className="w-3.5 h-3.5" /></button>
        </>
      )}
    </div>
  );
}

function ToggleActivo({ activo, onToggle }: { activo: boolean; onToggle: () => void }) {
  const [loading, setLoading] = useState(false);
  return (
    <button onClick={async () => { setLoading(true); await onToggle(); setLoading(false); }} disabled={loading}
      className="flex items-center gap-1.5 text-xs transition-colors">
      {loading ? <Loader2 className="w-4 h-4 animate-spin text-zinc-400" /> : activo ? (
        <><ToggleRight className="w-5 h-5 text-emerald-500" /><span className="text-emerald-600">Activo</span></>
      ) : (
        <><ToggleLeft className="w-5 h-5 text-zinc-400" /><span className="text-zinc-400">Inactivo</span></>
      )}
    </button>
  );
}

// ── Formulario de una sede ─────────────────────────────────────────────────
function FormSede({ sede }: { sede: Sede }) {
  const [form, setForm] = useState({
    nombre:    sede.nombre    ?? "",
    telefono:  sede.telefono  ?? "",
    email:     sede.email     ?? "",
    direccion: sede.direccion ?? "",
    instagram: sede.instagram ?? "",
    whatsapp:  sede.whatsapp  ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [ok, setOk]         = useState(false);

  async function guardar() {
    setSaving(true);
    await actualizarSede(sede.id, {
      nombre:    form.nombre,
      direccion: form.direccion,
      telefono:  form.telefono  || null,
      email:     form.email     || null,
      instagram: form.instagram || null,
      whatsapp:  form.whatsapp  || null,
    } as any);
    setSaving(false);
    setOk(true);
    setTimeout(() => setOk(false), 2000);
  }

  const f = (label: string, key: keyof typeof form, placeholder = "") => (
    <div>
      <label className="block text-xs text-zinc-400 mb-1.5">{label}</label>
      <input value={form[key] ?? ""} placeholder={placeholder}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] text-zinc-900 bg-white" />
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {f("Nombre del negocio", "nombre", "Monastery Barber Studio")}
        {f("Teléfono", "telefono", "+34 600 000 000")}
        {f("Email", "email", "info@monastery.com")}
        {f("Dirección", "direccion", "Calle Mayor 1")}
        {f("Instagram", "instagram", "@monasterybarber")}
        {f("Número de WhatsApp", "whatsapp", "34600000000")}
      </div>
      <button onClick={guardar} disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 bg-[#C9A84C] hover:bg-[#B8964A] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : ok ? <Check className="w-4 h-4" /> : null}
        {ok ? "¡Guardado!" : "Guardar cambios"}
      </button>
    </>
  );
}

// ── Información del negocio (con pestañas por sede) ────────────────────────
function SeccionInfoNegocio({ sedes }: { sedes: Sede[] }) {
  const [tabIdx, setTabIdx] = useState(0);
  const sede = sedes[tabIdx] ?? null;

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Scissors className="w-4 h-4 text-[#C9A84C]" />
        <h2 className="font-semibold text-zinc-900">Información del negocio</h2>
      </div>

      {sedes.length > 1 && (
        <div className="flex gap-0 mb-5 border-b border-zinc-100">
          {sedes.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setTabIdx(i)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                tabIdx === i
                  ? "border-[#C9A84C] text-[#C9A84C]"
                  : "border-transparent text-zinc-400 hover:text-zinc-700"
              }`}
            >
              {s.nombre}
            </button>
          ))}
        </div>
      )}

      {sede ? <FormSede key={sede.id} sede={sede} /> : (
        <p className="text-zinc-400 text-sm">Sin sedes configuradas</p>
      )}
    </div>
  );
}

// ── Horarios por sede ─────────────────────────────────────────────────────
const DIAS_SEMANA = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"] as const;

function toHHMM(t: string | null | undefined): string {
  if (!t) return "";
  return t.slice(0, 5);
}

function buildHorarioInicial(sedeId: string, rawRows: HorarioDia[]): HorarioDia[] {
  const porDia = new Map(rawRows.filter(r => r.sede_id === sedeId).map(r => [r.dia_semana, r]));
  return [0,1,2,3,4,5,6].map(dia => {
    const r = porDia.get(dia);
    if (r) return {
      ...r,
      periodo1_inicio: toHHMM(r.periodo1_inicio),
      periodo1_fin:    toHHMM(r.periodo1_fin),
      periodo2_inicio: toHHMM(r.periodo2_inicio),
      periodo2_fin:    toHHMM(r.periodo2_fin),
    };
    // Defaults: dom cerrado, lun-vie 10-14/16-20, sáb 10-19
    if (dia === 0) return { dia_semana: 0, abierto: false, periodo1_inicio: "10:00", periodo1_fin: "14:00", periodo2_inicio: null, periodo2_fin: null };
    if (dia === 6) return { dia_semana: 6, abierto: true,  periodo1_inicio: "10:00", periodo1_fin: "19:00", periodo2_inicio: null,    periodo2_fin: null };
    return { dia_semana: dia, abierto: true, periodo1_inicio: "10:00", periodo1_fin: "14:00", periodo2_inicio: "16:00", periodo2_fin: "20:00" };
  });
}

function HorarioDiaRow({ horario, onChange }: { horario: HorarioDia; onChange: (h: HorarioDia) => void }) {
  const { dia_semana, abierto, periodo1_inicio, periodo1_fin, periodo2_inicio, periodo2_fin } = horario;
  const esDomingo = dia_semana === 0;
  const tienePartido = !!(periodo2_inicio && periodo2_fin);

  if (esDomingo) return (
    <div className="flex items-center gap-3 py-2">
      <div className="relative inline-flex w-10 h-5 rounded-full bg-zinc-200 flex-shrink-0 opacity-40 cursor-not-allowed">
        <span className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white" />
      </div>
      <span className="text-sm text-zinc-500 w-24 flex-shrink-0">{DIAS_SEMANA[dia_semana]}</span>
      <span className="text-sm text-zinc-400">Cerrado</span>
    </div>
  );

  return (
    <div className="flex items-start gap-3 py-2 flex-wrap">
      <button onClick={() => onChange({ ...horario, abierto: !abierto })}
        className={`relative inline-flex w-10 h-5 rounded-full transition-colors flex-shrink-0 mt-0.5 ${abierto ? "bg-[#C9A84C]" : "bg-zinc-200"}`}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${abierto ? "translate-x-5" : "translate-x-0"}`} />
      </button>
      <span className="text-sm text-zinc-700 w-24 flex-shrink-0 mt-0.5">{DIAS_SEMANA[dia_semana]}</span>

      {!abierto ? (
        <span className="text-sm text-zinc-400 mt-0.5">Cerrado</span>
      ) : (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <input type="time" value={periodo1_inicio}
              onChange={e => onChange({ ...horario, periodo1_inicio: e.target.value })}
              className="px-2 py-1 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:border-[#C9A84C] bg-white text-zinc-900 w-24" />
            <span className="text-zinc-300 text-xs">—</span>
            <input type="time" value={periodo1_fin}
              onChange={e => onChange({ ...horario, periodo1_fin: e.target.value })}
              className="px-2 py-1 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:border-[#C9A84C] bg-white text-zinc-900 w-24" />
            <button
              onClick={() => onChange({ ...horario,
                periodo2_inicio: tienePartido ? null : "16:00",
                periodo2_fin:    tienePartido ? null : "20:00",
              })}
              className={`px-2 py-1 text-[11px] rounded-lg border transition-colors ${
                tienePartido ? "border-[#C9A84C] text-[#C9A84C] bg-[#C9A84C]/5" : "border-zinc-200 text-zinc-400 hover:border-zinc-300"
              }`}
              title="Horario partido (turno tarde)">
              {tienePartido ? "Con tarde" : "+ Tarde"}
            </button>
          </div>
          {tienePartido && (
            <div className="flex items-center gap-1.5 pl-0">
              <span className="text-[11px] text-zinc-400 w-24">Tarde:</span>
              <input type="time" value={periodo2_inicio ?? ""}
                onChange={e => onChange({ ...horario, periodo2_inicio: e.target.value })}
                className="px-2 py-1 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:border-[#C9A84C] bg-white text-zinc-900 w-24" />
              <span className="text-zinc-300 text-xs">—</span>
              <input type="time" value={periodo2_fin ?? ""}
                onChange={e => onChange({ ...horario, periodo2_fin: e.target.value })}
                className="px-2 py-1 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:border-[#C9A84C] bg-white text-zinc-900 w-24" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SeccionCierresEspeciales({ sedeId, cierresIniciales }: { sedeId: string; cierresIniciales: CierreEspecial[] }) {
  const [items, setItems] = useState(cierresIniciales);
  const [form, setForm]   = useState({ fecha_inicio: "", fecha_fin: "", motivo: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  async function añadir() {
    if (!form.fecha_inicio || !form.fecha_fin) return;
    if (form.fecha_fin < form.fecha_inicio) { setError("La fecha fin debe ser igual o posterior al inicio"); return; }
    setError(null);
    setSaving(true);
    const res = await crearCierreEspecial({ sede_id: sedeId, ...form, motivo: form.motivo || undefined });
    if (res.ok) {
      setItems(p => [...p, { id: Date.now().toString(), sede_id: sedeId, fecha_inicio: form.fecha_inicio, fecha_fin: form.fecha_fin, motivo: form.motivo || null }]);
      setForm({ fecha_inicio: "", fecha_fin: "", motivo: "" });
    } else { setError(res.error ?? "Error al guardar"); }
    setSaving(false);
  }

  async function borrar(id: string) {
    if (!confirm("¿Eliminar este cierre especial?")) return;
    const res = await eliminarCierreEspecial(id);
    if (res.ok) setItems(p => p.filter(c => c.id !== id));
  }

  function fmt(iso: string) {
    return new Date(iso + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  }

  return (
    <div className="border-t border-zinc-100 pt-5 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <CalendarX className="w-3.5 h-3.5 text-zinc-400" />
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Cierres especiales</p>
      </div>

      {/* Formulario añadir */}
      <div className="flex flex-wrap items-end gap-2 mb-3">
        <div>
          <label className="block text-[10px] text-zinc-400 mb-1">Desde</label>
          <input type="date" value={form.fecha_inicio} onChange={e => setForm(p => ({ ...p, fecha_inicio: e.target.value }))}
            className="px-2.5 py-1.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-[#C9A84C] bg-white text-zinc-900" />
        </div>
        <div>
          <label className="block text-[10px] text-zinc-400 mb-1">Hasta</label>
          <input type="date" value={form.fecha_fin} onChange={e => setForm(p => ({ ...p, fecha_fin: e.target.value }))}
            min={form.fecha_inicio}
            className="px-2.5 py-1.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-[#C9A84C] bg-white text-zinc-900" />
        </div>
        <div className="flex-1 min-w-32">
          <label className="block text-[10px] text-zinc-400 mb-1">Motivo (opcional)</label>
          <input type="text" value={form.motivo} placeholder="Vacaciones, festivo…"
            onChange={e => setForm(p => ({ ...p, motivo: e.target.value }))}
            className="w-full px-2.5 py-1.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-[#C9A84C] bg-white text-zinc-900" />
        </div>
        <button onClick={añadir} disabled={saving || !form.fecha_inicio || !form.fecha_fin}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-700 text-white text-xs rounded-lg transition-colors disabled:opacity-40">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          Añadir cierre
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mb-2">{error}</p>}

      {items.length === 0 ? (
        <p className="text-xs text-zinc-400 py-2">Sin cierres programados</p>
      ) : (
        <div className="space-y-1.5">
          {items.map(c => (
            <div key={c.id} className="flex items-center justify-between gap-3 px-3 py-2 bg-orange-50 border border-orange-100 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-zinc-800">{fmt(c.fecha_inicio)}</span>
                {c.fecha_inicio !== c.fecha_fin && <><span className="text-zinc-400">—</span><span className="font-medium text-zinc-800">{fmt(c.fecha_fin)}</span></>}
                {c.motivo && <span className="text-zinc-500 text-xs">· {c.motivo}</span>}
              </div>
              <button onClick={() => borrar(c.id)} className="p-1 text-zinc-400 hover:text-red-500 transition-colors flex-shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SeccionHorariosSedes({
  sedes,
  horariosRaw,
  cierresRaw,
}: {
  sedes: Sede[];
  horariosRaw: HorarioDia[];
  cierresRaw: CierreEspecial[];
}) {
  const [tabIdx, setTabIdx] = useState(0);
  const sede = sedes[tabIdx] ?? null;

  // Per-sede horarios state
  const [horariosPorSede, setHorariosPorSede] = useState<Record<string, HorarioDia[]>>(() =>
    Object.fromEntries(sedes.map(s => [s.id, buildHorarioInicial(s.id, horariosRaw)]))
  );
  const [saving, setSaving]       = useState(false);
  const [okSede, setOkSede]       = useState<string | null>(null);
  const [emergencia, setEmergencia] = useState<Record<string, boolean>>(
    Object.fromEntries(sedes.map(s => [s.id, s.cerrada_emergencia ?? false]))
  );
  const [savingEmerg, setSavingEmerg] = useState<string | null>(null);

  if (!sede) return null;

  const horariosSede = horariosPorSede[sede.id] ?? buildHorarioInicial(sede.id, horariosRaw);
  const cierresSede  = cierresRaw.filter(c => c.sede_id === sede.id);

  function updateDia(dia_semana: number, h: HorarioDia) {
    setHorariosPorSede(prev => ({
      ...prev,
      [sede.id]: prev[sede.id].map(d => d.dia_semana === dia_semana ? h : d),
    }));
  }

  async function guardar() {
    setSaving(true);
    const res = await guardarHorarioSede(sede.id, horariosSede);
    setSaving(false);
    if (res.ok) { setOkSede(sede.id); setTimeout(() => setOkSede(null), 2000); }
  }

  async function toggleEmergencia() {
    const nueva = !emergencia[sede.id];
    setSavingEmerg(sede.id);
    const res = await actualizarSede(sede.id, { cerrada_emergencia: nueva });
    setSavingEmerg(null);
    if (res.ok) setEmergencia(prev => ({ ...prev, [sede.id]: nueva }));
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-[#C9A84C]" />
        <h2 className="font-semibold text-zinc-900">Horarios y disponibilidad</h2>
      </div>

      {/* Pestañas por sede */}
      {sedes.length > 1 && (
        <div className="flex gap-0 mb-5 border-b border-zinc-100">
          {sedes.map((s, i) => (
            <button key={s.id} onClick={() => setTabIdx(i)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                tabIdx === i ? "border-[#C9A84C] text-[#C9A84C]" : "border-transparent text-zinc-400 hover:text-zinc-700"
              }`}>
              {s.nombre}
              {emergencia[s.id] && <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-red-500 mb-0.5" />}
            </button>
          ))}
        </div>
      )}

      {/* Cierre de emergencia */}
      <div className={`flex items-start justify-between gap-4 p-4 rounded-xl mb-5 border ${
        emergencia[sede.id] ? "border-red-200 bg-red-50" : "border-zinc-100 bg-zinc-50"
      }`}>
        <div className="flex items-start gap-3">
          <ShieldAlert className={`w-4 h-4 mt-0.5 flex-shrink-0 ${emergencia[sede.id] ? "text-red-500" : "text-zinc-400"}`} />
          <div>
            <p className={`text-sm font-semibold ${emergencia[sede.id] ? "text-red-700" : "text-zinc-700"}`}>
              Cierre de emergencia
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">
              {emergencia[sede.id]
                ? "⚠️ Agenda cerrada — los clientes ven esta sede sin disponibilidad"
                : "Cierra inmediatamente toda la agenda de esta sede"}
            </p>
          </div>
        </div>
        <button onClick={toggleEmergencia} disabled={savingEmerg === sede.id}
          className="flex items-center gap-2 flex-shrink-0">
          {savingEmerg === sede.id
            ? <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
            : emergencia[sede.id]
              ? <ToggleRight className="w-6 h-6 text-red-500" />
              : <ToggleLeft  className="w-6 h-6 text-zinc-300" />
          }
          <span className={`text-xs font-medium ${emergencia[sede.id] ? "text-red-600" : "text-zinc-400"}`}>
            {emergencia[sede.id] ? "Activado" : "Desactivado"}
          </span>
        </button>
      </div>

      {/* Horarios por día */}
      <div className="space-y-1 mb-5">
        {horariosSede.map(h => (
          <HorarioDiaRow key={h.dia_semana} horario={h} onChange={updated => updateDia(h.dia_semana, updated)} />
        ))}
      </div>

      <button onClick={guardar} disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 bg-[#C9A84C] hover:bg-[#B8964A] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : okSede === sede.id ? <Check className="w-4 h-4" /> : null}
        {okSede === sede.id ? "¡Horarios guardados!" : "Guardar horarios"}
      </button>

      {/* Cierres especiales */}
      <SeccionCierresEspeciales sedeId={sede.id} cierresIniciales={cierresSede} />
    </div>
  );
}

// ── Grid de 4 tarjetas ─────────────────────────────────────────────────────
function GridTarjetas() {
  const cards = [
    { icon: Globe,      title: "Landing pública",               sub: "Dominio, logo, colores y plantilla",  href: "/" },
    { icon: Bell,       title: "Notificaciones y automatizaciones", sub: "WhatsApp, recordatorios y campañas", href: null },
    { icon: CreditCard, title: "Facturación y plan",             sub: "Suscripción, pagos y facturas",       href: null },
    { icon: Palette,    title: "Servicios y precios",            sub: "Catálogo, duraciones y precios",      href: "#servicios" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {cards.map(c => (
        <a key={c.title}
          href={c.href ?? "#"}
          onClick={e => { if (!c.href) e.preventDefault(); }}
          className={`bg-white border border-zinc-200 rounded-2xl p-6 flex flex-col gap-4 transition-all hover:border-[#C9A84C]/30 hover:shadow-sm ${!c.href ? "cursor-default" : ""}`}>
          <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
            <c.icon className="w-5 h-5 text-zinc-400" />
          </div>
          <div>
            <p className="font-semibold text-zinc-900 text-[15px]">{c.title}</p>
            <p className="text-sm text-zinc-400 mt-0.5">{c.sub}</p>
          </div>
        </a>
      ))}
    </div>
  );
}

// ── Sección Sedes ──────────────────────────────────────────────────────────
function SeccionSedes({ sedes }: { sedes: Sede[] }) {
  const [items, setItems] = useState(sedes);
  const [, start] = useTransition();

  function update(id: string, field: string, value: string | boolean) {
    setItems(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    start(async () => { await actualizarSede(id, { [field]: value }); });
  }

  return (
    <section>
      <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Sedes</h2>
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
        {items.length === 0 && <p className="px-6 py-8 text-zinc-400 text-sm text-center">Sin sedes</p>}
        <div className="divide-y divide-zinc-100">
          {items.map(s => (
            <div key={s.id} className="px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
              <div className="space-y-1.5 flex-1 min-w-0">
                <Campo value={s.nombre} className="text-zinc-900 font-medium text-sm"
                  onSave={v => { update(s.id, "nombre", v); return Promise.resolve(); }} />
                <Campo value={s.direccion} className="text-zinc-500 text-xs"
                  onSave={v => { update(s.id, "direccion", v); return Promise.resolve(); }} />
              </div>
              <ToggleActivo activo={s.activa} onToggle={() => { update(s.id, "activa", !s.activa); return Promise.resolve(); }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Sección Barberos ───────────────────────────────────────────────────────
function SeccionBarberos({ barberos, sedes }: { barberos: Barbero[]; sedes: Sede[] }) {
  const [items, setItems]   = useState(barberos);
  const [nuevo, setNuevo]   = useState(false);
  const [form, setForm]     = useState({ nombre: "", email: "", sede_id: "" });
  const [guardando, setGua] = useState(false);
  const [, start]           = useTransition();

  function update(id: string, field: string, value: string | boolean) {
    setItems(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
    start(async () => { await actualizarBarbero(id, { [field]: value }); });
  }

  async function crear() {
    if (!form.nombre) return;
    setGua(true);
    const res = await crearBarbero({ nombre: form.nombre, email: form.email, sede_id: form.sede_id || undefined });
    if (res.ok) {
      setItems(prev => [...prev, { id: Date.now().toString(), nombre: form.nombre, email: form.email, activo: true, sede_id: form.sede_id || null }]);
      setForm({ nombre: "", email: "", sede_id: "" });
      setNuevo(false);
    }
    setGua(false);
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Equipo</h2>
        <button onClick={() => setNuevo(true)} className="flex items-center gap-1.5 text-xs text-[#C9A84C] hover:underline">
          <Plus className="w-3.5 h-3.5" /> Añadir barbero
        </button>
      </div>
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
        <div className="divide-y divide-zinc-100">
          {nuevo && (
            <div className="px-6 py-4 bg-zinc-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <input autoFocus placeholder="Nombre *" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                  className="px-3 py-2 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:border-[#C9A84C] text-zinc-900 bg-white" />
                <input placeholder="Email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="px-3 py-2 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:border-[#C9A84C] text-zinc-900 bg-white" />
                <select value={form.sede_id} onChange={e => setForm(p => ({ ...p, sede_id: e.target.value }))}
                  className="px-3 py-2 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:border-[#C9A84C] text-zinc-700 bg-white">
                  <option value="">Sede (opcional)</option>
                  {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={crear} disabled={guardando}
                  className="px-4 py-2 bg-[#C9A84C] text-white text-xs rounded-xl hover:bg-[#B8964A] transition-colors disabled:opacity-50">
                  {guardando ? "Guardando..." : "Guardar"}
                </button>
                <button onClick={() => setNuevo(false)} className="px-4 py-2 border border-zinc-200 text-zinc-500 text-xs rounded-xl hover:bg-zinc-50">Cancelar</button>
              </div>
            </div>
          )}
          {items.length === 0 && !nuevo && <p className="px-6 py-8 text-zinc-400 text-sm text-center">Sin barberos</p>}
          {items.map(b => {
            const sede = sedes.find(s => s.id === b.sede_id);
            return (
              <div key={b.id} className="px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#C9A84C]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-[#B8964A]">{b.nombre.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="space-y-1 min-w-0">
                    <Campo value={b.nombre} className="text-zinc-900 font-medium text-sm"
                      onSave={v => { update(b.id, "nombre", v); return Promise.resolve(); }} />
                    <Campo value={b.email} className="text-zinc-400 text-xs"
                      onSave={v => { update(b.id, "email", v); return Promise.resolve(); }} />
                    {sede && <p className="text-zinc-300 text-xs">{sede.nombre}</p>}
                  </div>
                </div>
                <ToggleActivo activo={b.activo} onToggle={() => { update(b.id, "activo", !b.activo); return Promise.resolve(); }} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Modal de edición de servicio ──────────────────────────────────────────
function ModalEditServicio({ servicio, onSave, onClose }: {
  servicio: Servicio;
  onSave: (id: string, data: Partial<Servicio>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    nombre: servicio.nombre,
    precio: String(servicio.precio),
    duracion_minutos: String(servicio.duracion_minutos),
    categoria: servicio.categoria ?? "",
  });
  const [guardando, setGua] = useState(false);

  async function guardar() {
    setGua(true);
    const data = { nombre: form.nombre, precio: Number(form.precio), duracion_minutos: Number(form.duracion_minutos) || 30, categoria: form.categoria || "General" };
    await actualizarServicio(servicio.id, data);
    onSave(servicio.id, data);
    setGua(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <h3 className="font-semibold text-zinc-900">Editar servicio</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Nombre</label>
            <input autoFocus value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] text-zinc-900 bg-white" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Precio (€)</label>
              <input type="number" value={form.precio} onChange={e => setForm(p => ({ ...p, precio: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] text-zinc-900 bg-white" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Duración (min)</label>
              <input type="number" value={form.duracion_minutos} onChange={e => setForm(p => ({ ...p, duracion_minutos: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] text-zinc-900 bg-white" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Categoría</label>
            <input value={form.categoria} onChange={e => setForm(p => ({ ...p, categoria: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] text-zinc-900 bg-white" />
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={guardar} disabled={guardando}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#C9A84C] hover:bg-[#B8964A] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
            {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Guardar cambios
          </button>
          <button onClick={onClose} className="px-5 py-2.5 border border-zinc-200 text-zinc-500 text-sm rounded-xl hover:bg-zinc-50 transition-colors">Cancelar</button>
        </div>
      </div>
    </div>
  );
}

// ── Sección Servicios ──────────────────────────────────────────────────────
function SeccionServicios({ servicios }: { servicios: Servicio[] }) {
  const [items, setItems]     = useState(servicios.filter(s => s.activo));
  const [nuevo, setNuevo]     = useState(false);
  const [editando, setEditar] = useState<Servicio | null>(null);
  const [form, setForm]       = useState({ nombre: "", precio: "", duracion_minutos: "", categoria: "" });
  const [guardando, setGua]   = useState(false);
  const [, start]             = useTransition();

  const categorias = Array.from(new Set(items.map(s => s.categoria ?? "General")));

  function update(id: string, field: string, value: string | number | boolean) {
    setItems(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    start(async () => { await actualizarServicio(id, { [field]: value }); });
  }

  function applyEdit(id: string, data: Partial<Servicio>) {
    setItems(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  }

  async function handleEliminar(id: string) {
    if (!confirm("¿Eliminar este servicio? Esta acción no se puede deshacer.")) return;
    const res = await eliminarServicio(id);
    if (res.ok) setItems(prev => prev.filter(s => s.id !== id));
  }

  async function crear() {
    if (!form.nombre || !form.precio) return;
    setGua(true);
    const res = await crearServicio({ nombre: form.nombre, precio: Number(form.precio), duracion_minutos: Number(form.duracion_minutos) || 30, categoria: form.categoria || "General" });
    if (res.ok) {
      setItems(prev => [...prev, { id: Date.now().toString(), nombre: form.nombre, precio: Number(form.precio), duracion_minutos: Number(form.duracion_minutos)||30, categoria: form.categoria||"General", activo: true }]);
      setForm({ nombre: "", precio: "", duracion_minutos: "", categoria: "" });
      setNuevo(false);
    }
    setGua(false);
  }

  const porCategoria = items.reduce((acc: Record<string, Servicio[]>, s) => {
    const cat = s.categoria ?? "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  return (
    <section id="servicios">
      {editando && (
        <ModalEditServicio
          servicio={editando}
          onSave={applyEdit}
          onClose={() => setEditar(null)}
        />
      )}

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Servicios y precios</h2>
        <button onClick={() => setNuevo(true)} className="flex items-center gap-1.5 text-xs text-[#C9A84C] hover:underline font-medium">
          <Plus className="w-3.5 h-3.5" /> Añadir servicio
        </button>
      </div>

      {nuevo && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 mb-4">
          <p className="text-sm font-medium text-zinc-700 mb-3">Nuevo servicio</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <input autoFocus placeholder="Nombre *" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
              className="col-span-2 px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:border-[#C9A84C] text-zinc-900 bg-white" />
            <input placeholder="Precio €" type="number" value={form.precio} onChange={e => setForm(p => ({ ...p, precio: e.target.value }))}
              className="px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:border-[#C9A84C] text-zinc-900 bg-white" />
            <input placeholder="Duración min" type="number" value={form.duracion_minutos} onChange={e => setForm(p => ({ ...p, duracion_minutos: e.target.value }))}
              className="px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:border-[#C9A84C] text-zinc-900 bg-white" />
            <input placeholder="Categoría (ej: Corte)" value={form.categoria} onChange={e => setForm(p => ({ ...p, categoria: e.target.value }))}
              list="cats" className="col-span-2 px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:border-[#C9A84C] text-zinc-900 bg-white" />
            <datalist id="cats">{categorias.map(c => <option key={c} value={c} />)}</datalist>
          </div>
          <div className="flex gap-2">
            <button onClick={crear} disabled={guardando}
              className="px-4 py-2 bg-[#C9A84C] text-white text-sm font-semibold rounded-xl hover:bg-[#B8964A] disabled:opacity-50">
              {guardando ? "Guardando..." : "Guardar"}
            </button>
            <button onClick={() => setNuevo(false)} className="px-4 py-2 border border-zinc-200 text-zinc-500 text-sm rounded-xl hover:bg-zinc-50">Cancelar</button>
          </div>
        </div>
      )}

      {items.length === 0 && !nuevo ? (
        <div className="bg-white border border-zinc-200 rounded-2xl px-6 py-10 text-center">
          <p className="text-zinc-400 text-sm">Sin servicios</p>
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col className="w-[42%]" />
              <col className="w-[16%]" />
              <col className="w-[16%]" />
              <col className="w-[16%]" />
              <col className="w-[10%]" />
            </colgroup>
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100">
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wide">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wide">Precio</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wide">Duración</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wide">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {Object.entries(porCategoria).map(([cat, svcs]) => (
                <>
                  <tr key={`cat-${cat}`} className="bg-zinc-50/70 border-y border-zinc-100">
                    <td colSpan={5} className="px-4 py-2">
                      <span className="text-[11px] font-bold text-[#C9A84C] uppercase tracking-widest">{cat}</span>
                    </td>
                  </tr>
                  {(svcs as Servicio[]).map(s => (
                    <tr key={s.id} className="hover:bg-zinc-50/50 transition-colors group">
                      <td className="px-4 py-3.5 text-zinc-800 font-medium truncate">{s.nombre}</td>
                      <td className="px-4 py-3.5 text-zinc-900 font-semibold tabular-nums">{s.precio} €</td>
                      <td className="px-4 py-3.5 text-zinc-500">{s.duracion_minutos} min</td>
                      <td className="px-4 py-3.5">
                        <ToggleActivo activo={s.activo}
                          onToggle={() => { update(s.id, "activo", !s.activo); return Promise.resolve(); }} />
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setEditar(s)}
                            className="p-1.5 rounded-lg text-zinc-300 hover:text-[#C9A84C] hover:bg-[#C9A84C]/5 transition-all opacity-0 group-hover:opacity-100">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleEliminar(s.id)}
                            className="p-1.5 rounded-lg text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

// ── Sección Dominio & Mantenimiento ───────────────────────────────────────
type InfoWeb = {
  dominio: string; fechaInicio: string; fechaRenovacion: string;
  mantenimiento: string; proveedor: string; aporteMensual: string;
};

const INFO_WEB_LS = "mbs_info_web";
const INFO_WEB_DEFAULT: InfoWeb = {
  dominio: "monasterybarbers.es",
  fechaInicio: "12-07-2026",
  fechaRenovacion: "12-07-2028",
  mantenimiento: "Mantenimiento Web y Marketing",
  proveedor: "Nown",
  aporteMensual: "69",
};

function SeccionDominio() {
  const [info, setInfo] = useState<InfoWeb>(INFO_WEB_DEFAULT);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(INFO_WEB_LS);
      if (saved) setInfo(JSON.parse(saved));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(INFO_WEB_LS, JSON.stringify(info));
  }, [info, hydrated]);

  function campo(key: keyof InfoWeb, label: string, suffix = "") {
    return (
      <div className="flex items-center justify-between gap-4 py-3 border-b border-zinc-50 last:border-0">
        <span className="text-xs text-zinc-400">{label}</span>
        <Campo
          value={info[key]}
          suffix={suffix}
          onSave={async v => setInfo(p => ({ ...p, [key]: v }))}
          className="text-sm text-zinc-900 font-medium"
        />
      </div>
    );
  }

  return (
    <section className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Globe className="w-4 h-4 text-[#C9A84C]" />
        <h2 className="font-bold text-zinc-900">Dominio & Mantenimiento Web</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-3">Dominio web</p>
          <div className="bg-zinc-50 rounded-xl px-4 py-2">
            {campo("dominio", "Dominio")}
            {campo("fechaInicio", "Fecha de inicio")}
            {campo("fechaRenovacion", "Fecha de renovación")}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-3">Mantenimiento</p>
          <div className="bg-zinc-50 rounded-xl px-4 py-2">
            {campo("mantenimiento", "Servicio")}
            {campo("proveedor", "Implementado por")}
            {campo("aporteMensual", "Aporte mensual", " €/mes")}
          </div>
          <p className="text-xs text-zinc-400 mt-2 pl-1">
            Desarrollado por{" "}
            <a href="https://www.nownlab.es/" target="_blank" rel="noopener noreferrer"
              className="text-[#C9A84C] hover:underline font-medium">
              Nown
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Sección Usuarios Admin ─────────────────────────────────────────────────
type AdminUser = { nombre: string; email: string; usuario: string };

const ADMIN_USERS_LS = "mbs_admin_users";
const ADMIN_USERS_DEFAULT: AdminUser[] = [
  { nombre: "Jonathan Suarez",   email: "jonathan.monastery@monasterybarbers.es",  usuario: "jonathan.monastery" },
  { nombre: "Daniel Quiñones",   email: "daniel.monastery@monasterybarbers.es",    usuario: "daniel.monastery" },
  { nombre: "Cristhian De Moya", email: "cristhian.monastery@monasterybarbers.es", usuario: "cristhian.monastery" },
];

function SeccionUsuarios() {
  const [users, setUsers]   = useState<AdminUser[]>(ADMIN_USERS_DEFAULT);
  const [hydrated, setHydrated] = useState(false);
  const [nuevo, setNuevo]   = useState<{ nombre: string; email: string; usuario: string } | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(ADMIN_USERS_LS);
      if (saved) setUsers(JSON.parse(saved));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(ADMIN_USERS_LS, JSON.stringify(users));
  }, [users, hydrated]);

  function añadir() {
    if (!nuevo?.nombre.trim() || !nuevo.email.trim()) return;
    setUsers(p => [...p, { ...nuevo }]);
    setNuevo(null);
  }

  function eliminar(email: string) {
    setUsers(p => p.filter(u => u.email !== email));
  }

  return (
    <section className="bg-white border border-zinc-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#C9A84C]" />
          <h2 className="font-bold text-zinc-900">Usuarios y contraseñas</h2>
        </div>
        <button
          onClick={() => setNuevo({ nombre: "", email: "", usuario: "" })}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#C9A84C] text-white rounded-lg hover:bg-[#B8964A] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Nuevo usuario
        </button>
      </div>

      <p className="text-xs text-zinc-400 mb-4 bg-zinc-50 px-3 py-2 rounded-lg">
        Los usuarios con acceso al panel de administración deben tener rol <strong>staff</strong> asignado en Supabase Auth. Para activar nuevos usuarios en producción, contacta a tu administrador técnico o crea el usuario directamente en Supabase con <code className="bg-zinc-100 px-1 rounded">app_metadata.role = &quot;staff&quot;</code>.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-100">
              <th className="px-4 py-2.5 text-left text-xs text-zinc-400 font-medium uppercase tracking-wide">Nombre</th>
              <th className="px-4 py-2.5 text-left text-xs text-zinc-400 font-medium uppercase tracking-wide">Usuario</th>
              <th className="px-4 py-2.5 text-left text-xs text-zinc-400 font-medium uppercase tracking-wide">Email de acceso</th>
              <th className="px-4 py-2.5 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {users.map(u => (
              <tr key={u.email} className="hover:bg-zinc-50/50 group">
                <td className="px-4 py-3 font-medium text-zinc-800">{u.nombre}</td>
                <td className="px-4 py-3 text-zinc-500 font-mono text-xs">{u.usuario}</td>
                <td className="px-4 py-3 text-zinc-500 text-xs">{u.email}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => eliminar(u.email)}
                    className="text-zinc-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {nuevo !== null && (
        <div className="mt-4 border border-zinc-200 rounded-xl p-4 bg-zinc-50 space-y-3">
          <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">Nuevo usuario administrador</p>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] text-zinc-400 mb-1">Nombre completo</label>
              <input value={nuevo.nombre} onChange={e => setNuevo(p => p ? { ...p, nombre: e.target.value } : p)}
                className="w-full px-2.5 py-1.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-[#C9A84C]" />
            </div>
            <div>
              <label className="block text-[10px] text-zinc-400 mb-1">Usuario (login)</label>
              <input value={nuevo.usuario} onChange={e => setNuevo(p => p ? { ...p, usuario: e.target.value } : p)}
                className="w-full px-2.5 py-1.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-[#C9A84C]" />
            </div>
            <div>
              <label className="block text-[10px] text-zinc-400 mb-1">Email de acceso</label>
              <input type="email" value={nuevo.email} onChange={e => setNuevo(p => p ? { ...p, email: e.target.value } : p)}
                className="w-full px-2.5 py-1.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-[#C9A84C]" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={añadir} className="px-3 py-1.5 bg-[#C9A84C] text-white text-xs rounded-lg hover:bg-[#B8964A] transition-colors">
              Añadir
            </button>
            <button onClick={() => setNuevo(null)} className="px-3 py-1.5 border border-zinc-200 text-zinc-500 text-xs rounded-lg hover:bg-zinc-100 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

// ── Export principal ───────────────────────────────────────────────────────
export default function ConfigAdmin({ sedes, barberos, servicios, horarios = [], cierres = [] }: {
  sedes: Sede[]; barberos: Barbero[]; servicios: Servicio[];
  horarios?: HorarioDia[]; cierres?: CierreEspecial[];
}) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <BackButton />
        <h1 className="text-2xl font-bold text-zinc-900">Configuración</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Gestiona todos los ajustes de tu negocio</p>
      </div>

      <SeccionInfoNegocio sedes={sedes} />
      <SeccionHorariosSedes sedes={sedes} horariosRaw={horarios} cierresRaw={cierres} />
      <GridTarjetas />

      <div className="pt-2 space-y-8">
        <SeccionServicios servicios={servicios} />
        <SeccionBarberos barberos={barberos} sedes={sedes} />
        <SeccionSedes sedes={sedes} />
        <SeccionDominio />
        <SeccionUsuarios />
      </div>
    </div>
  );
}
