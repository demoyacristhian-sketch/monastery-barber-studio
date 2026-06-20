import AdminNav from "@/components/admin/AdminNav";
import { AdminThemeProvider } from "@/components/admin/AdminTheme";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Monastery Barber Studio",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminThemeProvider>
      <div className="flex min-h-screen" style={{ background: "var(--admin-bg)" }}>
        <AdminNav />
        <main
          className="flex-1 overflow-auto"
          style={{ background: "var(--admin-bg)" }}
        >
          {children}
        </main>
      </div>
    </AdminThemeProvider>
  );
}
