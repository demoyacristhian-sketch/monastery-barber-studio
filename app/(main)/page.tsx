import Link from "next/link";
import Hero from "@/components/Hero";
import Instagram from "@/components/Instagram";
import Ofertas from "@/components/Ofertas";

const ScissorsIcon = () => (
  <svg className="w-10 h-10" viewBox="0 0 32 32" fill="none" stroke="#C9A84C" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7" cy="7.5" r="3.8" />
    <circle cx="7" cy="24.5" r="3.8" />
    <path d="M27 4.5L10 18" />
    <path d="M18 18.5L27 27.5" />
    <path d="M10 10.5L14.5 14" />
  </svg>
);

const RazorIcon = () => (
  <svg className="w-11 h-10" viewBox="0 0 38 28" fill="none" stroke="#C9A84C" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="10" width="11" height="8" rx="2" />
    <line x1="5.5" y1="14" x2="9.5" y2="14" strokeWidth="0.9" strokeOpacity="0.55" />
    <circle cx="13" cy="14" r="1.3" fill="#C9A84C" stroke="none" />
    <path d="M13 11 L36 9 L36 19 L13 17 Z" fill="rgba(201,168,76,0.07)" />
    <line x1="13" y1="14" x2="36" y2="14" strokeWidth="0.55" strokeOpacity="0.3" />
  </svg>
);

const CombIcon = () => (
  <svg className="w-10 h-10" viewBox="0 0 32 32" fill="none" stroke="#C9A84C" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="8" width="26" height="7" rx="1.5" />
    {[7, 11, 15, 19, 23].map((x) => (
      <line key={x} x1={x} y1="15" x2={x} y2="24" />
    ))}
  </svg>
);

const featuredServices = [
  {
    categoria: "Corte & Degradado",
    icono: <ScissorsIcon />,
    desc: "Cortes personalizados con técnica de degradado artesanal. Desde el clásico al más moderno.",
    link: "/servicios",
  },
  {
    categoria: "Barba & Afeitado",
    icono: <RazorIcon />,
    desc: "Recorte, diseño y afeitado clásico con navaja. Ritual completo con toallas calientes.",
    link: "/servicios",
  },
  {
    categoria: "Tratamientos Premium",
    icono: <CombIcon />,
    desc: "Cuidado capilar integral, tratamientos de cuero cabelludo y coloración profesional.",
    link: "/servicios",
  },
];

const sedes = [
  {
    nombre: "Centro Histórico",
    direccion: "C. S. Quirce, 6, local 4 · 47003 Valladolid",
    mapsUrl: "https://maps.google.com/?q=Calle+de+S.+Quirce+6+Valladolid",
  },
  {
    nombre: "Paseo Recoletos",
    direccion: "Acera de Recoletos, 14 · 47004 Valladolid",
    mapsUrl: "https://maps.google.com/?q=Acera+de+Recoletos+14+Valladolid",
  },
];

