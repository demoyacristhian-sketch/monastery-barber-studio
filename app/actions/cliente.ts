"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

// ── Helper: obtiene cliente autenticado (con fallback por email) ──────────
async function getClienteAutenticado() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, cliente: null };

  const admin = createAdminClient();

  // 1. Buscar por auth_user_id
  const { data: porAuth } = await (admin.from("clientes") as any)
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (porAuth) return { user, cliente: porAuth };

  // 2. Fallback: buscar por email y vincular auth_user_id automáticamente
  if (user.email) {
    const { data: porEmail } = await (admin.from("clientes") as any)
      .select("*")
      .eq("email", user.email)
      .maybeSingle();
    if (porEmail) {
      await (admin.from("clientes") as any)
        .update({ auth_user_id: user.id })
        .eq("id", porEmail.id);
      return { user, cliente: { ...porEmail, auth_user_id: user.id } };
    }
  }

  return { user, cliente: null };
}

// ── Confirmar cita ────────────────────────────────────────────────────────
export async function confirmarCita(citaId: string) {
  const { user, cliente } = await getClienteAutenticado();
  if (!user || !cliente) return { ok: false, error: "No autenticado" };

  const admin = createAdminClient();

  // Verificar que la cita pertenece a este cliente
  const { data: cita } = await (admin.from("citas") as any)
    .select("id, estado, fecha_hora")
    .eq("id", citaId)
    .eq("cliente_id", cliente.id)
    .single();

  if (!cita) return { ok: false, error: "Cita no encontrada" };
  if (!["pendiente"].includes(cita.estado)) {
    return { ok: false, error: "Solo puedes confirmar citas pendientes" };
  }

  const { error } = await (admin.from("citas") as any)
    .update({ estado: "confirmada", updated_at: new Date().toISOString() })
    .eq("id", citaId);

  if (error) return { ok: false, error: error.message };

  // Notificación al CRM
  await (admin.from("notificaciones_crm") as any).insert({
    tipo: "confirmacion_cliente",
    cliente_id: cliente.id,
    cita_id: citaId,
    mensaje: `${cliente.nombre} confirmó su cita del ${new Date(cita.fecha_hora).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}`,
  });

  revalidatePath("/espacio-vip");
  revalidatePath("/espacio-vip/citas");
  revalidatePath("/admin/citas");
  return { ok: true };
}

// ── Cancelar cita ─────────────────────────────────────────────────────────
export async function cancelarCita(citaId: string) {
  const { user, cliente } = await getClienteAutenticado();
  if (!user || !cliente) return { ok: false as const, error: "No autenticado" };

  const admin = createAdminClient();

  const { data: cita } = await (admin.from("citas") as any)
    .select("id, fecha_hora, estado")
    .eq("id", citaId)
    .eq("cliente_id", cliente.id)
    .single();

  if (!cita) return { ok: false as const, error: "Cita no encontrada" };
  if (["completada", "cancelada"].includes(cita.estado)) {
    return { ok: false as const, error: "Esta cita ya no se puede cancelar" };
  }

  const ahora = new Date();
  const fechaCita = new Date(cita.fecha_hora);
  const horasAntelacion = (fechaCita.getTime() - ahora.getTime()) / (1000 * 60 * 60);
  const conAntelacion = horasAntelacion >= 3;

  const { error } = await (admin.from("citas") as any)
    .update({ estado: "cancelada", updated_at: new Date().toISOString() })
    .eq("id", citaId);

  if (error) return { ok: false as const, error: error.message };

  const fechaStr = fechaCita.toLocaleDateString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  const aviso = conAntelacion
    ? "✓ Canceló con más de 3 horas de antelación."
    : "⚠️ Canceló con menos de 3 horas de antelación — pierde 1 sello (8 sellos = 9.º corte gratis).";

  await (admin.from("notificaciones_crm") as any).insert({
    tipo: "cancelacion_cliente",
    cliente_id: cliente.id,
    cita_id: citaId,
    mensaje: `${cliente.nombre} canceló su cita del ${fechaStr}. ${aviso}`,
  });

  revalidatePath("/espacio-vip");
  revalidatePath("/espacio-vip/citas");
  revalidatePath("/admin/citas");
  return { ok: true as const, conAntelacion };
}

