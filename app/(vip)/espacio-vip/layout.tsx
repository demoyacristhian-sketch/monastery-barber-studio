import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import VipNav from "@/components/vip/VipNav";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/icons/icon-192.png",
  },
};

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
