import { createClient } from "@/lib/supabase-server";
import type { Database } from "@/lib/database.types";
import { NextResponse } from "next/server";

type HorarioBarbero = Database["public"]["Tables"]["horarios_barbero"]["Row"];
type BloqueoAgenda  = Database["public"]["Tables"]["bloqueos_agenda"]["Row"];
type Cita           = Database["public"]["Tables"]["citas"]["Row"];

function generarSlots(horaInicio: string, horaFin: string): string[] {
  const slots: string[] = [];
  const [sh, sm] = horaInicio.split(":").map(Number);
  const [eh, em] = horaFin.split(":").map(Number);
  let cur = sh * 60 + sm;
  const end = eh * 60 + em;
  while (cur + 30 <= end) {
    slots.push(
      `${String(Math.floor(cur / 60)).padStart(2, "0")}:${String(cur % 60).padStart(2, "0")}`
    );
    cur += 30;
  }
  return slots;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const barberoId = searchParams.get("barbero_id");
  const fecha = searchParams.get("fecha"); // YYYY-MM-DD

  if (!barberoId || !fecha) return NextResponse.json({ slots: [] });

  const supabase = await createClient();

  // dia_semana: 1=Lun…6=Sáb, 0=Dom → no laborable
  const jsDay = new Date(fecha + "T12:00:00").getDay();
  if (jsDay === 0) return NextResponse.json({ slots: [] });

  const { data: horariosRaw } = await supabase
    .from("horarios_barbero")
    .select("*")
    .eq("barbero_id", barberoId)
    .eq("dia_semana", jsDay)
    .eq("activo", true);

  const horarios = (horariosRaw ?? []) as HorarioBarbero[];
  if (!horarios.length) return NextResponse.json({ slots: [] });

  const todosLosSlots = horarios.flatMap((h) =>
    generarSlots(h.hora_inicio, h.hora_fin)
  );

  const [citasRes, bloqueosRes] = await Promise.all([
    supabase
      .from("citas")
      .select("*")
      .eq("barbero_id", barberoId)
      .gte("fecha_hora", `${fecha}T00:00:00`)
      .lte("fecha_hora", `${fecha}T23:59:59`)
      .neq("estado", "cancelada"),
    supabase
      .from("bloqueos_agenda")
      .select("*")
      .lte("fecha_inicio", `${fecha}T23:59:59`)
      .gte("fecha_fin", `${fecha}T00:00:00`),
  ]);

  const citas   = (citasRes.data   ?? []) as Cita[];
  const bloqueos = (bloqueosRes.data ?? []) as BloqueoAgenda[];

  const ocupados = new Set<string>();

  for (const cita of citas) {
    const d = new Date(cita.fecha_hora);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    ocupados.add(`${hh}:${mm}`);
    const slotsExtras = Math.max(0, Math.floor(cita.duracion_minutos / 30) - 1);
    for (let i = 1; i <= slotsExtras; i++) {
      const next = d.getHours() * 60 + d.getMinutes() + 30 * i;
      ocupados.add(
        `${String(Math.floor(next / 60)).padStart(2, "0")}:${String(next % 60).padStart(2, "0")}`
      );
    }
  }

  for (const bloqueo of bloqueos) {
    const bStart = new Date(bloqueo.fecha_inicio);
    const bEnd   = new Date(bloqueo.fecha_fin);
    for (const slot of todosLosSlots) {
      const slotDate = new Date(`${fecha}T${slot}:00`);
      if (slotDate >= bStart && slotDate < bEnd) ocupados.add(slot);
    }
  }

  const ahora   = new Date();
  const hoyStr  = ahora.toISOString().slice(0, 10);

  const disponibles = todosLosSlots.filter((slot) => {
    if (ocupados.has(slot)) return false;
    if (fecha === hoyStr) {
      const [h, m] = slot.split(":").map(Number);
      const slotMin  = h * 60 + m;
      const ahoraMin = ahora.getHours() * 60 + ahora.getMinutes() + 60;
      if (slotMin <= ahoraMin) return false;
    }
    return true;
  });

  return NextResponse.json({ slots: disponibles });
}
