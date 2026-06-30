"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { LayoutDashboard, Calendar, User, Star, LogOut } from "lucide-react";

const ITEMS = [
  { href: "/espacio-vip",           label: "Inicio",       icon: LayoutDashboard, exact: true },
  { href: "/espacio-vip/citas",     label: "Mis citas",    icon: Calendar        },
  { href: "/espacio-vip/perfil",    label: "Mi perfil",    icon: User            },
  { href: "/espacio-vip/beneficios",label: "Beneficios",   icon: Star            },
];

export default function VipNav({ nombre }: { nombre: string }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const supabase  = createClient();

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="sticky top-14 sm:top-16 z-40 bg-black/95 backdrop-blur border-b border-[#1a1a1a]">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-12">
        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const activo = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-wide whitespace-nowrap transition-all rounded-sm ${
                  activo
                    ? "text-[#C9A84C] border-b-2 border-[#C9A84C] -mb-px font-medium"
                    : "text-[#555] hover:text-[#888]"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Usuario + logout */}
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <span className="text-[#444] text-xs hidden sm:block truncate max-w-[120px]">{nombre}</span>
          <button
            onClick={cerrarSesion}
            className="flex items-center gap-1 text-[#444] hover:text-red-400 transition-colors text-xs"
            title="Cerrar sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
