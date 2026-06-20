import Barberos from "@/components/Barberos";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "El Equipo | Monastery Barber Studio",
  description: "Conoce a nuestros maestros barberos. Artesanos del estilo comprometidos con la excelencia.",
};

export default function EquipoPage() {
  return (
    <main className="pt-14 sm:pt-16">
      <Barberos />
    </main>
  );
}
