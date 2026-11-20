"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createReserva } from "@/app/actions/reservas";
import { reagendarCita } from "@/app/actions/cliente";
import { esFestivoNacional } from "@/lib/festivos";
import { useVipTheme } from "./VipThemeProvider";
import { ChevronLeft } from "lucide-react";

// ── Tipos ─────────────────────────────────────────────────────
type Sede     = { id: string; nombre: string; direccion?: string; cerrada_emergencia?: boolean };
type Barbero  = { id: string; nombre: string; sede_id: string };
type Servicio = { id: string; nombre: string; categoria: string; duracion_minutos: number; precio: number };
type AppData  = { sedes: Sede[]; barberos: Barbero[]; servicios: Servicio[] };

type Form = {
  nombre: string; email: string; movil: string; fecha_nacimiento: string;
  sede_id: string; barbero_id: string; servicio_id: string;
  fecha: string; hora: string; metodo_pago: string; notas: string;
  acepta_privacidad: boolean;
};

type Step = "servicio" | "fecha" | "confirmar" | "exito";

const CATEGORIAS: Record<string, string> = {
  corte: "Cortes", barba: "Barba & Afeitado",
  tratamiento: "Tratamientos", estetica: "Estética", pack: "Packs",
};

const PAGOS = [
  { id: "metalico",      label: "Efectivo en barbería",                aviso: false },
  { id: "bizum",         label: "Bizum (50% anticipo)",                aviso: true  },
  { id: "transferencia", label: "Transferencia bancaria (50% anticipo)", aviso: true },
  { id: "online",        label: "Pago online",                         aviso: true  },
];

function formatFecha(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("es-ES", {
    weekday: "long", day: "numeric", month: "long",
  });
}

function diasDisponibles(dias = 21) {
  const result: { iso: string; label: string; dia: number }[] = [];
  const hoy = new Date();
  for (let i = 0; i <= dias + 7 && result.length < dias; i++) {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() + i);
    if (d.getDay() === 0) continue;
    const iso = d.toISOString().slice(0, 10);
    if (esFestivoNacional(iso)) continue;
    const label = d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
    result.push({ iso, label, dia: d.getDay() });
  }
  return result;
}

const NOMBRES_MESES: Record<number, string> = {
  1:"enero",2:"febrero",3:"marzo",4:"abril",5:"mayo",6:"junio",
  7:"julio",8:"agosto",9:"septiembre",10:"octubre",11:"noviembre",12:"diciembre",
};
function getNombreMeses(s: string) {
  return s.split(",").map(m => NOMBRES_MESES[parseInt(m,10)] ?? m).join(", ");
}