// ── Reagendar cita ────────────────────────────────────────────────────────
export async function reagendarCita(citaId: string, nuevaFechaHora: string) {
  const { user, cliente } = await getClienteAutenticado();
  if (!user || !cliente) return { ok: false as const, error: "No autenticado" };

  const admin = createAdminClient();

  const { data: cita } = await (admin.from("citas") as any)
    .select("id, fecha_hora, estado")
    .eq("id", citaId)
    .eq("cliente_id", cliente.id)
    .single();

  if (!cita) return { ok: false as const, error: "Cita no encontrada" };
  if (["completada", "cancelada"].includes(cita.estado)) {
    return { ok: false as const, error: "Esta cita ya no se puede reagendar" };
  }

  const { error } = await (admin.from("citas") as any)
    .update({
      fecha_hora: nuevaFechaHora,
      estado: "pendiente",
      reagendar_solicitado: false,
      reagendar_motivo: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", citaId);

  if (error) return { ok: false as const, error: error.message };

  const fechaAnterior = new Date(cita.fecha_hora).toLocaleDateString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  const fechaNueva = new Date(nuevaFechaHora).toLocaleDateString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  await (admin.from("notificaciones_crm") as any).insert({
    tipo: "reagenda_cliente",
    cliente_id: cliente.id,
    cita_id: citaId,
    mensaje: `${cliente.nombre} reagendó su cita del ${fechaAnterior} al ${fechaNueva}.`,
  });

  revalidatePath("/espacio-vip");
  revalidatePath("/espacio-vip/citas");
  revalidatePath("/admin/citas");
  return { ok: true as const };
}

// ── Solicitar reagendamiento ──────────────────────────────────────────────
export async function solicitarReagendar(citaId: string, motivo: string) {
  const { user, cliente } = await getClienteAutenticado();
  if (!user || !cliente) return { ok: false, error: "No autenticado" };

  const admin = createAdminClient();

  const { data: cita } = await (admin.from("citas") as any)
    .select("id, fecha_hora, estado")
    .eq("id", citaId)
    .eq("cliente_id", cliente.id)
    .single();

  if (!cita) return { ok: false, error: "Cita no encontrada" };
  if (["completada", "cancelada"].includes(cita.estado)) {
    return { ok: false, error: "No se puede reagendar esta cita" };
  }

  const { error } = await (admin.from("citas") as any)
    .update({
      reagendar_solicitado: true,
      reagendar_motivo: motivo || "Sin motivo indicado",
      updated_at: new Date().toISOString(),
    })
    .eq("id", citaId);

  if (error) return { ok: false, error: error.message };

  await (admin.from("notificaciones_crm") as any).insert({
    tipo: "solicitud_reagendar",
    cliente_id: cliente.id,
    cita_id: citaId,
    mensaje: `${cliente.nombre} solicita reagendar su cita del ${new Date(cita.fecha_hora).toLocaleDateString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}${motivo ? ` — Motivo: ${motivo}` : ""}`,
  });

  revalidatePath("/espacio-vip");
  revalidatePath("/espacio-vip/citas");
  revalidatePath("/admin/citas");
  return { ok: true };
}

// ── Actualizar perfil del cliente ─────────────────────────────────────────
export async function actualizarPerfilCliente(data: {
  nombre: string;
  telefono?: string;
  fecha_nacimiento?: string;
}) {
  const { user, cliente } = await getClienteAutenticado();
  if (!user || !cliente) return { ok: false, error: "No autenticado" };

  const admin = createAdminClient();

  const update: Record<string, string | null> = { nombre: data.nombre };
  if (data.telefono !== undefined) update.telefono = data.telefono || null;
  if (data.fecha_nacimiento !== undefined) update.fecha_nacimiento = data.fecha_nacimiento || null;

  const { error } = await (admin.from("clientes") as any)
    .update(update)
    .eq("auth_user_id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/espacio-vip");
  revalidatePath("/espacio-vip/perfil");
  return { ok: true };
}

// ── Obtener perfil propio (admin client, sin RLS) ─────────────────────────
export async function fetchMiPerfil() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, cliente: null };

  const admin = createAdminClient();

  const { data: porAuth } = await (admin.from("clientes") as any)
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (porAuth) return { user: { id: user.id, email: user.email }, cliente: porAuth };

  if (user.email) {
    const { data: porEmail } = await (admin.from("clientes") as any)
      .select("*")
      .eq("email", user.email)
      .maybeSingle();
    if (porEmail) {
      await (admin.from("clientes") as any)
        .update({ auth_user_id: user.id })
        .eq("id", porEmail.id);
      return { user: { id: user.id, email: user.email }, cliente: { ...porEmail, auth_user_id: user.id } };
    }
  }

  return { user: { id: user.id, email: user.email }, cliente: null };
}

// ── Crear perfil desde el Espacio VIP ────────────────────────────────────
export async function crearPerfil(data: {
  nombre: string;
  telefono?: string;
  fecha_nacimiento?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "No autenticado" };

  const admin = createAdminClient();

  const { data: existing } = await (admin.from("clientes") as any)
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (existing) return { ok: false as const, error: "Ya tienes un perfil" };

  const { error } = await (admin.from("clientes") as any)
    .insert({
      auth_user_id:     user.id,
      email:            user.email,
      nombre:           data.nombre,
      telefono:         data.telefono || null,
      fecha_nacimiento: data.fecha_nacimiento || null,
      activo:           true,
    });

  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/espacio-vip");
  revalidatePath("/espacio-vip/perfil");
  return { ok: true as const };
}

// ── Marcar notificaciones CRM como leídas ────────────────────────────────
export async function marcarNotificacionesLeidas() {
  const admin = createAdminClient();
  await (admin.from("notificaciones_crm") as any)
    .update({ leida: true })
    .eq("leida", false);
  revalidatePath("/admin/citas");
  revalidatePath("/admin");
  return { ok: true };
}
