import { NextResponse } from "next/server";
import { createClient }      from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json(null);

  const admin = createAdminClient();

  // 1. Buscar por auth_user_id (caso normal: ya reservó estando logueado)
  const { data: porAuth } = await (admin.from("clientes") as any)
    .select("id, nombre, email, telefono, fecha_nacimiento")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (porAuth) {
    return NextResponse.json(porAuth);
  }

  // 2. Si no hay registro vinculado, buscar por email (reservó sin auth en el pasado)
  const { data: porEmail } = await (admin.from("clientes") as any)
    .select("id, nombre, email, telefono, fecha_nacimiento")
    .eq("email", user.email ?? "")
    .maybeSingle();

  if (porEmail) {
    // Vincular auth_user_id para futuras consultas
    await (admin.from("clientes") as any)
      .update({ auth_user_id: user.id })
      .eq("id", porEmail.id);
    return NextResponse.json(porEmail);
  }

  // 3. Cliente nuevo: solo tenemos datos de auth (incluye fecha_nacimiento del registro VIP)
  return NextResponse.json({
    nombre:           (user.user_metadata?.nombre           as string) ?? "",
    email:            user.email ?? "",
    telefono:         null,
    fecha_nacimiento: (user.user_metadata?.fecha_nacimiento as string) ?? null,
  });
}
