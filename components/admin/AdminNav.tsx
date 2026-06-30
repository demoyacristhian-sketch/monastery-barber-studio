"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Calendar, Users, Megaphone, Star,
  DollarSign, UserCog, Package, Settings, ExternalLink,
  Menu, X, LogOut, Palette, ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { TEMAS, useTema } from "./AdminTheme";

const navMain = [
  { label: "Inicio",       href: "/admin",             icon: LayoutDashboard },
  { label: "Reservas",     href: "/admin/citas",       icon: Calendar        },
  { label: "Clientes",     href: "/admin/clientes",    icon: Users           },
  { label: "Marketing",    href: "/admin/marketing",   icon: Megaphone       },
  { label: "Fidelización", href: "/admin/fidelizacion",icon: Star            },
  { label: "Finanzas",     href: "/admin/finanzas",    icon: DollarSign      },
  { label: "Equipo",       href: "/admin/equipo",      icon: UserCog         },
  { label: "Inventario",   href: "/admin/inventario",  icon: Package         },
];

const navSecundario = [
  { label: "Mi Web",          href: "/",             icon: ExternalLink, external: true  },
  { label: "Configuración",  href: "/admin/config", icon: Settings,     external: false },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router   = useRouter();
  const { tema, setTema } = useTema();
  const [open, setOpen]           = useState(false);
  const [temasOpen, setTemasOpen] = useState(false);

  async function cerrarSesion() {
    const sb = createClient();
    await sb.auth.signOut();
    router.push("/login");
  }

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  const sidebar = (
    <>
      {/* Logo */}
      <div className="h-16 px-4 flex items-center gap-3 border-b border-zinc-800 flex-shrink-0">
        <Link href="/admin" className="flex-1 min-w-0" onClick={() => setOpen(false)}>
          <Image
            src="/images/logo.svg"
            alt="Monastery Barber Studio"
            width={150}
            height={26}
            className="w-full h-auto max-h-10 object-contain object-left"
            priority
          />
        </Link>
        <button
          className="md:hidden p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
          onClick={() => setOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav principal */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        {navMain.map(item => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group ${
                active
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              }`}
            >
              <item.icon className={`w-4 h-4 flex-shrink-0 transition-colors ${
                active ? "text-[#C9A84C]" : "group-hover:text-[#C9A84C]"
              }`} />
              {item.label}
            </Link>
          );
        })}

        {/* Separador */}
        <div className="pt-4 mt-2 border-t border-zinc-800 space-y-0.5">
          {navSecundario.map(item => {
            const active = !item.external && isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group ${
                  active
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                <item.icon className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  active ? "text-[#C9A84C]" : "group-hover:text-[#C9A84C]"
                }`} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Tema */}
      <div className="px-3 pb-2">
        <button
          onClick={() => setTemasOpen(!temasOpen)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors w-full"
        >
          <Palette className="w-4 h-4 flex-shrink-0" />
          Tema de color
          <span className="ml-auto text-[10px] opacity-40">{temasOpen ? "▲" : "▼"}</span>
        </button>
        {temasOpen && (
          <div className="mt-2 px-2 grid grid-cols-4 gap-1.5 pb-2">
            {TEMAS.map(t => (
              <button
                key={t.id}
                onClick={() => { setTema(t.id); setTemasOpen(false); }}
                title={t.label}
                className="flex flex-col items-center gap-1 p-1.5 rounded-lg transition-all"
                style={{
                  background: tema === t.id ? "rgba(201,168,76,0.15)" : "transparent",
                  outline: tema === t.id ? "1px solid rgba(201,168,76,0.4)" : "none",
                }}
              >
                <span
                  className="w-5 h-5 rounded-full"
                  style={{
                    background: t.bg,
                    border: t.claro ? "1px solid #ccc" : "1px solid #444",
                  }}
                />
                <span className="text-[8px] text-zinc-500 leading-none">{t.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Usuario */}
      <div className="p-3 border-t border-zinc-800 flex-shrink-0">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-9 h-9 bg-zinc-700 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-zinc-200">AD</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-zinc-200 font-medium truncate">Administrador</div>
            <div className="text-xs text-zinc-500">Propietario</div>
          </div>
          <button
            onClick={cerrarSesion}
            className="text-zinc-600 hover:text-zinc-400 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-zinc-900 border-b border-zinc-800 flex items-center px-4 gap-3">
        <button onClick={() => setOpen(true)} className="text-zinc-400 hover:text-zinc-100 transition-colors">
          <Menu className="w-5 h-5" />
        </button>
        <Image src="/images/logo.svg" alt="Monastery" width={120} height={20} className="h-7 w-auto" />
      </header>

      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50
        md:sticky md:top-0 md:h-screen
        w-60 bg-zinc-900 flex flex-col flex-shrink-0 border-r border-zinc-800
        transition-transform duration-200 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        {sidebar}
      </aside>
    </>
  );
}
