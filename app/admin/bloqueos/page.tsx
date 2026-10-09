import { createAdminClient } from "@/lib/supabase-admin";
import type { Metadata } from "next";
import BloqueosAdmin from "@/components/admin/BloqueosAdmin";

export const metadata: Metadata = { title: "Bloqueos | Admin Monastery" };
export const dynamic = "force-dynamic";

async function getData() {
  const admin = createAdminClient();
  const [{ data: bloqueos }, { data: barberos }] = await Promise.all([
    (admin.from("bloqueos_agenda") as any)
      .select("id, fecha_inicio, fecha_fin, motivo, barbero_id, barberos(nombre)")
      .order("fecha_inicio", { ascending: false }),
    admin.from("barberos").select("id, nombre").eq("activo", true).order("nombre"),
  ]);
  return { bloqueos: bloqueos ?? [], barberos: barberos ?? [] };
}

export default async function BloqueosPage() {
  const { bloqueos, barberos } = await getData();
  return <BloqueosAdmin bloqueos={bloqueos as any} barberos={barberos} />;
}
