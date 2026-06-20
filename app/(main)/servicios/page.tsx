import Servicios from "@/components/Servicios";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Servicios | Monastery Barber Studio",
  description: "Cortes, barba, tratamientos capilares y estética masculina premium en Valladolid.",
};

export default function ServiciosPage() {
  return (
    <main className="pt-14 sm:pt-16">
      <Servicios />
    </main>
  );
}
