import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import VipNav from "@/components/vip/VipNav";
import { redirect } from "next/navigation";

export default async function EspacioVipLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/espacio-vip");

  const admin = createAdminClient();
  const { data: cliente } = await (admin.from("clientes") as any)
    .select("nombre")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  const nombre = cliente?.nombre ?? user.email ?? "Cliente";

  return (
    <>
      <VipNav nombre={nombre} />
      {children}
    </>
  );
}
