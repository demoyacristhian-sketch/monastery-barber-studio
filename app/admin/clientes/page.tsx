import { createAdminClient } from "@/lib/supabase-admin";
import type { Metadata } from "next";
import ClientesAdmin from "@/components/admin/ClientesAdmin";

export const metadata: Metadata = { title: "Clientes | Admin Monastery" };
export const dynamic = "force-dynamic";

async function getClientes() {
  const admin = createAdminClient();
  const { data } = await (admin.from("clientes") as any)
    .select("*, citas(id, estado, precio_final, fecha_hora)")
    .order("created_at", { ascending: false })
    .limit(500);
  return data ?? [];
}

export default async function ClientesPage() {
  const clientes = await getClientes();
  return <ClientesAdmin clientes={clientes as any} />;
}
