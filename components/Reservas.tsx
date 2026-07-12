"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { createReserva } from "@/app/actions/reservas";

// ── Tipos ─────────────────────────────────────────────────────
type Sede     = { id: string; nombre: string; direccion?: string; orden?: number };
type Barbero  = { id: string; nombre: string; sede_id: string };
type Servicio = { id: string; nombre: string; categoria: string; duracion_minutos: number; precio: number };

type AppData = { sedes: Sede[]; barberos: Barbero[]; servicios: Servicio[] };

type Form = {
  nombre: string; email: string; movil: string; fecha_nacimiento: string;
  sede_id: string; barbero_id: string; servicio_id: string;
  fecha: string; hora: string; metodo_pago: string; notas: string;
  acepta_privacidad: boolean;
};

type Step = "datos" | "servicio" | "fecha" | "confirmar" | "exito";

const CATEGORIAS: Record<string, string> = {
  corte: "Cortes",
  barba: "Barba & Afeitado",
  tratamiento: "Tratamientos",
  estetica: "Estética",
  pack: "Packs",
};

const PAGOS = [
  { id: "metalico",     label: "Efectivo en barbería",               aviso: false },
  { id: "bizum",        label: "Bizum (50% anticipo)",               aviso: true  },
  { id: "transferencia",label: "Transferencia bancaria (50% anticipo)",aviso: true },
  { id: "online",       label: "Pago online",                        aviso: true  },
];

// ── Helpers ────────────────────────────────────────────────────
function formatFecha(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("es-ES", {
    weekday: "long", day: "numeric", month: "long",
  });
}

function diasDisponibles(dias = 21): { iso: string; label: string; dia: number }[] {
  const result = [];
  const hoy = new Date();
  for (let i = 1; i <= dias + 7 && result.length < dias; i++) {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() + i);
    if (d.getDay() === 0) continue; // sin domingos
    const iso = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
    result.push({ iso, label, dia: d.getDay() });
  }
  return result;
}

const NOMBRES_MESES: Record<number, string> = {
  1: "enero", 2: "febrero", 3: "marzo", 4: "abril", 5: "mayo", 6: "junio",
  7: "julio", 8: "agosto", 9: "septiembre", 10: "octubre", 11: "noviembre", 12: "diciembre",
};

function getNombreMeses(mesesStr: string) {
  return mesesStr.split(",").map(m => NOMBRES_MESES[parseInt(m, 10)] ?? m).join(", ");
}

