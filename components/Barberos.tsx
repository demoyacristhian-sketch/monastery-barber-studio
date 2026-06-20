// Replace CALENDLY_BARBERO_X_URL with actual Calendly URLs before launch
export const BARBEROS = [
  {
    id: 1,
    nombre: "Barbero 1",
    sede: "Sede S. Quirce",
    especialidad: "Maestro en degradados y cortes modernos con más de 8 años de experiencia. Técnica precisa, trato cercano y atención al detalle que marcan la diferencia.",
    calendlyUrl: "CALENDLY_BARBERO_1_URL",
    foto: null,
  },
  {
    id: 2,
    nombre: "Barbero 2",
    sede: "Sede S. Quirce",
    especialidad: "Especialista en diseño de barba y afeitado clásico con cuchilla. Combina técnica tradicional con estilo contemporáneo para resultados únicos.",
    calendlyUrl: "CALENDLY_BARBERO_2_URL",
    foto: null,
  },
  {
    id: 3,
    nombre: "Barbero 3",
    sede: "Sede Recoletos",
    especialidad: "Experto en cortes personalizados y tratamientos capilares. Cada visita es una experiencia de cuidado integral adaptada a tu imagen.",
    calendlyUrl: "CALENDLY_BARBERO_3_URL",
    foto: null,
  },
];

export default function Barberos() {
  return (
    <section id="barberos" className="py-16 sm:py-28 px-4 sm:px-6 bg-[#050505]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-20">
          <p className="section-label mb-4">El equipo</p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold">
            Nuestros <span className="gold-text">profesionales</span>
          </h2>
          <div className="divider-gold" />
          <p className="text-[#666] text-sm mt-4 max-w-md mx-auto">
            Artesanos del estilo comprometidos con la excelencia en cada corte
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {BARBEROS.map((b) => (
            <div key={b.id} className="card-premium overflow-hidden">
              {/* Photo area */}
              <div className="barbero-photo relative">
                {b.foto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={b.foto}
                    alt={b.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 opacity-30">
                    <div className="w-20 h-20 rounded-full border border-[#C9A84C] flex items-center justify-center text-4xl">
                      ✂
                    </div>
                    <p className="text-xs tracking-widest uppercase text-[#C9A84C]">
                      Foto próximamente
                    </p>
                  </div>
                )}
                {/* Sede badge */}
                <div className="absolute top-4 left-4 bg-black/80 border border-[#C9A84C]/40 px-3 py-1">
                  <p className="text-[#C9A84C] text-xs tracking-widest uppercase">{b.sede}</p>
                </div>
              </div>

              {/* Info */}
              <div className="p-6">
                <h3 className="font-serif text-xl font-bold mb-1">{b.nombre}</h3>
                <div className="w-8 h-0.5 bg-[#C9A84C] mb-4" />
                <p className="text-[#888] text-sm leading-relaxed mb-6">{b.especialidad}</p>
                <a
                  href="/reservas"
                  className="btn-gold w-full text-center justify-center text-xs"
                >
                  Reservar con {b.nombre.split(" ")[0]}
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Quote */}
        <div className="mt-24 text-center">
          <div className="gold-line mb-8" />
          <p className="font-serif text-2xl md:text-3xl text-[#888] italic max-w-2xl mx-auto">
            &ldquo;Monastery no es solo una barbería.
            <br />
            <span className="text-white">Es tu nuevo estándar.&rdquo;</span>
          </p>
          <div className="gold-line mt-8" />
        </div>
      </div>
    </section>
  );
}
