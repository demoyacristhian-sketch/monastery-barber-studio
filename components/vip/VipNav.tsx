"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { LayoutDashboard, Calendar, User, Star, Tag, LogOut, Sun, Moon, Download } from "lucide-react";
import { useVipTheme } from "./VipThemeProvider";
import { useState } from "react";

const ITEMS = [
  { href: "/espacio-vip",            label: "Inicio",     icon: LayoutDashboard, exact: true },
  { href: "/espacio-vip/citas",      label: "Citas",      icon: Calendar        },
  { href: "/espacio-vip/ofertas",    label: "Ofertas",    icon: Tag             },
  { href: "/espacio-vip/perfil",     label: "Perfil",     icon: User            },
  { href: "/espacio-vip/beneficios", label: "Beneficios", icon: Star            },
];

export default function VipNav({ nombre }: { nombre: string }) {
  const pathname    = usePathname();
  const router      = useRouter();
  const supabase    = createClient();
  const { theme, toggle } = useVipTheme();
  const isLight     = theme === "light";
  const [closing, setClosing] = useState(false);

  async function cerrarSesion() {
    setClosing(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  /* Colores según tema */
  const navBg      = "var(--vip-nav)";
  const textActive = "#C9A84C";
  const textInactive = isLight ? "#7A6A5E" : "#666666";
  const textHover  = isLight ? "#1A1210" : "#aaaaaa";
  const borderColor = isLight ? "rgba(229,214,195,0.6)" : "rgba(26,26,26,0.9)";

  return (
    <>
      {/* ── Desktop: sticky top tab bar ── */}
      <nav
        className="hidden sm:flex sticky top-0 z-40 backdrop-blur items-center justify-between h-12 px-6"
        style={{ background: navBg, borderBottom: `1px solid ${borderColor}`, transition: "background 0.4s" }}
      >
        <div className="flex items-center gap-1 overflow-x-auto">
          {ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const activo = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-wide whitespace-nowrap transition-all rounded-sm"
                style={{
                  color: activo ? textActive : textInactive,
                  borderBottom: activo ? `2px solid ${textActive}` : "2px solid transparent",
                  marginBottom: activo ? "-1px" : "0",
                  fontWeight: activo ? 600 : 400,
                }}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-4">
          <span className="text-xs truncate max-w-[120px]" style={{ color: textInactive }}>{nombre}</span>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            title={isLight ? "Cambiar a tema oscuro" : "Cambiar a tema claro"}
            className="p-1.5 rounded-lg transition-all"
            style={{ color: textInactive, background: isLight ? "rgba(201,168,76,0.08)" : "rgba(255,255,255,0.04)" }}
          >
            {isLight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={cerrarSesion}
            disabled={closing}
            className="flex items-center gap-1 text-xs transition-colors hover:opacity-70"
            style={{ color: textInactive }}
            title="Cerrar sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Salir</span>
          </button>
        </div>
      </nav>

      {/* ── Mobile: sticky top header ── */}
      <header
        className="sm:hidden sticky top-0 z-40 backdrop-blur flex items-center justify-between px-5 h-14"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          background: navBg,
          borderBottom: `1px solid ${borderColor}`,
          transition: "background 0.4s",
        }}
      >
        <Image
          src="/images/logo.svg"
          alt="Monastery Barber Studio"
          width={140}
          height={24}
          className="h-5 w-auto"
          style={{ filter: isLight ? "brightness(0.2)" : "none" }}
        />
        <div className="flex items-center gap-1.5">
          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="p-2 rounded-lg transition-all"
            style={{ color: textInactive, background: isLight ? "rgba(201,168,76,0.08)" : "rgba(255,255,255,0.04)" }}
            title={isLight ? "Tema oscuro" : "Tema claro"}
          >
            {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          <button
            onClick={cerrarSesion}
            disabled={closing}
            className="p-2 transition-colors hover:opacity-70"
            style={{ color: textInactive }}
            aria-label="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── Mobile: fixed bottom tab bar ── */}
      <nav
        className="sm:hidden fixed bottom-0 inset-x-0 z-40 backdrop-blur"
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
          background: navBg,
          borderTop: `1px solid ${borderColor}`,
          transition: "background 0.4s",
        }}
      >
        <div className="flex h-14">
          {ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const activo = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex-1 flex flex-col items-center justify-center gap-1 transition-colors"
                style={{ color: activo ? textActive : textInactive }}
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
