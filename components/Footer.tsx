import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-[#111] pt-16 pb-8 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-10 mb-16">
          {/* Brand */}
          <div className="md:col-span-2">
            <Image
              src="/images/logo.svg"
              alt="Monastery Barber Studio"
              width={200}
              height={33}
              className="h-8 w-auto mb-6"
            />
            <p className="text-[#555] text-sm leading-relaxed max-w-xs">
              Barbería urbana premium en Valladolid. Precisión, estilo y carácter en cada visita.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="section-label mb-5">Navegación</h4>
            <ul className="space-y-3">
              {[
                { label: "Servicios",    href: "/servicios" },
                { label: "Sedes",        href: "/sedes" },
                { label: "El equipo",    href: "/equipo" },
                { label: "Espacio VIP",  href: "/espacio-vip" },
                { label: "Reservar cita", href: "/reservas" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[#555] text-sm hover:text-[#C9A84C] transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="section-label mb-5">Sedes</h4>
            <div className="space-y-5 text-sm text-[#555]">
              <div>
                <p className="text-[#888] font-medium mb-1">Centro Histórico</p>
                <p>C. S. Quirce, 6, local 4</p>
                <p>47003 Valladolid</p>
              </div>
              <div>
                <p className="text-[#888] font-medium mb-1">Recoletos</p>
                <p>Acera de Recoletos, 14</p>
                <p>47004 Valladolid</p>
              </div>
            </div>
          </div>
        </div>

        <div className="gold-line mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#333] text-xs">
            © {new Date().getFullYear()} Monastery Barber Studio. Todos los derechos reservados.
          </p>
          <p className="text-[#222] text-xs">
            Desarrollado por{" "}
            <a
              href="https://cdmlabs.com"
              className="text-[#333] hover:text-[#C9A84C] transition-colors"
            >
              CDM Labs
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
