import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Monastery Barber Studio | Barbería Premium en Valladolid",
  description:
    "Barbería urbana premium en Valladolid. Reserva con tu barbero de confianza. Donde el corte se convierte en ritual.",
  keywords: "barbería valladolid, corte de pelo valladolid, barber shop, monastery barber studio",
  icons: {
    icon: "/icons/icon-512.png",
    apple: "/icons/icon-192.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full bg-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}
