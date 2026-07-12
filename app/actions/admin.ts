"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase-admin";

// ── Citas ──────────────────────────────────────────────────────────────────
export async function actualizarEstadoCita(
  citaId: string,
  estado: "confirmada" | "completada" | "cancelada" | "no_show"
) {
  const admin = createAdminClient();
  const { error } = await (admin.from("citas") as any)
    .update({ estado, updated_at: new Date().toISOString() })
    .eq("id", citaId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/citas");
  return { ok: true };
}

// ── Clientes ──────────────────────────────────────────────────────────────
export async function actualizarCliente(
  id: string,
  data: { nombre?: string; telefono?: string; email?: string; notas?: string; nivel?: string }
) {
  const admin = createAdminClient();

  // Separar nivel del resto para actualizar por separado si la caché no lo reconoce aún
  const { nivel, ...camposBase } = data;

  if (Object.keys(camposBase).length > 0) {
    const { error } = await (admin.from("clientes") as any)
      .update(camposBase)
      .eq("id", id);
    if (error) return { ok: false, error: error.message };
  }

  if (nivel !== undefined) {
    const { error } = await (admin.from("clientes") as any)
      .update({ nivel: nivel || null })
      .eq("id", id);
    if (error) return { ok: false, error: `nivel: ${error.message}` };
  }

  revalidatePath("/admin/clientes");
  revalidatePath(`/admin/clientes/${id}`);
  return { ok: true };
}

// ── Fotos de clientes ─────────────────────────────────────────────────────
export async function subirFotoCliente(clienteId: string, formData: FormData) {
  const admin = createAdminClient();
  const file = formData.get("foto") as File | null;
  if (!file) return { ok: false as const, error: "No se recibió archivo" };

  const ext    = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const nombre = `${Date.now()}.${ext}`;
  const path   = `${clienteId}/${nombre}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await admin.storage
    .from("fotos-clientes")
    .upload(path, buffer, { contentType: file.type || "image/jpeg", upsert: false });

  if (error) return { ok: false as const, error: error.message };

  const { data: { publicUrl } } = admin.storage.from("fotos-clientes").getPublicUrl(path);
  revalidatePath(`/admin/clientes/${clienteId}`);
  return { ok: true as const, url: publicUrl, path };
}

export async function obtenerFotosCliente(clienteId: string) {
  const admin = createAdminClient();
  try {
    const { data: files, error } = await admin.storage
      .from("fotos-clientes")
      .list(clienteId, { limit: 200, sortBy: { column: "created_at", order: "desc" } });
    if (error || !files) return [];
    return files
      .filter(f => f.name !== ".emptyFolderPlaceholder")
      .map(f => {
        const { data: { publicUrl } } = admin.storage
          .from("fotos-clientes")
          .getPublicUrl(`${clienteId}/${f.name}`);
        return { name: f.name, url: publicUrl };
      });
  } catch {
    return [];
  }
}

export async function eliminarFotoCliente(clienteId: string, nombre: string) {
  const admin = createAdminClient();
  const { error } = await admin.storage
    .from("fotos-clientes")
    .remove([`${clienteId}/${nombre}`]);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/clientes/${clienteId}`);
  return { ok: true };
}

// ── Servicios ──────────────────────────────────────────────────────────────
export async function actualizarServicio(
  id: string,
  data: { nombre?: string; precio?: number; duracion_minutos?: number; categoria?: string; activo?: boolean }
) {
  const admin = createAdminClient();
  const { error } = await (admin.from("servicios") as any)
    .update({ ...data })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/config");
  return { ok: true };
}

export async function crearServicio(
  data: { nombre: string; precio: number; duracion_minutos: number; categoria?: string }
) {
  const admin = createAdminClient();
  const { error } = await (admin.from("servicios") as any)
    .insert({ ...data, activo: true });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/config");
  return { ok: true };
}

// ── Barberos ──────────────────────────────────────────────────────────────
export async function actualizarBarbero(
  id: string,
  data: { nombre?: string; email?: string; activo?: boolean; sede_id?: string; cargo?: string; comision?: number }
) {
  const admin = createAdminClient();
  const { error } = await (admin.from("barberos") as any)
    .update({ ...data })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/config");
  revalidatePath("/admin/equipo");
  return { ok: true };
}

export async function crearBarbero(
  data: { nombre: string; email: string; sede_id?: string }
) {
  const admin = createAdminClient();
  const { error } = await (admin.from("barberos") as any)
    .insert({ ...data, activo: true });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/config");
  revalidatePath("/admin/equipo");
  return { ok: true };
}