// ── Componente ─────────────────────────────────────────────────
export default function VipReservar() {
  const router = useRouter();
  const { theme } = useVipTheme();
  const isLight = theme === "light";

  // Parámetros URL — se leen primero para usarlos como valores iniciales de estado
  const searchParams   = useSearchParams();
  const servicioParam  = searchParams.get("servicio");
  const ofertaParam    = searchParams.get("oferta");
  const precioParam    = searchParams.get("precio");
  const extraParam     = searchParams.get("extra");
  const franjaParam    = searchParams.get("franja");
  const mesesParam     = searchParams.get("meses");
  const diasParam      = searchParams.get("dias");

  // Modo reagendar: pre-rellena sede/barbero/servicio y salta al paso fecha
  const reagendarCitaId = searchParams.get("reagendar");
  const isReagendar     = !!reagendarCitaId;
  const preSedeId       = searchParams.get("sede_id")     ?? "";
  const preBarberoId    = searchParams.get("barbero_id")  ?? "";
  const preServicioId   = searchParams.get("servicio_id") ?? "";

  const servicioInitRef = useRef(false);

  const [step, setStep]           = useState<Step>(isReagendar ? "fecha" : "servicio");
  const [appData, setAppData]     = useState<AppData | null>(null);
  const [slots, setSlots]         = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [submitError, setSubmitError]   = useState<string | null>(null);
  const [citaId, setCitaId]       = useState<string | null>(null);
  const [sedeCerrada, setSedeCerrada] = useState<{ cerrada: boolean; motivo?: string } | null>(null);
  const [errors, setErrors]       = useState<Partial<Record<keyof Form | "acepta_privacidad", string>>>({});
  const [ofertaAplicada, setOfertaAplicada] = useState<string | null>(null);
  const [precioOferta, setPrecioOferta]     = useState<number | null>(null);
  const [extraOferta, setExtraOferta]       = useState<string | null>(null);
  const [servicioPreselect, setServicioPreselect] = useState<{ nombre: string; precio: number } | null>(null);
  const [perfil, setPerfil]       = useState<{ nombre: string; email: string } | null>(null);

  const [form, setForm] = useState<Form>({
    nombre: "", email: "", movil: "", fecha_nacimiento: "",
    sede_id: preSedeId, barbero_id: preBarberoId, servicio_id: preServicioId,
    fecha: "", hora: "", metodo_pago: isReagendar ? "metalico" : "", notas: "",
    acepta_privacidad: true,
  });

  // Cargar perfil autenticado
  useEffect(() => {
    fetch("/api/reservas/perfil")
      .then(r => r.json())
      .then(p => {
        if (!p) return;
        setForm(f => ({
          ...f,
          nombre:           p.nombre           ?? f.nombre,
          email:            p.email            ?? f.email,
          movil:            p.telefono         ?? f.movil,
          fecha_nacimiento: p.fecha_nacimiento ?? f.fecha_nacimiento,
          acepta_privacidad: true,
        }));
        if (p.nombre) setPerfil({ nombre: p.nombre, email: p.email ?? "" });
      })
      .catch(() => {});
  }, []);

  // Cargar catálogo
  useEffect(() => {
    fetch("/api/reservas/datos").then(r => r.json()).then(setAppData);
  }, []);

  // Parámetros URL de oferta
  useEffect(() => { if (ofertaParam) setOfertaAplicada(ofertaParam); }, [ofertaParam]);
  useEffect(() => { if (precioParam) setPrecioOferta(parseFloat(precioParam)); }, [precioParam]);
  useEffect(() => { if (extraParam)  setExtraOferta(extraParam); }, [extraParam]);

  // Scroll al inicio al cambiar de paso
  useEffect(() => {
    if (step === "exito") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  // Pre-seleccionar servicio desde URL
  useEffect(() => {
    if (!appData || !servicioParam || servicioInitRef.current) return;
    servicioInitRef.current = true;
    const match = appData.servicios.find(s =>
      s.nombre.toLowerCase() === servicioParam.toLowerCase() ||
      s.nombre.toLowerCase().includes(servicioParam.toLowerCase())
    );
    if (match) {
      setForm(f => ({ ...f, servicio_id: match.id }));
    } else if (servicioParam) {
      const precio = precioParam ? parseFloat(precioParam) : 0;
      setServicioPreselect({ nombre: servicioParam, precio });
    }
  }, [appData, servicioParam, ofertaParam, precioParam]);

  const cargarSlots = useCallback(async (barberoId: string, fecha: string) => {
    if (!barberoId || !fecha) return;
    setLoadingSlots(true); setSlots([]); setSedeCerrada(null);
    try {
      const res  = await fetch(`/api/reservas/disponibilidad?barbero_id=${barberoId}&fecha=${fecha}`);
      const data = await res.json();
      setSlots(data.slots ?? []);
      setSedeCerrada(data.sede_cerrada ? { cerrada: true, motivo: data.motivo } : { cerrada: false });
    } finally { setLoadingSlots(false); }
  }, []);

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => { const n = { ...e }; delete n[key]; return n; });
  }

  function validarServicio(): boolean {
    const e: typeof errors = {};
    if (!form.sede_id)    e.sede_id    = "Selecciona una sede";
    if (!form.barbero_id) e.barbero_id = "Selecciona un barbero";
    if (!form.servicio_id && !servicioPreselect) e.servicio_id = "Selecciona un servicio";
    setErrors(e); return Object.keys(e).length === 0;
  }

  function validarFecha(): boolean {
    const e: typeof errors = {};
    if (!form.fecha) e.fecha = "Selecciona un día";
    if (!form.hora)  e.hora  = "Selecciona una hora";
    setErrors(e); return Object.keys(e).length === 0;
  }

  function validarConfirmar(): boolean {
    const e: typeof errors = {};
    if (!isReagendar && !form.metodo_pago) e.metodo_pago = "Selecciona un método de pago";
    setErrors(e); return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validarConfirmar()) return;
    setSubmitting(true); setSubmitError(null);

    // Modo reagendar: solo actualiza fecha_hora de la cita existente
    if (isReagendar && reagendarCitaId) {
      const result = await reagendarCita(reagendarCitaId, `${form.fecha}T${form.hora}:00`);
      setSubmitting(false);
      if (result.ok) setStep("exito");
      else setSubmitError(result.error ?? "Error al reagendar");
      return;
    }

    const ofertaStr = ofertaAplicada
      ? [ofertaAplicada, precioOferta != null ? `${precioOferta} €` : null, extraOferta ?? null].filter(Boolean).join(" · ")
      : null;
    const notasConOferta = ofertaStr
      ? (form.notas ? `Oferta: ${ofertaStr} | ${form.notas}` : `Oferta: ${ofertaStr}`)
      : form.notas;
    const result = await createReserva({
      ...form, notas: notasConOferta,
      ...(precioOferta != null && { precio_oferta_override: precioOferta }),
      ...(ofertaAplicada && { oferta_nombre: ofertaAplicada }),
    });
    setSubmitting(false);
    if (result.ok) { setCitaId(result.cita_id); setStep("exito"); }
    else setSubmitError(result.error);
  }

  // ── Datos derivados ────────────────────────────────────────────
  const barberosFiltrados  = appData?.barberos.filter(b => !form.sede_id || b.sede_id === form.sede_id) ?? [];
  const serviciosAgrupados = (appData?.servicios ?? []).reduce<Record<string, Servicio[]>>(
    (acc, s) => { (acc[s.categoria] ??= []).push(s); return acc; }, {}
  );
  const sedeSel    = appData?.sedes.find(s => s.id === form.sede_id);
  const barberoSel = appData?.barberos.find(b => b.id === form.barbero_id);
  const servicioSel= appData?.servicios.find(s => s.id === form.servicio_id);
  const pagoSel    = PAGOS.find(p => p.id === form.metodo_pago);
  const dias       = diasDisponibles();

  const mesesValidos  = mesesParam  ? mesesParam.split(",").map(Number)  : null;
  const diasSemanaVal = diasParam   ? diasParam.split(",").map(Number)   : null;
  const diasFiltrados = (mesesValidos || diasSemanaVal)
    ? dias.filter(d => {
        const mes = new Date(d.iso + "T12:00:00").getMonth() + 1;
        if (mesesValidos  && !mesesValidos.includes(mes))     return false;
        if (diasSemanaVal && !diasSemanaVal.includes(d.dia))  return false;
        return true;
      })
    : dias;

  const slotsMostrar = franjaParam === "manana"
    ? slots.filter(s => { const h = parseInt(s.split(":")[0], 10); return h >= 9 && h < 14; })
    : slots;

  // ── Estilos temáticos ──────────────────────────────────────────
  const bg         = "var(--vip-bg)";
  const bgCard     = "var(--vip-bg-card)";
  const border     = "var(--vip-border)";
  const textPrimary= "var(--vip-text)";
  const textMuted  = "var(--vip-muted)";
  const gold       = "#C9A84C";

  const cardCls = `rounded-xl p-5 mb-4`;
  const cardSty = { background: bgCard, border: `1px solid ${border}` };

  // Barra de progreso
  const pasos: Step[] = isReagendar
    ? ["fecha", "confirmar"]
    : ["servicio", "fecha", "confirmar"];
  const pasoIdx  = pasos.indexOf(step);
  const progreso = step === "exito" ? 100 : Math.round(((pasoIdx + 1) / pasos.length) * 100);

  // ── Header ─────────────────────────────────────────────────────
  function Header({ label, title }: { label: string; title: React.ReactNode }) {
    return (
      <div className="mb-8">
        {perfil && (
          <div className="inline-flex items-center gap-2 text-xs mb-4 px-3 py-1.5 rounded-full"
            style={{ background: `${gold}14`, border: `1px solid ${gold}30` }}>
            <span style={{ color: gold }}>✓</span>
            <span style={{ color: textMuted }}>Reservando como</span>
            <span className="font-semibold" style={{ color: textPrimary }}>{perfil.nombre}</span>
          </div>
        )}
        <p className="section-label mb-2">{label}</p>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold" style={{ color: textPrimary }}>{title}</h2>
        <div className="h-px w-10 mt-3 mb-5" style={{ background: `${gold}60` }} />
        {step !== "exito" && (
          <div>
            <div className="flex justify-between text-xs mb-1" style={{ color: textMuted }}>
              <span>Paso {pasoIdx + 1} de {pasos.length}</span>
              <span>{progreso}%</span>
            </div>
            <div className="h-0.5 rounded-full" style={{ background: border }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progreso}%`, background: gold }} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Botón de volver atrás ──────────────────────────────────────
  function BackBtn({ to }: { to: Step | "dashboard" }) {
    function handleBack() {
      if (to === "dashboard") { router.push("/espacio-vip"); return; }
      // En reagendar, "volver" desde fecha va a mis citas
      if (isReagendar && to === "servicio") { router.push("/espacio-vip/citas"); return; }
      setStep(to);
    }
    return (
      <button
        onClick={handleBack}
        className="flex items-center gap-1.5 text-sm mb-6 transition-colors"
        style={{ color: textMuted }}
      >
        <ChevronLeft className="w-4 h-4" /> Volver
      </button>
    );
  }

  // ── PASO: SERVICIO ─────────────────────────────────────────────
  if (step === "servicio") return (
    <section className="pt-8 pb-28 sm:pb-10 px-4 sm:px-6 min-h-screen" style={{ background: bg }}>
      <div className="max-w-xl mx-auto">
        <BackBtn to="dashboard" />
        <Header label="Tu visita" title={<>Sede, barbero <span className="gold-text">y servicio</span></>} />

        {ofertaAplicada && (
          <div className="rounded-xl px-4 py-4 mb-5" style={{ border: `1px solid ${gold}40`, background: `${gold}08` }}>
            <p className="text-xs tracking-widest uppercase mb-1" style={{ color: gold }}>✦ Oferta seleccionada</p>
            <p className="text-sm font-medium" style={{ color: textPrimary }}>{ofertaAplicada}</p>
            {precioOferta != null && (
              <p className="text-xs mt-1" style={{ color: textMuted }}>
                Precio especial: <span className="font-bold" style={{ color: gold }}>{precioOferta} €</span>
              </p>
            )}
          </div>
        )}

        {!appData ? (
          <p className="text-center py-16 text-sm" style={{ color: textMuted }}>Cargando...</p>
        ) : (
          <div className="space-y-4">
            {/* Sede */}
            <div className={cardCls} style={cardSty}>
              <p className="text-xs tracking-widest uppercase mb-3" style={{ color: gold }}>Sede</p>
              <div className="grid grid-cols-2 gap-3">
                {[...appData.sedes]
                  .sort((a, b) => {
                    const aQ = (a.direccion ?? "").toLowerCase().includes("san quirce");
                    const bQ = (b.direccion ?? "").toLowerCase().includes("san quirce");
                    return aQ === bQ ? 0 : aQ ? -1 : 1;
                  })
                  .map(s => (
                    <button key={s.id} type="button"
                      onClick={() => { if (!s.cerrada_emergencia) { set("sede_id", s.id); set("barbero_id", ""); } }}
                      className="p-3 rounded-lg border text-sm text-center transition-all flex flex-col items-center gap-1"
                      style={{
                        border: `1px solid ${form.sede_id === s.id ? gold : border}`,
                        background: form.sede_id === s.id ? `${gold}12` : "transparent",
                        color: s.cerrada_emergencia ? "#666" : form.sede_id === s.id ? gold : textMuted,
                        opacity: s.cerrada_emergencia ? 0.6 : 1,
                        cursor: s.cerrada_emergencia ? "not-allowed" : "pointer",
                      }}
                    >
                      <span className="font-medium text-xs">Monastery Barber Studio</span>
                      {s.direccion && (
                        <span className="text-[11px] font-semibold" style={{ color: s.cerrada_emergencia ? "#f87171" : gold }}>
                          {s.direccion}
                        </span>
                      )}
                      {s.cerrada_emergencia && <span className="text-[10px] text-red-400">⚠ Sin disponibilidad</span>}
                    </button>
                  ))}
              </div>
              {errors.sede_id && <p className="text-red-500 text-xs mt-2">{errors.sede_id}</p>}
            </div>

            {/* Barbero */}
            {form.sede_id && (
              <div className={cardCls} style={cardSty}>
                <p className="text-xs tracking-widest uppercase mb-3" style={{ color: gold }}>Barbero</p>
                <div className="grid grid-cols-3 gap-2">
                  {barberosFiltrados.map(b => (
                    <button key={b.id} type="button"
                      onClick={() => { set("barbero_id", b.id); set("hora", ""); if (form.fecha) cargarSlots(b.id, form.fecha); }}
                      className="p-3 rounded-lg border text-xs text-center transition-all"
                      style={{
                        border: `1px solid ${form.barbero_id === b.id ? gold : border}`,
                        background: form.barbero_id === b.id ? `${gold}12` : "transparent",
                        color: form.barbero_id === b.id ? gold : textMuted,
                      }}
                    >
                      <span className="font-semibold" style={{ color: textPrimary }}>{b.nombre}</span>
                    </button>
                  ))}
                </div>
                {errors.barbero_id && <p className="text-red-500 text-xs mt-2">{errors.barbero_id}</p>}
              </div>
            )}

            {/* Servicio */}
            <div className={cardCls} style={cardSty}>
              <p className="text-xs tracking-widest uppercase mb-3" style={{ color: gold }}>Servicio</p>
              {servicioPreselect ? (
                <div className="rounded-lg px-4 py-3 flex items-center justify-between"
                  style={{ border: `1px solid ${gold}30`, background: `${gold}08` }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: textPrimary }}>{servicioPreselect.nombre}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: textMuted }}>Servicio exclusivo · incluido en la oferta</p>
                  </div>
                  {precioOferta != null && <p className="font-bold text-sm" style={{ color: gold }}>{precioOferta} €</p>}
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(serviciosAgrupados).map(([cat, lista]) => (
                    <div key={cat}>
                      <p className="text-[10px] tracking-widest uppercase mb-2" style={{ color: textMuted }}>
                        {CATEGORIAS[cat] ?? cat}
                      </p>
                      <div className="space-y-1">
                        {lista.map(s => (
                          <button key={s.id} type="button"
                            onClick={() => set("servicio_id", s.id)}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-left transition-all text-sm"
                            style={{
                              border: `1px solid ${form.servicio_id === s.id ? gold : border}`,
                              background: form.servicio_id === s.id ? `${gold}10` : "transparent",
                              color: form.servicio_id === s.id ? gold : textMuted,
                            }}
                          >
                            <span>{s.nombre}</span>
                            <span className="text-xs ml-4 shrink-0 flex items-center gap-1.5">
                              {s.duracion_minutos} min ·{" "}
                              {form.servicio_id === s.id && precioOferta != null ? (
                                <>
                                  <span className="line-through opacity-40">{s.precio}€</span>
                                  <span className="font-bold" style={{ color: gold }}>{precioOferta}€</span>
                                </>
                              ) : (
                                <span>{s.precio}€</span>
                              )}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {errors.servicio_id && <p className="text-red-500 text-xs mt-2">{errors.servicio_id}</p>}
            </div>
          </div>
        )}

        <button onClick={() => validarServicio() && setStep("fecha")}
          className="btn-gold w-full justify-center mt-2">
          Siguiente: elegir fecha →
        </button>
      </div>
    </section>
  );

  // ── PASO: FECHA ────────────────────────────────────────────────
  if (step === "fecha") return (
    <section className="pt-8 pb-28 sm:pb-10 px-4 sm:px-6 min-h-screen" style={{ background: bg }}>
      <div className="max-w-xl mx-auto">
        <BackBtn to="servicio" />
        <Header label="Elige tu momento" title={<>Fecha <span className="gold-text">y hora</span></>} />

        {ofertaAplicada && (franjaParam || mesesParam || diasParam) && (
          <div className="rounded-xl px-4 py-3 mb-5 space-y-1"
            style={{ border: `1px solid ${gold}20`, background: `${gold}06` }}>
            {franjaParam === "manana" && (
              <p className="text-xs flex items-center gap-1.5" style={{ color: textMuted }}>
                <span style={{ color: gold }}>◆</span> Esta oferta aplica solo en horario de mañana (10:00–14:00)
              </p>
            )}
            {mesesParam && (
              <p className="text-xs flex items-center gap-1.5" style={{ color: textMuted }}>
                <span style={{ color: gold }}>◆</span>
                {diasFiltrados.length > 0
                  ? "Mostrando solo fechas válidas para esta oferta"
                  : `Esta oferta no está disponible en los próximos días (solo en ${getNombreMeses(mesesParam)})`
                }
              </p>
            )}
            {diasParam === "1" && (
              <p className="text-xs flex items-center gap-1.5" style={{ color: textMuted }}>
                <span style={{ color: gold }}>◆</span> Esta oferta aplica solo los lunes
              </p>
            )}
          </div>
        )}

        {/* Días */}
        <div className={cardCls} style={cardSty}>
          <p className="text-xs tracking-widest uppercase mb-3" style={{ color: gold }}>Día</p>
          {diasFiltrados.length === 0 ? (
            <div className="py-4 text-center space-y-1">
              <p className="text-sm" style={{ color: textMuted }}>No hay fechas disponibles para esta oferta.</p>
              {mesesParam && (
                <p className="text-xs" style={{ color: textMuted }}>
                  Disponible solo en {getNombreMeses(mesesParam)}.
                </p>
              )}
            </div>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {diasFiltrados.map(d => (
                <button key={d.iso} type="button"
                  onClick={() => { set("fecha", d.iso); set("hora", ""); cargarSlots(form.barbero_id, d.iso); }}
                  className="shrink-0 px-3 py-2 rounded-lg border text-xs text-center transition-all min-w-[72px]"
                  style={{
                    border: `1px solid ${form.fecha === d.iso ? gold : border}`,
                    background: form.fecha === d.iso ? `${gold}12` : "transparent",
                    color: form.fecha === d.iso ? gold : textMuted,
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          )}
          {errors.fecha && <p className="text-red-500 text-xs mt-2">{errors.fecha}</p>}
        </div>

        {/* Slots */}
        {form.fecha && (
          <div className={cardCls} style={cardSty}>
            <p className="text-xs tracking-widest uppercase mb-3" style={{ color: gold }}>Hora disponible</p>
            {loadingSlots ? (
              <p className="text-sm text-center py-4" style={{ color: textMuted }}>Consultando disponibilidad...</p>
            ) : sedeCerrada?.cerrada ? (
              <div className="py-4 space-y-3">
                <p className="text-orange-400 text-sm text-center font-medium">
                  {sedeCerrada.motivo === "emergencia"
                    ? "⚠ Esta sede no tiene disponibilidad en este momento"
                    : `⚠ Sede cerrada${sedeCerrada.motivo ? ` (${sedeCerrada.motivo})` : ""}`}
                </p>
                {(appData?.sedes.filter(s => s.id !== form.sede_id && !s.cerrada_emergencia) ?? []).length > 0 && (
                  <div className="p-3 text-center rounded-lg" style={{ border: `1px solid ${gold}20`, background: `${gold}06` }}>
                    <p className="text-xs mb-2" style={{ color: textMuted }}>¿Quieres reservar en la otra sede?</p>
                    {appData!.sedes.filter(s => s.id !== form.sede_id && !s.cerrada_emergencia).map(s => (
                      <button key={s.id} type="button"
                        onClick={() => { set("sede_id", s.id); set("barbero_id", ""); set("fecha", ""); set("hora", ""); setSedeCerrada(null); setStep("servicio"); }}
                        className="font-semibold hover:underline text-sm" style={{ color: gold }}>
                        Cambiar a {s.nombre} {s.direccion ? `(${s.direccion})` : ""}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : slotsMostrar.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: textMuted }}>
                {franjaParam === "manana" && slots.length > 0
                  ? "No hay horarios de mañana disponibles este día."
                  : "Sin horarios disponibles este día. Prueba con otro."}
              </p>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {slotsMostrar.map(s => (
                  <button key={s} type="button" onClick={() => set("hora", s)}
                    className="py-2 rounded-lg border text-xs text-center transition-all"
                    style={{
                      border: `1px solid ${form.hora === s ? gold : border}`,
                      background: form.hora === s ? `${gold}12` : "transparent",
                      color: form.hora === s ? gold : textMuted,
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {errors.hora && <p className="text-red-500 text-xs mt-2">{errors.hora}</p>}
          </div>
        )}

        <button onClick={() => validarFecha() && setStep("confirmar")}
          className="btn-gold w-full justify-center mt-2">
          Siguiente: confirmar →
        </button>
      </div>
    </section>
  );

  // ── PASO: CONFIRMAR ────────────────────────────────────────────
  if (step === "confirmar") return (
    <section className="pt-8 pb-28 sm:pb-10 px-4 sm:px-6 min-h-screen" style={{ background: bg }}>
      <div className="max-w-lg mx-auto">
        <BackBtn to="fecha" />
        <Header
          label="Último paso"
          title={isReagendar
            ? <>Confirma la <span className="gold-text">nueva fecha</span></>
            : <>Confirma tu <span className="gold-text">reserva</span></>
          }
        />

        {/* Resumen */}
        <div className="rounded-xl p-5 mb-4" style={{ border: `1px solid ${gold}25`, background: `${gold}06` }}>
          <p className="text-xs tracking-widest uppercase mb-4" style={{ color: gold }}>
            {isReagendar ? "Nueva fecha" : "Tu reserva"}
          </p>
          {[
            ...(!isReagendar ? [{ label: "Nombre", value: form.nombre || perfil?.nombre || "—" }] : []),
            { label: "Sede",     value: sedeSel?.nombre ?? "—" },
            { label: "Barbero",  value: barberoSel?.nombre ?? "—" },
            {
              label: "Servicio",
              value: servicioPreselect
                ? `${servicioPreselect.nombre}${precioOferta != null ? ` · ${precioOferta} €` : ""}`
                : `${servicioSel?.nombre} — ${servicioSel?.duracion_minutos} min · ${servicioSel?.precio}€`,
            },
            ...(!isReagendar && ofertaAplicada ? [{
              label: "Oferta",
              value: [ofertaAplicada, precioOferta != null ? `${precioOferta} €` : null, extraOferta].filter(Boolean).join(" · "),
            }] : []),
            { label: "Fecha", value: formatFecha(form.fecha) },
            { label: "Hora",  value: form.hora },
          ].map(row => (
            <div key={row.label} className="flex justify-between text-sm gap-4 py-1.5"
              style={{ borderBottom: `1px solid ${border}` }}>
              <span style={{ color: textMuted }}>{row.label}</span>
              <span className="text-right font-medium" style={{ color: textPrimary }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Método de pago — oculto en reagendar */}
        {!isReagendar && <div className={cardCls} style={cardSty}>
          <p className="text-xs tracking-widest uppercase mb-3" style={{ color: gold }}>Método de pago</p>
          <div className="space-y-2">
            {PAGOS.map(p => (
              <label key={p.id}
                className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all"
                style={{
                  border: `1px solid ${form.metodo_pago === p.id ? gold : border}`,
                  background: form.metodo_pago === p.id ? `${gold}08` : "transparent",
                }}>
                <input type="radio" name="metodo_pago" value={p.id}
                  checked={form.metodo_pago === p.id}
                  onChange={() => set("metodo_pago", p.id)}
                  className="mt-0.5 accent-[#C9A84C] shrink-0"
                />
                <span className="text-sm" style={{ color: textPrimary }}>{p.label}</span>
              </label>
            ))}
          </div>
          {errors.metodo_pago && <p className="text-red-500 text-xs mt-2">{errors.metodo_pago}</p>}
          {pagoSel?.aviso && (
            <div className="rounded-lg p-3 mt-3 text-xs" style={{ border: `1px solid ${gold}20`, background: `${gold}06`, color: textMuted }}>
              <strong style={{ color: gold }}>Política de cancelación:</strong>{" "}
              Si no acudes sin avisar con al menos 4 h de antelación, el anticipo del 50% no será reembolsado.
            </div>
          )}
        </div>}


        {/* Notas opcionales */}
        <div className="mb-4">
          <label className="text-xs tracking-widest uppercase block mb-2" style={{ color: textMuted }}>
            Notas adicionales (opcional)
          </label>
          <textarea
            value={form.notas}
            onChange={e => set("notas", e.target.value)}
            placeholder="Preferencias, peticiones especiales..."
            className="w-full h-16 resize-none rounded-lg px-3 py-2 text-sm"
            style={{ background: bgCard, border: `1px solid ${border}`, color: textPrimary }}
          />
        </div>

        {submitError && (
          <p className="text-red-400 text-sm border border-red-900/30 bg-red-950/20 px-4 py-3 mb-4 rounded-lg">
            {submitError}
          </p>
        )}

        <button onClick={handleSubmit} disabled={submitting}
          className="btn-gold w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed">
          {submitting
            ? (isReagendar ? "Reagendando..." : "Confirmando...")
            : (isReagendar ? "Confirmar nueva fecha ✦" : "Confirmar reserva ✦")
          }
        </button>
      </div>
    </section>
  );

  // ── PASO: ÉXITO ────────────────────────────────────────────────
  return (
    <section className="pt-16 pb-28 sm:pb-10 px-6 min-h-screen flex items-center" style={{ background: bg }}>
      <div className="max-w-md mx-auto text-center w-full">
        <div className="rounded-2xl p-10" style={{ border: `1px solid ${gold}30`, background: bgCard }}>
          <div className="text-5xl mb-6">✦</div>
          <p className="section-label mb-2">{isReagendar ? "Cita reagendada" : "Reserva confirmada"}</p>
          <h2 className="font-serif text-3xl font-bold mb-2" style={{ color: textPrimary }}>
            {isReagendar
              ? <>¡Nueva <span className="gold-text">fecha</span> confirmada!</>
              : <>¡Hasta <span className="gold-text">pronto</span>!</>
            }
          </h2>
          <div className="h-px w-10 mx-auto my-4" style={{ background: `${gold}60` }} />
          <div className="text-sm space-y-1 mt-4 mb-6" style={{ color: textMuted }}>
            <p className="font-semibold" style={{ color: textPrimary }}>{form.nombre || perfil?.nombre}</p>
            <p>{formatFecha(form.fecha)} a las {form.hora}</p>
            <p>{barberoSel?.nombre} · {sedeSel?.nombre}</p>
            <p>{servicioSel?.nombre ?? servicioPreselect?.nombre}</p>
            {ofertaAplicada && !isReagendar && (
              <p className="text-xs mt-1" style={{ color: gold }}>
                ✦ {ofertaAplicada}
                {precioOferta != null && <span className="ml-1">· {precioOferta} €</span>}
              </p>
            )}
          </div>
          {!isReagendar && (
            <p className="text-xs mb-6" style={{ color: textMuted }}>
              Recibirás confirmación en <strong style={{ color: textPrimary }}>{form.email || perfil?.email}</strong>.
              Recuerda avisar con al menos 4 h si necesitas cancelar.
            </p>
          )}
          {citaId && !isReagendar && (
            <p className="text-[10px] font-mono mb-6" style={{ color: textMuted }}>Ref: {citaId.slice(0, 8).toUpperCase()}</p>
          )}
          <button onClick={() => router.push(isReagendar ? "/espacio-vip/citas" : "/espacio-vip")}
            className="btn-gold inline-flex text-sm">
            {isReagendar ? "Ver mis citas →" : "Volver al Espacio VIP →"}
          </button>
        </div>
      </div>
    </section>
  );
}
