"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";
import { createReserva } from "@/app/actions/reservas";

// ── Tipos ─────────────────────────────────────────────────────
type Sede     = { id: string; nombre: string };
type Barbero  = { id: string; nombre: string; sede_id: string };
type Servicio = { id: string; nombre: string; categoria: string; duracion_minutos: number; precio: number };

type AppData = { sedes: Sede[]; barberos: Barbero[]; servicios: Servicio[] };

type Form = {
  nombre: string; email: string; movil: string;
  sede_id: string; barbero_id: string; servicio_id: string;
  fecha: string; hora: string; metodo_pago: string; notas: string;
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
  { id: "online",       label: "Pago online por pasarela",           aviso: true  },
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

// ── Componente principal ────────────────────────────────────────
export default function Reservas() {
  const [step, setStep] = useState<Step>("datos");
  const [appData, setAppData] = useState<AppData | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [citaId, setCitaId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});

  const [form, setForm] = useState<Form>({
    nombre: "", email: "", movil: "",
    sede_id: "", barbero_id: "", servicio_id: "",
    fecha: "", hora: "", metodo_pago: "", notas: "",
  });

  // Pre-fill con datos del usuario autenticado
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setForm((f) => ({
        ...f,
        email: user.email ?? f.email,
        nombre: (user.user_metadata?.nombre as string) ?? f.nombre,
      }));
    });
  }, []);

  // Cargar sedes, barberos y servicios
  useEffect(() => {
    fetch("/api/reservas/datos")
      .then((r) => r.json())
      .then(setAppData);
  }, []);

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
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validarServicio(): boolean {
    const e: typeof errors = {};
    if (!form.sede_id)     e.sede_id     = "Selecciona una sede";
    if (!form.barbero_id)  e.barbero_id  = "Selecciona un barbero";
    if (!form.servicio_id) e.servicio_id = "Selecciona un servicio";
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
    const result = await createReserva(form);
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

  // ── Barra de progreso ──────────────────────────────────────────
  const pasos: Step[] = ["datos", "servicio", "fecha", "confirmar"];
  const pasoIdx = pasos.indexOf(step);
  const progreso = step === "exito" ? 100 : Math.round(((pasoIdx + 1) / pasos.length) * 100);

  // ── UI compartida ──────────────────────────────────────────────
  function Header({ label, title }: { label: string; title: React.ReactNode }) {
    return (
      <div className="text-center mb-8 sm:mb-12">
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
            <label>Notas adicionales (opcional)</label>
            <textarea
              value={form.notas}
              onChange={(e) => set("notas", e.target.value)}
              placeholder="Preferencias, alergias, peticiones especiales..."
              className="h-20 resize-none"
            />
          </div>
        </div>
        <button
          onClick={() => validarDatos() && setStep("servicio")}
          className="btn-gold w-full justify-center mt-6"
        >
          Siguiente: elegir servicio →
        </button>
      </div>
    </section>
  );

  // ── PASO: SERVICIO ─────────────────────────────────────────────
  if (step === "servicio") return (
    <section id="reservas" className="py-16 sm:py-28 px-4 sm:px-6 bg-[#050505]">
      <div className="max-w-xl mx-auto">
        <Header label="Tu visita" title={<>Sede, barbero <span className="gold-text">y servicio</span></>} />

        {!appData ? (
          <p className="text-[#444] text-center text-sm py-16">Cargando...</p>
        ) : (
          <div className="space-y-6">
            {/* Sede */}
            <div className="card-premium p-5">
              <p className="text-xs tracking-widest text-[#C9A84C] uppercase mb-3">Sede</p>
              <div className="grid grid-cols-2 gap-3">
                {appData.sedes.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => { set("sede_id", s.id); set("barbero_id", ""); }}
                    className={`p-3 border text-sm text-center transition-all ${
                      form.sede_id === s.id
                        ? "border-[#C9A84C] bg-[#C9A84C]/10 text-[#C9A84C]"
                        : "border-[#1f1f1f] text-[#666] hover:border-[#333]"
                    }`}
                  >
                    {s.nombre}
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
                      className={`p-3 border text-xs text-center transition-all ${
                        form.barbero_id === b.id
                          ? "border-[#C9A84C] bg-[#C9A84C]/10 text-[#C9A84C]"
                          : "border-[#1f1f1f] text-[#666] hover:border-[#333]"
                      }`}
                    >
                      {b.nombre}
                    </button>
                  ))}
                </div>
                {errors.barbero_id && <p className="text-red-500 text-xs mt-2">{errors.barbero_id}</p>}
              </div>
            )}

            {/* Servicio */}
            <div className="card-premium p-5">
              <p className="text-xs tracking-widest text-[#C9A84C] uppercase mb-3">Servicio</p>
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
                          <span className="text-xs ml-4 shrink-0">
                            {s.duracion_minutos} min · {s.precio}€
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
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

        {/* Días */}
        <div className="card-premium p-5 mb-6">
          <p className="text-xs tracking-widest text-[#C9A84C] uppercase mb-3">Día</p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {dias.map((d) => (
              <button
                key={d.iso}
                type="button"
                onClick={() => {
                  set("fecha", d.iso);
                  set("hora", "");
                  cargarSlots(form.barbero_id, d.iso);
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
          {errors.fecha && <p className="text-red-500 text-xs mt-2">{errors.fecha}</p>}
        </div>

        {/* Slots */}
        {form.fecha && (
          <div className="card-premium p-5 mb-6">
            <p className="text-xs tracking-widest text-[#C9A84C] uppercase mb-3">Hora disponible</p>
            {loadingSlots ? (
              <p className="text-[#444] text-sm text-center py-4">Consultando disponibilidad...</p>
            ) : slots.length === 0 ? (
              <p className="text-[#444] text-sm text-center py-4">
                Sin horarios disponibles este día. Prueba con otro.
              </p>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {slots.map((s) => (
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
            className="btn-gold flex-1 justify-center"
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
            { label: "Servicio", value: `${servicioSel?.nombre} — ${servicioSel?.duracion_minutos} min · ${servicioSel?.precio}€` },
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
