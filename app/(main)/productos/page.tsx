import Productos from "@/components/Productos";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Productos | Monastery Barber Studio",
  description: "Productos de barbería premium: aceites, sérums y estilistas profesionales usados por nuestros barberos. Pago en Bizum o efectivo, recogida en nuestras sedes de Valladolid.",
};

export default function ProductosPage() {
  return (
    <main className="pt-14 sm:pt-16">
      <Productos />
    </main>
  );
}
