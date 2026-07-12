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
      <div className="relative py-20 sm:py-28 px-6 text-center overflow-hidden bg-black border-b border-[#111]">
        {/* Atmospheric glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 65% 65% at 50% 50%, rgba(201,168,76,0.07) 0%, transparent 70%)",
          }}
        />
        {/* Corner accents */}
        <div className="absolute top-8 left-8 w-12 h-12 border-t border-l border-[#C9A84C]/20" />
        <div className="absolute top-8 right-8 w-12 h-12 border-t border-r border-[#C9A84C]/20" />
        <div className="absolute bottom-8 left-8 w-12 h-12 border-b border-l border-[#C9A84C]/20" />
        <div className="absolute bottom-8 right-8 w-12 h-12 border-b border-r border-[#C9A84C]/20" />

        <div className="relative z-10">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-10 bg-[#C9A84C]/40" />
            <span className="section-label">Acceso Exclusivo</span>
            <div className="h-px w-10 bg-[#C9A84C]/40" />
          </div>

          <h1 className="font-serif text-5xl sm:text-6xl md:text-8xl font-black tracking-tight mb-3">
            Espacio <span className="gold-text">VIP</span>
          </h1>

          <p className="text-[#444] text-xs tracking-[0.35em] uppercase mb-6">
            Members Only · Monastery Barber Studio
          </p>

          <div className="divider-gold" />

          <p className="text-[#666] text-sm max-w-sm mx-auto mt-6">
            Tu acceso exclusivo al mundo Monastery. Reservas rápidas, historial y beneficios pensados solo para los nuestros.
          </p>
        </div>
      </div>

      <AreaCliente />
    </main>
  );
}
