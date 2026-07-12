import Link from "next/link";

type Oferta = {
  id: string;
  nombre: string;
  descripcion: string;
  badge: string;
  condicion: string;
  extra?: string;
};

const OFERTAS_MANANA: Oferta[] = [
  {
    id: "morning-ritual",
    nombre: "Morning Ritual",
    descripcion: "Corte Estándar a precio reducido. Ven por la mañana y llévate un refresco o cerveza de regalo.",
    badge: "17 € → 14 €",
    condicion: "Lun–Vie · 09:00–14:00",
    extra: "🍺 Bebida incluida",
  },
  {
    id: "upgrade-mananero",
    nombre: "Upgrade Mañanero",
    descripcion: "Reservas Corte Estándar y por solo 5 € más subes al Corte Medium completo (barba + cejas).",
    badge: "+5 € en vez de +8 €",
    condicion: "Lun–Vie · 09:00–14:00",
    extra: "Ahorra 3 € en el upgrade",
  },
  {
    id: "pack-madrugador",
    nombre: "Pack Madrugador",
    descripcion: "Corte Medium completo con barba y cejas a precio especial. Con snack de bienvenida incluido.",
    badge: "25 € → 20 €",
    condicion: "Lun–Vie · 09:00–14:00",
    extra: "🥐 Snack incluido",
  },
];

const OFERTAS_VERANO: Oferta[] = [
  {
    id: "verano-monastery",
    nombre: "Verano Monastery",
    descripcion: "El Corte Premium completo (cabello + barba + cejas + nariz + oído + lavado) a precio de temporada.",
    badge: "35 € → 28 €",
    condicion: "Todo agosto · Lun–Vie",
  },
  {
    id: "bono-verano",
    nombre: "Bono Verano 3+1",
    descripcion: "Paga 3 cortes de cualquier tipo y el 4.º te sale completamente gratis. Ideal para el verano.",
    badge: "3+1 gratis",
    condicion: "Jul–Sep · Lun–Vie",
    extra: "Válido con cualquier servicio",
  },
  {
    id: "cerveza-verano",
    nombre: "Verano Refrescante",
    descripcion: "Solo 10 plazas al día durante julio y agosto. Reserva tu sitio y llévate una bebida fría de cortesía. Primero en llegar, primero en disfrutar.",
    badge: "10 plazas/día 🍺",
    condicion: "Jul–Ago · Lun–Vie · Solo las primeras 10 reservas del día",
    extra: "Bebida incluida · Cerveza (+18) o refresco",
  },
];

const OFERTAS_SIEMPRE: Oferta[] = [
  {
    id: "trae-amigo",
    nombre: "Trae a un Amigo",
    descripcion: "Trae a alguien nuevo a Monastery y ambos os lleváis un 10% de descuento en vuestra próxima visita.",
    badge: "−10% para los dos",
    condicion: "Lun–Vie · Todo el año",
    extra: "Sin límite de usos",
  },
  {
    id: "lunes-barba",
    nombre: "Lunes de Barba",
    descripcion: "Los lunes es el día perfecto para poner a punto tu barba. Precio especial solo por ese día.",
    badge: "12 € → 10 €",
    condicion: "Todos los lunes",
    extra: "Solo barba · 20 min",
  },
];

type OfertaAsignacion = {
  servicio?: string;
  precio?: number;
  extra?: string;
  franja?: string;  // "manana" = solo horario 09:00–14:00
  meses?: string;   // "8" o "7,8,9" — meses válidos (1-12)
  dias?: string;    // "1" = solo lunes (0=dom, 1=lun, ..., 6=sáb)
};

const SERVICIO_POR_OFERTA: Record<string, OfertaAsignacion> = {
  "morning-ritual":   { servicio: "Corte Estándar", precio: 14,  extra: "Refresco incluido",             franja: "manana" },
  "upgrade-mananero": { servicio: "Corte Medium",   precio: 22,  extra: "Ahorro de 3 € en el upgrade",   franja: "manana" },
  "pack-madrugador":  { servicio: "Corte Medium",   precio: 20,  extra: "Snack incluido",                 franja: "manana" },
  "verano-monastery": { servicio: "Corte Premium",  precio: 28,  meses: "8" },
  "bono-verano":      { meses: "7,8,9" },
  "cerveza-verano":   { extra: "Bebida incluida",                              meses: "7,8" },
  "trae-amigo":       {},
  "lunes-barba":      { servicio: "Solo Barba",     precio: 10,  dias: "1" },
};

