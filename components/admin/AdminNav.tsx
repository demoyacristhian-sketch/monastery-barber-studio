"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

const NAV = [
  { href: "/admin",          label: "Dashboard",  icon: "◈" },
  { href: "/admin/citas",    label: "Citas",       icon: "📅" },
  { href: "/admin/clientes", label: "Clientes",    icon: "👤" },
  { href: "/admin/agenda",   label: "Agenda",      icon: "🗓" },
  { href: "/admin/config",   label: "Config",      icon: "⚙" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router   = useRouter();

  async function cerrarSesion() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside className="w-56 shrink-0 bg-[#050505] border-r border-[#111] min-h-screen flex flex-col">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-[#111]">
        <p className="text-[#C9A84C] font-serif text-lg font-bold">Monastery</p>
        <p className="text-[#333] text-xs tracking-widest uppercase mt-0.5">Panel Admin</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {NAV.map((item) => {
          const activo = item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-all ${
                activo
                  ? "bg-[#C9A84C]/10 text-[#C9A84C] border-l-2 border-[#C9A84C] -ml-px"
                  : "text-[#555] hover:text-[#999] hover:bg-[#111]"
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-[#111]">
        <button
          onClick={cerrarSesion}
          className="text-xs text-[#333] hover:text-[#C9A84C] transition-colors w-full text-left"
        >
          Cerrar sesión →
        </button>
      </div>
    </aside>
  );
}
