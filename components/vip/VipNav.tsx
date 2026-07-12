"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { LayoutDashboard, Calendar, User, Star, Tag, LogOut } from "lucide-react";

const ITEMS = [
  { href: "/espacio-vip",            label: "Inicio",     icon: LayoutDashboard, exact: true },
  { href: "/espacio-vip/citas",      label: "Citas",      icon: Calendar        },
  { href: "/espacio-vip/ofertas",    label: "Ofertas",    icon: Tag             },
  { href: "/espacio-vip/perfil",     label: "Perfil",     icon: User            },
  { href: "/espacio-vip/beneficios", label: "Beneficios", icon: Star            },
];

export default function VipNav({ nombre }: { nombre: string }) {
  const pathname = usePathname();
  const router   = useRouter();
  const supabase = createClient();

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* ── Desktop: sticky top tab bar ── */}
      <nav className="hidden sm:flex sticky top-0 z-40 bg-black/95 backdrop-blur border-b border-[#1a1a1a] items-center justify-between h-12 px-6">
        <div className="flex items-center gap-1 overflow-x-auto">
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
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <span className="text-[#444] text-xs truncate max-w-[140px]">{nombre}</span>
          <button
            onClick={cerrarSesion}
            className="flex items-center gap-1 text-[#444] hover:text-red-400 transition-colors text-xs"
            title="Cerrar sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Salir</span>
          </button>
        </div>
      </nav>

      {/* ── Mobile: minimal sticky top header ── */}
      <header
        className="sm:hidden sticky top-0 z-40 bg-black/98 backdrop-blur border-b border-[#1a1a1a] flex items-center justify-between px-5 h-14"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <Image
          src="/images/logo.svg"
          alt="Monastery Barber Studio"
          width={140}
          height={24}
          className="h-5 w-auto"
        />
        <button
          onClick={cerrarSesion}
          className="text-[#444] hover:text-red-400 transition-colors p-1"
          aria-label="Cerrar sesión"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {/* ── Mobile: fixed bottom tab bar ── */}
      <nav
        className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-black/98 backdrop-blur border-t border-[#1a1a1a]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex h-14">
          {ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const activo = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${
                  activo ? "text-[#C9A84C]" : "text-[#3a3a3a]"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] tracking-wide">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
