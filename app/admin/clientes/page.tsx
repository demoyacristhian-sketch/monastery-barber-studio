import { createAdminClient } from "@/lib/supabase-admin";
import type { Metadata } from "next";
import ClientesAdmin from "@/components/admin/ClientesAdmin";

export const metadata: Metadata = { title: "Clientes | Admin Monastery" };
export const revalidate = 60;

async function getClientes(busqueda?: string) {
  const admin = createAdminClient();

  let q = admin
    .from("clientes")
    .select("id, nombre, email, telefono, notas, created_at, activo")
    .order("created_at", { ascending: false })
    .limit(200);

  if (busqueda) {
    q = q.or(`nombre.ilike.%${busqueda}%,email.ilike.%${busqueda}%,telefono.ilike.%${busqueda}%`);
  }

  const { data } = await q;
  return data ?? [];
}

async function getClientesCitas() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("citas")
    .select("cliente_id, estado")
    .in("estado", ["completada", "cancelada", "no_show", "confirmada", "pendiente"]);
  return data ?? [];
}

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const [clientes, citasRaw] = await Promise.all([
    getClientes(sp.q),
    getClientesCitas(),
  ]);

  const conteosCitas = (citasRaw as any[]).reduce(
    (acc: Record<string, { total: number; completadas: number }>, c) => {
      if (!acc[c.cliente_id]) acc[c.cliente_id] = { total: 0, completadas: 0 };
      acc[c.cliente_id].total++;
      if (c.estado === "completada") acc[c.cliente_id].completadas++;
      return acc;
    },
    {}
  );

  return <ClientesAdmin clientes={clientes as any} conteosCitas={conteosCitas} busqueda={sp.q} />;
}
