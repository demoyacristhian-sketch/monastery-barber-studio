"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const links = [
  { label: "Inicio",    href: "/" },
  { label: "Servicios", href: "/servicios" },
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
          {/* Espacio VIP — premium link */}
          <Link
            href="/espacio-vip"
            className="nav-link flex items-center gap-1.5"
            style={{ color: "#C9A84C" }}
          >
            <span style={{ fontSize: "0.6rem" }}>✦</span>
            Espacio VIP
          </Link>
        </nav>

        {/* Desktop CTA */}
        <Link href="/reservas" className="hidden md:inline-flex btn-gold">
          Reservar cita
        </Link>

        {/* Mobile: hamburger only */}
        <button
          className="md:hidden flex flex-col gap-[5px] p-3"
          onClick={() => setOpen(!open)}
          aria-label="Menú"
        >
          <span
            className={`block w-5 h-0.5 bg-[#C9A84C] transition-all duration-300 ${
              open ? "rotate-45 translate-y-[7px]" : ""
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-[#C9A84C] transition-all duration-300 ${
              open ? "opacity-0 scale-x-0" : ""
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-[#C9A84C] transition-all duration-300 ${
              open ? "-rotate-45 -translate-y-[7px]" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-black border-t border-[#1a1a1a] px-6 py-8 flex flex-col gap-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="nav-link text-sm"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          {/* Espacio VIP in mobile menu */}
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
        </div>
      )}
    </header>
  );
}
