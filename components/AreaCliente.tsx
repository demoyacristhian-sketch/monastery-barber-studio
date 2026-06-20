import { createClient } from "@/lib/supabase-server";
import type { Cliente, PuntosFidelizacion } from "@/lib/database.types";
import Link from "next/link";

type CitaResumen = {
  id: string;
  fecha_hora: string;
  estado: string;
  servicios: { nombre: string } | null;
  barberos: { nombre: string } | null;
  sedes: { nombre: string } | null;
};

type MembresiaResumen = {
  id: string;
  planes_membresia: { nombre: string; descuento_servicios: number } | null;
} | null;

async function getDashboardData(userId: string) {
  const supabase = await createClient();

  const { data: clienteRaw } = await supabase
    .from("clientes")
    .select("*")
    .eq("auth_user_id", userId)
    .single();

  const cliente = clienteRaw as Cliente | null;
  if (!cliente) return { cliente: null, citas: [], puntos: 0, membresia: null };

  const [citasRes, puntosRes, membresiaRes] = await Promise.all([
    supabase
      .from("citas")
      .select("id, fecha_hora, estado, servicios(nombre), barberos(nombre), sedes(nombre)")
      .eq("cliente_id", cliente.id)
      .order("fecha_hora", { ascending: false })
      .limit(5),
    supabase
      .from("puntos_fidelizacion")
      .select("*")
      .eq("cliente_id", cliente.id)
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("membresias")
      .select("id, planes_membresia(nombre, descuento_servicios)")
      .eq("cliente_id", cliente.id)
      .eq("estado", "activa")
      .maybeSingle(),
  ]);

  const citas = (citasRes.data ?? []) as CitaResumen[];
  const puntos = ((puntosRes.data ?? []) as PuntosFidelizacion[])[0]?.saldo_acumulado ?? 0;
  const membresia = (membresiaRes.data ?? null) as MembresiaResumen;

  return { cliente, citas, puntos, membresia };
}

export default async function AreaCliente() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <AreaClientePublica />;

  const { cliente, citas, puntos, membresia } = await getDashboardData(user.id);

  if (!cliente) return <AreaClienteNuevo email={user.email!} />;

  return <Dashboard cliente={cliente} citas={citas} puntos={puntos} membresia={membresia} />;
}

/* ── Vista pública (no autenticado) ── */
const features = [
  { icon: "📅", title: "Historial de citas", desc: "Consulta todas tus visitas pasadas y servicios realizados." },
  { icon: "⚡", title: "Reserva rápida", desc: "Con tus datos guardados, reserva en segundos en futuras visitas." },
  { icon: "👑", title: "Membresías VIP", desc: "Accede a planes exclusivos con descuentos y prioridad de agenda." },
  { icon: "💳", title: "Suscripciones", desc: "Gestiona tu suscripción mensual y beneficios asociados." },
  { icon: "🎁", title: "Beneficios exclusivos", desc: "Ofertas, descuentos y acceso anticipado a nuevos servicios." },
  { icon: "📱", title: "Experiencia app (PWA)", desc: "Instala Monastery en tu móvil como una app nativa." },
];

