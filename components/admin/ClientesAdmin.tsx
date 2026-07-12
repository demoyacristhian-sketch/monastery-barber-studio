"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import {
  Search, Users, TrendingUp, AlertTriangle, Star,
  Plus, MoreHorizontal, X, Check, Loader2, Scissors, Crown, Trash2,
} from "lucide-react";
import { actualizarCliente, crearCliente, toggleActivoCliente, actualizarSellosCliente, canjearCorteGratis, toggleVipCliente, eliminarCliente } from "@/app/actions/admin";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BackButton from "./BackButton";

type CitaMin = { id: string; estado: string; precio_final: number | null; fecha_hora: string };
type Cliente = {
  id: string; nombre: string; telefono: string | null;
  email: string | null; created_at: string; notas: string | null;
  nivel?: string | null;
  activo?: boolean | null;
  sellos?: number;
  vip?: boolean;
  citas?: CitaMin[];
};
type Tab = "todos" | "activos" | "inactivos" | "vip";

// ── Utilidades ──────────────────────────────────────────────────────────────
function iniciales(n: string) {
  return n.split(" ").slice(0, 2).map(p => p[0] ?? "").join("").toUpperCase();
}
function tiempoRelativo(fecha: string | null): string {
  if (!fecha) return "Sin visitas";
  const dias = Math.floor((Date.now() - new Date(fecha).getTime()) / 86_400_000);
  if (dias < 7) return "Esta semana";
  const sem = Math.floor(dias / 7);
  if (sem < 5) return `Hace ${sem} sem.`;
  const mes = Math.floor(dias / 30);
  if (mes < 12) return `Hace ${mes} mes${mes !== 1 ? "es" : ""}`;
  const ano = Math.floor(dias / 365);
  return `Hace ${ano} año${ano !== 1 ? "s" : ""}`;
}
function euros(n: number): string { return `${Math.round(n)} €`; }

const NIVEL_BADGE: Record<string, string> = {
  Silver: "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-300",
  Gold:   "bg-amber-50 text-amber-700 ring-1 ring-[#C9A84C]",
  Black:  "bg-zinc-900 text-white",
};

// ── Sello interactivo ────────────────────────────────────────────────────
function SelloBtn({ relleno, onClick }: { relleno: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={e => { e.stopPropagation(); onClick(); }}
      className="w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer hover:scale-125 active:scale-95 transition-transform"
      style={{ background: relleno ? "#18181b" : "#e4e4e7", outline: "none" }}
    >
      {relleno && <Star className="w-2.5 h-2.5 fill-[#C9A84C] pointer-events-none" style={{ color: "#C9A84C" }} />}
    </button>
  );
}

