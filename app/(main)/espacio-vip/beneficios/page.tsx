import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Beneficios VIP | Monastery Barber Studio",
};

const OFERTAS = [
  {
    tag: "Oferta del mes",
    titulo: "Pack Ritual Completo",
    desc: "Corte + barba + tratamiento con aceite de argán. Tu sesión más completa.",
    precio: "45 € · antes 55 €",
    badge: "−18%",
  },
  {
    tag: "Solo miembros",
    titulo: "Lunes de Barbería",
    desc: "Los lunes tienes prioridad de agenda y un 10% de descuento en cualquier servicio.",
    precio: "Aplicado automáticamente",
    badge: "−10%",
  },
  {
    tag: "Nuevo",
    titulo: "Tratamiento Capilar Profundo",
    desc: "Hidratación profesional con productos exclusivos. Disponible bajo reserva.",
    precio: "20 €",
    badge: "Nuevo",
  },
];

const TENDENCIAS = [
  {
    categoria: "Cortes 2025",
    titulo: "El Buzz Cut con degradado",
    desc: "El clásico military se reinventa con degradados precisos y texturas contrastadas. La opción más solicitada esta temporada.",
    tiempo: "Lectura 2 min",
  },
  {
    categoria: "Barba",
    titulo: "La barba corta y definida",
    desc: "Menos es más. La barba de 3-5 mm perfectamente contorneada es la tendencia dominante entre los hombres que cuidan su imagen.",
    tiempo: "Lectura 1 min",
  },
  {
    categoria: "Cuidado capilar",
    titulo: "Rutina de mantenimiento en casa",
    desc: "Los productos que tu barbero usa y cómo replicar el acabado profesional entre visitas.",
    tiempo: "Lectura 3 min",
  },
  {
    categoria: "Estilo",
    titulo: "El Slick Back moderno",
    desc: "Peinado hacia atrás con productos de fijación media. Elegante pero natural, ideal para cualquier ocasión.",
    tiempo: "Lectura 2 min",
  },
];

const PLANES = [
  {
    nombre: "Silver",
    precio: "29 €/mes",
    color: "#aaa",
    beneficios: ["2 cortes al mes", "Acceso al Espacio VIP", "Acceso a ofertas exclusivas"],
  },
  {
    nombre: "Gold",
    precio: "40 €/mes",
    color: "#C9A84C",
    beneficios: ["2 cortes al mes", "Barba incluida en cada visita", "Perfilado de cejas incluido", "Prioridad de agenda", "Acceso VIP a tendencias"],
    destacado: true,
  },
  {
    nombre: "Black",
    precio: "60 €/mes",
    color: "#888",
    beneficios: ["2 cortes Premium al mes", "Barba + cejas incluidas", "Depilación nariz y oído", "Lavado de cabello incluido", "Prioridad absoluta de agenda", "Acceso a productos exclusivos"],
  },
];

export default async function BeneficiosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/espacio-vip/beneficios");

  const admin = createAdminClient();
  const { data: clienteRaw } = await (admin.from("clientes") as any)
    .select("nivel, sellos, vip")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  const nivel = clienteRaw?.nivel as string | null;

  return (
    <main className="min-h-screen bg-black py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-16">

        {/* Header */}
        <div>
          <p className="section-label mb-1">Solo para ti</p>
          <h1 className="font-serif text-3xl font-bold">
            Beneficios <span className="gold-text">VIP</span>
          </h1>
          <div className="h-px w-12 bg-[#C9A84C]/50 mt-3" />
          <p className="text-[#555] text-sm mt-3">
            Ofertas exclusivas, tendencias del sector y ventajas de membresía reservadas para nuestros clientes.
          </p>
        </div>

        {/* Ofertas */}
        <div>
          <p className="section-label mb-6">Ofertas exclusivas</p>
          <div className="grid md:grid-cols-3 gap-5">
            {OFERTAS.map(o => (
              <div key={o.titulo} className="card-premium p-6 relative overflow-hidden">
                <div className="absolute top-4 right-4 text-[10px] px-2 py-0.5 bg-[#C9A84C] text-black font-bold tracking-wider">
                  {o.badge}
                </div>
                <p className="section-label mb-2">{o.tag}</p>
                <h3 className="font-serif text-lg font-bold text-white mb-2">{o.titulo}</h3>
                <p className="text-[#555] text-sm mb-4 leading-relaxed">{o.desc}</p>
                <p className="text-[#C9A84C] text-sm font-medium">{o.precio}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link href="/reservas" className="btn-gold inline-flex text-sm">
              Reservar y aplicar oferta →
            </Link>
          </div>
        </div>

        {/* Membresías */}
        <div>
          <p className="section-label mb-2">La Orden — Membresías</p>
          <p className="text-[#555] text-sm mb-6">
            Hazte miembro y accede a cortes ilimitados, descuentos y prioridad de agenda.
            Habla con tu barbero para activar tu plan.
          </p>
          <div className="grid md:grid-cols-3 gap-5">
            {PLANES.map(p => (
              <div
                key={p.nombre}
                className={`card-premium p-6 relative ${p.destacado ? "border-[#C9A84C]/40" : ""}`}
              >
                {p.destacado && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] px-3 py-0.5 bg-[#C9A84C] text-black font-bold tracking-wider whitespace-nowrap">
                    Más popular
                  </div>
                )}
                <p className="font-serif text-2xl font-bold mb-0.5" style={{ color: p.color }}>
                  {p.nombre}
                </p>
                <p className="text-white text-lg font-semibold mb-4">{p.precio}</p>
                {nivel === p.nombre && (
                  <p className="text-[#C9A84C] text-xs mb-3 flex items-center gap-1">
                    ✓ Tu plan actual
                  </p>
                )}
                <ul className="space-y-2">
                  {p.beneficios.map(b => (
                    <li key={b} className="text-[#555] text-xs flex items-start gap-2">
                      <span className="text-[#C9A84C] mt-0.5 shrink-0">·</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-[#333] text-xs text-center mt-4">
            Para activar o cambiar tu membresía, habla con tu barbero o escríbenos por WhatsApp.
          </p>
        </div>

        {/* Tendencias */}
        <div>
          <p className="section-label mb-6">Tendencias · {new Date().getFullYear()}</p>
          <div className="grid md:grid-cols-2 gap-5">
            {TENDENCIAS.map(t => (
              <div key={t.titulo} className="card-premium p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="section-label text-[10px]">{t.categoria}</span>
                  <span className="text-[#333] text-xs">{t.tiempo}</span>
                </div>
                <h3 className="font-serif text-xl font-bold text-white mb-2">{t.titulo}</h3>
                <p className="text-[#555] text-sm leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="border border-[#C9A84C]/20 bg-gradient-to-r from-transparent via-[#C9A84C]/5 to-transparent p-10 text-center">
          <h3 className="font-serif text-2xl font-bold mb-2">
            ¿Listo para tu próxima <span className="gold-text">sesión</span>?
          </h3>
          <p className="text-[#555] text-sm mb-6 max-w-sm mx-auto">
            Reserva ahora y aplica automáticamente tus beneficios de miembro.
          </p>
          <Link href="/reservas" className="btn-gold inline-flex">
            Reservar cita →
          </Link>
        </div>

      </div>
    </main>
  );
}
