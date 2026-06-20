"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { useState } from "react";
import { TEMAS, useTema } from "./AdminTheme";

const NAV = [
  { href: "/admin",          label: "Dashboard", icon: "◈" },
  { href: "/admin/citas",    label: "Citas",     icon: "▦" },
  { href: "/admin/clientes", label: "Clientes",  icon: "◉" },
  { href: "/admin/agenda",   label: "Agenda",    icon: "▤" },
  { href: "/admin/config",   label: "Config",    icon: "◎" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router   = useRouter();
  const { tema, setTema } = useTema();
  const [mostrarTemas, setMostrarTemas] = useState(false);

  async function cerrarSesion() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside
      className="w-56 shrink-0 flex flex-col"
      style={{ background: "#080808", borderRight: "1px solid #161616", minHeight: "100vh" }}
    >
      {/* Logo — siempre sobre fondo oscuro */}
      <div className="px-5 pt-6 pb-5 border-b border-[#161616]">
        <Link href="/admin">
          <Image
            src="/images/logo.svg"
            alt="Monastery Barber Studio"
            width={160}
            height={27}
            className="w-full h-auto max-h-12 object-contain"
            priority
          />
        </Link>
        <p className="text-[#2a2a2a] text-[9px] tracking-widest uppercase mt-2 text-center">
          Panel Admin
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {NAV.map((item) => {
          const activo =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 text-sm transition-all"
              style={
                activo
                  ? { background: "rgba(201,168,76,0.10)", color: "#C9A84C", borderLeft: "2px solid #C9A84C", marginLeft: "-1px" }
                  : { color: "#444" }
              }
              onMouseEnter={e => { if (!activo) (e.currentTarget as HTMLElement).style.color = "#999"; }}
              onMouseLeave={e => { if (!activo) (e.currentTarget as HTMLElement).style.color = "#444"; }}
            >
              <span className="text-sm w-4 text-center leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Selector de tema */}
      <div className="px-4 py-3 border-t border-[#161616]">
        <button
          onClick={() => setMostrarTemas(!mostrarTemas)}
          className="flex items-center gap-2 w-full text-left text-xs text-[#333] hover:text-[#777] transition-colors"
        >
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{
              background: TEMAS.find(t => t.id === tema)?.bg ?? "#0a0a0a",
              border: TEMAS.find(t => t.id === tema)?.claro ? "1px solid #bbb" : "1px solid #333",
            }}
          />
          Tema de color
          <span className="ml-auto opacity-50">{mostrarTemas ? "↑" : "↓"}</span>
        </button>

        {mostrarTemas && (
          <div className="mt-3 grid grid-cols-4 gap-1.5">
            {TEMAS.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTema(t.id); setMostrarTemas(false); }}
                title={t.label}
                className="flex flex-col items-center gap-1 p-1.5 transition-all"
                style={{
                  background: tema === t.id ? "rgba(201,168,76,0.10)" : "transparent",
                  border: tema === t.id ? "1px solid rgba(201,168,76,0.35)" : "1px solid transparent",
                }}
              >
                <span
                  className="w-5 h-5 rounded-full"
                  style={{
                    background: t.bg,
                    border: t.claro ? "1px solid #ccc" : "1px solid #222",
                    boxShadow: tema === t.id ? "0 0 0 2px rgba(201,168,76,0.4)" : "none",
                  }}
                />
                <span className="text-[8px] text-[#333] leading-none">{t.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Cerrar sesión */}
      <div className="px-5 py-4 border-t border-[#161616]">
        <button
          onClick={cerrarSesion}
          className="text-xs text-[#2a2a2a] hover:text-[#C9A84C] transition-colors w-full text-left"
        >
          Cerrar sesión →
        </button>
      </div>
    </aside>
  );
}
