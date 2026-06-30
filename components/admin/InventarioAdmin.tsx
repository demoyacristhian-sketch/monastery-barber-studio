"use client";

import { useState, useTransition } from "react";
import {
  Package, TrendingUp, AlertTriangle, Plus,
  Pencil, Check, X, Loader2, Search, Trash2,
} from "lucide-react";
import { crearProducto, actualizarProducto, eliminarProducto } from "@/app/actions/admin";
import BackButton from "./BackButton";

type Producto = {
  id: string; nombre: string; categoria: string | null; descripcion: string | null;
  precio_compra: number; precio_venta: number; stock_actual: number; stock_minimo: number;
  unidad: string | null; activo: boolean;
};

const SQL_CREAR = `CREATE TABLE inventario (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre text NOT NULL,
  categoria text DEFAULT 'General',
  descripcion text,
  precio_compra numeric(10,2) DEFAULT 0,
  precio_venta numeric(10,2) DEFAULT 0,
  stock_actual integer DEFAULT 0,
  stock_minimo integer DEFAULT 5,
  unidad text DEFAULT 'unidad',
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE inventario ENABLE ROW LEVEL SECURITY;`;

function euros(n: number) {
  return n.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}
function margen(venta: number, compra: number) {
  if (venta <= 0) return 0;
  return Math.round(((venta - compra) / venta) * 100);
}
function estadoProducto(p: Producto): "critico" | "bajo" | "ok" {
  if (p.stock_actual <= 0 || p.stock_actual < p.stock_minimo) return "critico";
  if (p.stock_actual < p.stock_minimo * 1.5) return "bajo";
  return "ok";
}

