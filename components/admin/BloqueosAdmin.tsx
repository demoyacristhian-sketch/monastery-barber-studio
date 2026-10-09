"use client";

import { useState, useTransition } from "react";
import { CalendarOff, Trash2, Plus, AlertTriangle, User, Users, Clock } from "lucide-react";
import { crearBloqueo, eliminarBloqueo } from "@/app/actions/admin";
import { useRouter } from "next/navigation";

type Bloqueo = {
  id: string;
  fecha_inicio: string;
  fecha_fin: string;
  motivo: string | null;
  barbero_id: string | null;
  barberos: { nombre: string } | null;
};

type Barbero = { id: string; nombre: string };

function formatFecha(isoStr: string) {
  // isoStr puede ser "2026-08-20T16:00:00" → tomar solo la parte de fecha
  const fecha = isoStr.slice(0, 10);
  const [y, m, d] = fecha.split("-");
  return new Date(`${y}-${m}-${d}T12:00:00`).toLocaleDateString("es-ES", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function extraerHora(isoStr: string) {
  return isoStr.slice(11, 16); // "HH:MM"
}

function esDiaCompleto(inicio: string, fin: string) {
  return extraerHora(inicio) === "00:00" && extraerHora(fin) >= "23:59";
}

function esMultiDia(inicio: string, fin: string) {
  return inicio.slice(0, 10) !== fin.slice(0, 10);
}

function esPasado(fin: string) {
  return new Date(fin) < new Date();
}

// Slots de hora disponibles (mismas franjas que el sistema de reservas)
const HORAS_DISPONIBLES = [
  "10:00","10:45","11:30","12:15","13:00","13:45",
  "14:30","15:15",
  "16:00","16:45","17:30","18:15","19:00","19:45",
];

export default function BloqueosAdmin({
  bloqueos,
  barberos,
}: {
  bloqueos: Bloqueo[];
  barberos: Barbero[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [tipo,        setTipo]        = useState<"dia" | "franja">("dia");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin,    setFechaFin]    = useState("");
  const [horaInicio,  setHoraInicio]  = useState("10:00");
  const [horaFin,     setHoraFin]     = useState("14:00");
  const [barberoId,   setBarberoId]   = useState("todos");
  const [motivo,      setMotivo]      = useState("");
  const [error,       setError]       = useState<string | null>(null);
  const [ok,          setOk]          = useState(false);

  const hoy = new Date().toISOString().slice(0, 10);

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(false);

    if (!fechaInicio) { setError("Selecciona la fecha de inicio."); return; }

    if (tipo === "franja" && horaInicio >= horaFin) {
      setError("La hora de fin debe ser posterior a la de inicio.");
      return;
    }

    let fi: string;
    let ff: string;

    if (tipo === "dia") {
      const fin = fechaFin || fechaInicio;
      fi = `${fechaInicio}T00:00:00`;
      ff = `${fin}T23:59:59`;
    } else {
      // Franja horaria: siempre un solo día
      fi = `${fechaInicio}T${horaInicio}:00`;
      ff = `${fechaInicio}T${horaFin}:59`;
    }

    startTransition(async () => {
      const res = await crearBloqueo({
        fecha_inicio: fi,
        fecha_fin:    ff,
        barbero_id:   barberoId === "todos" ? null : barberoId,
        motivo:       motivo.trim() || null,
      });
      if (!res.ok) {
        setError(res.error ?? "Error al crear el bloqueo.");
      } else {
        setOk(true);
        setFechaInicio("");
        setFechaFin("");
        setHoraInicio("10:00");
        setHoraFin("14:00");
        setBarberoId("todos");
        setMotivo("");
        router.refresh();
      }
    });
  }

  async function handleEliminar(id: string) {
    startTransition(async () => {
      await eliminarBloqueo(id);
      router.refresh();
    });
  }

  const proximos = bloqueos.filter(b => !esPasado(b.fecha_fin));
  const pasados  = bloqueos.filter(b =>  esPasado(b.fecha_fin));

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">

      {/* Cabecera */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <CalendarOff className="w-6 h-6 text-[#C9A84C]" />
          <h1 className="text-xl font-bold text-zinc-100">Bloqueos de agenda</h1>
        </div>
        <p className="text-sm text-zinc-400">
          Bloquea días completos, rangos de fechas o franjas horarias concretas.
          Los periodos bloqueados no aparecerán disponibles en el formulario de reservas de la web.
        </p>
      </div>

      {/* Formulario */}
      <form
        onSubmit={handleCrear}
        className="bg-zinc-800 border border-zinc-700 rounded-xl p-5 space-y-5"
      >
        <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#C9A84C]" />
          Añadir bloqueo
        </h2>

        {/* Tipo de bloqueo */}
        <div className="flex gap-2">
          {(["dia", "franja"] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTipo(t)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                tipo === t
                  ? "bg-[#C9A84C]/10 border-[#C9A84C] text-[#C9A84C]"
                  : "border-zinc-600 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500"
              }`}
            >
              {t === "dia" ? (
                <><CalendarOff className="w-4 h-4" /> Día(s) completo(s)</>
              ) : (
                <><Clock className="w-4 h-4" /> Franja horaria</>
              )}
            </button>
          ))}
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-400">
              {tipo === "franja" ? "Fecha" : "Fecha de inicio"} *
            </label>
            <input
              type="date"
              min={hoy}
              value={fechaInicio}
              onChange={e => {
                setFechaInicio(e.target.value);
                if (fechaFin && e.target.value > fechaFin) setFechaFin(e.target.value);
              }}
              className="bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-[#C9A84C]"
            />
          </div>

          {tipo === "dia" && (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-400">
                Fecha de fin <span className="text-zinc-500">(dejar vacío si es un solo día)</span>
              </label>
              <input
                type="date"
                min={fechaInicio || hoy}
                value={fechaFin}
                onChange={e => setFechaFin(e.target.value)}
                className="bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-[#C9A84C]"
              />
            </div>
          )}
        </div>

        {/* Horas (solo en modo franja) */}
        {tipo === "franja" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-400">Hora de inicio *</label>
              <select
                value={horaInicio}
                onChange={e => setHoraInicio(e.target.value)}
                className="bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-[#C9A84C]"
              >
                {HORAS_DISPONIBLES.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-400">Hora de fin *</label>
              <select
                value={horaFin}
                onChange={e => setHoraFin(e.target.value)}
                className="bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-[#C9A84C]"
              >
                {["10:45","11:30","12:15","13:00","13:45","14:00",
                  "14:30","15:15","16:00","16:45","17:00","17:30",
                  "18:15","19:00","19:45","20:00"].map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Barbero y motivo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-400">Afecta a</label>
            <select
              value={barberoId}
              onChange={e => setBarberoId(e.target.value)}
              className="bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-[#C9A84C]"
            >
              <option value="todos">Todos los barberos</option>
              {barberos.map(b => (
                <option key={b.id} value={b.id}>{b.nombre}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-400">Motivo <span className="text-zinc-500">(opcional)</span></label>
            <input
              type="text"
              placeholder="Vacaciones, festivo, reforma..."
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              maxLength={120}
              className="bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#C9A84C]"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-xs bg-red-950/30 border border-red-900/40 rounded-lg px-3 py-2">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            {error}
          </div>
        )}
        {ok && (
          <p className="text-emerald-400 text-xs bg-emerald-950/30 border border-emerald-900/40 rounded-lg px-3 py-2">
            Bloqueo creado. El calendario de la web ya refleja el cambio.
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 bg-[#C9A84C] hover:bg-[#b8943f] text-zinc-900 font-semibold text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Guardando..." : "Crear bloqueo"}
        </button>
      </form>

      {/* Listado próximos */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-300">Bloqueos activos y próximos</h2>

        {proximos.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-zinc-700 rounded-xl">
            <CalendarOff className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-sm text-zinc-500">No hay bloqueos activos.</p>
            <p className="text-xs text-zinc-600 mt-1">El negocio está disponible en todos los días habituales.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {proximos.map(b => (
              <BloqueoFila key={b.id} bloqueo={b} onEliminar={handleEliminar} isPending={isPending} />
            ))}
          </ul>
        )}
      </section>

      {pasados.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-zinc-500">Bloqueos pasados</h2>
          <ul className="space-y-2 opacity-60">
            {pasados.slice(0, 5).map(b => (
              <BloqueoFila key={b.id} bloqueo={b} onEliminar={handleEliminar} isPending={isPending} pasado />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function BloqueoFila({
  bloqueo,
  onEliminar,
  isPending,
  pasado = false,
}: {
  bloqueo: Bloqueo;
  onEliminar: (id: string) => void;
  isPending: boolean;
  pasado?: boolean;
}) {
  const diaCompleto = esDiaCompleto(bloqueo.fecha_inicio, bloqueo.fecha_fin);
  const multiDia    = esMultiDia(bloqueo.fecha_inicio, bloqueo.fecha_fin);

  let fechaTexto: string;
  let horaTexto: string | null = null;

  if (multiDia) {
    fechaTexto = `${formatFecha(bloqueo.fecha_inicio)} → ${formatFecha(bloqueo.fecha_fin)}`;
  } else {
    fechaTexto = formatFecha(bloqueo.fecha_inicio);
    if (!diaCompleto) {
      horaTexto = `${extraerHora(bloqueo.fecha_inicio)} – ${extraerHora(bloqueo.fecha_fin)}`;
    }
  }

  return (
    <li className="flex items-center gap-3 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3">
      {horaTexto
        ? <Clock    className={`w-4 h-4 flex-shrink-0 ${pasado ? "text-zinc-600" : "text-[#C9A84C]"}`} />
        : <CalendarOff className={`w-4 h-4 flex-shrink-0 ${pasado ? "text-zinc-600" : "text-[#C9A84C]"}`} />
      }

      <div className="flex-1 min-w-0">
        <p className="text-sm text-zinc-200 font-medium">
          {fechaTexto}
          {horaTexto && (
            <span className="ml-2 text-xs font-normal text-[#C9A84C] bg-[#C9A84C]/10 px-2 py-0.5 rounded-full">
              {horaTexto}
            </span>
          )}
        </p>
        <div className="flex items-center gap-3 mt-0.5">
          {bloqueo.barbero_id ? (
            <span className="flex items-center gap-1 text-xs text-zinc-400">
              <User className="w-3 h-3" />
              {bloqueo.barberos?.nombre ?? "Barbero"}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-zinc-400">
              <Users className="w-3 h-3" />
              Todos los barberos
            </span>
          )}
          {bloqueo.motivo && (
            <span className="text-xs text-zinc-500 truncate">· {bloqueo.motivo}</span>
          )}
        </div>
      </div>

      {!pasado && (
        <button
          onClick={() => onEliminar(bloqueo.id)}
          disabled={isPending}
          title="Eliminar bloqueo"
          className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors disabled:opacity-40"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </li>
  );
}
