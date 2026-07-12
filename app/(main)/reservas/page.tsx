import { Suspense } from "react";
import Reservas from "@/components/Reservas";
import Politica from "@/components/Politica";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reservar Cita | Monastery Barber Studio",
  description: "Reserva tu cita en Monastery Barber Studio. Elige tu barbero, servicio y fecha.",
};

export default function ReservasPage() {
  return (
    <main className="pt-14 sm:pt-16">
      <Suspense fallback={
        <section className="py-28 px-6 bg-[#050505] flex items-center justify-center min-h-[60vh]">
          <p className="text-[#444] text-sm">Cargando reservas...</p>
        </section>
      }>
        <Reservas />
      </Suspense>
      <Politica />
    </main>
  );
}
