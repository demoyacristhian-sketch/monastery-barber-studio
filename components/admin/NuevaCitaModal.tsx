"use client";

import { useState, useEffect, useRef } from "react";
import { X, Loader2, AlertCircle, CheckCircle, Search, User, Clock } from "lucide-react";
import {
  obtenerDatosFormularioCita,
  buscarClientes,
  crearCitaConCliente,
} from "@/app/actions/admin";

const INPUT =
  "w-full px-3.5 py-2.5 text-sm border border-zinc-200 rounded-xl bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 transition-all";
const LABEL = "block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide";

type Servicio = { id: string; nombre: string; precio: number; duracion_minutos: number };
type Barbero  = { id: string; nombre: string; sede_id: string | null };
type Sede     = { id: string; nombre: string };
type ClienteR = { id: string; nombre: string; telefono: string | null; email: string | null };

const FORM_INICIAL = {
  clienteQuery:    "",
  clienteId:       "",
  clienteNombre:   "",
  clienteTelefono: "",
  clienteEmail:    "",
  servicioId:      "",
  barberoId:       "",
  sedeId:          "",
  fecha:           "",
  hora:            "",
  estado:          "confirmada",
  precio:          "",
  notas:           "",
};

export default function NuevaCitaModal({
  abierto,
  onCerrar,
  onExito,
}: {
  abierto:  boolean;
  onCerrar: () => void;
  onExito:  () => void;
}) {
  const [servicios, setServicios]     = useState<Servicio[]>([]);
  const [barberos,  setBarberos]      = useState<Barbero[]>([]);
  const [sedes,     setSedes]         = useState<Sede[]>([]);
  const [form,      setForm]          = useState(FORM_INICIAL);
  const [sugerencias, setSugerencias] = useState<ClienteR[]>([]);
  const [dropdown,  setDropdown]      = useState(false);
  const [cargando,  setCargando]      = useState(false);
  const [guardando, setGuardando]     = useState(false);
  const [error,     setError]         = useState<string | null>(null);
  const [exito,     setExito]         = useState(false);

  // Slots dinámicos
  const [slotsDisponibles, setSlotsDisponibles] = useState<string[]>([]);
  const [cargandoSlots,    setCargandoSlots]    = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  // Cargar datos al abrir
  useEffect(() => {
    if (!abierto) return;
    setForm(FORM_INICIAL);
    setError(null);
    setExito(false);
    setSugerencias([]);
    setSlotsDisponibles([]);
    setCargando(true);
    obtenerDatosFormularioCita().then(({ servicios, barberos, sedes }) => {
      setServicios(servicios);
      setBarberos(barberos);
      setSedes(sedes);
      if (sedes.length === 1) setForm(f => ({ ...f, sedeId: sedes[0].id }));
      setCargando(false);
    });
  }, [abierto]);

  // Precio automático al cambiar servicio
  useEffect(() => {
    if (!form.servicioId) return;
    const s = servicios.find(x => x.id === form.servicioId);
    if (s) setForm(f => ({ ...f, precio: String(s.precio ?? "") }));
  }, [form.servicioId, servicios]);

  // Slots disponibles al cambiar barbero o fecha
  useEffect(() => {
    setForm(f => ({ ...f, hora: "" }));
    if (!form.barberoId || !form.fecha) { setSlotsDisponibles([]); return; }
    setCargandoSlots(true);
    fetch(`/api/reservas/disponibilidad?barbero_id=${form.barberoId}&fecha=${form.fecha}`)
      .then(r => r.json())
      .then(({ slots }) => {
        setSlotsDisponibles(slots ?? []);
        setCargandoSlots(false);
      })
      .catch(() => { setSlotsDisponibles([]); setCargandoSlots(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.barberoId, form.fecha]);

  // Búsqueda de clientes con debounce
  useEffect(() => {
    if (form.clienteQuery.length < 2) { setSugerencias([]); setDropdown(false); return; }
    const t = setTimeout(async () => {
      const res = await buscarClientes(form.clienteQuery);
      setSugerencias(res);
      setDropdown(res.length > 0);
    }, 280);
    return () => clearTimeout(t);
  }, [form.clienteQuery]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setDropdown(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function seleccionarCliente(c: ClienteR) {
    setForm(f => ({
      ...f,
      clienteId:       c.id,
      clienteQuery:    c.nombre,
      clienteNombre:   c.nombre,
      clienteTelefono: c.telefono ?? "",
      clienteEmail:    c.email    ?? "",
    }));
    setDropdown(false);
  }

  function limpiarCliente() {
    setForm(f => ({ ...f, clienteId: "", clienteQuery: "", clienteNombre: "", clienteTelefono: "", clienteEmail: "" }));
  }

  function set(field: keyof typeof FORM_INICIAL) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);

    const nombre = form.clienteId ? form.clienteNombre : (form.clienteNombre || form.clienteQuery).trim();
    if (!nombre)      { setError("El nombre del cliente es obligatorio."); setGuardando(false); return; }
    if (!form.hora)   { setError("Selecciona una hora disponible.");       setGuardando(false); return; }
    if (!form.barberoId) { setError("Selecciona un barbero.");             setGuardando(false); return; }

    // Convertir a UTC desde hora local (España). new Date("YYYY-MM-DDTHH:MM:00")
    // en el navegador se interpreta como hora local del cliente → .toISOString() da UTC correcto.
    const fechaHoraISO = new Date(`${form.fecha}T${form.hora}:00`).toISOString();

    const result = await crearCitaConCliente({
      clienteId:       form.clienteId   || undefined,
      clienteNombre:   nombre,
      clienteTelefono: form.clienteTelefono || undefined,
      clienteEmail:    form.clienteEmail    || undefined,
      servicioId:  form.servicioId,
      barberoId:   form.barberoId,
      sedeId:      form.sedeId    || undefined,
      fechaHora:   fechaHoraISO,
      estado:      form.estado,
      precio:      form.precio ? Number(form.precio) : undefined,
      notas:       form.notas  || undefined,
    });

    setGuardando(false);
    if (!result.ok) { setError(result.error ?? "Error desconocido."); return; }
    setExito(true);
    setTimeout(() => { onExito(); onCerrar(); }, 900);
  }

  if (!abierto) return null;

  const hoy = new Date().toISOString().slice(0, 10);
  const esDomingo = form.fecha
    ? new Date(form.fecha + "T12:00:00").getDay() === 0
    : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCerrar} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col">

        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 flex-shrink-0">
          <h2 className="text-lg font-bold text-zinc-900">Nueva cita</h2>
          <button onClick={onCerrar} className="w-8 h-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-zinc-500" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="overflow-y-auto flex-1">
          {cargando ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
            </div>
          ) : exito ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
              <p className="text-zinc-700 font-medium">¡Cita creada correctamente!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-5">

              {/* ── Cliente ── */}
              <div>
                <label className={LABEL}>Cliente</label>
                {form.clienteId ? (
                  <div className="flex items-center justify-between px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                        <span className="text-xs font-semibold text-emerald-700">{form.clienteNombre.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-emerald-800">{form.clienteNombre}</p>
                        {form.clienteTelefono && <p className="text-xs text-emerald-600">{form.clienteTelefono}</p>}
                      </div>
                    </div>
                    <button type="button" onClick={limpiarCliente} className="text-xs text-emerald-600 hover:text-emerald-800 underline underline-offset-2">Cambiar</button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div ref={searchRef} className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none z-10" />
                      <input
                        type="text"
                        placeholder="Buscar cliente por nombre o teléfono…"
                        value={form.clienteQuery}
                        onChange={e => setForm(f => ({ ...f, clienteQuery: e.target.value, clienteNombre: e.target.value }))}
                        className={INPUT}
                        style={{ paddingLeft: "2.25rem" }}
                        autoComplete="off"
                      />
                      {dropdown && (
                        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-xl shadow-lg overflow-hidden">
                          {sugerencias.map(c => (
                            <button key={c.id} type="button" onClick={() => seleccionarCliente(c)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50 transition-colors text-left">
                              <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0">
                                <User className="w-3.5 h-3.5 text-zinc-400" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-zinc-900">{c.nombre}</p>
                                <p className="text-xs text-zinc-400">{c.telefono ?? c.email ?? "Sin contacto"}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-4 space-y-3">
                      <p className="text-xs text-zinc-500 font-medium flex items-center gap-1.5">
                        <User className="w-3 h-3" /> Datos del nuevo cliente
                      </p>
                      <input type="text" placeholder="Nombre completo *"
                        value={form.clienteNombre}
                        onChange={e => setForm(f => ({ ...f, clienteNombre: e.target.value, clienteQuery: e.target.value }))}
                        className={INPUT} required />
                      <div className="grid grid-cols-2 gap-3">
                        <input type="tel" placeholder="Teléfono" value={form.clienteTelefono} onChange={set("clienteTelefono")} className={INPUT} />
                        <input type="email" placeholder="Email"   value={form.clienteEmail}    onChange={set("clienteEmail")}    className={INPUT} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Servicio ── */}
              <div>
                <label className={LABEL}>Servicio</label>
                <select value={form.servicioId} onChange={set("servicioId")} required className={INPUT}>
                  <option value="">Seleccionar servicio…</option>
                  {servicios.map(s => (
                    <option key={s.id} value={s.id}>{s.nombre} — {s.precio} € ({s.duracion_minutos} min)</option>
                  ))}
                </select>
              </div>

              {/* ── Barbero ── */}
              <div>
                <label className={LABEL}>Barbero / Estilista</label>
                <select value={form.barberoId} onChange={set("barberoId")} required className={INPUT}>
                  <option value="">Seleccionar barbero…</option>
                  {barberos.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
                </select>
              </div>

              {/* ── Fecha ── */}
              <div>
                <label className={LABEL}>Fecha</label>
                <input type="date" value={form.fecha} min={hoy} onChange={set("fecha")} required className={INPUT} />
                {esDomingo && (
                  <p className="text-xs text-amber-600 mt-1.5">⚠️ Los domingos estamos cerrados. Elige otro día.</p>
                )}
              </div>

              {/* ── Hora ── */}
              <div>
                <label className={LABEL}>
                  Hora disponible
                  {form.barberoId && form.fecha && !esDomingo && (
                    <span className="text-zinc-400 ml-1 normal-case font-normal">
                      · Horario 09:00-14:00 y 16:00-21:00
                    </span>
                  )}
                </label>
                {!form.barberoId || !form.fecha ? (
                  <div className="flex items-center gap-2 px-3.5 py-2.5 border border-zinc-200 rounded-xl bg-zinc-50 text-zinc-400 text-sm">
                    <Clock className="w-4 h-4" />
                    Selecciona barbero y fecha primero
                  </div>
                ) : esDomingo ? (
                  <div className="flex items-center gap-2 px-3.5 py-2.5 border border-amber-200 rounded-xl bg-amber-50 text-amber-600 text-sm">
                    <Clock className="w-4 h-4" />
                    Domingo — cerrado
                  </div>
                ) : cargandoSlots ? (
                  <div className="flex items-center gap-2 px-3.5 py-2.5 border border-zinc-200 rounded-xl bg-zinc-50 text-zinc-400 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Comprobando disponibilidad…
                  </div>
                ) : slotsDisponibles.length === 0 ? (
                  <div className="flex items-center gap-2 px-3.5 py-2.5 border border-red-200 rounded-xl bg-red-50 text-red-600 text-sm">
                    <Clock className="w-4 h-4" />
                    Sin horas disponibles para este día y barbero
                  </div>
                ) : (
                  <select value={form.hora} onChange={set("hora")} required className={INPUT}>
                    <option value="">Seleccionar hora…</option>
                    {slotsDisponibles.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                )}
              </div>

              {/* ── Precio y estado ── */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Precio (€)</label>
                  <input type="number" step="0.01" min="0" placeholder="0.00"
                    value={form.precio} onChange={set("precio")} className={INPUT} />
                </div>
                <div>
                  <label className={LABEL}>Estado</label>
                  <select value={form.estado} onChange={set("estado")} className={INPUT}>
                    <option value="pendiente">Pendiente</option>
                    <option value="confirmada">Confirmada</option>
                  </select>
                </div>
              </div>

              {/* ── Sede ── */}
              {sedes.length > 1 && (
                <div>
                  <label className={LABEL}>Sede</label>
                  <select value={form.sedeId} onChange={set("sedeId")} className={INPUT}>
                    <option value="">Cualquier sede</option>
                    {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                  </select>
                </div>
              )}

              {/* ── Notas ── */}
              <div>
                <label className={LABEL}>Notas</label>
                <textarea placeholder="Peticiones especiales, observaciones…"
                  value={form.notas} onChange={set("notas")} rows={2}
                  className={`${INPUT} resize-none`} />
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2.5 px-3.5 py-3 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600 leading-relaxed">{error}</p>
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onCerrar}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors font-medium">
                  Cancelar
                </button>
                <button type="submit" disabled={guardando || cargandoSlots}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ background: "#C9A84C" }}>
                  {guardando ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando…</> : "Crear cita"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
