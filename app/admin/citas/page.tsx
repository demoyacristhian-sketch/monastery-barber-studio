import { createAdminClient } from "@/lib/supabase-admin";
import type { Metadata } from "next";
import CitasAdmin from "@/components/admin/CitasAdmin";

export const metadata: Metadata = { title: "Citas | Admin Monastery" };
export const revalidate = 30;

async function getCitas(fecha?: string, barberoId?: string, estado?: string) {
  const admin = createAdminClient();

  let q = admin
    .from("citas")
    .select("id, fecha_hora, estado, precio_final, notas_cliente, notas_barbero, clientes(id, nombre, telefono, email), barberos(id, nombre), servicios(nombre, duracion_minutos), sedes(nombre)")
    .order("fecha_hora", { ascending: false })
    .limit(100);

  if (fecha) {
    q = q.gte("fecha_hora", `${fecha}T00:00:00`).lte("fecha_hora", `${fecha}T23:59:59`);
  }
  if (barberoId) q = q.eq("barbero_id", barberoId);
  if (estado)    q = q.eq("estado", estado);

  const { data } = await q;
  return data ?? [];
}

async function getBarberos() {
  const admin = createAdminClient();
  const { data } = await admin.from("barberos").select("id, nombre").eq("activo", true);
  return data ?? [];
}

export default async function CitasPage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string; barbero?: string; estado?: string }>;
}) {
  const sp      = await searchParams;
  const [citas, barberos] = await Promise.all([
    getCitas(sp.fecha, sp.barbero, sp.estado),
    getBarberos(),
  ]);

  return <CitasAdmin citas={citas as any} barberos={barberos} filtros={sp} />;
}
