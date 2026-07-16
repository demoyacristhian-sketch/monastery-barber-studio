"use client";

import { useRef, useState } from "react";
import Image from "next/image";

const FOTOS = [
  { src: "/images/sedes/fachada.jpg", alt: "Fachada Monastery Barber Shop San Quirce" },
  { src: "/images/sedes/interior-panoramica.jpg", alt: "Interior panorámica con polo de barbería" },
  { src: "/images/sedes/interior-amplio.jpg", alt: "Interior completo con zona de lavado y sillones" },
  { src: "/images/sedes/sillon-espejo.jpg", alt: "Sillón barbero con espejo LED y estantería" },
  { src: "/images/sedes/zona-espera.jpg", alt: "Zona de espera con sofá y polo de barbería" },
  { src: "/images/sedes/interior-completo.jpg", alt: "Vista completa del interior" },
];

function GaleriaScroll() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  function scrollTo(idx: number) {
    const container = scrollRef.current;
    if (!container) return;
    const item = container.children[idx] as HTMLElement;
    if (item) {
      container.scrollTo({ left: item.offsetLeft - 24, behavior: "smooth" });
    }
    setActive(idx);
  }

  function handleScroll() {
    const container = scrollRef.current;
    if (!container) return;
    const scrollLeft = container.scrollLeft;
    const itemWidth = (container.children[0] as HTMLElement)?.offsetWidth ?? 0;
    const idx = Math.round(scrollLeft / (itemWidth + 16));
    setActive(Math.min(idx, FOTOS.length - 1));
  }

  return (
    <div className="relative">
      {/* Scroll container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {FOTOS.map((foto, i) => (
          <div
            key={i}
            className="flex-none w-[280px] sm:w-[340px] snap-start"
          >
            <div className="relative h-52 sm:h-64 rounded-xl overflow-hidden group">
              <Image
                src={foto.src}
                alt={foto.alt}
                fill
                sizes="340px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Overlay sutil */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60 group-hover:opacity-30 transition-opacity duration-300" />
              {/* Corner accent top-left */}
              <div className="absolute top-0 left-0 w-8 h-0.5 bg-gradient-to-r from-[#C9A84C] to-transparent" />
              <div className="absolute top-0 left-0 w-0.5 h-8 bg-gradient-to-b from-[#C9A84C] to-transparent" />
            </div>
          </div>
        ))}
      </div>

      {/* Indicadores de puntos */}
      <div className="flex items-center justify-center gap-1.5 mt-4">
        {FOTOS.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            className={`transition-all duration-300 rounded-full ${
              i === active
                ? "w-5 h-1.5 bg-[#C9A84C]"
                : "w-1.5 h-1.5 bg-white/25 hover:bg-white/50"
            }`}
            aria-label={`Ver foto ${i + 1}`}
          />
        ))}
      </div>

      {/* Botones prev/next en desktop */}
      <button
        onClick={() => scrollTo(Math.max(0, active - 1))}
        className="hidden sm:flex absolute left-2 top-1/2 -translate-y-7 w-8 h-8 rounded-full bg-black/60 border border-white/10 items-center justify-center text-white hover:bg-[#C9A84C]/80 transition-colors"
        aria-label="Anterior"
      >
        ‹
      </button>
      <button
        onClick={() => scrollTo(Math.min(FOTOS.length - 1, active + 1))}
        className="hidden sm:flex absolute right-2 top-1/2 -translate-y-7 w-8 h-8 rounded-full bg-black/60 border border-white/10 items-center justify-center text-white hover:bg-[#C9A84C]/80 transition-colors"
        aria-label="Siguiente"
      >
        ›
      </button>
    </div>
  );
}

export default function Sedes() {
  const sedes = [
    {
      id: 1,
      nombre: "Sede Centro Histórico",
      etiqueta: "MBS San Quirce",
      direccion: "Calle de S. Quirce, 6, local 4",
      ciudad: "47003 Valladolid",
      equipo: "2 barberos",
      mapsUrl: "https://maps.google.com/?q=Calle+de+S.+Quirce+6+Valladolid",
    },
    {
      id: 2,
      nombre: "Sede Paseo Recoletos",
      etiqueta: "MBS Recoletos",
      direccion: "C. Acera de Recoletos, 14",
      ciudad: "47004 Valladolid",
      equipo: "1 barbero",
      mapsUrl: "https://maps.google.com/?q=Acera+de+Recoletos+14+Valladolid",
    },
  ];

  return (
    <section id="sedes" className="py-16 sm:py-28 px-4 sm:px-6 bg-[#050505]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-16">
          <p className="section-label mb-4">Encuéntranos</p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold">
            Nuestras <span className="gold-text">sedes</span>
          </h2>
          <div className="divider-gold" />
          <p className="text-[#aaa] text-sm mt-4">Dos ubicaciones premium en el corazón de Valladolid</p>
        </div>

        {/* Galería con scroll horizontal */}
        <div className="mb-12 sm:mb-16">
          <p className="text-xs tracking-widest text-[#C9A84C]/70 uppercase mb-4 text-center">
            MBS San Quirce — Galería
          </p>
          <GaleriaScroll />
        </div>

        {/* Cards de sedes */}
        <div className="grid md:grid-cols-2 gap-8">
          {sedes.map((sede) => (
            <div key={sede.id} className="card-premium p-0 overflow-hidden">
              {/* Header de la card */}
              <div className="relative h-2 bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent" />

              {/* Info */}
              <div className="p-8">
                <p className="section-label mb-1">{sede.etiqueta}</p>
                <h3 className="font-serif text-2xl font-bold mb-1">{sede.nombre}</h3>
                <div className="gold-line my-4" />

                <div className="space-y-3 mb-8">
                  <div className="flex items-start gap-3">
                    <span className="text-[#C9A84C] text-lg mt-0.5">📍</span>
                    <div>
                      <p className="text-white font-medium">{sede.direccion}</p>
                      <p className="text-[#aaa] text-sm">{sede.ciudad}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#C9A84C] text-lg">✂</span>
                    <p className="text-[#aaa] text-sm">{sede.equipo}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={sede.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex btn-outline text-xs flex-1 justify-center"
                  >
                    Cómo llegar →
                  </a>
                  <a
                    href="/reservas"
                    className="inline-flex btn-gold text-xs flex-1 justify-center"
                  >
                    Reservar aquí
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
