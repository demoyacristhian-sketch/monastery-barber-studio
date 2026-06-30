import { createAdminClient } from "@/lib/supabase-admin";
import InventarioAdmin from "@/components/admin/InventarioAdmin";

export const dynamic = "force-dynamic";

export default async function InventarioPage() {
  const admin = createAdminClient();

  let productos: any[] = [];
  let tablaExiste = true;

  try {
    const { data, error } = await (admin.from("inventario") as any)
      .select("id, nombre, categoria, descripcion, precio_compra, precio_venta, stock_actual, stock_minimo, unidad, activo")
      .order("categoria").order("nombre");

    if (error?.code === "42P01") {
      tablaExiste = false;
    } else {
      productos = data ?? [];
    }
  } catch {
    tablaExiste = false;
  }

  return <InventarioAdmin productos={productos} tablaExiste={tablaExiste} />;
}
