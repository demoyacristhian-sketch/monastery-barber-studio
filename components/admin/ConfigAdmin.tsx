"use client";

import { useState, useTransition, useEffect } from "react";
import {
  Pencil, Check, X, Plus, Loader2, ToggleLeft, ToggleRight,
  Globe, Bell, CreditCard, Palette, Scissors, Clock,
} from "lucide-react";
import {
  actualizarServicio, crearServicio,
  actualizarBarbero, crearBarbero, actualizarSede,
} from "@/app/actions/admin";
import BackButton from "./BackButton";

type Sede     = { id: string; nombre: string; direccion: string; activa: boolean; telefono?: string | null; email?: string | null; instagram?: string | null; whatsapp?: string | null };
type Barbero  = { id: string; nombre: string; email: string; activo: boolean; sede_id: string | null };
type Servicio = { id: string; nombre: string; precio: number; duracion_minutos: number; categoria: string | null; activo: boolean };

const DIAS = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"] as const;

const HORARIO_DEFAULT = DIAS.map((dia, i) => ({
  dia, abierto: i < 6, apertura: i === 5 ? "10:00" : "09:00", cierre: i === 5 ? "15:00" : "21:00",
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

// ── Información del negocio ────────────────────────────────────────────────
function SeccionInfoNegocio({ sede }: { sede: Sede | null }) {
  const [form, setForm] = useState({
    nombre:    sede?.nombre    ?? "",
    telefono:  sede?.telefono  ?? "",
    email:     sede?.email     ?? "",
    direccion: sede?.direccion ?? "",
    instagram: sede?.instagram ?? "",
    whatsapp:  sede?.whatsapp  ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [ok, setOk]         = useState(false);

  async function guardar() {
    if (!sede) return;
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
      <input value={form[key]} placeholder={placeholder}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] text-zinc-900 bg-white" />
    </div>
  );

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <Scissors className="w-4 h-4 text-[#C9A84C]" />
        <h2 className="font-semibold text-zinc-900">Información del negocio</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {f("Nombre del negocio", "nombre", "Monastery Barber Studio")}
        {f("Teléfono", "telefono", "+34 600 000 000")}
        {f("Email", "email", "info@monastery.com")}
        {f("Dirección", "direccion", "Calle Mayor 1, Madrid")}
        {f("Instagram", "instagram", "@monasterybarber")}
        {f("Número de WhatsApp", "whatsapp", "34600000000")}
      </div>
      <button onClick={guardar} disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 bg-[#C9A84C] hover:bg-[#B8964A] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : ok ? <Check className="w-4 h-4" /> : null}
        {ok ? "¡Guardado!" : "Guardar cambios"}
      </button>
    </div>
  );
}

// ── Horarios de apertura ───────────────────────────────────────────────────
function SeccionHorarios() {
  const [horarios, setHorarios] = useState(HORARIO_DEFAULT);
  const [saving, setSaving]     = useState(false);
  const [ok, setOk]             = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("monastery_horarios");
    if (saved) { try { setHorarios(JSON.parse(saved)); } catch {} }
  }, []);

  function toggleDia(i: number) {
    setHorarios(prev => prev.map((h, idx) => idx === i ? { ...h, abierto: !h.abierto } : h));
  }
  function setHora(i: number, campo: "apertura" | "cierre", valor: string) {
    setHorarios(prev => prev.map((h, idx) => idx === i ? { ...h, [campo]: valor } : h));
  }

  async function guardar() {
    setSaving(true);
    localStorage.setItem("monastery_horarios", JSON.stringify(horarios));
    await new Promise(r => setTimeout(r, 400));
    setSaving(false);
    setOk(true);
    setTimeout(() => setOk(false), 2000);
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <Clock className="w-4 h-4 text-[#C9A84C]" />
        <h2 className="font-semibold text-zinc-900">Horarios de apertura</h2>
      </div>
      <div className="space-y-3">
        {horarios.map((h, i) => (
          <div key={h.dia} className="flex items-center gap-4 flex-wrap">
            {/* Toggle */}
            <button onClick={() => toggleDia(i)}
              className={`relative inline-flex w-11 h-6 rounded-full transition-colors flex-shrink-0 ${h.abierto ? "bg-[#C9A84C]" : "bg-zinc-200"}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${h.abierto ? "translate-x-5" : "translate-x-0"}`} />
            </button>

            {/* Día */}
            <span className="text-sm text-zinc-700 w-20 flex-shrink-0">{h.dia}</span>

            {/* Horas */}
            {h.abierto ? (
              <div className="flex items-center gap-2">
                <input type="time" value={h.apertura}
                  onChange={e => setHora(i, "apertura", e.target.value)}
                  className="px-2.5 py-1.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-[#C9A84C] bg-white text-zinc-900 w-28" />
                <span className="text-zinc-300">—</span>
                <input type="time" value={h.cierre}
                  onChange={e => setHora(i, "cierre", e.target.value)}
                  className="px-2.5 py-1.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-[#C9A84C] bg-white text-zinc-900 w-28" />
              </div>
            ) : (
              <span className="text-sm text-zinc-400">Cerrado</span>
            )}
          </div>
        ))}
      </div>
      <button onClick={guardar} disabled={saving}
        className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-[#C9A84C] hover:bg-[#B8964A] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : ok ? <Check className="w-4 h-4" /> : null}
        {ok ? "¡Guardado!" : "Guardar horarios"}
      </button>
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
  const [items, setItems]     = useState(servicios);
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
                        <button onClick={() => setEditar(s)}
                          className="p-1.5 rounded-lg text-zinc-300 hover:text-[#C9A84C] hover:bg-[#C9A84C]/5 transition-all opacity-0 group-hover:opacity-100">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
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

// ── Export principal ───────────────────────────────────────────────────────
export default function ConfigAdmin({ sedes, barberos, servicios }: {
  sedes: Sede[]; barberos: Barbero[]; servicios: Servicio[];
}) {
  const sedePrincipal = sedes[0] ?? null;

  return (
    <div className="p-6 space-y-6">
      <div>
        <BackButton />
        <h1 className="text-2xl font-bold text-zinc-900">Configuración</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Gestiona todos los ajustes de tu negocio</p>
      </div>

      <SeccionInfoNegocio sede={sedePrincipal} />
      <SeccionHorarios />
      <GridTarjetas />

      <div className="pt-2 space-y-8">
        <SeccionServicios servicios={servicios} />
        <SeccionBarberos barberos={barberos} sedes={sedes} />
        <SeccionSedes sedes={sedes} />
      </div>
    </div>
  );
}
