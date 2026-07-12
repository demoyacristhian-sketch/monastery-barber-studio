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

  const { data: servicioRaw } = await admin
    .from("servicios")
    .select("*")
    .eq("id", input.servicio_id)
    .single();
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

  const notas = [
    input.metodo_pago ? `Pago: ${input.metodo_pago}` : null,
    input.notas ?? null,
  ].filter(Boolean).join(" | ") || null;

  const { data: citaRaw, error: citaError } = await admin
    .from("citas")
    .insert({
      cliente_id:       clienteId,
      barbero_id:       input.barbero_id,
      servicio_id:      input.servicio_id,
      sede_id:          input.sede_id,
      fecha_hora:       fechaHora,
      duracion_minutos: servicio?.duracion_minutos ?? 45,
      estado:           "pendiente",
      precio_final:     servicio?.precio ?? null,
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
