import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ofertas y Promociones | Espacio VIP — Monastery",
};

// ── Mapa oferta → parámetros de reserva ──────────────────────────────────
const MES_ACTUAL = new Date().getMonth() + 1; // 1–12

type OfertaItem = {
  id: string;
  tag: string;
  titulo: string;
  desc: string;
  badge: string;
  condicion: string;
  color: string;
  servicio?: string;
  precioOferta?: number;
  precioOriginal?: number;
  extra?: string;
  vipExclusivo?: boolean;
  franja?: string;  // "manana"
  meses?: string;   // "8" o "7,8,9"
  dias?: string;    // "1" = solo lunes
};

const OFERTAS_VIP: OfertaItem[] = [
  {
    id: "pack-ritual-vip",
    tag: "Oferta del mes",
    titulo: "Pack Ritual Completo",
    desc: "Corte + barba + tratamiento con aceite de argán. Tu sesión más completa, disponible solo para miembros VIP.",
    badge: "−18%",
    condicion: "Solo miembros VIP",
    color: "#C9A84C",
    servicio: "Pack Ritual Completo",
    precioOferta: 45,
    precioOriginal: 55,
    vipExclusivo: true,
  },
  {
    id: "lunes-barberia-vip",
    tag: "Solo miembros",
    titulo: "Lunes de Barbería",
    desc: "Los lunes tienes prioridad de agenda y un 10% de descuento automático en cualquier servicio que reserves.",
    badge: "−10%",
    condicion: "Todos los lunes · Solo VIP",
    color: "#C9A84C",
    vipExclusivo: true,
  },
  {
    id: "tratamiento-capilar-vip",
    tag: "Nuevo",
    titulo: "Tratamiento Capilar Profundo",
    desc: "Hidratación profesional con productos exclusivos. Revitaliza tu cabello entre visitas. Disponible bajo reserva.",
    badge: "20 €",
    condicion: "Disponible toda la semana",
    color: "#C9A84C",
    servicio: "Tratamiento Capilar Profundo",
    precioOferta: 20,
    vipExclusivo: true,
  },
];

const OFERTAS_PUBLICAS: OfertaItem[] = [
  {
    id: "morning-ritual",
    tag: "Horario de mañana",
    titulo: "Morning Ritual",
    desc: "Corte Estándar a precio reducido. Ven por la mañana y llévate un refresco o cerveza de regalo.",
    badge: "14 €",
    condicion: "Lun–Vie · 09:00–14:00",
    color: "#C9A84C",
    servicio: "Corte Estándar",
    precioOferta: 14,
    precioOriginal: 17,
    extra: "Refresco incluido",
    franja: "manana",
  },
  {
    id: "upgrade-mananero",
    tag: "Horario de mañana",
    titulo: "Upgrade Mañanero",
    desc: "Reserva Corte Estándar y sube al Corte Medium completo (barba + cejas) por solo 5 € más.",
    badge: "+5 € en vez de +8 €",
    condicion: "Lun–Vie · 09:00–14:00",
    color: "#C9A84C",
    servicio: "Corte Medium",
    precioOferta: 22,
    precioOriginal: 25,
    extra: "Ahorro de 3 € en el upgrade",
    franja: "manana",
  },
  {
    id: "pack-madrugador",
    tag: "Horario de mañana",
    titulo: "Pack Madrugador",
    desc: "Corte Medium completo con barba y cejas a precio especial. Con snack de bienvenida incluido.",
    badge: "20 €",
    condicion: "Lun–Vie · 09:00–14:00",
    color: "#C9A84C",
    servicio: "Corte Medium",
    precioOferta: 20,
    precioOriginal: 25,
    extra: "Snack incluido",
    franja: "manana",
  },
  {
    id: "verano-monastery",
    tag: "Verano",
    titulo: "Verano Monastery",
    desc: "El Corte Premium completo (cabello + barba + cejas + nariz + oído + lavado) a precio de temporada.",
    badge: "28 €",
    condicion: "Todo agosto · Lun–Vie",
    color: "#60A5FA",
    servicio: "Corte Premium",
    precioOferta: 28,
    precioOriginal: 35,
    meses: "8",
  },
  {
    id: "lunes-barba",
    tag: "Siempre disponible",
    titulo: "Lunes de Barba",
    desc: "Los lunes es el día perfecto para poner a punto tu barba. Precio especial solo ese día.",
    badge: "10 €",
    condicion: "Todos los lunes",
    color: "#A78BFA",
    servicio: "Solo Barba",
    precioOferta: 10,
    precioOriginal: 12,
    dias: "1",
  },
  {
    id: "cerveza-verano",
    tag: "Verano",
    titulo: "Verano Refrescante",
    desc: "Solo 10 plazas al día durante julio y agosto. Sé de los primeros en reservar y llévate una bebida fría de cortesía.",
    badge: "10 plazas/día 🍺",
    condicion: "Jul–Ago · Lun–Vie · Primeras 10 reservas del día",
    color: "#60A5FA",
    extra: "Bebida incluida · Cerveza (+18) o refresco",
    meses: "7,8",
  },
  {
    id: "bono-verano",
    tag: "Verano",
    titulo: "Bono Verano 3+1",
    desc: "Paga 3 cortes de cualquier tipo y el 4.º te sale completamente gratis. Ideal para el verano.",
    badge: "3+1 gratis",
    condicion: "Jul–Sep · Lun–Vie",
    color: "#60A5FA",
    meses: "7,8,9",
  },
  {
    id: "trae-amigo",
    tag: "Siempre disponible",
    titulo: "Trae a un Amigo",
    desc: "Trae a alguien nuevo a Monastery y ambos os lleváis un 10% de descuento en vuestra próxima visita.",
    badge: "−10% para los dos",
    condicion: "Todo el año",
    color: "#A78BFA",
  },
];