function AreaClientePublica() {
  return (
    <section id="cuenta" className="py-16 sm:py-28 px-4 sm:px-6 bg-black">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <p className="section-label mb-4">Tu espacio</p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold">
            Área <span className="gold-text">cliente</span>
          </h2>
          <div className="divider-gold" />
          <p className="text-[#666] text-sm mt-4 max-w-md mx-auto">
            Crea tu cuenta y accede a una experiencia personalizada y exclusiva
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {features.map((f) => (
            <div key={f.title} className="card-premium p-6">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-[#666] text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="border border-[#C9A84C]/20 bg-gradient-to-r from-transparent via-[#C9A84C]/5 to-transparent p-10 text-center">
          <h3 className="font-serif text-2xl font-bold mb-3">
            Tu imagen merece una <span className="gold-text">experiencia premium</span>
          </h3>
          <p className="text-[#666] text-sm mb-8 max-w-md mx-auto">
            Crea tu cuenta gratuita y accede a tu espacio privado en Monastery.
          </p>
          <Link href="/login" className="inline-flex btn-gold">
            Acceder al Espacio VIP →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Cliente nuevo (auth pero sin perfil) ── */
function AreaClienteNuevo({ email }: { email: string }) {
  return (
    <section id="cuenta" className="py-16 px-4 sm:px-6 bg-black">
      <div className="max-w-md mx-auto text-center">
        <div className="border border-[#C9A84C]/20 p-10">
          <div className="text-4xl mb-4">✦</div>
          <h2 className="font-serif text-2xl font-bold mb-2">Bienvenido</h2>
          <p className="text-[#555] text-sm mb-1">{email}</p>
          <div className="divider-gold" />
          <p className="text-[#666] text-sm mt-4 mb-8">
            Tu cuenta está lista. Reserva tu primera cita para activar tu perfil completo.
          </p>
          <Link href="/reservas" className="inline-flex btn-gold">
            Reservar primera cita →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Dashboard real ── */
function Dashboard({ cliente, citas, puntos, membresia }: {
  cliente: Cliente;
  citas: CitaResumen[];
  puntos: number;
  membresia: MembresiaResumen;
}) {
  const nivel = membresia?.planes_membresia?.nombre ?? null;
  const nivelColor = nivel === "Black" ? "#888" : nivel === "Gold" ? "#C9A84C" : nivel === "Silver" ? "#aaa" : "#fff";
  const descuento = membresia?.planes_membresia?.descuento_servicios;

  return (
    <section id="cuenta" className="py-16 px-4 sm:px-6 bg-black">
      <div className="max-w-5xl mx-auto">
        {/* Saludo */}
        <div className="mb-10">
          <p className="section-label mb-1">Bienvenido de vuelta</p>
          <h2 className="font-serif text-3xl font-bold">{cliente.nombre}</h2>
          <div className="h-px w-16 bg-[#C9A84C]/50 mt-3" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Visitas", value: String(cliente.total_visitas) },
            { label: "Puntos", value: String(puntos) },
            { label: "Nivel", value: nivel ?? "Estándar", color: nivelColor },
            {
              label: "Última visita",
              value: cliente.ultima_visita
                ? new Date(cliente.ultima_visita).toLocaleDateString("es-ES", { day: "numeric", month: "short" })
                : "—",
            },
          ].map((s) => (
            <div key={s.label} className="card-premium p-5 text-center">
              <p className="text-2xl font-bold mb-1" style={{ color: s.color ?? "#fff" }}>{s.value}</p>
              <p className="text-[#555] text-xs tracking-widest uppercase">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Membresía activa */}
        {membresia && (
          <div className="border border-[#C9A84C]/30 bg-[#C9A84C]/5 p-6 mb-10 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="section-label mb-1">Tu membresía activa</p>
              <p className="font-serif text-xl font-bold" style={{ color: nivelColor }}>
                La Orden · {nivel}
              </p>
              {descuento && (
                <p className="text-[#666] text-xs mt-1">{descuento}% de descuento en todos los servicios</p>
              )}
            </div>
            <Link href="/espacio-vip/membresia" className="btn-outline text-xs inline-flex">
              Gestionar →
            </Link>
          </div>
        )}

        {/* Últimas citas */}
        <div className="mb-10">
          <p className="section-label mb-5">Tus últimas citas</p>
          {citas.length === 0 ? (
            <div className="card-premium p-8 text-center">
              <p className="text-[#444] text-sm mb-4">Aún no tienes citas registradas.</p>
              <Link href="/reservas" className="inline-flex btn-gold text-sm">
                Reservar ahora →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {citas.map((cita) => (
                <div key={cita.id} className="card-premium p-5 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-white text-sm font-medium">{cita.servicios?.nombre ?? "Servicio"}</p>
                    <p className="text-[#555] text-xs mt-0.5">
                      {[cita.barberos?.nombre, cita.sedes?.nombre].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[#888] text-xs">
                      {new Date(cita.fecha_hora).toLocaleDateString("es-ES", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                    <span className={`text-xs px-2 py-0.5 mt-1 inline-block ${
                      cita.estado === "completada"
                        ? "text-green-400 bg-green-950/30"
                        : cita.estado === "cancelada"
                        ? "text-red-400 bg-red-950/30"
                        : "text-[#C9A84C] bg-[#C9A84C]/10"
                    }`}>
                      {cita.estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Acciones rápidas */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/reservas" className="inline-flex btn-gold justify-center">
            Nueva reserva →
          </Link>
          <Link href="/espacio-vip/membresia" className="inline-flex btn-outline justify-center">
            {membresia ? "Gestionar membresía" : "Activar La Orden ✦"}
          </Link>
        </div>
      </div>
    </section>
  );
}
