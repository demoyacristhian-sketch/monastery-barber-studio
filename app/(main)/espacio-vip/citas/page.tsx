import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import CitaCardCliente from "@/components/vip/CitaCardCliente";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mis citas | Espacio VIP — Monastery",
};

export default async function MisCitasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/espacio-vip/citas");

  const admin = createAdminClient();
  const { data: clienteRaw } = await (admin.from("clientes") as any)
    .select("id, nombre")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  const cliente = clienteRaw as { id: string; nombre: string } | null;
  if (!cliente) redirect("/espacio-vip");

  const ahora = new Date().toISOString();

  const [proximasRes, pasadasRes] = await Promise.all([
    (admin.from("citas") as any)
      .select("id, fecha_hora, estado, precio_final, reagendar_solicitado, reagendar_motivo, servicios(nombre), barberos(nombre), sedes(nombre)")
      .eq("cliente_id", cliente.id)
      .gte("fecha_hora", ahora)
      .not("estado", "in", '("cancelada","completada")')
      .order("fecha_hora", { ascending: true }),
    (admin.from("citas") as any)
      .select("id, fecha_hora, estado, precio_final, servicios(nombre), barberos(nombre), sedes(nombre)")
      .eq("cliente_id", cliente.id)
      .or(`fecha_hora.lt.${ahora},estado.in.(completada,cancelada)`)
      .order("fecha_hora", { ascending: false })
      .limit(20),
  ]);

  const proximas = proximasRes.data ?? [];
  const pasadas  = pasadasRes.data  ?? [];

  return (
    <main className="min-h-screen bg-black py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-10">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="section-label mb-1">Gestión de citas</p>
            <h1 className="font-serif text-3xl font-bold">Mis citas</h1>
            <div className="h-px w-12 bg-[#C9A84C]/50 mt-3" />
          </div>
          <Link href="/reservas" className="btn-gold text-sm inline-flex shrink-0">
            + Nueva reserva
          </Link>
        </div>

        {/* Próximas */}
        <div>
          <p className="section-label mb-4">Próximas citas ({proximas.length})</p>
          {proximas.length === 0 ? (
            <div className="card-premium p-8 text-center">
              <p className="text-[#444] text-sm mb-4">No tienes citas próximas.</p>
              <Link href="/reservas" className="inline-flex btn-gold text-sm">
                Reservar ahora →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {proximas.map((c: any) => (
                <CitaCardCliente key={c.id} cita={c} />
              ))}
            </div>
          )}
        </div>

        {/* Historial */}
        <div>
          <p className="section-label mb-4">Historial de visitas ({pasadas.length})</p>
          {pasadas.length === 0 ? (
            <p className="text-[#444] text-sm text-center py-8">Aún no tienes visitas registradas.</p>
          ) : (
            <div className="space-y-3">
              {pasadas.map((c: any) => (
                <CitaCardCliente key={c.id} cita={c} pasada />
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
