import AreaCliente from "@/components/AreaCliente";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "El Sagrario · Área Privada | Monastery Barber Studio",
  description: "Tu espacio reservado. Accede a tu historial, reservas rápidas y beneficios exclusivos.",
};

export default function MiRitualPage() {
  return (
    <main className="pt-14 sm:pt-16">
      {/* Premium header */}
      <div className="relative py-28 px-6 text-center overflow-hidden bg-black border-b border-[#111]">
        {/* Atmospheric glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 70% at 50% 50%, rgba(201,168,76,0.07) 0%, transparent 70%)",
          }}
        />
        {/* Corner lines */}
        <div className="absolute top-8 left-8 w-12 h-12 border-t border-l border-[#C9A84C]/20" />
        <div className="absolute top-8 right-8 w-12 h-12 border-t border-r border-[#C9A84C]/20" />
        <div className="absolute bottom-8 left-8 w-12 h-12 border-b border-l border-[#C9A84C]/20" />
        <div className="absolute bottom-8 right-8 w-12 h-12 border-b border-r border-[#C9A84C]/20" />

        <div className="relative z-10">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-10 bg-[#C9A84C]/40" />
            <span className="section-label">Acceso Privado</span>
            <div className="h-px w-10 bg-[#C9A84C]/40" />
          </div>

          <h1 className="font-serif text-6xl sm:text-7xl md:text-8xl font-black tracking-tight mb-3">
            El <span className="gold-text">Sagrario</span>
          </h1>

          <p className="text-[#444] text-xs tracking-[0.35em] uppercase mb-6">
            Sanctuary · Monastery Barber Studio
          </p>

          <div className="divider-gold" />

          <p className="text-[#666] text-sm max-w-sm mx-auto mt-6">
            Tu espacio reservado. Donde cada visita queda registrada y cada detalle define tu imagen.
          </p>
        </div>
      </div>

      <AreaCliente />
    </main>
  );
}
