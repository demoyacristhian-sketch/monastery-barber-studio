"use client";

import { useState, useTransition } from "react";
import {
  Users, CalendarDays, DollarSign, TrendingUp,
  Plus, Check, X, Loader2, Pencil,
} from "lucide-react";
import { actualizarBarbero, crearBarbero } from "@/app/actions/admin";
import BackButton from "./BackButton";

type Barbero = {
  id: string;
  nombre: string;
  email: string;
  activo: boolean;
  sede_id: string | null;
  created_at?: string;
  comision?: number | null;
  cargo?: string | null;
};
type Sede    = { id: string; nombre: string };
type CitaMes = { barbero_id: string; estado: string; precio_final: number | null };

function euros(n: number) {
  return n.toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
}
function anioDesde(iso?: string) {
  if (!iso) return new Date().getFullYear();
  return new Date(iso).getFullYear();
}
function iniciales(nombre: string) {
  return nombre.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
}

// ── Modal añadir empleado ────────────────────────────────────────────────────
function ModalNuevo({ sedes, onClose, onCreado }: {
  sedes: Sede[];
  onClose: () => void;
  onCreado: (b: Barbero) => void;
}) {
  const [form, setForm]   = useState({ nombre: "", email: "", sede_id: "", cargo: "Barbero", comision: "20" });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  async function crear() {
    if (!form.nombre.trim()) { setError("El nombre es obligatorio"); return; }
    setSaving(true);
    const res = await crearBarbero({ nombre: form.nombre, email: form.email, sede_id: form.sede_id || undefined });
    if (!res.ok) { setError((res as any).error ?? "Error al crear"); setSaving(false); return; }
    onCreado({
      id: Date.now().toString(), nombre: form.nombre, email: form.email,
      activo: true, sede_id: form.sede_id || null,
      cargo: form.cargo, comision: parseFloat(form.comision) || 20,
    });
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-zinc-900 text-lg">Añadir empleado</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-3">
          <Field label="Nombre *">
            <input autoFocus placeholder="Ej. Juan García" value={form.nombre}
              onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] text-zinc-900 bg-white" />
          </Field>
          <Field label="Email">
            <input placeholder="barbero@email.com" value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] text-zinc-900 bg-white" />
          </Field>
          <Field label="Cargo">
            <select value={form.cargo} onChange={e => setForm(p => ({ ...p, cargo: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] text-zinc-700 bg-white">
              <option>Barbero</option>
              <option>Barbero Senior</option>
              <option>Maestro Barbero</option>
              <option>Estilista</option>
              <option>Aprendiz</option>
            </select>
          </Field>
          <Field label="Comisión (%)">
            <input type="number" min="0" max="100" placeholder="20" value={form.comision}
              onChange={e => setForm(p => ({ ...p, comision: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] text-zinc-900 bg-white" />
          </Field>
          <Field label="Sede">
            <select value={form.sede_id} onChange={e => setForm(p => ({ ...p, sede_id: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] text-zinc-700 bg-white">
              <option value="">Sin sede</option>
              {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          </Field>
        </div>

        {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

        <div className="flex gap-2 mt-6">
          <button onClick={crear} disabled={saving}
            className="flex-1 py-2.5 bg-[#C9A84C] hover:bg-[#B8964A] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Añadir empleado
          </button>
          <button onClick={onClose} className="px-4 py-2.5 border border-zinc-200 text-zinc-600 text-sm rounded-xl hover:bg-zinc-50">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-500 mb-1">{label}</label>
      {children}
    </div>
  );
}

// ── Tarjeta de empleado ───────────────────────────────────────────────────────
function TarjetaEmpleado({ b, sedes, stats, onToggle, onUpdate }: {
  b: Barbero;
  sedes: Sede[];
  stats: { cortes: number; ingresos: number; ticketMedio: number };
  onToggle: () => void;
  onUpdate: (data: Partial<Barbero>) => void;
}) {
  const [editando, setEditando] = useState(false);
  const [form, setForm]         = useState<Partial<Barbero>>({});
  const [saving, setSaving]     = useState(false);
  const [, start]               = useTransition();

  const comision   = b.comision ?? 20;
  const cargo      = b.cargo ?? "Barbero";
  const anio       = anioDesde(b.created_at);
  const comisionA  = (stats.ingresos * comision) / 100;

  function iniciarEdit() {
    setForm({ nombre: b.nombre, email: b.email, sede_id: b.sede_id, cargo, comision });
    setEditando(true);
  }

  async function guardar() {
    if (!form.nombre?.trim()) return;
    setSaving(true);
    await actualizarBarbero(b.id, {
      nombre: form.nombre,
      email: form.email ?? "",
      sede_id: form.sede_id ?? undefined,
    });
    onUpdate(form);
    setEditando(false);
    setSaving(false);
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
      {/* Cabecera */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-11 h-11 rounded-full bg-[#C9A84C]/10 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-[#B8964A]">{iniciales(b.nombre)}</span>
          </div>

          <div className="flex-1 min-w-0">
            {editando ? (
              <div className="space-y-2">
                <input autoFocus value={form.nombre ?? ""} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                  placeholder="Nombre"
                  className="w-full px-2.5 py-1.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-[#C9A84C] text-zinc-900 bg-white" />
                <input value={form.email ?? ""} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="Email"
                  className="w-full px-2.5 py-1.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-[#C9A84C] text-zinc-900 bg-white" />
                <div className="grid grid-cols-2 gap-2">
                  <select value={form.cargo ?? ""} onChange={e => setForm(p => ({ ...p, cargo: e.target.value }))}
                    className="px-2.5 py-1.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-[#C9A84C] text-zinc-700 bg-white">
                    <option>Barbero</option>
                    <option>Barbero Senior</option>
                    <option>Maestro Barbero</option>
                    <option>Estilista</option>
                    <option>Aprendiz</option>
                  </select>
                  <input type="number" min="0" max="100" value={form.comision ?? 20}
                    onChange={e => setForm(p => ({ ...p, comision: parseFloat(e.target.value) || 0 }))}
                    placeholder="Comisión %"
                    className="px-2.5 py-1.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-[#C9A84C] text-zinc-900 bg-white" />
                </div>
                <select value={form.sede_id ?? ""} onChange={e => setForm(p => ({ ...p, sede_id: e.target.value }))}
                  className="w-full px-2.5 py-1.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-[#C9A84C] text-zinc-700 bg-white">
                  <option value="">Sin sede</option>
                  {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
              </div>
            ) : (
              <>
                <p className="font-semibold text-zinc-900 text-[15px] leading-tight">{b.nombre}</p>
                <p className="text-xs text-zinc-400 mt-0.5">{cargo} · desde {anio}</p>
              </>
            )}
          </div>

          {/* Badge activo + acciones */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {editando ? (
              saving ? <Loader2 className="w-4 h-4 animate-spin text-zinc-400" /> : (
                <>
                  <button onClick={guardar} className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setEditando(false)} className="p-1.5 rounded-lg bg-zinc-100 text-zinc-500 hover:bg-zinc-200 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </>
              )
            ) : (
              <>
                <button
                  onClick={onToggle}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors ${
                    b.activo
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                  }`}>
                  {b.activo ? "activo" : "inactivo"}
                </button>
                <button onClick={iniciarEdit} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats 2×2 */}
      <div className="px-5 pb-4 grid grid-cols-2 gap-3">
        <StatBox value={String(stats.cortes)}        label="Cortes"       />
        <StatBox value={euros(stats.ingresos)}       label="Ingresos"     />
        <StatBox value={euros(stats.ticketMedio)}    label="Ticket medio" />
        <StatBox value={`${comision}%`}              label="Comisión (%)" />
      </div>

      {/* Footer comisión a pagar */}
      <div className="border-t border-zinc-100 px-5 py-3.5 flex items-center justify-between">
        <span className="text-sm text-zinc-500">Comisión a pagar</span>
        <span className="text-sm font-bold text-[#C9A84C]">{euros(comisionA)}</span>
      </div>
    </div>
  );
}

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-zinc-50 rounded-xl px-3 py-3 text-center">
      <p className="text-lg font-bold text-zinc-900 tabular-nums">{value}</p>
      <p className="text-xs text-zinc-400 mt-0.5">{label}</p>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function EquipoAdmin({ barberos, sedes, citasMes }: {
  barberos: Barbero[]; sedes: Sede[]; citasMes: CitaMes[];
}) {
  const [items, setItems]   = useState<Barbero[]>(barberos);
  const [modal, setModal]   = useState(false);
  const [, start]           = useTransition();

  function toggleActivo(id: string) {
    const b = items.find(x => x.id === id);
    if (!b) return;
    setItems(prev => prev.map(x => x.id === id ? { ...x, activo: !x.activo } : x));
    start(async () => { await actualizarBarbero(id, { activo: !b.activo }); });
  }

  function actualizarItem(id: string, data: Partial<Barbero>) {
    setItems(prev => prev.map(b => b.id === id ? { ...b, ...data } : b));
  }

  function statsBarb(id: string) {
    const cc          = citasMes.filter(c => c.barbero_id === id);
    const completadas = cc.filter(c => c.estado === "completada");
    const ingresos    = completadas.reduce((s, c) => s + (c.precio_final ?? 0), 0);
    const cortes      = completadas.length;
    return { cortes, ingresos, ticketMedio: cortes > 0 ? ingresos / cortes : 0 };
  }

  const activos    = items.filter(b => b.activo).length;
  const citasTotal = citasMes.length;
  const ingresosTotal = citasMes
    .filter(c => c.estado === "completada")
    .reduce((s, c) => s + (c.precio_final ?? 0), 0);
  const completadasTotal = citasMes.filter(c => c.estado === "completada").length;
  const ticketGlobal = completadasTotal > 0 ? ingresosTotal / completadasTotal : 0;

  return (
    <div className="p-6 space-y-6">

      {/* ── Cabecera ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <BackButton />
          <h1 className="text-2xl font-bold text-zinc-900">Equipo</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Rendimiento y gestión de empleados</p>
        </div>
        <button onClick={() => setModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#C9A84C] hover:bg-[#B8964A] text-white text-sm font-semibold rounded-xl transition-colors flex-shrink-0">
          <Plus className="w-4 h-4" /> Añadir empleado
        </button>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={<Users className="w-5 h-5 text-[#C9A84C]" />} bg="bg-[#C9A84C]/5"
          value={String(activos)} label="Empleados activos" />
        <KpiCard icon={<CalendarDays className="w-5 h-5 text-[#C9A84C]" />} bg="bg-[#C9A84C]/5"
          value={String(citasTotal)} label="Citas este mes" />
        <KpiCard icon={<DollarSign className="w-5 h-5 text-[#C9A84C]" />} bg="bg-[#C9A84C]/5"
          value={euros(ingresosTotal)} label="Ingresos (mes)" />
        <KpiCard icon={<TrendingUp className="w-5 h-5 text-[#C9A84C]" />} bg="bg-[#C9A84C]/5"
          value={euros(ticketGlobal)} label="Ticket medio" />
      </div>

      {/* ── Tarjetas de empleados ── */}
      {items.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl px-6 py-16 text-center">
          <p className="text-zinc-400 text-sm">No hay empleados. Añade el primero.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {items.map(b => (
            <TarjetaEmpleado
              key={b.id}
              b={b}
              sedes={sedes}
              stats={statsBarb(b.id)}
              onToggle={() => toggleActivo(b.id)}
              onUpdate={data => actualizarItem(b.id, data)}
            />
          ))}
        </div>
      )}

      {/* ── Modal nuevo empleado ── */}
      {modal && (
        <ModalNuevo
          sedes={sedes}
          onClose={() => setModal(false)}
          onCreado={nuevo => { setItems(prev => [...prev, nuevo]); setModal(false); }}
        />
      )}
    </div>
  );
}

function KpiCard({ icon, bg, value, label }: {
  icon: React.ReactNode; bg: string; value: string; label: string;
}) {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl px-5 py-4">
      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-zinc-900">{value}</p>
      <p className="text-sm text-zinc-500 mt-0.5">{label}</p>
    </div>
  );
}