export default function Home() {
  return (
    <main>
      {/* ── Hero ── */}
      <Hero />

      {/* ── Stats strip ── */}
      <div className="bg-[#050505] border-y border-[#111] py-10 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { num: "2", label: "Sedes en Valladolid" },
            { num: "8+", label: "Servicios disponibles" },
            { num: "10+", label: "Años de experiencia" },
            { num: "100%", label: "Calidad premium" },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-serif text-3xl sm:text-4xl font-black gold-text mb-1">{s.num}</p>
              <p className="text-[#999] text-xs tracking-wider uppercase">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Servicios destacados ── */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-label mb-3">Lo que hacemos</p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold">
              Servicios <span className="gold-text">esenciales</span>
            </h2>
            <div className="divider-gold" />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {featuredServices.map((s) => (
              <div key={s.categoria} className="card-premium p-8 group">
                <div className="mb-5">{s.icono}</div>
                <h3 className="font-serif text-xl font-bold mb-2 text-white">{s.categoria}</h3>
                <div className="w-8 h-0.5 bg-[#C9A84C] mb-4" />
                <p className="text-[#aaa] text-sm leading-relaxed mb-6">{s.desc}</p>
                <Link
                  href={s.link}
                  className="text-[#C9A84C] text-xs tracking-widest uppercase hover:text-white transition-colors"
                >
                  Ver todo →
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/servicios" className="inline-flex btn-outline">
              Todos los servicios →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Membresías ── */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 bg-[#050505]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-label mb-3">La Orden</p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold">
              Membresías <span className="gold-text">exclusivas</span>
            </h2>
            <div className="divider-gold" />
            <p className="text-[#999] text-sm mt-4 max-w-md mx-auto">
              Hazte miembro y disfruta de cortes ilimitados, prioridad de agenda y acceso a beneficios únicos.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                nombre: "Silver",
                precio: "29 €/mes",
                color: "#aaa",
                beneficios: ["2 cortes al mes", "Acceso al Espacio VIP", "Ofertas exclusivas"],
              },
              {
                nombre: "Gold",
                precio: "40 €/mes",
                color: "#C9A84C",
                beneficios: ["2 cortes al mes", "Barba incluida", "Perfilado de cejas", "Prioridad de agenda"],
                destacado: true,
              },
              {
                nombre: "Black",
                precio: "60 €/mes",
                color: "#888",
                beneficios: ["2 cortes Premium", "Barba + cejas", "Nariz y oído", "Lavado incluido"],
              },
            ].map((p) => (
              <div
                key={p.nombre}
                className={`card-premium p-7 relative flex flex-col ${p.destacado ? "border-[#C9A84C]/40" : ""}`}
              >
                {p.destacado && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] px-3 py-0.5 bg-[#C9A84C] text-black font-bold tracking-wider whitespace-nowrap">
                    Más popular
                  </div>
                )}
                <p className="font-serif text-3xl font-bold mb-1" style={{ color: p.color }}>{p.nombre}</p>
                <p className="text-white text-xl font-semibold mb-5">{p.precio}</p>
                <ul className="space-y-2 flex-1">
                  {p.beneficios.map((b) => (
                    <li key={b} className="text-[#999] text-sm flex items-start gap-2">
                      <span className="mt-0.5 shrink-0" style={{ color: p.color }}>·</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center mt-10 space-y-3">
            <p className="text-[#888] text-xs">Habla con tu barbero para activar tu membresía.</p>
            <Link href="/la-orden" className="inline-flex btn-gold">
              Conocer todos los beneficios →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Ofertas & Promociones ── */}
      <Ofertas />

      {/* ── Sedes teaser ── */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 bg-[#050505]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-label mb-3">Encuéntranos</p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold">
              Dos <span className="gold-text">sedes</span> en Valladolid
            </h2>
            <div className="divider-gold" />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {sedes.map((sede) => (
              <div key={sede.nombre} className="card-premium p-8">
                <p className="section-label mb-3">Sede</p>
                <h3 className="font-serif text-2xl font-bold mb-2">{sede.nombre}</h3>
                <div className="gold-line my-4" />
                <div className="flex items-start gap-3 mb-8">
                  <span className="text-[#C9A84C] text-lg">📍</span>
                  <p className="text-[#888] text-sm leading-relaxed">{sede.direccion}</p>
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
                  <Link
                    href="/reservas"
                    className="inline-flex btn-gold text-xs flex-1 justify-center"
                  >
                    Reservar aquí
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/sedes" className="text-[#999] text-xs tracking-widest uppercase hover:text-[#C9A84C] transition-colors">
              Ver información completa de sedes →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Quote ── */}
      <div className="py-20 px-6 bg-black text-center">
        <div className="gold-line mb-10 max-w-xs mx-auto" />
        <p className="font-serif text-2xl md:text-3xl text-[#aaa] italic max-w-2xl mx-auto">
          &ldquo;Monastery no es solo una barbería.
          <br />
          <span className="text-white">Es tu nuevo estándar.&rdquo;</span>
        </p>
        <div className="gold-line mt-10 max-w-xs mx-auto" />
      </div>

      {/* ── Instagram CTA ── */}
      <Instagram />
    </main>
  );
}
