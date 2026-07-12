"use server";

import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import type { Cliente, Servicio, Cita } from "@/lib/database.types";

export type ReservaInput = {
  nombre: string;
  email: string;
  movil: string;
  fecha_nacimiento: string;
  sede_id: string;
  barbero_id: string;
  servicio_id: string;
  fecha: string;
  hora: string;
  metodo_pago: string;
  notas?: string;
  precio_oferta_override?: number;
  oferta_nombre?: string;
};

export type ReservaResult =
  | { ok: true; cita_id: string }
  | { ok: false; error: string };

export async function createReserva(input: ReservaInput): Promise<ReservaResult> {
  // Auth: cliente SSR (con cookies del usuario)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Admin: bypass RLS para todas las escrituras en BD
  const admin = createAdminClient();

  let clienteId: string;

  if (user) {
    const { data: existingRaw } = await admin
      .from("clientes")
      .select("*")
      .eq("auth_user_id", user.id)
      .single();

    const existing = existingRaw as Cliente | null;

    if (existing) {
      clienteId = existing.id;
    } else {
      const { data: nuevoRaw, error } = await admin
        .from("clientes")
        .insert({ auth_user_id: user.id, nombre: input.nombre, email: input.email, telefono: input.movil, fecha_nacimiento: input.fecha_nacimiento || null, activo: true } as any)
        .select("*")
        .single();
      const nuevo = nuevoRaw as Cliente | null;
      if (error || !nuevo) return { ok: false, error: `Error al crear tu perfil: ${error?.message ?? "sin respuesta"}` };
      clienteId = nuevo.id;
    }
  } else {
    const { data: existingRaw } = await admin
      .from("clientes")
      .select("*")
      .eq("email", input.email)
      .maybeSingle();
    const existing = existingRaw as Cliente | null;

    if (existing) {
      clienteId = existing.id;
    } else {
      const { data: nuevoRaw, error } = await admin
        .from("clientes")
        .insert({ nombre: input.nombre, email: input.email, telefono: input.movil, fecha_nacimiento: input.fecha_nacimiento || null, activo: true } as any)
        .select("*")
        .single();
      const nuevo = nuevoRaw as Cliente | null;
      if (error || !nuevo) return { ok: false, error: `Error al registrar tus datos: ${error?.message ?? "sin respuesta"}` };
      clienteId = nuevo.id;
    }
  }

  // Verano Refrescante: verificar plazas y asignar posición
  const MAX_PLAZAS_VERANO = 10;
  let posicionVerano: number | null = null;

  if (input.oferta_nombre === "Verano Refrescante") {
    const { count, error: countError } = await (admin.from("citas") as any)
      .select("*", { count: "exact", head: true })
      .gte("fecha_hora", `${input.fecha}T00:00:00`)
      .lte("fecha_hora", `${input.fecha}T23:59:59`)
      .ilike("notas_cliente", "%Verano Refrescante%")
      .not("estado", "eq", "cancelada");

    if (!countError) {
      const ocupadas = count ?? 0;
      if (ocupadas >= MAX_PLAZAS_VERANO) {
        return {
          ok: false,
          error: `Las ${MAX_PLAZAS_VERANO} plazas de Verano Refrescante para este día ya están completas. Prueba con otro día de julio o agosto.`,
        };
      }
      posicionVerano = ocupadas + 1;
    }
  }

  const { data: servicioRaw } = input.servicio_id
    ? await admin.from("servicios").select("*").eq("id", input.servicio_id).single()
    : { data: null };
  const servicio = servicioRaw as Servicio | null;

  const fechaHora = `${input.fecha}T${input.hora}:00`;

  const { data: conflictoRaw } = await admin
    .from("citas")
    .select("*")
    .eq("barbero_id", input.barbero_id)
    .eq("fecha_hora", fechaHora)
    .neq("estado", "cancelada")
    .maybeSingle();
  const conflicto = conflictoRaw as Cita | null;

  if (conflicto) {
    return { ok: false, error: "Ese horario acaba de ser reservado. Por favor elige otro." };
  }

  // Inyectar posición de Verano Refrescante en las notas
  const notasInput = (posicionVerano !== null && input.notas)
    ? input.notas.replace(
        "Verano Refrescante",
        `Verano Refrescante · #${posicionVerano}/${MAX_PLAZAS_VERANO}`
      )
    : (input.notas ?? null);

  const notas = [
    input.metodo_pago ? `Pago: ${input.metodo_pago}` : null,
    notasInput,
  ].filter(Boolean).join(" | ") || null;

  const { data: citaRaw, error: citaError } = await admin
    .from("citas")
    .insert({
      cliente_id:       clienteId,
      barbero_id:       input.barbero_id,
      servicio_id:      input.servicio_id || null,
      sede_id:          input.sede_id,
      fecha_hora:       fechaHora,
      duracion_minutos: servicio?.duracion_minutos ?? 45,
      estado:           "pendiente",
      precio_final:     input.precio_oferta_override != null ? input.precio_oferta_override : (servicio?.precio ?? null),
      puntos_otorgados: 0,
      notas_cliente:    notas,
    } as any)
    .select("*")
    .single();

  const cita = citaRaw as Cita | null;

  if (citaError || !cita) {
    console.error("Error creando cita:", citaError);
    return { ok: false, error: "Error al confirmar la reserva. Inténtalo de nuevo." };
  }

  return { ok: true, cita_id: cita.id };
}
