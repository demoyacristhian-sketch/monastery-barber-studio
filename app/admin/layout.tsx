import AdminNav from "@/components/admin/AdminNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Monastery Barber Studio",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#080808]">
      <AdminNav />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