// ── Modal nuevo cliente ──────────────────────────────────────────────────────
function NuevoClienteModal({ onCerrar, onExito }: { onCerrar: () => void; onExito: () => void }) {
  const [form, setForm] = useState({ nombre: "", telefono: "", email: "", notas: "" });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre.trim()) { setError("El nombre es obligatorio"); return; }
    setGuardando(true);
    const res = await crearCliente({
      nombre:   form.nombre.trim(),
      telefono: form.telefono.trim() || undefined,
      email:    form.email.trim()    || undefined,
      notas:    form.notas.trim()    || undefined,
    });
    setGuardando(false);
    if (!res.ok) { setError(res.error ?? "Error al guardar"); return; }
    onExito();
  }

  const INPUT = "w-full px-3.5 py-2.5 text-sm border border-zinc-200 rounded-xl bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] placeholder:text-zinc-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onCerrar} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <h2 className="font-bold text-zinc-900">Nuevo cliente</h2>
          <button onClick={onCerrar} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          {[
            { field: "nombre",   label: "Nombre completo *", type: "text",  ph: "Carlos Martínez" },
            { field: "telefono", label: "Teléfono",           type: "tel",   ph: "+34 600 000 000" },
            { field: "email",    label: "Email",              type: "email", ph: "cliente@email.com" },
          ].map(({ field, label, type, ph }) => (
            <div key={field}>
              <label className="block text-xs font-medium text-zinc-500 mb-1.5">{label}</label>
              <input className={INPUT} type={type} placeholder={ph}
                value={(form as Record<string, unknown>)[field] as string}
                onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">Notas internas</label>
            <textarea className={`${INPUT} resize-none`} rows={3}
              placeholder="Preferencias, alergias, observaciones..."
              value={form.notas} onChange={e => setForm(p => ({ ...p, notas: e.target.value }))} />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={guardando}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 hover:opacity-90"
              style={{ background: "#C9A84C" }}>
              {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {guardando ? "Guardando…" : "Guardar cliente"}
            </button>
            <button type="button" onClick={onCerrar}
              className="px-4 py-2.5 border border-zinc-200 text-zinc-500 text-sm rounded-xl hover:bg-zinc-50">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Panel lateral de edición ──────────────────────────────────────────────
function PanelEdicion({ cliente, onClose, onSave }: {
  cliente: Cliente & { visitas: number; gasto: number; ultimaFecha: string | null };
  onClose: () => void;
  onSave: (id: string, data: Partial<Cliente>) => void;
}) {
  const [form, setForm] = useState({
    nombre:       cliente.nombre,
    telefono:     cliente.telefono ?? "",
    email:        cliente.email    ?? "",
    notas:        cliente.notas    ?? "",
    nivel:        cliente.nivel    ?? "",
    activoManual: cliente.activo !== false,
    vip:          cliente.vip === true,
  });
  const [saving, setSaving] = useState(false);
  const INPUT = "w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/20 text-zinc-900 bg-white";

  async function guardar() {
    setSaving(true);
    await Promise.all([
      toggleActivoCliente(cliente.id, form.activoManual),
      toggleVipCliente(cliente.id, form.vip),
    ]);
    const res = await actualizarCliente(cliente.id, {
      nombre:   form.nombre,
      telefono: form.telefono || undefined,
      email:    form.email    || undefined,
      notas:    form.notas    || undefined,
      nivel:    form.nivel    || undefined,
    });
    if (res.ok) onSave(cliente.id, {
      nombre:   form.nombre,
      telefono: form.telefono || null,
      email:    form.email    || null,
      notas:    form.notas    || null,
      nivel:    form.nivel    || null,
      activo:   form.activoManual,
      vip:      form.vip,
    });
    setSaving(false);
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white border-l border-zinc-200 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <h3 className="font-semibold text-zinc-900">Editar cliente</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-6 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-600">{iniciales(cliente.nombre)}</div>
            <div>
              <p className="font-medium text-zinc-900">{cliente.nombre}</p>
              <p className="text-xs text-zinc-400">{cliente.visitas} visitas · {euros(cliente.gasto)}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {[
            { field: "nombre",   label: "Nombre completo", type: "text"  },
            { field: "telefono", label: "Teléfono",         type: "tel"   },
            { field: "email",    label: "Email",            type: "email" },
          ].map(({ field, label, type }) => (
            <div key={field}>
              <label className="block text-xs font-medium text-zinc-500 mb-1.5">{label}</label>
              <input type={type} className={INPUT}
                value={(form as Record<string, unknown>)[field] as string}
                onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} />
            </div>
          ))}

          {/* Estado activo/inactivo */}
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-2">Estado del cliente</label>
            <div className="flex gap-2">
              {[{ val: true, label: "Activo", cls: "border-emerald-400 bg-emerald-50 text-emerald-700" }, { val: false, label: "Inactivo", cls: "border-red-400 bg-red-50 text-red-600" }].map(opt => (
                <button key={String(opt.val)} type="button"
                  onClick={() => setForm(p => ({ ...p, activoManual: opt.val }))}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                    form.activoManual === opt.val ? opt.cls : "border-zinc-200 bg-white text-zinc-400 hover:bg-zinc-50"
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Nivel */}
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-2">Nivel de membresía</label>
            <div className="grid grid-cols-4 gap-2">
              {(["", "Silver", "Gold", "Black"] as const).map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, nivel: n }))}
                  className={`py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                    form.nivel === n
                      ? n === "Gold"   ? "border-[#C9A84C] bg-amber-50 text-amber-700"
                      : n === "Black"  ? "border-zinc-900 bg-zinc-900 text-white"
                      : n === "Silver" ? "border-zinc-400 bg-zinc-100 text-zinc-700"
                      :                  "border-zinc-200 bg-zinc-100 text-zinc-700"
                      : "border-zinc-200 bg-white text-zinc-400 hover:bg-zinc-50"
                  }`}
                >
                  {n === "" ? "Básico" : n}
                </button>
              ))}
            </div>
          </div>

          {/* Estado VIP */}
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-2">Estado VIP</label>
            <div className="flex gap-2">
              <button type="button"
                onClick={() => setForm(p => ({ ...p, vip: false }))}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                  !form.vip ? "border-zinc-300 bg-zinc-100 text-zinc-700" : "border-zinc-200 bg-white text-zinc-400 hover:bg-zinc-50"
                }`}>
                No VIP
              </button>
              <button type="button"
                onClick={() => setForm(p => ({ ...p, vip: true }))}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition-all flex items-center justify-center gap-1.5 ${
                  form.vip ? "border-[#C9A84C] bg-amber-50 text-amber-700" : "border-zinc-200 bg-white text-zinc-400 hover:bg-zinc-50"
                }`}>
                <Crown className="w-3 h-3" /> VIP
              </button>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1.5">
              Se activa automáticamente al canjear el corte gratis
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">Notas internas</label>
            <textarea rows={4} className={`${INPUT} resize-none`}
              placeholder="Observaciones, preferencias, alergias..."
              value={form.notas} onChange={e => setForm(p => ({ ...p, notas: e.target.value }))} />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-zinc-100 flex gap-3">
          <button onClick={guardar} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-zinc-700 transition-colors disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
          <button onClick={onClose} className="px-4 py-2.5 border border-zinc-200 text-zinc-500 text-sm rounded-xl hover:bg-zinc-50">
            Cancelar
          </button>
        </div>
      </div>
    </>
  );
}

