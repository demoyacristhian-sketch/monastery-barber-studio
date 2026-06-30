"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

// ── Helper: obtiene cliente autenticado ───────────────────────────────────
async function getClienteAutenticado() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, cliente: null };

  const admin = createAdminClient();
  const { data } = await (admin.from("clientes") as any)
    .select("*")
    .eq("auth_user_id", user.id)
    .single();

  return { user, cliente: data ?? null };
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
