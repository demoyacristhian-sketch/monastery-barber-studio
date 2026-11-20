import AreaCliente from "@/components/AreaCliente";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Espacio VIP | Monastery Barber Studio",
  description: "Tu acceso exclusivo. Historial de citas, reservas exprés y beneficios premium reservados para los nuestros.",
};

export default function EspacioVipPage() {
  return (
    <main className="pb-20 sm:pb-0">
      <AreaCliente />
    </main>
  );
}