function GrupoOfertas({ titulo, icono, ofertas, color }: {
  titulo: string;
  icono: string;
  ofertas: Oferta[];
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">{icono}</span>
        <div>
          <p className="section-label">{titulo}</p>
        </div>
        <div className="flex-1 h-px ml-2" style={{ background: color + "30" }} />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ofertas.map((o) => {
          const asig = SERVICIO_POR_OFERTA[o.id] ?? {};
          const reservaHref = [
            `/reservas?oferta=${encodeURIComponent(o.nombre)}`,
            asig.servicio ? `&servicio=${encodeURIComponent(asig.servicio)}` : "",
            asig.precio   ? `&precio=${asig.precio}`                          : "",
            asig.extra    ? `&extra=${encodeURIComponent(asig.extra)}`         : "",
            asig.franja   ? `&franja=${asig.franja}`                           : "",
            asig.meses    ? `&meses=${encodeURIComponent(asig.meses)}`         : "",
            asig.dias     ? `&dias=${asig.dias}`                               : "",
          ].join("");
          return (
            <div
              key={o.id}
              className="card-premium p-5 flex flex-col gap-3 relative overflow-hidden"
            >
              {/* Banda lateral de color */}
              <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{ background: color }} />

              <div className="flex items-start justify-between gap-2">
                <h3 className="font-serif font-bold text-white text-base leading-tight">{o.nombre}</h3>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-sm shrink-0 whitespace-nowrap"
                  style={{ background: color + "20", color }}
                >
                  {o.badge}
                </span>
              </div>

              <p className="text-[#555] text-sm leading-relaxed flex-1">{o.descripcion}</p>

              <div className="space-y-1 mt-auto">
                <p className="text-[#333] text-xs flex items-center gap-1.5">
                  <span style={{ color }}>◆</span>
                  {o.condicion}
                </p>
                {o.extra && (
                  <p className="text-[#444] text-xs">{o.extra}</p>
                )}
              </div>

              <Link
                href={reservaHref}
                className="text-xs mt-1 transition-colors hover:text-white"
                style={{ color }}
              >
                Reservar y aplicar →
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Ofertas() {
  return (
    <section id="ofertas" className="py-20 sm:py-28 px-4 sm:px-6 bg-[#050505]">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14">
          <p className="section-label mb-3">Para nuestros clientes</p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold">
            Ofertas & <span className="gold-text">Promociones</span>
          </h2>
          <div className="divider-gold" />
          <p className="text-[#666] text-sm mt-4 max-w-md mx-auto">
            Más razones para visitarnos. Descuentos especiales por horario, temporada y fidelidad.
          </p>
        </div>

        <div className="space-y-14">
          <GrupoOfertas
            titulo="Horario de mañana · 09:00–14:00"
            icono="🌅"
            ofertas={OFERTAS_MANANA}
            color="#C9A84C"
          />
          <div className="h-px bg-[#111]" />
          <GrupoOfertas
            titulo="Temporada de verano"
            icono="☀️"
            ofertas={OFERTAS_VERANO}
            color="#60A5FA"
          />
          <div className="h-px bg-[#111]" />
          <GrupoOfertas
            titulo="Siempre disponibles"
            icono="✦"
            ofertas={OFERTAS_SIEMPRE}
            color="#A78BFA"
          />
        </div>

        {/* CTA */}
        <div className="mt-16 text-center border border-[#C9A84C]/20 bg-[#C9A84C]/5 p-8">
          <p className="text-[#888] text-sm mb-2">Promociones válidas de lunes a viernes. No aplicables en sábado.</p>
          <p className="text-[#555] text-xs mb-6">Menciona la oferta al reservar o al llegar a tu cita.</p>
          <Link href="/reservas" className="inline-flex btn-gold">
            Reservar con promoción →
          </Link>
        </div>
      </div>
    </section>
  );
}