// ── Componente principal ────────────────────────────────────────
export default function Reservas() {
  const [step, setStep] = useState<Step>("datos");
  const [appData, setAppData] = useState<AppData | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [citaId, setCitaId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof Form | "acepta_privacidad", string>>>({});
  const [ofertaAplicada, setOfertaAplicada] = useState<string | null>(null);
  const [precioOferta,   setPrecioOferta]   = useState<number | null>(null);
  const [extraOferta,    setExtraOferta]    = useState<string | null>(null);
  const [contadorOferta, setContadorOferta] = useState<{ ocupadas: number; disponibles: number; agotado: boolean } | null>(null);
  const [loadingContador, setLoadingContador] = useState(false);
  // Servicio exclusivo/virtual (no existe en la BD de servicios generales)
  const [servicioPreselect, setServicioPreselect] = useState<{ nombre: string; precio: number } | null>(null);
  const [cargandoPerfil,   setCargandoPerfil]   = useState(true);
  const [clienteReconocido, setClienteReconocido] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const servicioParam = searchParams.get("servicio");
  const ofertaParam   = searchParams.get("oferta");
  const precioParam   = searchParams.get("precio");
  const extraParam    = searchParams.get("extra");
  const franjaParam   = searchParams.get("franja");   // "manana" = solo 09:00–14:00
  const mesesParam    = searchParams.get("meses");    // "8" o "7,8,9"
  const diasParam     = searchParams.get("dias");     // "1" = solo lunes
  const servicioInitRef = useRef(false);

  const [form, setForm] = useState<Form>({
    nombre: "", email: "", movil: "", fecha_nacimiento: "",
    sede_id: "", barbero_id: "", servicio_id: "",
    fecha: "", hora: "", metodo_pago: "", notas: "",
    acepta_privacidad: false,
  });

  // Cargar perfil del cliente autenticado — pre-rellenar datos y saltar paso 1 si está completo
  useEffect(() => {
    fetch("/api/reservas/perfil")
      .then(r => r.json())
      .then(perfil => {
        if (!perfil) return;
        setForm(f => ({
          ...f,
          nombre:          perfil.nombre          ?? f.nombre,
          email:           perfil.email           ?? f.email,
          movil:           perfil.telefono        ?? f.movil,
          fecha_nacimiento: perfil.fecha_nacimiento ?? f.fecha_nacimiento,
          // Si ya existe registro completo, marcar privacidad aceptada (ya la aceptaron al registrarse)
          acepta_privacidad: !!(perfil.nombre && perfil.telefono),
        }));
        if (perfil.nombre) setClienteReconocido(perfil.nombre);
        // Saltar paso de datos si tiene toda la info requerida
        if (perfil.nombre && perfil.telefono && perfil.fecha_nacimiento) {
          setStep("servicio");
        }
      })
      .catch(() => {})
      .finally(() => setCargandoPerfil(false));
  }, []);

  // Cargar sedes, barberos y servicios
  useEffect(() => {
    fetch("/api/reservas/datos")
      .then((r) => r.json())
      .then(setAppData);
  }, []);

  // Capturar oferta, precio y extra desde URL
  useEffect(() => {
    if (ofertaParam) setOfertaAplicada(ofertaParam);
  }, [ofertaParam]);

  useEffect(() => {
    if (precioParam) setPrecioOferta(parseFloat(precioParam));
  }, [precioParam]);

  useEffect(() => {
    if (extraParam) setExtraOferta(extraParam);
  }, [extraParam]);

  // Scroll al inicio de la sección al cambiar de paso
  useEffect(() => {
    if (step === "exito") return;
    const el = document.getElementById("reservas");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  // Pre-seleccionar servicio desde URL cuando cargan los datos
  useEffect(() => {
    if (!appData || !servicioParam || servicioInitRef.current) return;
    servicioInitRef.current = true;
    const match = appData.servicios.find((s) =>
      s.nombre.toLowerCase() === servicioParam.toLowerCase() ||
      s.nombre.toLowerCase().includes(servicioParam.toLowerCase()) ||
      servicioParam.toLowerCase().includes(s.nombre.toLowerCase())
    );
    if (match) {
      setForm((f) => ({ ...f, servicio_id: match.id }));
    } else if (ofertaParam || servicioParam) {
      // Servicio exclusivo/de oferta que no existe en el catálogo general
      const precio = precioParam ? parseFloat(precioParam) : 0;
      setServicioPreselect({ nombre: servicioParam, precio });
    }
  }, [appData, servicioParam, ofertaParam, precioParam]);

  // Cargar slots cuando cambia barbero o fecha
  const cargarSlots = useCallback(async (barberoId: string, fecha: string) => {
    if (!barberoId || !fecha) return;
    setLoadingSlots(true);
    setSlots([]);
    try {
      const res = await fetch(`/api/reservas/disponibilidad?barbero_id=${barberoId}&fecha=${fecha}`);
      const { slots: s } = await res.json();
      setSlots(s ?? []);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  // Cargar contador de plazas para ofertas con límite (ej: Verano Refrescante)
  const cargarContador = useCallback(async (oferta: string, fecha: string) => {
    if (!oferta || !fecha) return;
    setLoadingContador(true);
    setContadorOferta(null);
    try {
      const res = await fetch(
        `/api/reservas/oferta-contador?fecha=${fecha}&oferta=${encodeURIComponent(oferta)}`
      );
      const data = await res.json();
      setContadorOferta(data);
    } catch {
      setContadorOferta(null);
    } finally {
      setLoadingContador(false);
    }
  }, []);

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  }

  // ── Validaciones por paso ──────────────────────────────────────
  function validarDatos(): boolean {
    const e: typeof errors = {};
    if (!form.nombre.trim()) e.nombre = "Obligatorio";
    if (!form.email.trim() || !form.email.includes("@")) e.email = "Email inválido";
    if (!form.movil.trim()) e.movil = "Obligatorio";
    if (!form.fecha_nacimiento) {
      e.fecha_nacimiento = "Obligatorio";
    } else if (new Date(form.fecha_nacimiento) >= new Date()) {
      e.fecha_nacimiento = "La fecha debe ser anterior a hoy";
    }
    if (!form.acepta_privacidad) e.acepta_privacidad = "Debes aceptar la política de privacidad";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validarServicio(): boolean {
    const e: typeof errors = {};
    if (!form.sede_id)    e.sede_id    = "Selecciona una sede";
    if (!form.barbero_id) e.barbero_id = "Selecciona un barbero";
    // Si hay servicio exclusivo/virtual preseleccionado, no exigir servicio_id del catálogo
    if (!form.servicio_id && !servicioPreselect) e.servicio_id = "Selecciona un servicio";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validarFecha(): boolean {
    const e: typeof errors = {};
    if (!form.fecha) e.fecha = "Selecciona un día";
    if (!form.hora)  e.hora  = "Selecciona una hora";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validarConfirmar(): boolean {
    const e: typeof errors = {};
    if (!form.metodo_pago) e.metodo_pago = "Selecciona un método de pago";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validarConfirmar()) return;
    setSubmitting(true);
    setSubmitError(null);
    const ofertaStr = ofertaAplicada
      ? [ofertaAplicada, precioOferta != null ? `${precioOferta} €` : null, extraOferta ?? null]
          .filter(Boolean).join(" · ")
      : null;
    const notasConOferta = ofertaStr
      ? (form.notas ? `Oferta: ${ofertaStr} | ${form.notas}` : `Oferta: ${ofertaStr}`)
      : form.notas;
    const result = await createReserva({
      ...form,
      notas: notasConOferta,
      ...(precioOferta != null && { precio_oferta_override: precioOferta }),
      ...(ofertaAplicada && { oferta_nombre: ofertaAplicada }),
    });
    setSubmitting(false);
    if (result.ok) {
      setCitaId(result.cita_id);
      setStep("exito");
    } else {
      setSubmitError(result.error);
    }
  }

  // ── Datos derivados ────────────────────────────────────────────
  const barberosFiltrados = appData?.barberos.filter(
    (b) => !form.sede_id || b.sede_id === form.sede_id
  ) ?? [];

  const serviciosAgrupados = (appData?.servicios ?? []).reduce<Record<string, Servicio[]>>(
    (acc, s) => { (acc[s.categoria] ??= []).push(s); return acc; },
    {}
  );

  const sedeSel    = appData?.sedes.find((s) => s.id === form.sede_id);
  const barberoSel = appData?.barberos.find((b) => b.id === form.barbero_id);
  const servicioSel= appData?.servicios.find((s) => s.id === form.servicio_id);
  const pagoSel    = PAGOS.find((p) => p.id === form.metodo_pago);
  const dias       = diasDisponibles();

  // Restricciones de oferta: filtrar por mes y día de semana
  const mesesValidos  = mesesParam  ? mesesParam.split(",").map(Number) : null;
  const diasSemanaVal = diasParam   ? diasParam.split(",").map(Number)  : null;
  const diasFiltrados = (mesesValidos || diasSemanaVal)
    ? dias.filter(d => {
        const mes = new Date(d.iso + "T12:00:00").getMonth() + 1;
        if (mesesValidos && !mesesValidos.includes(mes)) return false;
        if (diasSemanaVal && !diasSemanaVal.includes(d.dia)) return false;
        return true;
      })
    : dias;

  // Restricción de franja horaria: filtrar slots de mañana
  const slotsMostrar = franjaParam === "manana"
    ? slots.filter(s => {
        const h = parseInt(s.split(":")[0], 10);
        return h >= 9 && h < 14;
      })
    : slots;

  // ── Barra de progreso ──────────────────────────────────────────
  const pasos: Step[] = ["datos", "servicio", "fecha", "confirmar"];
  const pasoIdx = pasos.indexOf(step);
  const progreso = step === "exito" ? 100 : Math.round(((pasoIdx + 1) / pasos.length) * 100);

  // ── UI compartida ──────────────────────────────────────────────
  function Header({ label, title }: { label: string; title: React.ReactNode }) {
    return (
      <div className="text-center mb-8 sm:mb-12">
        {clienteReconocido && (
          <div className="mb-3 flex justify-center">
            <a
              href="/espacio-vip"
              className="inline-flex items-center gap-1.5 text-xs text-[#555] hover:text-[#C9A84C] transition-colors"
            >
              <span style={{ fontSize: "0.6rem" }}>✦</span>
              Espacio VIP
            </a>
          </div>
        )}
        {clienteReconocido && (
          <div className="mb-5 inline-flex items-center gap-2 text-xs border border-[#1a1a1a] bg-[#0a0a0a] px-3 py-1.5">
            <span className="text-[#C9A84C]">✓</span>
            <span className="text-[#888]">Reservando como</span>
            <span className="text-white font-medium">{clienteReconocido}</span>
          </div>
        )}
        <p className="section-label mb-4">{label}</p>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold">{title}</h2>
        <div className="divider-gold" />
        {step !== "exito" && (
          <div className="mt-6 max-w-xs mx-auto">
            <div className="flex justify-between text-xs text-[#444] mb-1">
              <span>Paso {pasoIdx + 1} de {pasos.length}</span>
              <span>{progreso}%</span>
            </div>
            <div className="h-0.5 bg-[#1a1a1a]">
              <div
                className="h-full bg-[#C9A84C] transition-all duration-500"
                style={{ width: `${progreso}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── PASO: DATOS ────────────────────────────────────────────────
  if (step === "datos") return (
    <section id="reservas" className="py-16 sm:py-28 px-4 sm:px-6 bg-[#050505]">
      <div className="max-w-lg mx-auto">
        <Header label="¿Listo para tu transformación?" title={<>Tus <span className="gold-text">datos</span></>} />

        {/* Pantalla de carga mientras se verifica la sesión */}
        {cargandoPerfil ? (
          <div className="py-16 text-center">
            <p className="text-[#444] text-sm">Verificando sesión...</p>
          </div>
        ) : (
        <>
        <div className="card-premium p-6 space-y-4">
          <div>
            <label>Nombre y apellidos *</label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => set("nombre", e.target.value)}
              placeholder="Tu nombre completo"
            />
            {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
          </div>
          <div>
            <label>Correo electrónico *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="tu@email.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label>Móvil *</label>
            <input
              type="tel"
              value={form.movil}
              onChange={(e) => set("movil", e.target.value)}
              placeholder="+34 600 000 000"
            />
            {errors.movil && <p className="text-red-500 text-xs mt-1">{errors.movil}</p>}
          </div>
          <div>
            <label>Tu cumpleaños *</label>
            <input
              type="date"
              value={form.fecha_nacimiento}
              onChange={(e) => set("fecha_nacimiento", e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
            />
            {errors.fecha_nacimiento && <p className="text-red-500 text-xs mt-1">{errors.fecha_nacimiento}</p>}
            <div className="mt-2 px-3 py-2.5 border border-[#C9A84C]/20 bg-[#C9A84C]/5 text-xs text-[#888] leading-relaxed">
              <span className="text-[#C9A84C] font-semibold">🎂 Regalo de cumpleaños:</span>{" "}
              El día de tu cumpleaños disfrutas de un <strong className="text-white">50% de descuento</strong> en cualquier servicio.
              Se valida con DNI en la barbería. Aplica solo ese día; si cae en domingo, festivo u otra eventualidad,
              podrás aplicarlo el día anterior o posterior.
            </div>
          </div>
          <div>
            <label>Notas adicionales (opcional)</label>
            <textarea
              value={form.notas}
              onChange={(e) => set("notas", e.target.value)}
              placeholder="Preferencias, alergias, peticiones especiales..."
              className="h-20 resize-none"
            />
          </div>

          {/* Política de privacidad */}
          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={form.acepta_privacidad}
                onChange={(e) => set("acepta_privacidad", e.target.checked)}
                className="mt-0.5 shrink-0 accent-[#C9A84C] w-4 h-4"
              />
              <span className="text-xs text-[#666] leading-relaxed group-hover:text-[#888] transition-colors">
                He leído y acepto la{" "}
                <a
                  href="/privacidad"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#C9A84C] hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Política de Privacidad y Cookies
                </a>{" "}
                de Monastery Barber Studio. Consiento el tratamiento de mis datos personales,
                incluida la fecha de nacimiento, para la gestión de reservas y el descuento de cumpleaños. *
              </span>
            </label>
            {errors.acepta_privacidad && (
              <p className="text-red-500 text-xs mt-1.5 pl-7">{errors.acepta_privacidad}</p>
            )}
          </div>
        </div>
        <button
          onClick={() => validarDatos() && setStep("servicio")}
          className="btn-gold w-full justify-center mt-6"
        >
          Siguiente: elegir servicio →
        </button>
        </>
        )}
      </div>
    </section>
  );

  // ── PASO: SERVICIO ─────────────────────────────────────────────
  if (step === "servicio") return (
    <section id="reservas" className="py-16 sm:py-28 px-4 sm:px-6 bg-[#050505]">
      <div className="max-w-xl mx-auto">
        <Header label="Tu visita" title={<>Sede, barbero <span className="gold-text">y servicio</span></>} />

        {ofertaAplicada && (
          <div className="border border-[#C9A84C]/30 bg-[#C9A84C]/5 px-4 py-4 mb-6">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[#C9A84C] text-xs">✦</span>
              <span className="text-[#C9A84C] font-semibold text-xs tracking-widest uppercase">Oferta seleccionada</span>
            </div>
            <p className="text-white text-sm font-medium pl-4">{ofertaAplicada}</p>
            {precioOferta != null && (
              <p className="text-[#aaa] text-xs pl-4 mt-1">
                Precio especial:{" "}
                <span className="text-[#C9A84C] font-bold">{precioOferta} €</span>
                <span className="text-[#555] ml-1">(aplicado al confirmar)</span>
              </p>
            )}
            {extraOferta && (
              <p className="text-[#aaa] text-xs pl-4 mt-0.5">
                Incluye: <span className="text-white">{extraOferta}</span>
              </p>
            )}
            <p className="text-[#444] text-[10px] pl-4 mt-2 border-t border-[#1a1a1a] pt-2">
              Las ofertas no son combinables entre sí ni con otros descuentos.
            </p>
          </div>
        )}

        {!appData ? (
          <p className="text-[#444] text-center text-sm py-16">Cargando...</p>
        ) : (
          <div className="space-y-6">
            {/* Sede */}
            <div className="card-premium p-5">
              <p className="text-xs tracking-widest text-[#C9A84C] uppercase mb-3">Sede</p>
              <div className="grid grid-cols-2 gap-3">
                {[...appData.sedes]
                  .sort((a, b) => {
                    const aQ = (a.direccion ?? "").toLowerCase().includes("san quirce");
                    const bQ = (b.direccion ?? "").toLowerCase().includes("san quirce");
                    return aQ === bQ ? 0 : aQ ? -1 : 1;
                  })
                  .map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => { set("sede_id", s.id); set("barbero_id", ""); }}
                    className={`p-3 border text-sm text-center transition-all flex flex-col items-center gap-1 ${
                      form.sede_id === s.id
                        ? "border-[#C9A84C] bg-[#C9A84C]/10 text-[#C9A84C]"
                        : "border-[#1f1f1f] text-[#666] hover:border-[#333]"
                    }`}
                  >
                    <span className="font-medium">Monastery Barber Studio</span>
                    {s.direccion && (
                      <span className="text-[11px] leading-tight text-[#C9A84C] font-semibold tracking-wide">
                        {s.direccion}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {errors.sede_id && <p className="text-red-500 text-xs mt-2">{errors.sede_id}</p>}
            </div>

            {/* Barbero */}
            {form.sede_id && (
              <div className="card-premium p-5">
                <p className="text-xs tracking-widest text-[#C9A84C] uppercase mb-3">Barbero</p>
                <div className="grid grid-cols-3 gap-2">
                  {barberosFiltrados.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        set("barbero_id", b.id);
                        set("hora", "");
                        if (form.fecha) cargarSlots(b.id, form.fecha);
                      }}
                      className={`p-3 border text-xs text-center transition-all flex flex-col items-center gap-1 ${
                        form.barbero_id === b.id
                          ? "border-[#C9A84C] bg-[#C9A84C]/10"
                          : "border-[#1f1f1f] hover:border-[#333]"
                      }`}
                    >
                      <span className="text-white font-semibold">{b.nombre}</span>
                    </button>
                  ))}
                </div>
                {errors.barbero_id && <p className="text-red-500 text-xs mt-2">{errors.barbero_id}</p>}
              </div>
            )}

            {/* Servicio */}
            <div className="card-premium p-5">
              <p className="text-xs tracking-widest text-[#C9A84C] uppercase mb-3">Servicio</p>
              {servicioPreselect ? (
                /* Servicio exclusivo o de oferta — ya confirmado, no se puede cambiar */
                <div className="border border-[#C9A84C]/30 bg-[#C9A84C]/5 px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">{servicioPreselect.nombre}</p>
                    <p className="text-[#555] text-[10px] mt-0.5">Servicio exclusivo · incluido en la oferta</p>
                  </div>
                  <div className="text-right shrink-0">
                    {precioOferta != null && (
                      <p className="text-[#C9A84C] font-bold text-sm">{precioOferta} €</p>
                    )}
                    <span className="text-[#C9A84C] text-[10px]">✓ Seleccionado</span>
                  </div>
                </div>
              ) : (
              <div className="space-y-4">
                {Object.entries(serviciosAgrupados).map(([cat, lista]) => (
                  <div key={cat}>
                    <p className="text-[#555] text-[10px] tracking-widest uppercase mb-2">
                      {CATEGORIAS[cat] ?? cat}
                    </p>
                    <div className="space-y-1">
                      {lista.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => set("servicio_id", s.id)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 border text-left transition-all text-sm ${
                            form.servicio_id === s.id
                              ? "border-[#C9A84C] bg-[#C9A84C]/10 text-[#C9A84C]"
                              : "border-[#1a1a1a] text-[#777] hover:border-[#2a2a2a]"
                          }`}
                        >
                          <span>{s.nombre}</span>
                          <span className="text-xs ml-4 shrink-0 flex items-center gap-1.5">
                            {s.duracion_minutos} min ·
                            {form.servicio_id === s.id && precioOferta != null ? (
                              <>
                                <span className="line-through opacity-40">{s.precio}€</span>
                                <span className="text-[#C9A84C] font-bold">{precioOferta}€</span>
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

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setStep("datos")}
            className="btn-outline flex-1 justify-center text-sm"
          >
            ← Volver
          </button>
          <button
            onClick={() => validarServicio() && setStep("fecha")}
            className="btn-gold flex-1 justify-center"
          >
            Siguiente: elegir fecha →
          </button>
        </div>
      </div>
    </section>
  );

  // ── PASO: FECHA ────────────────────────────────────────────────
  if (step === "fecha") return (
    <section id="reservas" className="py-16 sm:py-28 px-4 sm:px-6 bg-[#050505]">
      <div className="max-w-xl mx-auto">
        <Header label="Elige tu momento" title={<>Fecha <span className="gold-text">y hora</span></>} />

        {/* Aviso de restricciones de oferta */}
        {ofertaAplicada && (franjaParam || mesesParam || diasParam) && (
          <div className="border border-[#C9A84C]/20 bg-[#C9A84C]/5 px-4 py-3 mb-5 space-y-1">
            {franjaParam === "manana" && (
              <p className="text-xs text-[#888] flex items-center gap-1.5">
                <span className="text-[#C9A84C]">◆</span>
                Esta oferta aplica solo en horario de mañana (09:00–14:00)
              </p>
            )}
            {mesesParam && (
              <p className="text-xs text-[#888] flex items-center gap-1.5">
                <span className="text-[#C9A84C]">◆</span>
                {diasFiltrados.length > 0
                  ? `Mostrando solo fechas válidas para esta oferta`
                  : `Esta oferta no está disponible en los próximos días (solo en ${getNombreMeses(mesesParam)})`
                }
              </p>
            )}
            {diasParam === "1" && (
              <p className="text-xs text-[#888] flex items-center gap-1.5">
                <span className="text-[#C9A84C]">◆</span>
                Esta oferta aplica solo los lunes
              </p>
            )}
          </div>
        )}

        {/* Días */}
        <div className="card-premium p-5 mb-6">
          <p className="text-xs tracking-widest text-[#C9A84C] uppercase mb-3">Día</p>
          {diasFiltrados.length === 0 ? (
            <div className="py-4 text-center space-y-1">
              <p className="text-[#555] text-sm">No hay fechas disponibles para esta oferta en los próximos días.</p>
              {mesesParam && (
                <p className="text-[#333] text-xs">
                  Oferta disponible solo en {getNombreMeses(mesesParam)}.
                </p>
              )}
            </div>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {diasFiltrados.map((d) => (
                <button
                  key={d.iso}
                  type="button"
                  onClick={() => {
                    set("fecha", d.iso);
                    set("hora", "");
                    cargarSlots(form.barbero_id, d.iso);
                    if (ofertaAplicada === "Verano Refrescante") {
                      cargarContador("Verano Refrescante", d.iso);
                    }
                  }}
                  className={`shrink-0 px-3 py-2 border text-xs text-center transition-all min-w-[72px] ${
                    form.fecha === d.iso
                      ? "border-[#C9A84C] bg-[#C9A84C]/10 text-[#C9A84C]"
                      : "border-[#1f1f1f] text-[#666] hover:border-[#333]"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          )}
          {errors.fecha && <p className="text-red-500 text-xs mt-2">{errors.fecha}</p>}
        </div>

        {/* Contador de plazas para Verano Refrescante */}
        {ofertaAplicada === "Verano Refrescante" && form.fecha && (
          <div className={`px-4 py-3 mb-5 border text-xs ${
            loadingContador
              ? "border-[#222] text-[#555]"
              : contadorOferta?.agotado
              ? "border-red-900/40 bg-red-950/10 text-red-400"
              : (contadorOferta?.disponibles ?? 10) <= 3
              ? "border-amber-900/40 bg-amber-950/10 text-amber-400"
              : "border-emerald-900/30 bg-emerald-950/10 text-emerald-400"
          }`}>
            {loadingContador ? (
              <span>Consultando plazas disponibles...</span>
            ) : contadorOferta?.agotado ? (
              <span>✗ Las 10 plazas de Verano Refrescante para este día están agotadas. Elige otro día.</span>
            ) : contadorOferta ? (
              <span>
                {contadorOferta.disponibles <= 3
                  ? `⚡ ¡Solo quedan ${contadorOferta.disponibles} de 10 plazas para este día!`
                  : `✓ Quedan ${contadorOferta.disponibles} de 10 plazas — Verano Refrescante`
                }
              </span>
            ) : null}
          </div>
        )}

        {/* Slots */}
        {form.fecha && (
          <div className="card-premium p-5 mb-6">
            <p className="text-xs tracking-widest text-[#C9A84C] uppercase mb-3">Hora disponible</p>
            {loadingSlots ? (
              <p className="text-[#444] text-sm text-center py-4">Consultando disponibilidad...</p>
            ) : slotsMostrar.length === 0 ? (
              <p className="text-[#444] text-sm text-center py-4">
                {franjaParam === "manana" && slots.length > 0
                  ? "No hay horarios de mañana disponibles este día. Prueba con otro."
                  : "Sin horarios disponibles este día. Prueba con otro."
                }
              </p>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {slotsMostrar.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set("hora", s)}
                    className={`py-2 border text-xs text-center transition-all ${
                      form.hora === s
                        ? "border-[#C9A84C] bg-[#C9A84C]/10 text-[#C9A84C]"
                        : "border-[#1f1f1f] text-[#666] hover:border-[#333]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {errors.hora && <p className="text-red-500 text-xs mt-2">{errors.hora}</p>}
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={() => setStep("servicio")} className="btn-outline flex-1 justify-center text-sm">
            ← Volver
          </button>
          <button
            onClick={() => validarFecha() && setStep("confirmar")}
            disabled={contadorOferta?.agotado === true}
            className="btn-gold flex-1 justify-center disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Siguiente: confirmar →
          </button>
        </div>
      </div>
    </section>
  );

  // ── PASO: CONFIRMAR ────────────────────────────────────────────
  if (step === "confirmar") return (
    <section id="reservas" className="py-16 sm:py-28 px-4 sm:px-6 bg-[#050505]">
      <div className="max-w-lg mx-auto">
        <Header label="Último paso" title={<>Confirma tu <span className="gold-text">reserva</span></>} />

        {/* Resumen */}
        <div className="border border-[#C9A84C]/20 bg-[#C9A84C]/5 p-6 mb-6 space-y-3">
          <p className="text-xs tracking-widest text-[#C9A84C] uppercase mb-4">Tu reserva</p>
          {[
            { label: "Nombre",   value: form.nombre },
            { label: "Sede",     value: sedeSel?.nombre ?? "—" },
            { label: "Barbero",  value: barberoSel?.nombre ?? "—" },
            {
              label: "Servicio",
              value: servicioPreselect
                ? `${servicioPreselect.nombre}${precioOferta != null ? ` · ${precioOferta} €` : ""}`
                : `${servicioSel?.nombre} — ${servicioSel?.duracion_minutos} min · ${servicioSel?.precio}€`,
            },
            ...(ofertaAplicada ? [{
              label: "Oferta",
              value: [ofertaAplicada, precioOferta != null ? `${precioOferta} €` : null, extraOferta]
                .filter(Boolean).join(" · "),
            }] : []),
            { label: "Fecha",    value: formatFecha(form.fecha) },
            { label: "Hora",     value: form.hora },
          ].map((row) => (
            <div key={row.label} className="flex justify-between text-sm gap-4">
              <span className="text-[#555] shrink-0">{row.label}</span>
              <span className="text-white text-right">{row.value}</span>
            </div>
          ))}
        </div>

        {/* Método de pago */}
        <div className="card-premium p-5 mb-6">
          <p className="text-xs tracking-widest text-[#C9A84C] uppercase mb-3">Método de pago</p>
          <div className="space-y-2">
            {PAGOS.map((p) => (
              <label
                key={p.id}
                className={`flex items-start gap-3 p-3 border cursor-pointer transition-all ${
                  form.metodo_pago === p.id
                    ? "border-[#C9A84C] bg-[#C9A84C]/5"
                    : "border-[#1f1f1f] hover:border-[#333]"
                }`}
              >
                <input
                  type="radio"
                  name="metodo_pago"
                  value={p.id}
                  checked={form.metodo_pago === p.id}
                  onChange={() => set("metodo_pago", p.id)}
                  className="mt-0.5 accent-[#C9A84C] shrink-0"
                />
                <span className="text-sm text-[#ccc]">{p.label}</span>
              </label>
            ))}
          </div>
          {errors.metodo_pago && <p className="text-red-500 text-xs mt-2">{errors.metodo_pago}</p>}

          {pagoSel?.aviso && (
            <div className="border border-[#C9A84C]/20 bg-[#C9A84C]/5 p-3 mt-3 text-xs text-[#aaa]">
              <strong className="text-[#C9A84C]">Política de cancelación:</strong>{" "}
              Si no acudes sin avisar con al menos 4 h de antelación, el anticipo del 50% no será reembolsado.
            </div>
          )}
        </div>

        {submitError && (
          <p className="text-red-400 text-sm border border-red-900/30 bg-red-950/20 px-4 py-3 mb-4">
            {submitError}
          </p>
        )}

        <div className="flex gap-3">
          <button onClick={() => setStep("fecha")} className="btn-outline flex-1 justify-center text-sm">
            ← Volver
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-gold flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Confirmando..." : "Confirmar reserva ✦"}
          </button>
        </div>
      </div>
    </section>
  );

  // ── PASO: ÉXITO ────────────────────────────────────────────────
  return (
    <section id="reservas" className="py-28 px-6 bg-[#050505]">
      <div className="max-w-md mx-auto text-center">
        <div className="border border-[#C9A84C]/30 p-12">
          <div className="text-5xl mb-6">✦</div>
          <p className="section-label mb-2">Reserva confirmada</p>
          <h2 className="font-serif text-3xl font-bold mb-2">
            ¡Hasta <span className="gold-text">pronto</span>!
          </h2>
          <div className="divider-gold" />
          <div className="text-sm text-[#666] space-y-1 mt-4 mb-8">
            <p><span className="text-white">{form.nombre}</span></p>
            <p>{formatFecha(form.fecha)} a las {form.hora}</p>
            <p>{barberoSel?.nombre} · {sedeSel?.nombre}</p>
            <p>{servicioSel?.nombre}</p>
            {ofertaAplicada && (
              <p className="text-[#C9A84C] text-xs mt-1">
                ✦ {ofertaAplicada}
                {precioOferta != null && <span className="ml-1">· {precioOferta} €</span>}
                {extraOferta && <span className="ml-1 text-[#888]">· {extraOferta}</span>}
              </p>
            )}
          </div>
          <p className="text-[#444] text-xs mb-8">
            Recibirás confirmación en <strong className="text-[#777]">{form.email}</strong>.
            Recuerda avisar con al menos 4 h si necesitas cancelar.
          </p>
          {citaId && (
            <p className="text-[#333] text-[10px] font-mono mb-6">Ref: {citaId.slice(0, 8).toUpperCase()}</p>
          )}
          <a href="/" className="inline-flex btn-gold text-sm">
            Volver al inicio →
          </a>
        </div>
      </div>
    </section>
  );
}