// ── Sedes ──────────────────────────────────────────────────────────────────
export async function actualizarSede(
  id: string,
  data: { nombre?: string; direccion?: string; activa?: boolean; telefono?: string; email?: string; instagram?: string; whatsapp?: string }
) {
  const admin = createAdminClient();
  const { error } = await (admin.from("sedes") as any)
    .update({ ...data })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/config");
  return { ok: true };
}

// ── Nueva cita ────────────────────────────────────────────────────────────
export async function obtenerDatosFormularioCita() {
  const admin = createAdminClient();
  const [{ data: servicios }, { data: barberos }, { data: sedes }] = await Promise.all([
    admin.from("servicios").select("id, nombre, precio, duracion_minutos").eq("activo", true).order("nombre"),
    admin.from("barberos").select("id, nombre, sede_id").eq("activo", true).order("nombre"),
    admin.from("sedes").select("id, nombre").eq("activa", true).order("nombre"),
  ]);
  return {
    servicios: (servicios ?? []) as { id: string; nombre: string; precio: number; duracion_minutos: number }[],
    barberos:  (barberos  ?? []) as { id: string; nombre: string; sede_id: string | null }[],
    sedes:     (sedes     ?? []) as { id: string; nombre: string }[],
  };
}

export async function buscarClientes(query: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("clientes")
    .select("id, nombre, telefono, email")
    .or(`nombre.ilike.%${query}%,telefono.ilike.%${query}%`)
    .limit(6)
    .order("nombre");
  return (data ?? []) as { id: string; nombre: string; telefono: string | null; email: string | null }[];
}

export async function crearCitaConCliente(data: {
  clienteId?:       string;
  clienteNombre:    string;
  clienteTelefono?: string;
  clienteEmail?:    string;
  servicioId:  string;
  barberoId:   string;
  sedeId?:     string;
  fechaHora:   string;
  estado:      string;
  precio?:     number;
  notas?:      string;
}) {
  const admin = createAdminClient();

  let clienteId = data.clienteId;

  if (!clienteId) {
    // Buscar por teléfono si lo tienen
    if (data.clienteTelefono) {
      const { data: existente } = await admin
        .from("clientes")
        .select("id")
        .eq("telefono", data.clienteTelefono)
        .maybeSingle();
      clienteId = (existente as any)?.id;
    }

    // Si no existe, crearlo
    if (!clienteId) {
      const { data: nuevo, error: errCliente } = await (admin.from("clientes") as any)
        .insert({
          nombre:   data.clienteNombre,
          telefono: data.clienteTelefono ?? null,
          email:    data.clienteEmail    ?? null,
        })
        .select("id")
        .single();
      if (errCliente) return { ok: false, error: `Error al crear cliente: ${errCliente.message}` };
      clienteId = nuevo.id;
    }
  }

  // Obtener duración del servicio para satisfacer la constraint NOT NULL
  let duracionMinutos: number | null = null;
  try {
    const { data: srv } = await admin
      .from("servicios")
      .select("duracion_minutos")
      .eq("id", data.servicioId)
      .single();
    duracionMinutos = (srv as any)?.duracion_minutos ?? null;
  } catch { /* usa null */ }

  const { data: citaCreada, error: errCita } = await (admin.from("citas") as any)
    .insert({
      cliente_id:        clienteId,
      servicio_id:       data.servicioId,
      barbero_id:        data.barberoId,
      sede_id:           data.sedeId    ?? null,
      fecha_hora:        data.fechaHora,
      estado:            data.estado,
      precio_final:      data.precio    ?? null,
      duracion_minutos:  duracionMinutos,
    })
    .select("id")
    .single();

  if (errCita) return { ok: false, error: `Error al crear cita: ${errCita.message}` };

  // notas en update separado por si el caché de PostgREST aún no la incluye
  if (data.notas && citaCreada?.id) {
    await (admin.from("citas") as any)
      .update({ notas: data.notas })
      .eq("id", citaCreada.id);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/citas");
  revalidatePath("/admin/clientes");
  return { ok: true };
}

// ── Sellos manuales de fidelidad ─────────────────────────────────────────
export async function actualizarSellosCliente(id: string, sellos: number) {
  const admin = createAdminClient();
  const { error } = await (admin.from("clientes") as any)
    .update({ sellos })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/clientes/${id}`);
  revalidatePath("/admin/clientes");
  return { ok: true };
}

// ── Canjear corte gratis → resetea sellos + promueve a VIP permanente ────
export async function canjearCorteGratis(id: string) {
  const admin = createAdminClient();
  const { error } = await (admin.from("clientes") as any)
    .update({ sellos: 0, vip: true })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/clientes/${id}`);
  revalidatePath("/admin/clientes");
  return { ok: true };
}

