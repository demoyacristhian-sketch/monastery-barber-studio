import AdminLoginForm from "@/components/AdminLoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acceso Administradores | Monastery Barber Studio",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return <AdminLoginForm />;
}
