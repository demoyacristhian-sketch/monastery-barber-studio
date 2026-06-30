import AdminNav from "@/components/admin/AdminNav";
import { AdminThemeProvider } from "@/components/admin/AdminTheme";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin | Monastery Barber Studio" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminThemeProvider>
      <div className="flex h-screen bg-zinc-50 overflow-hidden">
        <AdminNav />
        <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
          {children}
        </main>
      </div>
    </AdminThemeProvider>
  );
}
