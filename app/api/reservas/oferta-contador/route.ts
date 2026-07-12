import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

const MAX_PLAZAS = 10;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fecha  = searchParams.get("fecha");   // "YYYY-MM-DD"
  const oferta = searchParams.get("oferta");  // nombre de la oferta

  if (!fecha || !oferta) {
    return NextResponse.json({ error: "Parámetros incompletos" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { count, error } = await (admin.from("citas") as any)
    .select("*", { count: "exact", head: true })
    .gte("fecha_hora", `${fecha}T00:00:00`)
    .lte("fecha_hora", `${fecha}T23:59:59`)
    .ilike("notas_cliente", `%${oferta}%`)
    .not("estado", "eq", "cancelada");

  if (error) {
    return NextResponse.json({ error: "Error al consultar disponibilidad" }, { status: 500 });
  }

  const ocupadas = count ?? 0;
  return NextResponse.json({
    ocupadas,
    max: MAX_PLAZAS,
    disponibles: Math.max(0, MAX_PLAZAS - ocupadas),
    agotado: ocupadas >= MAX_PLAZAS,
  });
}
