"use client";

import { useState, useTransition } from "react";
import {
  Search, SlidersHorizontal, Check, X, Loader2, Plus,
  Trash2, CheckCheck, Ban, RefreshCw, ChevronDown,
} from "lucide-react";
import {
  actualizarEstadoCita,
  eliminarCita,
  eliminarCitas,
} from "@/app/actions/admin";
import NuevaCitaModal from "./NuevaCitaModal";
import { useRouter } from "next/navigation";
import BackButton from "./BackButton";

type Cita = {
  id: string;
  fecha_hora: string;
  estado: string;
  precio_final: number | null;
  clientes: { nombre: string; telefono: string | null } | null;
  servicios: { nombre: string; duracion_minutos: number | null } | null;
  barberos:  { nombre: string } | null;
  sedes?:    { nombre: string } | null;
};

type Periodo = "proximas" | "hoy" | "mañana" | "semana" | "mes";

const BADGE: Record<string, { label: string; cls: string }> = {
  pendiente:  { label: "Pendiente",  cls: "bg-amber-50 text-amber-700 ring-1 ring-amber-200"      },
  confirmada: { label: "Confirmada", cls: "bg-blue-50 text-blue-700 ring-1 ring-blue-200"          },
  completada: { label: "Completada", cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" },
  cancelada:  { label: "Cancelada",  cls: "bg-zinc-100 text-zinc-500 ring-1 ring-zinc-200"         },
  no_show:    { label: "No asistió", cls: "bg-red-50 text-red-600 ring-1 ring-red-200"             },
};

const ESTADOS_FILTRO = ["todos", "pendiente", "confirmada", "completada", "cancelada", "no_show"] as const;

function euros(n: number | null) {
  if (n == null) return "—";
  return n.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}
function dateStr(offset = 0) {
  const d = new Date(); d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}
function semanaRange() {
  const hoy = new Date(); const en7 = new Date(hoy.getTime() + 7 * 86_400_000);
  return { lun: hoy.toISOString().slice(0, 10), dom: en7.toISOString().slice(0, 10) };
}
function mesRange() {
  const hoy = new Date(); const en30 = new Date(hoy.getTime() + 30 * 86_400_000);
  return { inicio: hoy.toISOString().slice(0, 10), fin: en30.toISOString().slice(0, 10) };
}

// ── Checkbox estilizado ───────────────────────────────────────────────────
function Checkbox({ checked, indeterminate, onChange }: {
  checked: boolean; indeterminate?: boolean; onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={e => { e.stopPropagation(); onChange(); }}
      className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-all ${
        checked || indeterminate
          ? "border-[#C9A84C] bg-[#C9A84C]"
          : "border-zinc-300 bg-white hover:border-[#C9A84C]"
      }`}
    >
      {indeterminate && !checked
        ? <div className="w-2 h-0.5 bg-white rounded" />
        : checked
        ? <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
        : null}
    </button>
  );
}

export default function CitasAdmin({ citas: citasIniciales }: { citas: Cita[] }) {
  const [items,          setItems]      = useState<Cita[]>(citasIniciales);
  const [busqueda,       setBusqueda]   = useState("");
  const [periodo,        setPeriodo]    = useState<Periodo>("proximas");
  const [filtroEstado,   setFiltroE]    = useState("todos");
  const [filtrosOpen,    setFiltrosO]   = useState(false);
  const [modalAbierto,   setModal]      = useState(false);
  const [actualizando,   setAct]        = useState<string | null>(null);
  const [eliminando,     setElim]       = useState<string | null>(null);
  const [seleccionadas,  setSel]        = useState<Set<string>>(new Set());
  const [accionMasiva,   setAccionM]    = useState(false);
  const [procesando,     setProcesando] = useState(false);
  const [, startT] = useTransition();
  const router = useRouter();

  const hoy    = dateStr(0);
  const manana = dateStr(1);
  const { lun, dom }       = semanaRange();
  const { inicio, fin: finMes } = mesRange();

  function inPeriodo(c: Cita) {
    const f = c.fecha_hora.slice(0, 10);
    if (periodo === "proximas") return f >= hoy;
    if (periodo === "hoy")      return f === hoy;
    if (periodo === "mañana")   return f === manana;
    if (periodo === "semana")   return f >= lun && f <= dom;
    return f >= inicio && f <= finMes;
  }

  const citasPeriodo = items.filter(inPeriodo);
  const filtradas = citasPeriodo.filter(c => {
    const q = busqueda.toLowerCase();
    const matchQ = !q
      || (c.clientes?.nombre ?? "").toLowerCase().includes(q)
      || (c.servicios?.nombre ?? "").toLowerCase().includes(q)
      || (c.barberos?.nombre ?? "").toLowerCase().includes(q);
    return matchQ && (filtroEstado === "todos" || c.estado === filtroEstado);
  });

  const stats = {
    total:       citasPeriodo.length,
    completadas: citasPeriodo.filter(c => c.estado === "completada").length,
    pendientes:  citasPeriodo.filter(c => c.estado === "pendiente" || c.estado === "confirmada").length,
    ingresos:    citasPeriodo.filter(c => c.estado === "completada").reduce((s, c) => s + (c.precio_final ?? 0), 0),
  };

  // Selección
  const idsVisibles    = filtradas.map(c => c.id);
  const todasSel       = idsVisibles.length > 0 && idsVisibles.every(id => seleccionadas.has(id));
  const algunasSel     = idsVisibles.some(id => seleccionadas.has(id));
  const numSel         = [...seleccionadas].filter(id => idsVisibles.includes(id)).length;

  function toggleTodas() {
    setSel(prev => {
      const next = new Set(prev);
      if (todasSel) idsVisibles.forEach(id => next.delete(id));
      else          idsVisibles.forEach(id => next.add(id));
      return next;
    });
  }
  function toggleUna(id: string) {
    setSel(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }

  // Cambio de estado individual
  async function cambiarEstado(id: string, estado: "confirmada" | "completada" | "cancelada" | "no_show") {
    setAct(id);
    startT(async () => {
      await actualizarEstadoCita(id, estado);
      setItems(prev => prev.map(c => c.id === id ? { ...c, estado } : c));
      setAct(null);
    });
  }

  // Eliminar individual
  async function handleEliminar(id: string) {
    setElim(id);
    const res = await eliminarCita(id);
    if (res.ok) {
      setItems(prev => prev.filter(c => c.id !== id));
      setSel(prev => { const next = new Set(prev); next.delete(id); return next; });
    }
    setElim(null);
  }

  // Acción masiva
  async function ejecutarAccionMasiva(accion: "completada" | "cancelada" | "no_show" | "eliminar") {
    const ids = [...seleccionadas].filter(id => idsVisibles.includes(id));
    if (!ids.length) return;
    setProcesando(true);
    setAccionM(false);

    if (accion === "eliminar") {
      const res = await eliminarCitas(ids);
      if (res.ok) {
        setItems(prev => prev.filter(c => !ids.includes(c.id)));
        setSel(new Set());
      }
    } else {
      await Promise.all(ids.map(id => actualizarEstadoCita(id, accion)));
      setItems(prev => prev.map(c => ids.includes(c.id) ? { ...c, estado: accion } : c));
      setSel(new Set());
    }
    setProcesando(false);
    router.refresh();
  }

  const labelPeriodo = ({
    proximas: "todas las próximas", hoy: "hoy", mañana: "mañana",
    semana: "próximos 7 días", mes: "próximos 30 días",
  }[periodo]) ?? "período";

  const mensajeVacio = ({
    proximas: 'No hay citas registradas. Usa "Nueva cita" para añadir una.',
    hoy: "No hay citas para hoy.", mañana: "No hay citas para mañana.",
    semana: "No hay citas en los próximos 7 días.",
    mes: "No hay citas en los próximos 30 días.",
  }[periodo]) ?? "No hay citas.";

  const periodos: { id: Periodo; label: string }[] = [
    { id: "proximas", label: "Próximas" }, { id: "hoy", label: "Hoy" },
    { id: "mañana", label: "Mañana" }, { id: "semana", label: "7 días" },
    { id: "mes", label: "Mes" },
  ];

  return (
    <div className="p-6 space-y-6">

      {/* ── Cabecera ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <BackButton />
          <h1 className="text-2xl font-bold text-zinc-900">Reservas</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Gestiona todas las citas del negocio</p>
        </div>
        <button onClick={() => setModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 flex-shrink-0"
          style={{ background: "#C9A84C" }}>
          <Plus className="w-4 h-4" /> Nueva cita
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label={labelPeriodo.charAt(0).toUpperCase() + labelPeriodo.slice(1)} value={`${stats.total} citas`} sub={`${stats.pendientes} pendientes`} />
        <KPICard label="Completadas" value={String(stats.completadas)} sub={labelPeriodo} />
        <KPICard label="Pendientes"  value={String(stats.pendientes)}  sub="por atender" />
        <KPICard label="Ingresos"    value={euros(stats.ingresos)}     sub={`${labelPeriodo} (completadas)`} />
      </div>

      {/* ── Barra de filtros ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none z-10" />
          <input type="text" placeholder="Buscar cliente..." value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full pr-4 py-2 text-sm border border-zinc-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] text-zinc-900 placeholder:text-zinc-400"
            style={{ paddingLeft: "2.25rem" }} />
        </div>

        <div className="relative">
          <button onClick={() => setFiltrosO(!filtrosOpen)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border transition-colors ${
              filtrosOpen || filtroEstado !== "todos"
                ? "bg-zinc-900 text-white border-zinc-900"
                : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"
            }`}>
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filtros
            {filtroEstado !== "todos" && <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#C9A84C" }} />}
          </button>
          {filtrosOpen && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-zinc-200 rounded-xl shadow-lg p-2 z-20 min-w-[160px]">
              {ESTADOS_FILTRO.map(e => (
                <button key={e} onClick={() => { setFiltroE(e); setFiltrosO(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    filtroEstado === e ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-50"
                  }`}>
                  {e === "todos" ? "Todos" : (BADGE[e]?.label ?? e)}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 bg-zinc-100 rounded-xl p-1">
          {periodos.map(p => (
            <button key={p.id} onClick={() => setPeriodo(p.id)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                periodo === p.id ? "text-white shadow-sm" : "text-zinc-600 hover:text-zinc-900"
              }`}
              style={periodo === p.id ? { background: "#C9A84C" } : {}}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Barra acción masiva ── */}
      {numSel > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-zinc-900 rounded-2xl text-white shadow-lg">
          <span className="text-sm font-semibold flex-shrink-0">
            {numSel} seleccionada{numSel !== 1 ? "s" : ""}
          </span>
          <div className="h-4 w-px bg-zinc-700 flex-shrink-0" />
          <div className="flex items-center gap-2 flex-wrap flex-1">
            <BulkBtn icon={CheckCheck} label="Completada" color="text-emerald-400"
              onClick={() => ejecutarAccionMasiva("completada")} disabled={procesando} />
            <BulkBtn icon={Ban} label="Cancelada" color="text-amber-400"
              onClick={() => ejecutarAccionMasiva("cancelada")} disabled={procesando} />
            <BulkBtn icon={X} label="No asistió" color="text-red-400"
              onClick={() => ejecutarAccionMasiva("no_show")} disabled={procesando} />
          </div>
          <button onClick={() => ejecutarAccionMasiva("eliminar")} disabled={procesando}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50 flex-shrink-0">
            {procesando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Eliminar
          </button>
          <button onClick={() => setSel(new Set())} className="p-1.5 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Tabla ── */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50">
                {/* Checkbox cabecera */}
                <th className="pl-4 pr-2 py-3.5 w-8">
                  <Checkbox
                    checked={todasSel}
                    indeterminate={algunasSel && !todasSel}
                    onChange={toggleTodas}
                  />
                </th>
                {["HORA / FECHA", "CLIENTE", "SERVICIO", "BARBERO", "DUR.", "PRECIO", "ESTADO", ""].map(h => (
                  <th key={h} className="px-4 py-3.5 text-left text-[11px] font-semibold text-zinc-400 tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filtradas.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-14 text-center text-sm text-zinc-400">{mensajeVacio}</td>
                </tr>
              ) : filtradas.map(c => {
                const d      = new Date(c.fecha_hora);
                const hora   = d.toLocaleTimeString("es-ES",  { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Madrid" });
                const fecha  = d.toLocaleDateString("es-ES",  { weekday: "short", day: "numeric", month: "short", timeZone: "Europe/Madrid" });
                const badge  = BADGE[c.estado] ?? BADGE.pendiente;
                const carg   = actualizando === c.id;
                const elim   = eliminando   === c.id;
                const dur    = c.servicios?.duracion_minutos;
                const isSel  = seleccionadas.has(c.id);

                return (
                  <tr key={c.id}
                    className={`hover:bg-zinc-50/50 transition-colors ${isSel ? "bg-amber-50/40" : ""}`}>
                    {/* Checkbox */}
                    <td className="pl-4 pr-2 py-3.5">
                      <Checkbox checked={isSel} onChange={() => toggleUna(c.id)} />
                    </td>

                    {/* Hora + fecha */}
                    <td className="px-4 py-3.5">
                      <p className="text-zinc-900 font-semibold tabular-nums text-sm">{hora}</p>
                      <p className="text-zinc-400 text-xs mt-0.5">{fecha}</p>
                    </td>

                    {/* Cliente */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-zinc-500">
                            {(c.clientes?.nombre ?? "?").charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-zinc-800 font-medium whitespace-nowrap">{c.clientes?.nombre ?? "—"}</div>
                          {c.clientes?.telefono && <div className="text-xs text-zinc-400">{c.clientes.telefono}</div>}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-zinc-600 whitespace-nowrap">{c.servicios?.nombre ?? "—"}</td>
                    <td className="px-4 py-3.5 text-zinc-600 whitespace-nowrap">{c.barberos?.nombre  ?? "—"}</td>
                    <td className="px-4 py-3.5 text-zinc-500 whitespace-nowrap">{dur ? `${dur} min` : "—"}</td>
                    <td className="px-4 py-3.5 text-zinc-900 font-medium tabular-nums whitespace-nowrap">{euros(c.precio_final)}</td>

                    {/* Estado */}
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3.5">
                      {carg || elim ? (
                        <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />
                      ) : (
                        <div className="flex items-center gap-0.5">
                          {c.estado !== "completada" && c.estado !== "cancelada" && (
                            <button onClick={() => cambiarEstado(c.id, "completada")}
                              className="p-1.5 rounded-lg hover:bg-emerald-50 text-zinc-300 hover:text-emerald-600 transition-colors"
                              title="Marcar completada">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {c.estado !== "cancelada" && c.estado !== "completada" && (
                            <button onClick={() => cambiarEstado(c.id, "cancelada")}
                              className="p-1.5 rounded-lg hover:bg-amber-50 text-zinc-300 hover:text-amber-500 transition-colors"
                              title="Cancelar">
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button onClick={() => handleEliminar(c.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-300 hover:text-red-500 transition-colors"
                            title="Eliminar cita">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal nueva cita */}
      <NuevaCitaModal
        abierto={modalAbierto}
        onCerrar={() => setModal(false)}
        onExito={() => {
          setModal(false);
          // Refrescar para ver la nueva cita
          router.refresh();
        }}
      />
    </div>
  );
}

function BulkBtn({ icon: Icon, label, color, onClick, disabled }: {
  icon: React.ElementType; label: string; color: string; onClick: () => void; disabled: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium bg-zinc-800 hover:bg-zinc-700 transition-colors disabled:opacity-50 ${color}`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  );
}

function KPICard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl px-5 py-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="text-2xl font-bold text-zinc-900 mt-1">{value}</p>
      <p className="text-xs text-zinc-400 mt-1">{sub}</p>
    </div>
  );
}
