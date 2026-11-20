import { createAdminClient } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";
import { esFestivoNacional } from "@/lib/festivos";

export const dynamic = "force-dynamic";

const SPAIN_TZ = "Europe/Madrid";

function timeToMinutes(t: string | null | undefined): number {
  if (!t) return 0;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

function generarSlotsDesdeHorario(periodos: { inicio: number; fin: number }[]): string[] {
  const slots: string[] = [];
  for (const { inicio, fin } of periodos) {
    let cur = inicio;
    while (cur + 45 <= fin) {
      const h = Math.floor(cur / 60);
      const m = cur % 60;
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
      cur += 45;
    }
  }
  return slots;
}

// Convierte una fecha UTC a HH:MM en hora de España
function toSpainHHMM(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: SPAIN_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const h = parts.find(p => p.type === "hour")?.value  ?? "00";
  const m = parts.find(p => p.type === "minute")?.value ?? "00";
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
}

function toSpainMinutes(date: Date): number {
  const [h, m] = toSpainHHMM(date).split(":").map(Number);
  return h * 60 + m;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const barberoId = searchParams.get("barbero_id");
  const fecha     = searchParams.get("fecha"); // YYYY-MM-DD en hora España

  if (!barberoId || !fecha) return NextResponse.json({ slots: [] });

  // Domingo (0) o festivo nacional → cerrado
  const jsDay = new Date(fecha + "T12:00:00").getDay();
  if (jsDay === 0) return NextResponse.json({ slots: [] });
  if (esFestivoNacional(fecha)) return NextResponse.json({ slots: [] });

  const admin = createAdminClient();

  // Obtener sede del barbero
  const { data: barberoData } = await (admin.from("barberos") as any)
    .select("sede_id")
    .eq("id", barberoId)
    .maybeSingle();

  const sedeId: string | null = (barberoData as any)?.sede_id ?? null;

  // Comprobar cierre de emergencia
  if (sedeId) {
    const { data: sedeData } = await (admin.from("sedes") as any)
      .select("cerrada_emergencia")
      .eq("id", sedeId)
      .maybeSingle();

    if ((sedeData as any)?.cerrada_emergencia) {
      return NextResponse.json({ slots: [], sede_cerrada: true, motivo: "emergencia" });
    }

    // Comprobar cierres especiales para esta fecha
    const { data: cierres } = await (admin.from("cierres_especiales") as any)
      .select("id, motivo")
      .eq("sede_id", sedeId)
      .lte("fecha_inicio", fecha)
      .gte("fecha_fin",    fecha)
      .limit(1);

    if (cierres && cierres.length > 0) {
      return NextResponse.json({ slots: [], sede_cerrada: true, motivo: cierres[0].motivo ?? "cierre especial" });
    }
  }

  // Obtener horario de la sede para este día de semana
  let periodos: { inicio: number; fin: number }[] = [];

  if (sedeId) {
    const { data: horarioData } = await (admin.from("horarios_sedes") as any)
      .select("abierto, periodo1_inicio, periodo1_fin, periodo2_inicio, periodo2_fin")
      .eq("sede_id", sedeId)
      .eq("dia_semana", jsDay)
      .maybeSingle();

    if (horarioData) {
      if (!(horarioData as any).abierto) {
        return NextResponse.json({ slots: [] });
      }
      const p1i = timeToMinutes((horarioData as any).periodo1_inicio);
      const p1f = timeToMinutes((horarioData as any).periodo1_fin);
      periodos.push({ inicio: p1i, fin: p1f });
      if ((horarioData as any).periodo2_inicio && (horarioData as any).periodo2_fin) {
        const p2i = timeToMinutes((horarioData as any).periodo2_inicio);
        const p2f = timeToMinutes((horarioData as any).periodo2_fin);
        periodos.push({ inicio: p2i, fin: p2f });
      }
    }
  }

  // Fallback a horario por defecto si no hay registro en DB
  if (periodos.length === 0) {
    periodos = jsDay === 6
      ? [{ inicio: 10 * 60, fin: 19 * 60 }]
      : [{ inicio: 10 * 60, fin: 14 * 60 }, { inicio: 16 * 60, fin: 20 * 60 }];
  }

  const todosLosSlots = generarSlotsDesdeHorario(periodos);

  // Comprobar bloqueos de agenda activos para este barbero en esta fecha
  const fechaInicioDia = `${fecha}T00:00:00`;
  const fechaFinDia    = `${fecha}T23:59:59`;

  const { data: bloqueosRaw } = await (admin.from("bloqueos_agenda") as any)
    .select("fecha_inicio, fecha_fin")
    .lte("fecha_inicio", fechaFinDia)
    .gte("fecha_fin",    fechaInicioDia)
    .or(`barbero_id.eq.${barberoId},barbero_id.is.null`);

  const franjasBloqueadas: { inicio: number; fin: number }[] = [];
  for (const b of (bloqueosRaw ?? []) as { fecha_inicio: string; fecha_fin: string }[]) {
    const inicioMin = b.fecha_inicio.slice(0, 10) === fecha
      ? parseInt(b.fecha_inicio.slice(11, 13)) * 60 + parseInt(b.fecha_inicio.slice(14, 16))
      : 0;
    const finMin = b.fecha_fin.slice(0, 10) === fecha
      ? parseInt(b.fecha_fin.slice(11, 13)) * 60 + parseInt(b.fecha_fin.slice(14, 16))
      : 24 * 60;
    franjasBloqueadas.push({ inicio: inicioMin, fin: finMin });
  }

  // Citas del barbero en la fecha seleccionada
  const { data: citasRaw } = await (admin.from("citas") as any)
    .select("fecha_hora, duracion_minutos")
    .eq("barbero_id", barberoId)
    .gte("fecha_hora", `${fecha}T00:00:00+00:00`)
    .lte("fecha_hora", `${fecha}T23:59:59+00:00`)
    .neq("estado", "cancelada");

  const citas = (citasRaw ?? []) as { fecha_hora: string; duracion_minutos: number | null }[];

  const ocupados = new Set<string>();
  for (const cita of citas) {
    const d = new Date(cita.fecha_hora);
    const inicioMin = toSpainMinutes(d);
    const durMin    = cita.duracion_minutos ?? 45;
    for (const slot of todosLosSlots) {
      const [sh, sm] = slot.split(":").map(Number);
      const slotMin  = sh * 60 + sm;
      if (slotMin >= inicioMin && slotMin < inicioMin + durMin) {
        ocupados.add(slot);
      }
    }
  }

  // Filtrar slots pasados si es hoy
  const ahora    = new Date();
  const ahoraMin = toSpainMinutes(ahora);
  const fechaHoyEnEspana = new Intl.DateTimeFormat("en-CA", {
    timeZone: SPAIN_TZ, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(ahora);

  const disponibles = todosLosSlots.filter(slot => {
    if (ocupados.has(slot)) return false;
    const [sh, sm] = slot.split(":").map(Number);
    const slotMin  = sh * 60 + sm;
    if (franjasBloqueadas.some(f => slotMin >= f.inicio && slotMin < f.fin)) return false;
    if (fecha === fechaHoyEnEspana) {
      if (slotMin <= ahoraMin + 30) return false;
    }
    return true;
  });

  return NextResponse.json({ slots: disponibles, sede_cerrada: false });
}
