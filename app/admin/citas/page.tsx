import { createAdminClient } from "@/lib/supabase-admin";
import type { Metadata } from "next";
import CitasAdmin from "@/components/admin/CitasAdmin";

export const metadata: Metadata = { title: "Citas | Admin Monastery" };
export const dynamic = "force-dynamic";

async function getCitas() {
  const admin = createAdminClient();

  // Sin 'notas' en el SELECT — la columna puede no estar en el caché de PostgREST
  // y haría fallar toda la query devolviendo array vacío.
  const { data, error } = await (admin.from("citas") as any)
    .select("id, fecha_hora, estado, precio_final, clientes(nombre, telefono), barberos(nombre), servicios(nombre, duracion_minutos), sedes(nombre)")
    .order("fecha_hora", { ascending: true })
    .limit(500);

  if (error) {
    console.error("[CitasPage] getCitas error:", error.message);
    return [];
  }
  return data ?? [];
}

export default async function CitasPage() {
  const citas = await getCitas();
  return <CitasAdmin citas={citas as any} />;
}