// ── Modal añadir producto ─────────────────────────────────────────────────────
function ModalNuevo({ onClose, onCreado }: {
  onClose: () => void;
  onCreado: (p: Producto) => void;
}) {
  const [form, setForm] = useState({
    nombre: "", descripcion: "", categoria: "General", unidad: "uds",
    precio_compra: "", precio_venta: "", stock_actual: "", stock_minimo: "5",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  async function crear() {
    if (!form.nombre.trim()) { setError("El nombre es obligatorio"); return; }
    setSaving(true);
    const res = await crearProducto({
      nombre: form.nombre, categoria: form.categoria || "General",
      descripcion: form.descripcion || undefined,
      precio_compra: Number(form.precio_compra) || 0,
      precio_venta:  Number(form.precio_venta)  || 0,
      stock_actual:  Number(form.stock_actual)  || 0,
      stock_minimo:  Number(form.stock_minimo)  || 5,
      unidad: form.unidad || "uds",
    });
    if (!res.ok) { setError((res as any).error ?? "Error"); setSaving(false); return; }
    onCreado({
      id: Date.now().toString(), nombre: form.nombre,
      descripcion: form.descripcion || null, categoria: form.categoria || "General",
      precio_compra: Number(form.precio_compra) || 0,
      precio_venta:  Number(form.precio_venta)  || 0,
      stock_actual:  Number(form.stock_actual)  || 0,
      stock_minimo:  Number(form.stock_minimo)  || 5,
      unidad: form.unidad || "uds", activo: true,
    });
    setSaving(false);
  }

  const f = (label: string, key: keyof typeof form, type = "text", placeholder = "") => (
    <div>
      <label className="block text-xs font-medium text-zinc-500 mb-1">{label}</label>
      <input type={type} placeholder={placeholder} value={form[key]}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] text-zinc-900 bg-white" />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-zinc-900 text-lg">Añadir producto</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400"><X className="w-4 h-4" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">{f("Nombre *", "nombre", "text", "Ej. Cera mate Uppercut")}</div>
          <div className="col-span-2">{f("Marca / descripción", "descripcion", "text", "Ej. Uppercut")}</div>
          {f("Categoría", "categoria", "text", "Ej. Ceras")}
          {f("Unidad", "unidad", "text", "uds")}
          {f("Precio venta (€)", "precio_venta", "number", "0.00")}
          {f("Precio coste (€)", "precio_compra", "number", "0.00")}
          {f("Stock actual", "stock_actual", "number", "0")}
          {f("Stock mínimo", "stock_minimo", "number", "5")}
        </div>
        {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
        <div className="flex gap-2 mt-6">
          <button onClick={crear} disabled={saving}
            className="flex-1 py-2.5 bg-[#C9A84C] hover:bg-[#B8964A] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Añadir producto
          </button>
          <button onClick={onClose} className="px-4 py-2.5 border border-zinc-200 text-zinc-600 text-sm rounded-xl hover:bg-zinc-50">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal editar producto ─────────────────────────────────────────────────────
function ModalEditar({ producto, onClose, onGuardado }: {
  producto: Producto;
  onClose: () => void;
  onGuardado: (data: Partial<Producto>) => void;
}) {
  const [form, setForm] = useState({
    nombre: producto.nombre,
    descripcion: producto.descripcion ?? "",
    categoria: producto.categoria ?? "General",
    unidad: producto.unidad ?? "uds",
    precio_compra: String(producto.precio_compra),
    precio_venta:  String(producto.precio_venta),
    stock_actual:  String(producto.stock_actual),
    stock_minimo:  String(producto.stock_minimo),
  });
  const [saving, setSaving] = useState(false);

  async function guardar() {
    setSaving(true);
    const data = {
      nombre: form.nombre, descripcion: form.descripcion || undefined,
      categoria: form.categoria || "General",
      precio_compra: Number(form.precio_compra) || 0,
      precio_venta:  Number(form.precio_venta)  || 0,
      stock_actual:  Number(form.stock_actual)  || 0,
      stock_minimo:  Number(form.stock_minimo)  || 5,
      unidad: form.unidad || "uds",
    };
    await actualizarProducto(producto.id, data);
    onGuardado(data);
    setSaving(false);
  }

  const f = (label: string, key: keyof typeof form, type = "text") => (
    <div>
      <label className="block text-xs font-medium text-zinc-500 mb-1">{label}</label>
      <input type={type} value={form[key]}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] text-zinc-900 bg-white" />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-zinc-900 text-lg">Editar producto</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400"><X className="w-4 h-4" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">{f("Nombre", "nombre")}</div>
          <div className="col-span-2">{f("Marca / descripción", "descripcion")}</div>
          {f("Categoría", "categoria")}
          {f("Unidad", "unidad")}
          {f("Precio venta (€)", "precio_venta", "number")}
          {f("Precio coste (€)", "precio_compra", "number")}
          {f("Stock actual", "stock_actual", "number")}
          {f("Stock mínimo", "stock_minimo", "number")}
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={guardar} disabled={saving}
            className="flex-1 py-2.5 bg-[#C9A84C] hover:bg-[#B8964A] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Guardar cambios
          </button>
          <button onClick={onClose} className="px-4 py-2.5 border border-zinc-200 text-zinc-600 text-sm rounded-xl hover:bg-zinc-50">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function InventarioAdmin({ productos, tablaExiste }: {
  productos: Producto[]; tablaExiste: boolean;
}) {
  const [items,      setItems]    = useState<Producto[]>(productos);
  const [busqueda,   setBusq]     = useState("");
  const [modalNew,   setModalNew] = useState(false);
  const [editando,   setEditando] = useState<Producto | null>(null);
  const [eliminando, setElim]     = useState<string | null>(null);
  const [sqlCopied,  setSqlC]     = useState(false);
  const [, start]                 = useTransition();

  const activos    = items.filter(p => p.activo);
  const bajoStk    = activos.filter(p => estadoProducto(p) !== "ok");
  const criticos   = activos.filter(p => estadoProducto(p) === "critico");
  const valorStock = activos.reduce((s, p) => s + p.precio_venta * p.stock_actual, 0);

  const filtrados  = activos.filter(p => {
    const q = busqueda.toLowerCase();
    return !q || p.nombre.toLowerCase().includes(q) || (p.descripcion ?? "").toLowerCase().includes(q) || (p.categoria ?? "").toLowerCase().includes(q);
  });

  async function handleEliminar(id: string) {
    setElim(id);
    const res = await eliminarProducto(id);
    if (res.ok) setItems(prev => prev.filter(p => p.id !== id));
    setElim(null);
  }

  function ajustarStock(id: string, delta: number) {
    const p = items.find(x => x.id === id);
    if (!p) return;
    const nuevo = Math.max(0, p.stock_actual + delta);
    setItems(prev => prev.map(x => x.id === id ? { ...x, stock_actual: nuevo } : x));
    start(async () => { await actualizarProducto(id, { stock_actual: nuevo }); });
  }

  if (!tablaExiste) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <BackButton />
          <h1 className="text-2xl font-bold text-zinc-900">Inventario</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Control de stock y ventas de productos</p>
        </div>
        <div className="bg-white border border-amber-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-zinc-900 mb-1">Tabla de inventario no encontrada</h2>
              <p className="text-sm text-zinc-500 mb-4">Crea la tabla en Supabase → SQL Editor:</p>
              <div className="relative">
                <pre className="bg-zinc-950 text-zinc-300 text-xs rounded-xl p-4 overflow-x-auto font-mono leading-relaxed">{SQL_CREAR}</pre>
                <button onClick={() => { navigator.clipboard.writeText(SQL_CREAR); setSqlC(true); setTimeout(() => setSqlC(false), 2000); }}
                  className="absolute top-3 right-3 px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-lg transition-colors">
                  {sqlCopied ? "¡Copiado!" : "Copiar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      {/* ── Cabecera ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <BackButton />
          <h1 className="text-2xl font-bold text-zinc-900">Inventario</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Control de stock y ventas de productos</p>
        </div>
        <button onClick={() => setModalNew(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#C9A84C] hover:bg-[#B8964A] text-white text-sm font-semibold rounded-xl transition-colors flex-shrink-0">
          <Plus className="w-4 h-4" /> Añadir producto
        </button>
      </div>

      {/* ── Banner bajo stock ── */}
      {bajoStk.length > 0 && (
        <div className="flex items-center justify-between gap-4 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span className="text-sm font-semibold text-amber-800 whitespace-nowrap">
              {bajoStk.length} producto{bajoStk.length !== 1 ? "s" : ""} con stock bajo
            </span>
            <span className="text-sm text-amber-600 truncate">
              {bajoStk.map(p => p.nombre).join(", ")} necesitan reposición.
            </span>
          </div>
          <button className="text-sm font-semibold text-amber-700 hover:text-amber-900 whitespace-nowrap flex-shrink-0 transition-colors">
            Pedir stock →
          </button>
        </div>
      )}

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={<Package className="w-5 h-5 text-[#C9A84C]" />}   bg="bg-[#C9A84C]/5"
          value={String(activos.length)} label="Productos activos" />
        <KpiCard icon={<TrendingUp className="w-5 h-5 text-emerald-500" />} bg="bg-emerald-50"
          value={euros(valorStock)} label="Valor en stock" />
        <KpiCard icon={<AlertTriangle className="w-5 h-5 text-amber-500" />} bg="bg-amber-50"
          value={String(bajoStk.length)} label="Bajo stock" />
        <KpiCard icon={<AlertTriangle className="w-5 h-5 text-red-500" />}   bg="bg-red-50"
          value={String(criticos.length)} label="Críticos" />
      </div>

      {/* ── Barra de búsqueda ── */}
      <div className="relative w-72">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
        <input type="text" placeholder="Buscar producto..."
          value={busqueda} onChange={e => setBusq(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-zinc-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] text-zinc-900 placeholder:text-zinc-400" />
      </div>

      {/* ── Tabla ── */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
        {filtrados.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Package className="w-10 h-10 text-zinc-200 mx-auto mb-3" />
            <p className="text-sm text-zinc-400">
              {items.length === 0 ? 'Sin productos. Usa "+ Añadir producto".' : "Sin resultados para esa búsqueda."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100">
                  {["PRODUCTO", "STOCK", "PRECIO VENTA", "COSTE", "MARGEN", "ESTADO", "", ""].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold text-zinc-400 tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {filtrados.map(p => {
                  const estado   = estadoProducto(p);
                  const isCrit   = estado === "critico";
                  const isBajo   = estado === "bajo";
                  const pct      = margen(p.precio_venta, p.precio_compra);
                  const unidad   = p.unidad ?? "uds";

                  return (
                    <tr key={p.id} className="hover:bg-zinc-50/50 transition-colors">
                      {/* Producto */}
                      <td className="px-5 py-4">
                        <p className="font-medium text-zinc-900">{p.nombre}</p>
                        {p.descripcion && <p className="text-xs text-zinc-400 mt-0.5">{p.descripcion}</p>}
                      </td>

                      {/* Stock */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <button onClick={() => ajustarStock(p.id, -1)}
                            className="w-5 h-5 rounded-full border border-zinc-200 text-zinc-400 hover:border-zinc-400 flex items-center justify-center text-xs leading-none transition-colors">
                            −
                          </button>
                          <span className={`font-bold tabular-nums text-sm ${isCrit || isBajo ? "text-red-500" : "text-zinc-900"}`}>
                            {p.stock_actual} {unidad}
                          </span>
                          <button onClick={() => ajustarStock(p.id, 1)}
                            className="w-5 h-5 rounded-full border border-zinc-200 text-zinc-400 hover:border-zinc-400 flex items-center justify-center text-xs leading-none transition-colors">
                            +
                          </button>
                        </div>
                        <p className="text-[11px] text-zinc-400">min: {p.stock_minimo}</p>
                      </td>

                      {/* Precio venta */}
                      <td className="px-5 py-4 text-zinc-700 tabular-nums">
                        {euros(p.precio_venta)}
                      </td>

                      {/* Coste */}
                      <td className="px-5 py-4 text-zinc-700 tabular-nums">
                        {euros(p.precio_compra)}
                      </td>

                      {/* Margen */}
                      <td className="px-5 py-4">
                        <span className="text-emerald-600 font-semibold tabular-nums">{pct}%</span>
                      </td>

                      {/* Estado */}
                      <td className="px-5 py-4">
                        {isCrit || isBajo ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-red-200 text-red-600 bg-red-50">
                            Crítico
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-emerald-200 text-emerald-600 bg-emerald-50">
                            En stock
                          </span>
                        )}
                      </td>

                      {/* Editar */}
                      <td className="px-5 py-4">
                        <button onClick={() => setEditando(p)}
                          className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-300 hover:text-zinc-600 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </td>

                      {/* Eliminar */}
                      <td className="px-2 py-4">
                        {eliminando === p.id ? (
                          <Loader2 className="w-3.5 h-3.5 text-zinc-400 animate-spin" />
                        ) : (
                          <button onClick={() => handleEliminar(p.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-300 hover:text-red-500 transition-colors"
                            title="Eliminar producto">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modales ── */}
      {modalNew && (
        <ModalNuevo
          onClose={() => setModalNew(false)}
          onCreado={nuevo => { setItems(prev => [...prev, nuevo]); setModalNew(false); }}
        />
      )}
      {editando && (
        <ModalEditar
          producto={editando}
          onClose={() => setEditando(null)}
          onGuardado={data => {
            setItems(prev => prev.map(p => p.id === editando.id ? { ...p, ...data } : p));
            setEditando(null);
          }}
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