// ── Menú "..." con posición fixed (escapa de overflow-hidden) ─────────────
function MenuAcciones({ clienteId, onEditar, onEliminar }: { clienteId: string; onEditar: () => void; onEliminar: () => void }) {
  const [open, setOpen]   = useState(false);
  const [pos,  setPos]    = useState({ top: 0, right: 0 });
  const btnRef  = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router  = useRouter();

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        btnRef.current  && !btnRef.current.contains(e.target as Node)
      ) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  function handleOpen() {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, right: window.innerWidth - r.right });
    }
    setOpen(o => !o);
  }

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open && (
        <div
          ref={menuRef}
          className="fixed bg-white border border-zinc-200 rounded-xl shadow-xl py-1 z-50 min-w-[170px]"
          style={{ top: pos.top, right: pos.right }}
        >
          <button
            onClick={() => { setOpen(false); router.push(`/admin/clientes/${clienteId}`); }}
            className="w-full text-left px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            Ver ficha completa
          </button>
          <button
            onClick={() => { setOpen(false); onEditar(); }}
            className="w-full text-left px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            Editar cliente
          </button>
          <div className="my-1 border-t border-zinc-100" />
          <button
            onClick={() => {
              setOpen(false);
              if (confirm("¿Eliminar este cliente? Esta acción no se puede deshacer.")) onEliminar();
            }}
            className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Eliminar cliente
          </button>
        </div>
      )}
    </>
  );
}

