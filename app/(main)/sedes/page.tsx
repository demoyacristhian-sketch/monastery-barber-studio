import Sedes from "@/components/Sedes";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sedes | Monastery Barber Studio",
  description: "Dos ubicaciones premium en el corazón de Valladolid: Centro Histórico y Paseo Recoletos.",
};

export default function SedesPage() {
  return (
    <main className="pt-14 sm:pt-16">
      <Sedes />
    </main>
  );
}
