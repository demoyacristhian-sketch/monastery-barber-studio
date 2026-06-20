"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { useState } from "react";
import { TEMAS, useTema, type TemaId } from "./AdminTheme";

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
      className="w-56 shrink-0 border-r flex flex-col"
      style={{
        background: "var(--admin-bg)",
        borderColor: "var(--admin-border)",
        minHeight: "100vh",
      }}
    >
      {/* Logo */}
      <div className="px-5 py-6 border-b" style={{ borderColor: "var(--admin-border)" }}>
        <p className="text-[#C9A84C] font-serif text-lg font-bold tracking-wide">Monastery</p>
        <p className="text-[#333] text-[10px] tracking-widest uppercase mt-0.5">Panel Admin</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {NAV.map((item) => {
          const activo = item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 text-sm transition-all"
              style={activo ? {
                background: "rgba(201,168,76,0.08)",
                color: "#C9A84C",
                borderLeft: "2px solid #C9A84C",
                marginLeft: "-1px",
              } : {
                color: "#555",
              }}
              onMouseEnter={e => { if (!activo) (e.currentTarget as HTMLElement).style.color = "#999"; }}
              onMouseLeave={e => { if (!activo) (e.currentTarget as HTMLElement).style.color = "#555"; }}
            >
              <span className="text-sm w-4 text-center leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Selector de tema */}
      <div className="px-4 py-3 border-t" style={{ borderColor: "var(--admin-border)" }}>
        <button
          onClick={() => setMostrarTemas(!mostrarTemas)}
          className="flex items-center gap-2 w-full text-left text-xs text-[#444] hover:text-[#888] transition-colors"
        >
          <span
            className="w-3 h-3 rounded-full border border-[#333]"
            style={{ background: TEMAS.find(t => t.id === tema)?.bg }}
          />
          Tema de color
          <span className="ml-auto">{mostrarTemas ? "↑" : "↓"}</span>
        </button>

        {mostrarTemas && (
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {TEMAS.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTema(t.id as TemaId); setMostrarTemas(false); }}
                title={t.label}
                className="flex flex-col items-center gap-1 p-1.5 rounded transition-all"
                style={{
                  background: tema === t.id ? "rgba(201,168,76,0.1)" : "transparent",
                  border: tema === t.id ? "1px solid rgba(201,168,76,0.4)" : "1px solid transparent",
                }}
              >
                <span
                  className="w-5 h-5 rounded-full border border-[#222]"
                  style={{ background: t.bg }}
                />
                <span className="text-[9px] text-[#444] leading-none">{t.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t" style={{ borderColor: "var(--admin-border)" }}>
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
