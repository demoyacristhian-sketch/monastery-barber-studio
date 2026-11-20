import { createAdminClient } from "@/lib/supabase-admin";
import type { Metadata } from "next";
import ConfigAdmin from "@/components/admin/ConfigAdmin";

export const metadata: Metadata = { title: "Configuración | Admin Monastery" };
export const dynamic = "force-dynamic";

async function getConfig() {
  const admin = createAdminClient();
  const [{ data: sedes }, { data: barberos }, { data: servicios }, { data: horarios }, { data: cierres }] = await Promise.all([
    (admin.from("sedes") as any).select("id, nombre, direccion, activa, telefono, email, instagram, whatsapp, cerrada_emergencia").order("nombre"),
    admin.from("barberos").select("id, nombre, email, activo, sede_id").order("nombre"),
    admin.from("servicios").select("id, nombre, precio, duracion_minutos, categoria, activo").order("categoria").order("nombre"),
    (admin.from("horarios_sedes") as any).select("*").order("sede_id").order("dia_semana"),
    (admin.from("cierres_especiales") as any).select("*").order("fecha_inicio"),
  ]);
  return {
    sedes:    sedes    ?? [],
    barberos: barberos ?? [],
    servicios: servicios ?? [],
    horarios: horarios ?? [],
    cierres:  cierres  ?? [],
  };
}

export default async function ConfigPage() {
  const { sedes, barberos, servicios, horarios, cierres } = await getConfig();
  return (
    <ConfigAdmin
      sedes={sedes as any}
      barberos={barberos as any}
      servicios={servicios as any}
      horarios={horarios as any}
      cierres={cierres as any}
    />
  );
}
