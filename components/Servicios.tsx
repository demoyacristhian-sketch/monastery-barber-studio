import type { ReactNode } from "react";

/* ── Premium SVG icons ── */
const ScissorsIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" stroke="#C9A84C" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7" cy="7.5" r="3.8" />
    <circle cx="7" cy="24.5" r="3.8" />
    <path d="M27 4.5L10 18" />
    <path d="M18 18.5L27 27.5" />
    <path d="M10 10.5L14.5 14" />
  </svg>
);

const RazorIcon = () => (
  <svg className="w-9 h-8" viewBox="0 0 38 28" fill="none" stroke="#C9A84C" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="10" width="11" height="8" rx="2" />
    <line x1="5.5" y1="14" x2="9.5" y2="14" strokeWidth="0.9" strokeOpacity="0.55" />
    <circle cx="13" cy="14" r="1.3" fill="#C9A84C" stroke="none" />
    <path d="M13 11 L36 9 L36 19 L13 17 Z" fill="rgba(201,168,76,0.07)" />
    <line x1="13" y1="14" x2="36" y2="14" strokeWidth="0.55" strokeOpacity="0.3" />
  </svg>
);

const CombIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" stroke="#C9A84C" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="8" width="26" height="7" rx="1.5" />
    {[7, 11, 15, 19, 23].map((x) => (
      <line key={x} x1={x} y1="15" x2={x} y2="24" />
    ))}
  </svg>
);

const DiamondIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" stroke="#C9A84C" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 3 L29 13 L16 29 L3 13 Z" />
    <path d="M3 13 L16 3 L29 13" />
    <line x1="3" y1="13" x2="29" y2="13" strokeOpacity="0.45" strokeWidth="0.9" />
    <line x1="10" y1="13" x2="16" y2="3" strokeOpacity="0.35" strokeWidth="0.9" />
    <line x1="22" y1="13" x2="16" y2="3" strokeOpacity="0.35" strokeWidth="0.9" />
  </svg>
);

type Categoria = { nombre: string; icono: ReactNode; servicios: string[] };

const categorias: Categoria[] = [
  {
    nombre: "Cortes de Cabello",
    icono: <ScissorsIcon />,
    servicios: [
      "Corte con degradado",
      "Corte difuminado",
      "Corte con tijeras",
      "Corte de pelo con navaja",
      "Corte personalizado",
      "Corte casi rapado",
      "Corte estilo militar",
      "Corte de pelo largo",
      "Cortes infantiles",
      "Pelo rizado",
    ],
  },
  {
    nombre: "Barba & Afeitado",
    icono: <RazorIcon />,
    servicios: [
      "Recorte de barba",
      "Mantenimiento de barba",
      "Acondicionamiento de barba",
      "Afeitado",
      "Afeitado con navaja",
      "Afeitado con toallas calientes",
      "Afeitado de cabeza",
      "Tinte de barba",
    ],
  },
  {
    nombre: "Tratamientos Capilares",
    icono: <CombIcon />,
    servicios: [
      "Tratamiento capilar",
      "Tratamiento para el cuero cabelludo",
      "Champú y acondicionador",
      "Alisado",
      "Permanente",
      "Extensiones de cabello",
      "Coloración capilar",
    ],
  },
  {
    nombre: "Estética & Complementos",
    icono: <DiamondIcon />,
    servicios: [
      "Recorte de cejas",
      "Teñido de cejas",
      "Depilación con cera",
      "Depilación masculina",
      "Manicura masculina",
      "Paquetes para novios",
    ],
  },
];

export default function Servicios() {
  return (
    <section id="servicios" className="py-16 sm:py-28 px-4 sm:px-6 bg-black">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-20">
          <p className="section-label mb-4">Lo que hacemos</p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold">
            Nuestros <span className="gold-text">servicios</span>
          </h2>
          <div className="divider-gold" />
          <p className="text-[#666] text-sm mt-4 max-w-md mx-auto">
            Cada servicio ejecutado con precisión artesanal y productos premium
          </p>
        </div>

        {/* Price note */}
        <div className="border border-[#C9A84C]/20 bg-[#C9A84C]/5 p-4 mb-8 sm:mb-14 text-center max-w-xl mx-auto">
          <p className="text-[#C9A84C] text-xs tracking-widest uppercase font-semibold">
            Precios · Consultar en reserva
          </p>
          <p className="text-[#666] text-sm mt-1">
            Tarifas disponibles al confirmar tu cita o en nuestras sedes
          </p>
        </div>

        {/* Categories grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {categorias.map((cat) => (
            <div key={cat.nombre} className="card-premium p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-shrink-0">{cat.icono}</div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-white">{cat.nombre}</h3>
                  <div className="w-10 h-0.5 bg-[#C9A84C] mt-1" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {cat.servicios.map((s) => (
                  <span key={s} className="service-tag">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-14">
          <p className="text-[#666] text-sm mb-6">
            ¿No encuentras lo que buscas? Consúltanos directamente.
          </p>
          <a
            href="https://instagram.com/monasterybarberia"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex btn-outline"
          >
            Contactar por Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
