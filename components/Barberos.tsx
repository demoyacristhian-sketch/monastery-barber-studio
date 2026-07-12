import Link from "next/link";

export const BARBEROS = [
  {
    id: 1,
    nombre: "Jonathan Suárez",
    sede: "Monastery San Quirce",
    especialidad:
      "Maestro barbero con más de 10 años de experiencia especializado en cortes de precisión, degradados y diseño personalizado. Jonathan domina desde el corte clásico hasta las técnicas más contemporáneas, siempre con un nivel de detalle que distingue cada trabajo. Su pasión por el oficio y su trato cercano lo convierten en referencia en Monastery San Quirce.",
    foto: null,
  },
  {
    id: 2,
    nombre: "Daniel Quiñones",
    sede: "Monastery Recoletos",
    especialidad:
      "Con más de 10 años de trayectoria, Daniel es especialista en barba, afeitado clásico y tratamientos capilares premium. Su técnica combina la tradición del barbero artesano con las tendencias actuales, logrando resultados únicos en cada sesión. En Monastery Recoletos, Daniel cuida cada detalle para que tu imagen sea siempre impecable.",
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

        {/* Cards — centradas cuando son 2 */}
        <div className="flex flex-col md:flex-row gap-8 justify-center max-w-3xl mx-auto">
          {BARBEROS.map((b) => (
            <div key={b.id} className="card-premium overflow-hidden flex-1">
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
                <Link
                  href="/reservas"
                  className="btn-gold w-full text-center justify-center text-xs inline-flex"
                >
                  Reservar con {b.nombre.split(" ")[0]}
                </Link>
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
