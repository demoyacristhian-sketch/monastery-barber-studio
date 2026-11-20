import AreaCliente from "@/components/AreaCliente";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Espacio VIP | Monastery Barber Studio",
  description: "Tu acceso exclusivo. Historial de citas, reservas exprés y beneficios premium reservados para los nuestros.",
};

export default function EspacioVipPage() {
  return (
    <main className="pb-20 sm:pb-0">
      {/* Premium header */}
      <div
        className="relative py-16 sm:py-20 px-6 text-center overflow-hidden"
        style={{
          background: "var(--vip-bg-sec)",
          borderBottom: "1px solid var(--vip-border)",
        }}
      >
        {/* Atmospheric glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 65% 65% at 50% 50%, rgba(201,168,76,0.07) 0%, transparent 70%)",
          }}
        />
        {/* Corner accents */}
        <div className="absolute top-6 left-6 w-10 h-10 border-t border-l border-[#C9A84C]/20" />
        <div className="absolute top-6 right-6 w-10 h-10 border-t border-r border-[#C9A84C]/20" />
        <div className="absolute bottom-6 left-6 w-10 h-10 border-b border-l border-[#C9A84C]/20" />
        <div className="absolute bottom-6 right-6 w-10 h-10 border-b border-r border-[#C9A84C]/20" />

        <div className="relative z-10">
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="h-px w-10 bg-[#C9A84C]/40" />
            <span className="section-label">Acceso Exclusivo</span>
            <div className="h-px w-10 bg-[#C9A84C]/40" />
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl font-black tracking-tight mb-3">
            <span style={{ color: "var(--vip-text)" }}>Espacio </span>
            <span className="gold-text">VIP</span>
          </h1>

          <p style={{ color: "var(--vip-muted)" }} className="text-xs tracking-[0.35em] uppercase mb-5">
            Members Only · Monastery Barber Studio
          </p>

          <div className="divider-gold" />

          <p style={{ color: "var(--vip-muted)" }} className="text-sm max-w-sm mx-auto mt-5">
            Tu acceso exclusivo al mundo Monastery. Reservas rápidas, historial y beneficios pensados solo para los nuestros.
          </p>
        </div>
      </div>

      <AreaCliente />
    </main>
  );
}
