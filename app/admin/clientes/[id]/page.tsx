import { createAdminClient } from "@/lib/supabase-admin";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ClienteFicha from "@/components/admin/ClienteFicha";
import { obtenerFotosCliente } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getCliente(id: string): Promise<any> {
  const admin = createAdminClient();

  // 1. Columnas base — las que existen desde el inicio, sin joins
  const { data: base, error } = await (admin.from("clientes") as any)
    .select("id, nombre, email, telefono, notas, created_at")
    .eq("id", id)
    .maybeSingle();

  // .maybeSingle() devuelve null data (sin error) si no existe el registro
  if (error) {
    console.error("[ClientePage] error query base:", error.message, "id:", id);
    return null;
  }
  if (!base) return null; // cliente no existe

  // 2. Columnas añadidas con ALTER TABLE — query separada con try/catch
  //    por si el caché de PostgREST aún no las tiene
  let nivel: string | null = null;
  let activo: boolean = true;
  let sellos: number = 0;
  let vip: boolean = false;
  try {
    const { data: extra } = await (admin.from("clientes") as any)
      .select("nivel, activo, sellos, vip")
      .eq("id", id)
      .maybeSingle();
    if (extra) {
      nivel  = extra.nivel  ?? null;
      activo = extra.activo ?? true;
      sellos = extra.sellos ?? 0;
      vip    = extra.vip    ?? false;
    }
  } catch {
    /* usa defaults */
  }

  // 3. Citas del cliente — desde la tabla citas (evita join anidado de 3 niveles)
  let citas: unknown[] = [];
  try {
    const { data: citasData } = await (admin.from("citas") as any)
      .select(
        "id, fecha_hora, estado, precio_final, notas," +
        " servicios(nombre, duracion_minutos), barberos(nombre)"
      )
      .eq("cliente_id", id)
      .order("fecha_hora", { ascending: false })
      .limit(200);
    citas = citasData ?? [];
  } catch {
    /* citas vacías si falla */
  }

  return { ...base, nivel, activo, sellos, vip, citas };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const cliente = await getCliente(id);
  return { title: cliente ? `${cliente.nombre} | Monastery CRM` : "Cliente" };
}

export default async function ClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [cliente, fotos] = await Promise.all([
    getCliente(id),
    obtenerFotosCliente(id),
  ]);
  if (!cliente) notFound();
  return <ClienteFicha cliente={cliente} fotos={fotos} />;
}
