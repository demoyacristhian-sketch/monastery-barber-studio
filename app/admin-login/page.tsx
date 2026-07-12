import AdminLoginForm from "@/components/AdminLoginForm";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Acceso Administradores | Monastery Barber Studio",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user?.app_metadata?.role === "staff") {
    redirect("/admin");
  }

  return <AdminLoginForm />;
}