function buildHref(o: OfertaItem): string {
  return [
    `/reservas?oferta=${encodeURIComponent(o.titulo)}`,
    o.servicio     ? `&servicio=${encodeURIComponent(o.servicio)}`  : "",
    o.precioOferta ? `&precio=${o.precioOferta}`                    : "",
    o.extra        ? `&extra=${encodeURIComponent(o.extra)}`        : "",
    o.franja       ? `&franja=${o.franja}`                          : "",
    o.meses        ? `&meses=${encodeURIComponent(o.meses)}`        : "",
    o.dias         ? `&dias=${o.dias}`                              : "",
  ].join("");
}

function isOfertaActiva(o: OfertaItem): boolean {
  if (!o.meses) return true;
  return o.meses.split(",").map(Number).includes(MES_ACTUAL);
}

function OfertaCard({ o }: { o: OfertaItem }) {
  const href = buildHref(o);
  const activa = isOfertaActiva(o);
  return (
    <div className={`card-premium p-5 flex flex-col gap-3 relative overflow-hidden ${!activa ? "opacity-50" : ""}`}>
      <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{ background: o.color }} />
      {o.vipExclusivo && (
        <div className="absolute top-3 right-3 text-[9px] px-1.5 py-0.5 bg-[#C9A84C] text-black font-bold tracking-wider">
          VIP
        </div>
      )}
      {!activa && o.meses && (
        <div className="absolute top-3 right-3 text-[9px] px-1.5 py-0.5 bg-[#333] text-[#666] font-medium tracking-wider">
          Solo en {o.meses.split(",").map(m => ["","ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"][parseInt(m)]??m).join(", ")}
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[#555] text-[10px] tracking-widest uppercase mb-0.5">{o.tag}</p>
          <h3 className="font-serif font-bold text-white text-base leading-tight">{o.titulo}</h3>
        </div>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-sm shrink-0 whitespace-nowrap mt-1"
          style={{ background: o.color + "20", color: o.color }}
        >
          {o.badge}
        </span>
      </div>

      <p className="text-[#555] text-sm leading-relaxed flex-1">{o.desc}</p>

      {/* Precio */}
      {o.precioOferta && (
        <div className="flex items-baseline gap-2">
          <span className="text-[#C9A84C] font-bold">{o.precioOferta} €</span>
          {o.precioOriginal && (
            <span className="text-[#444] text-xs line-through">{o.precioOriginal} €</span>
          )}
        </div>
      )}

      <div className="space-y-0.5 mt-auto">
        <p className="text-[#333] text-xs flex items-center gap-1.5">
          <span style={{ color: o.color }}>◆</span>
          {o.condicion}
        </p>
        {o.extra && (
          <p className="text-[#444] text-xs pl-4">Incluye: {o.extra}</p>
        )}
      </div>

      {activa ? (
        <Link
          href={href}
          className="text-xs mt-1 transition-colors hover:text-white"
          style={{ color: o.color }}
        >
          Reservar esta oferta →
        </Link>
      ) : (
        <span className="text-xs mt-1 text-[#333] cursor-not-allowed">
          No disponible en este periodo
        </span>
      )}
    </div>
  );
}

export default async function OfertasVipPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/espacio-vip/ofertas");

  return (
    <main className="min-h-screen bg-black pt-6 pb-24 sm:py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-14">

        {/* Header */}
        <div>
          <p className="section-label mb-1">Solo para ti</p>
          <h1 className="font-serif text-3xl font-bold">
            Ofertas <span className="gold-text">& Promociones</span>
          </h1>
          <div className="h-px w-12 bg-[#C9A84C]/50 mt-3" />
          <p className="text-[#555] text-sm mt-3">
            Precios especiales, extras incluidos y descuentos exclusivos disponibles ahora mismo.
            Haz clic en cualquier oferta para reservar con el precio ya aplicado.
          </p>
        </div>

        {/* Ofertas VIP exclusivas */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">👑</span>
            <p className="section-label">Exclusivas para miembros VIP</p>
            <div className="flex-1 h-px ml-2 bg-[#C9A84C]/20" />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {OFERTAS_VIP.map(o => <OfertaCard key={o.id} o={o} />)}
          </div>
        </div>

        <div className="h-px bg-[#111]" />

        {/* Todas las ofertas */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">✦</span>
            <p className="section-label">Todas las ofertas disponibles</p>
            <div className="flex-1 h-px ml-2 bg-[#333]" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {OFERTAS_PUBLICAS.map(o => <OfertaCard key={o.id} o={o} />)}
          </div>
        </div>

        {/* Nota */}
        <div className="border border-[#111] bg-[#050505] p-6 text-center">
          <p className="text-[#444] text-xs">
            Promociones válidas de lunes a viernes. No aplicables en sábado. Al seleccionar una oferta,
            el precio especial se aplica automáticamente en tu reserva.
          </p>
        </div>

      </div>
    </main>
  );
}
