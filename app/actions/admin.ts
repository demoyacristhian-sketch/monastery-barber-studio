"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase-admin";

export async function actualizarEstadoCita(
  citaId: string,
  estado: "confirmada" | "completada" | "cancelada" | "no_show"
) {
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q = admin.from("citas") as any;
  const { error } = await q
    .update({ estado, updated_at: new Date().toISOString() })
    .eq("id", citaId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/citas");
  return { ok: true };
}

export async function actualizarNotasCita(citaId: string, notas: string) {
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q = admin.from("citas") as any;
  const { error } = await q
    .update({ notas_barbero: notas, updated_at: new Date().toISOString() })
    .eq("id", citaId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/citas");
  return { ok: true };
}

export async function actualizarNotasCliente(clienteId: string, notas: string) {
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q = admin.from("clientes") as any;
  const { error } = await q
    .update({ notas })
    .eq("id", clienteId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/clientes");
  return { ok: true };
}
