"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Lock } from "lucide-react";

const links = [
  { label: "Inicio",    href: "/" },
  { label: "Servicios", href: "/servicios" },
  { label: "Productos", href: "/productos" },
  { label: "Sedes",     href: "/sedes" },
  { label: "Equipo",    href: "/equipo" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-black/95 backdrop-blur-sm border-b border-[#1a1a1a]" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 sm:h-16">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/images/logo.svg"
            alt="Monastery Barber Studio"
            width={160}
            height={30}
            className="h-7 sm:h-8 w-auto max-w-[130px] sm:max-w-none"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="nav-link">
              {l.label}
            </Link>
          ))}
          <Link
            href="/espacio-vip"
            className="nav-link flex items-center gap-1.5"
            style={{ color: "#C9A84C" }}
          >
            <span style={{ fontSize: "0.6rem" }}>✦</span>
            Espacio VIP
          </Link>
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          {/* Acceso CRM — solo para administradores */}
          <Link
            href="/admin-login"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#2a2a2a] text-[#999] hover:text-[#888] hover:border-[#383838] transition-all duration-200 group"
            title="Acceso al panel de administración"
            style={{ fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase" }}
          >
            <Lock className="w-3 h-3 group-hover:text-[#C9A84C] transition-colors" />
            Admin
          </Link>

          <Link href="/reservas" className="inline-flex btn-gold">
            Reservar cita
          </Link>
        </div>

        {/* Mobile: hamburger */}
        <button
          className="md:hidden flex flex-col gap-[5px] p-3"
          onClick={() => setOpen(!open)}
          aria-label="Menú"
        >
          <span className={`block w-5 h-0.5 bg-[#C9A84C] transition-all duration-300 ${open ? "rotate-45 translate-y-[7px]" : ""}`} />
          <span className={`block w-5 h-0.5 bg-[#C9A84C] transition-all duration-300 ${open ? "opacity-0 scale-x-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-[#C9A84C] transition-all duration-300 ${open ? "-rotate-45 -translate-y-[7px]" : ""}`} />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-black border-t border-[#1a1a1a] px-6 py-8 flex flex-col gap-6">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="nav-link text-sm" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <Link
            href="/espacio-vip"
            className="nav-link text-sm flex items-center gap-2"
            style={{ color: "#C9A84C" }}
            onClick={() => setOpen(false)}
          >
            <span style={{ fontSize: "0.6rem" }}>✦</span>
            Espacio VIP
          </Link>

          <div className="gold-line mt-2" />

          <Link
            href="/reservas"
            className="inline-flex btn-gold text-center justify-center"
            onClick={() => setOpen(false)}
          >
            Reservar cita →
          </Link>

          {/* Acceso admin en mobile */}
          <Link
            href="/admin-login"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 border border-[#1e1e1e] text-[#888] hover:text-[#aaa] transition-colors rounded"
            onClick={() => setOpen(false)}
            style={{ fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase" }}
          >
            <Lock className="w-3 h-3" />
            Acceso administradores
          </Link>
        </div>
      )}
    </header>
  );
}
