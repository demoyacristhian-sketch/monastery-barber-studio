import { createAdminClient } from "@/lib/supabase-admin";
import type { Metadata } from "next";
import AgendaAdmin from "@/components/admin/AgendaAdmin";

export const metadata: Metadata = { title: "Agenda | Admin Monastery" };
export const revalidate = 30;

function getLunes(fechaStr?: string): Date {
  const base = fechaStr ? new Date(fechaStr) : new Date();
  const dia   = base.getDay();
  const diff  = (dia + 6) % 7;
  base.setDate(base.getDate() - diff);
  base.setHours(0, 0, 0, 0);
  return base;
}

async function getAgenda(lunes: Date) {
  const admin   = createAdminClient();
  const sabado  = new Date(lunes);
  sabado.setDate(lunes.getDate() + 5);
  sabado.setHours(23, 59, 59, 999);

  const [{ data: citas }, { data: barberos }] = await Promise.all([
    admin
      .from("citas")
      .select("id, fecha_hora, estado, precio_final, clientes(nombre), barberos(id, nombre), servicios(nombre, duracion_minutos)")
      .gte("fecha_hora", lunes.toISOString())
      .lte("fecha_hora", sabado.toISOString())
      .not("estado", "eq", "cancelada")
      .order("fecha_hora"),
    admin.from("barberos").select("id, nombre").eq("activo", true),
  ]);

  return { citas: citas ?? [], barberos: barberos ?? [] };
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ semana?: string; barbero?: string }>;
}) {
  const sp    = await searchParams;
  const lunes = getLunes(sp.semana);
  const { citas, barberos } = await getAgenda(lunes);

  return (
    <AgendaAdmin
      citas={citas as any}
      barberos={barberos}
      lunes={lunes.toISOString()}
      filtrosBarbero={sp.barbero}
    />
  );
}
