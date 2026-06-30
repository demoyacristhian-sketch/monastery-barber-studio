import { createAdminClient } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

const SPAIN_TZ = "Europe/Madrid";

// Slots fijos: 09:00-14:00 y 16:00-21:00 en intervalos de 45 min
function generarTodosLosSlots(): string[] {
  const slots: string[] = [];
  const periodos = [
    { inicio: 9 * 60, fin: 14 * 60 },
    { inicio: 16 * 60, fin: 21 * 60 },
  ];
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

// Minutos desde medianoche en España para una fecha UTC
function toSpainMinutes(date: Date): number {
  const [h, m] = toSpainHHMM(date).split(":").map(Number);
  return h * 60 + m;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const barberoId = searchParams.get("barbero_id");
  const fecha     = searchParams.get("fecha"); // YYYY-MM-DD en hora España

  if (!barberoId || !fecha) return NextResponse.json({ slots: [] });

  // Lunes=1 … Sábado=6 → laborable; Domingo=0 → cerrado
  const jsDay = new Date(fecha + "T12:00:00").getDay();
  if (jsDay === 0) return NextResponse.json({ slots: [] });

  const todosLosSlots = generarTodosLosSlots();

  const admin = createAdminClient();

  // Citas del barbero en la fecha seleccionada (± 1 día en UTC para cubrir desfases)
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
    // Bloquear todos los slots que se solapan con esta cita
    for (const slot of todosLosSlots) {
      const [sh, sm] = slot.split(":").map(Number);
      const slotMin  = sh * 60 + sm;
      // Solapamiento: slot starts within [citaInicio, citaInicio+durMin)
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
  }).format(ahora); // YYYY-MM-DD

  const disponibles = todosLosSlots.filter(slot => {
    if (ocupados.has(slot)) return false;
    if (fecha === fechaHoyEnEspana) {
      const [sh, sm] = slot.split(":").map(Number);
      const slotMin  = sh * 60 + sm;
      if (slotMin <= ahoraMin + 60) return false; // al menos 1h en el futuro
    }
    return true;
  });

  return NextResponse.json({ slots: disponibles });
}
