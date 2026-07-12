import { createAdminClient } from "@/lib/supabase-admin";
import type { Metadata } from "next";
import CitasAdmin from "@/components/admin/CitasAdmin";
import NotificacionesCRM from "@/components/admin/NotificacionesCRM";

export const metadata: Metadata = { title: "Citas | Admin Monastery" };
export const dynamic = "force-dynamic";

async function getCitas() {
  const admin = createAdminClient();
  const { data, error } = await (admin.from("citas") as any)
    .select("id, fecha_hora, estado, precio_final, notas_cliente, reagendar_solicitado, reagendar_motivo, clientes(nombre, telefono, email, fecha_nacimiento), barberos(nombre), servicios(nombre, duracion_minutos), sedes(nombre)")
    .order("fecha_hora", { ascending: true })
    .limit(500);
  if (error) {
    console.error("[CitasPage] getCitas error:", error.message);
    return [];
  }
  return data ?? [];
}

async function getNotificaciones() {
  const admin = createAdminClient();
  const { data } = await (admin.from("notificaciones_crm") as any)
    .select("id, tipo, mensaje, leida, created_at, cita_id, clientes(nombre)")
    .eq("leida", false)
    .order("created_at", { ascending: false })
    .limit(20);
  return data ?? [];
}

export default async function CitasPage() {
  const [citas, notificaciones] = await Promise.all([getCitas(), getNotificaciones()]);
  return (
    <>
      <NotificacionesCRM notificaciones={notificaciones as any[]} />
      <CitasAdmin citas={citas as any} />
    </>
  );
}
