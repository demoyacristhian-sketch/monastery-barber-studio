import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const [sedesRes, barberosRes, serviciosRes] = await Promise.all([
    supabase
      .from("sedes")
      .select("id, nombre")
      .eq("activa", true)
      .order("nombre"),
    supabase
      .from("barberos")
      .select("id, nombre, sede_id")
      .eq("activo", true)
      .order("nombre"),
    supabase
      .from("servicios")
      .select("id, nombre, categoria, duracion_minutos, precio")
      .eq("activo", true)
      .order("categoria")
      .order("nombre"),
  ]);

  return NextResponse.json({
    sedes: sedesRes.data ?? [],
    barberos: barberosRes.data ?? [],
    servicios: serviciosRes.data ?? [],
  });
}
