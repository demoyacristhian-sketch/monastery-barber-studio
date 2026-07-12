import { NextResponse } from "next/server";
import { createClient }      from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json(null);

  const admin = createAdminClient();
  const { data } = await (admin.from("clientes") as any)
    .select("nombre, email, telefono, fecha_nacimiento")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  // Si aún no tiene registro en clientes, devolver lo que está en auth
  return NextResponse.json(data ?? {
    nombre: (user.user_metadata?.nombre as string) ?? "",
    email:  user.email ?? "",
    telefono: null,
    fecha_nacimiento: null,
  });
}
