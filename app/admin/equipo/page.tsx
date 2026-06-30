import { createAdminClient } from "@/lib/supabase-admin";
import EquipoAdmin from "@/components/admin/EquipoAdmin";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Equipo | Admin Monastery" };
export const dynamic = "force-dynamic";

export default async function EquipoPage() {
  const admin = createAdminClient();

  const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

  const [{ data: barberos }, { data: sedes }, { data: citasMes }] = await Promise.all([
    (admin.from("barberos") as any)
      .select("id, nombre, email, activo, sede_id, created_at, comision, cargo")
      .order("nombre"),
    admin.from("sedes").select("id, nombre"),
    admin.from("citas")
      .select("barbero_id, estado, precio_final")
      .gte("fecha_hora", inicioMes),
  ]);

  return (
    <EquipoAdmin
      barberos={(barberos ?? []) as any}
      sedes={(sedes ?? []) as any}
      citasMes={(citasMes ?? []) as any}
    />
  );
}