// ── Toggle VIP manual ────────────────────────────────────────────────────
export async function toggleVipCliente(id: string, vip: boolean) {
  const admin = createAdminClient();
  const { error } = await (admin.from("clientes") as any)
    .update({ vip })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/clientes/${id}`);
  revalidatePath("/admin/clientes");
  return { ok: true };
}

// ── Eliminar cita(s) ─────────────────────────────────────────────────────
export async function eliminarCita(id: string) {
  const admin = createAdminClient();
  const { error } = await (admin.from("citas") as any).delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/citas");
  return { ok: true };
}

export async function eliminarCitas(ids: string[]) {
  if (!ids.length) return { ok: true };
  const admin = createAdminClient();
  const { error } = await (admin.from("citas") as any).delete().in("id", ids);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/citas");
  return { ok: true };
}

// ── Toggle estado activo/inactivo ────────────────────────────────────────
export async function toggleActivoCliente(id: string, activo: boolean) {
  const admin = createAdminClient();
  const { error } = await (admin.from("clientes") as any)
    .update({ activo })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/clientes");
  revalidatePath(`/admin/clientes/${id}`);
  return { ok: true };
}

// ── Clientes (crear) ──────────────────────────────────────────────────────
export async function crearCliente(data: {
  nombre: string;
  telefono?: string;
  email?: string;
  notas?: string;
}) {
  const admin = createAdminClient();
  const { error } = await (admin.from("clientes") as any)
    .insert({
      nombre:   data.nombre,
      telefono: data.telefono  ?? null,
      email:    data.email     ?? null,
      notas:    data.notas     ?? null,
    });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/clientes");
  return { ok: true };
}

// ── Inventario ────────────────────────────────────────────────────────────
export async function crearProducto(data: {
  nombre: string; categoria?: string; descripcion?: string;
  precio_compra?: number; precio_venta?: number;
  stock_actual?: number; stock_minimo?: number; unidad?: string;
}) {
  const admin = createAdminClient();
  const { error } = await (admin.from("inventario") as any)
    .insert({ ...data, activo: true });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/inventario");
  return { ok: true };
}

export async function actualizarProducto(
  id: string,
  data: { nombre?: string; categoria?: string; descripcion?: string; precio_compra?: number; precio_venta?: number; stock_actual?: number; stock_minimo?: number; unidad?: string; activo?: boolean }
) {
  const admin = createAdminClient();
  const { error } = await (admin.from("inventario") as any)
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/inventario");
  return { ok: true };
}

export async function eliminarProducto(id: string) {
  const admin = createAdminClient();
  const { error } = await (admin.from("inventario") as any).delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/inventario");
  return { ok: true };
}

// ── Eliminar servicio ─────────────────────────────────────────────────────
export async function eliminarServicio(id: string) {
  const admin = createAdminClient();
  const { error } = await (admin.from("servicios") as any).delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/config");
  return { ok: true };
}

// ── Eliminar barbero ──────────────────────────────────────────────────────
export async function eliminarBarbero(id: string) {
  const admin = createAdminClient();
  // Eliminar citas del barbero antes de borrar (barbero_id NOT NULL en citas)
  const { error: errCitas } = await (admin.from("citas") as any)
    .delete()
    .eq("barbero_id", id);
  if (errCitas) return { ok: false, error: errCitas.message };
  const { error } = await (admin.from("barberos") as any).delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/config");
  revalidatePath("/admin/equipo");
  return { ok: true };
}

// ── Eliminar cliente ──────────────────────────────────────────────────────
export async function eliminarCliente(id: string) {
  const admin = createAdminClient();
  // Eliminar citas del cliente antes de borrar para evitar FK constraint
  const { error: errCitas } = await (admin.from("citas") as any)
    .delete()
    .eq("cliente_id", id);
  if (errCitas) return { ok: false, error: errCitas.message };
  // Eliminar fotos del cliente si las hay
  await (admin.from("cliente_fotos") as any).delete().eq("cliente_id", id);
  const { error } = await (admin.from("clientes") as any).delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/clientes");
  return { ok: true };
}