// ── Componente principal ──────────────────────────────────────────────────
export default function ClientesAdmin({ clientes }: { clientes: Cliente[] }) {
  const [busqueda, setBusqueda]     = useState("");
  const [tab, setTab]               = useState<Tab>("todos");
  const [editando, setEditando]     = useState<string | null>(null);
  const [modalNuevo, setModalNuevo] = useState(false);
  const [items, setItems]           = useState(clientes);
  const router = useRouter();

  const MS_30 = 30 * 86_400_000;

  async function handleEliminar(id: string) {
    const res = await eliminarCliente(id);
    if (res.ok) setItems(prev => prev.filter(c => c.id !== id));
  }

  const enriquecidos = items.map(c => {
    const completadas = (c.citas ?? []).filter(ci => ci.estado === "completada");
    const gasto       = completadas.reduce((s, ci) => s + (ci.precio_final ?? 0), 0);
    const ordenadas   = [...completadas].sort((a, b) => b.fecha_hora.localeCompare(a.fecha_hora));
    const ultimaFecha = ordenadas[0]?.fecha_hora ?? null;
    const diasDesde   = ultimaFecha ? (Date.now() - new Date(ultimaFecha).getTime()) : Infinity;
    const visitas     = completadas.length;
    const vip         = c.vip === true;
    const activoDB    = c.activo !== false;
    const esActivo    = !vip && activoDB;
    const esInactivo  = !vip && !activoDB;
    const enRiesgo    = diasDesde > MS_30;
    const sellos      = c.sellos ?? 0;
    const corteGratis = sellos >= 10;
    return { ...c, activo: activoDB, visitas, gasto, ultimaFecha, vip, esActivo, esInactivo, enRiesgo, sellos, corteGratis };
  });

  const stats = {
    total:    enriquecidos.length,
    activos:  enriquecidos.filter(c => c.esActivo || c.vip).length,
    enRiesgo: enriquecidos.filter(c => c.enRiesgo).length,
    vip:      enriquecidos.filter(c => c.vip).length,
  };

  const filtrados = enriquecidos.filter(c => {
    const q      = busqueda.toLowerCase();
    const matchQ = !q || c.nombre.toLowerCase().includes(q) || (c.telefono ?? "").includes(q);
    const matchT =
      tab === "todos"     ? true :
      tab === "activos"   ? (c.esActivo || c.vip) :
      tab === "inactivos" ? c.esInactivo :
      c.vip;
    return matchQ && matchT;
  });

  async function toggleActivo(clienteId: string, nuevoActivo: boolean) {
    setItems(prev => prev.map(c => c.id === clienteId ? { ...c, activo: nuevoActivo } : c));
    const res = await toggleActivoCliente(clienteId, nuevoActivo);
    if (!res.ok) setItems(prev => prev.map(c => c.id === clienteId ? { ...c, activo: !nuevoActivo } : c));
  }

  async function handleSellos(clienteId: string, nuevo: number) {
    setItems(prev => prev.map(c => c.id === clienteId ? { ...c, sellos: nuevo } : c));
    await actualizarSellosCliente(clienteId, nuevo);
  }

  async function handleCanjear(clienteId: string) {
    setItems(prev => prev.map(c => c.id === clienteId ? { ...c, sellos: 0, vip: true } : c));
    await canjearCorteGratis(clienteId);
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: "todos",     label: "Todos"     },
    { id: "activos",   label: "Activos"   },
    { id: "inactivos", label: "Inactivos" },
    { id: "vip",       label: "VIP"       },
  ];

  function onSave(id: string, data: Partial<Cliente>) {
    setItems(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    setEditando(null);
  }

  const clienteEditando = enriquecidos.find(c => c.id === editando);

  return (
    <div className="p-6 space-y-6">

      {/* ── Cabecera ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <BackButton />
          <h1 className="text-2xl font-bold text-zinc-900">Clientes</h1>
          <p className="text-sm text-zinc-500 mt-0.5">CRM completo de tu peluquería</p>
        </div>
        <button
          onClick={() => setModalNuevo(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 flex-shrink-0"
          style={{ background: "#C9A84C" }}
        >
          <Plus className="w-4 h-4" /> Nuevo cliente
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={Users}         value={String(stats.total)}    label="Total clientes"       sub="en tu base de datos" />
        <KPICard icon={TrendingUp}    value={String(stats.activos)}  label="Clientes activos"     sub="activos y VIP"       />
        <KPICard icon={AlertTriangle} value={String(stats.enRiesgo)} label="En riesgo (+30 días)" sub="sin visitar"         />
        <KPICard icon={Star}          value={String(stats.vip)}      label="Clientes VIP"         sub="mayor fidelidad"     />
      </div>

      {/* ── Filtros ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none z-10" />
          <input
            type="text"
            placeholder="Buscar por nombre o teléfono..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full pr-4 py-2 text-sm border border-zinc-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] text-zinc-900 placeholder:text-zinc-400"
            style={{ paddingLeft: "2.25rem" }}
          />
        </div>
        <div className="flex items-center gap-1 bg-zinc-100 rounded-xl p-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                tab === t.id ? "text-white shadow-sm" : "text-zinc-600 hover:text-zinc-900"
              }`}
              style={tab === t.id ? { background: "#C9A84C" } : {}}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tabla ── */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100">
                {["CLIENTE", "ÚLTIMA VISITA", "VISITAS", "GASTO TOTAL", "SELLOS", "ESTADO", ""].map(h => (
                  <th key={h} className="px-4 py-3.5 text-left text-[11px] font-semibold text-zinc-400 tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center text-sm text-zinc-400">
                    No se encontraron clientes
                  </td>
                </tr>
              ) : filtrados.map(c => (
                <tr key={c.id} className="hover:bg-zinc-50/50 transition-colors">

                  {/* CLIENTE */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                        style={{
                          background: c.nivel === "Gold"  ? "linear-gradient(135deg,#C9A84C,#f0c060)"
                                    : c.nivel === "Black" ? "linear-gradient(135deg,#18181b,#3f3f46)"
                                    : c.nivel === "Silver"? "linear-gradient(135deg,#a1a1aa,#d4d4d8)"
                                    : "#f4f4f5",
                          color: c.nivel === "Silver" ? "#52525b" : c.nivel ? "#fff" : "#71717a",
                        }}>
                        {iniciales(c.nombre)}
                      </div>
                      <div className="min-w-0">
                        <Link href={`/admin/clientes/${c.id}`}
                          className="font-medium text-zinc-900 hover:text-[#C9A84C] transition-colors truncate block">
                          {c.nombre}
                        </Link>
                        {c.telefono && <div className="text-xs text-zinc-400">{c.telefono}</div>}
                        {c.email    && <div className="text-xs text-zinc-400">{c.email}</div>}
                        {c.nivel    && (
                          <span className={`inline-flex mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold ${NIVEL_BADGE[c.nivel] ?? ""}`}>
                            {c.nivel}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* ÚLTIMA VISITA */}
                  <td className="px-4 py-3.5 text-zinc-600">{tiempoRelativo(c.ultimaFecha)}</td>

                  {/* VISITAS */}
                  <td className="px-4 py-3.5 text-zinc-900 font-medium tabular-nums">{c.visitas}</td>

                  {/* GASTO TOTAL */}
                  <td className="px-4 py-3.5 text-zinc-900 font-medium tabular-nums">{euros(c.gasto)}</td>

                  {/* SELLOS — interactivos + sello 11 especial */}
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1 mb-1 flex-wrap items-center">
                      {Array.from({ length: 10 }).map((_, i) => {
                        const nuevo = (i + 1 === c.sellos) ? i : i + 1;
                        return (
                          <SelloBtn
                            key={i}
                            relleno={i < c.sellos}
                            onClick={() => handleSellos(c.id, nuevo)}
                          />
                        );
                      })}
                      {/* Separador */}
                      <div className="w-px h-[18px] bg-zinc-200 mx-0.5 flex-shrink-0" />
                      {/* Sello 11 — corte gratis */}
                      <button
                        type="button"
                        disabled={!c.corteGratis}
                        onClick={e => { e.stopPropagation(); if (c.corteGratis) handleCanjear(c.id); }}
                        title={c.corteGratis ? "Entregar corte gratis → reinicia sellos" : "Completa 10 sellos para desbloquear"}
                        className="w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                        style={{
                          background: c.corteGratis ? "linear-gradient(135deg,#C9A84C,#f0c060)" : "transparent",
                          border: c.corteGratis ? "none" : "2px dashed #d4d4d8",
                          cursor: c.corteGratis ? "pointer" : "default",
                          outline: "none",
                        }}
                      >
                        <Scissors
                          className="w-3 h-3 pointer-events-none"
                          style={{ color: c.corteGratis ? "#fff" : "#a1a1aa" }}
                        />
                      </button>
                    </div>
                    {c.corteGratis ? (
                      <span className="text-[10px] font-bold" style={{ color: "#C9A84C" }}>🎁 Toca las tijeras</span>
                    ) : (
                      <span className="text-[11px] text-zinc-400">{c.sellos}/10</span>
                    )}
                  </td>

                  {/* ESTADO — clic para alternar activo/inactivo */}
                  <td className="px-4 py-3.5">
                    {c.vip ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                        <Crown className="w-3 h-3" /> VIP
                      </span>
                    ) : (
                      <button
                        onClick={() => toggleActivo(c.id, !c.activo)}
                        title={c.esActivo ? "Clic para marcar inactivo" : "Clic para marcar activo"}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-opacity hover:opacity-70 ${
                          c.esActivo
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                            : "bg-red-50 text-red-600 ring-1 ring-red-200"
                        }`}
                      >
                        {c.esActivo ? "activo" : "inactivo"}
                      </button>
                    )}
                  </td>

                  {/* Menú */}
                  <td className="px-4 py-3.5">
                    <MenuAcciones clienteId={c.id} onEditar={() => setEditando(c.id)} onEliminar={() => handleEliminar(c.id)} />
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modales */}
      {modalNuevo && (
        <NuevoClienteModal
          onCerrar={() => setModalNuevo(false)}
          onExito={() => { setModalNuevo(false); router.refresh(); }}
        />
      )}
      {editando && clienteEditando && (
        <PanelEdicion
          cliente={clienteEditando}
          onClose={() => setEditando(null)}
          onSave={onSave}
        />
      )}
    </div>
  );
}

function KPICard({ icon: Icon, value, label, sub }: {
  icon: React.ElementType; value: string; label: string; sub: string;
}) {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl px-5 py-4">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: "rgba(201,168,76,0.1)" }}>
        <Icon className="w-4 h-4" style={{ color: "#C9A84C" }} />
      </div>
      <p className="text-2xl font-bold text-zinc-900">{value}</p>
      <p className="text-sm text-zinc-600 mt-0.5">{label}</p>
      <p className="text-xs text-zinc-400 mt-0.5">{sub}</p>
    </div>
  );
}
