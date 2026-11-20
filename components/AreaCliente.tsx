import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import Link from "next/link";
import SellosVisuales from "@/components/vip/SellosVisuales";
import CitaCardCliente from "@/components/vip/CitaCardCliente";
import InstallPrompt from "@/components/vip/InstallPrompt";
import { Crown, Calendar, ChevronRight, Zap } from "lucide-react";

type CitaVip = {
  id: string;
  fecha_hora: string;
  estado: string;
  precio_final: number | null;
  barbero_id?: string | null;
  servicio_id?: string | null;
  sede_id?: string | null;
  reagendar_solicitado?: boolean;
  reagendar_motivo?: string;
  servicios: { nombre: string } | null;
  barberos: { nombre: string } | null;
  sedes: { nombre: string } | null;
};

type ClienteVip = {
  id: string;
  nombre: string;
  email: string | null;
  telefono: string | null;
  total_visitas: number;
  ultima_visita: string | null;
  sellos?: number;
  vip?: boolean;
  nivel?: string | null;
};

async function getDashboardData(userId: string) {
  const admin = createAdminClient();

  const { data: clienteRaw } = await (admin.from("clientes") as any)
    .select("*")
    .eq("auth_user_id", userId)
    .single();

  const cliente = clienteRaw as ClienteVip | null;
  if (!cliente) return { cliente: null, proximas: [], pasadas: [], membresia: null };

  const ahora = new Date().toISOString();

  const [proximasRes, pasadasRes, membresiaRes] = await Promise.all([
    (admin.from("citas") as any)
      .select("id, fecha_hora, estado, precio_final, reagendar_solicitado, reagendar_motivo, barbero_id, servicio_id, sede_id, servicios(nombre), barberos(nombre), sedes(nombre)")
      .eq("cliente_id", cliente.id)
      .gte("fecha_hora", ahora)
      .not("estado", "in", '("cancelada","completada")')
      .order("fecha_hora", { ascending: true })
      .limit(10),
    (admin.from("citas") as any)
      .select("id, fecha_hora, estado, precio_final, servicios(nombre), barberos(nombre), sedes(nombre)")
      .eq("cliente_id", cliente.id)
      .or(`fecha_hora.lt.${ahora},estado.in.(completada,cancelada)`)
      .order("fecha_hora", { ascending: false })
      .limit(5),
    (admin.from("membresias") as any)
      .select("id, planes_membresia(nombre, precio_mensual, descuento_servicios)")
      .eq("cliente_id", cliente.id)
      .eq("estado", "activa")
      .maybeSingle(),
  ]);

  return {
    cliente,
    proximas: (proximasRes.data ?? []) as CitaVip[],
    pasadas:  (pasadasRes.data  ?? []) as CitaVip[],
    membresia: membresiaRes.data ?? null,
  };
}

export default async function AreaCliente() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <AreaClientePublica />;

  const { cliente, proximas, pasadas, membresia } = await getDashboardData(user.id);

  const authName = (user.user_metadata?.full_name as string | undefined)
    || (user.user_metadata?.name as string | undefined)
    || undefined;

  if (!cliente) return <AreaClienteNuevo email={user.email!} nombre={authName} />;

  return <Dashboard
    cliente={cliente}
    proximas={proximas}
    pasadas={pasadas}
    membresia={membresia}
  />;
}

// ── Vista pública ─────────────────────────────────────────────────────────
const features = [
  { icon: "📅", title: "Reservas exprés",      desc: "Tus datos guardados, reserva en segundos." },
  { icon: "⭐", title: "Sellos de fidelidad",  desc: "8 sellos = 9.º corte gratis." },
  { icon: "👑", title: "Membresías VIP",        desc: "Descuentos exclusivos y prioridad de agenda." },
  { icon: "🎁", title: "Ofertas exclusivas",    desc: "Promociones solo para miembros." },
  { icon: "✂️", title: "Tendencias",           desc: "Contenido editorial sobre cortes y estilos." },
  { icon: "🔔", title: "Notificaciones",        desc: "Recordatorios de citas y novedades." },
];

function AreaClientePublica() {
  return (
    <section id="cuenta" className="py-16 sm:py-28 px-4 sm:px-6" style={{ background: "var(--vip-bg)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <p className="section-label mb-4">Tu espacio</p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold" style={{ color: "var(--vip-text)" }}>
            Área <span className="gold-text">cliente</span>
          </h2>
          <div className="divider-gold" />
          <p className="text-sm mt-4 max-w-md mx-auto" style={{ color: "var(--vip-muted)" }}>
            Crea tu cuenta y accede a una experiencia personalizada y exclusiva
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {features.map(f => (
            <div key={f.title} className="card-premium p-6">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-semibold mb-2" style={{ color: "var(--vip-text)" }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--vip-muted)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="border border-[#C9A84C]/20 bg-gradient-to-r from-transparent via-[#C9A84C]/5 to-transparent p-10 text-center">
          <h3 className="font-serif text-2xl font-bold mb-3" style={{ color: "var(--vip-text)" }}>
            Tu imagen merece una <span className="gold-text">experiencia premium</span>
          </h3>
          <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: "var(--vip-muted)" }}>
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

// ── Cliente sin perfil aún ────────────────────────────────────────────────
function AreaClienteNuevo({ email, nombre }: { email: string; nombre?: string }) {
  const displayName = nombre || email.split("@")[0];

  return (
    <section className="pt-6 pb-28 sm:pb-10 px-4 sm:px-6" style={{ background: "var(--vip-bg)" }}>
      <div className="max-w-lg mx-auto space-y-5">

        {/* Greeting — visible sin scroll */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1" style={{ background: "var(--vip-border)" }} />
            <span className="section-label text-[10px]">Espacio VIP · Members Only</span>
            <div className="h-px flex-1" style={{ background: "var(--vip-border)" }} />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold leading-tight" style={{ color: "var(--vip-text)" }}>
            Bienvenido,{" "}
            <span className="gold-text">{displayName}</span>
          </h1>
          <p className="text-sm mt-2" style={{ color: "var(--vip-muted)" }}>
            Tu acceso exclusivo al mundo Monastery.
          </p>
        </div>

        {/* CTAs — siempre visibles sin scroll */}
        <div className="flex flex-col gap-3">
          <Link href="/espacio-vip/reservar" className="btn-gold flex justify-center text-sm py-3.5">
            Reservar cita →
          </Link>
          <Link href="/espacio-vip/perfil" className="btn-outline flex justify-center text-sm py-3">
            Activar mi perfil VIP
          </Link>
        </div>

        {/* Features */}
        <div className="card-premium p-5">
          <p className="section-label mb-4">Qué incluye tu espacio</p>
          <div className="space-y-3">
            {[
              { icon: "📅", text: "Reservas exprés con tus datos guardados" },
              { icon: "⭐", text: "8 sellos = 9.º corte gratis" },
              { icon: "👑", text: "Membresías VIP con descuentos exclusivos" },
              { icon: "🎁", text: "Ofertas y promociones solo para miembros" },
            ].map(f => (
              <div key={f.icon} className="flex items-center gap-3">
                <span className="text-base shrink-0">{f.icon}</span>
                <p className="text-sm" style={{ color: "var(--vip-muted)" }}>{f.text}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

// ── Dashboard principal ───────────────────────────────────────────────────
function Dashboard({ cliente, proximas, pasadas, membresia }: {
  cliente: ClienteVip;
  proximas: CitaVip[];
  pasadas:  CitaVip[];
  membresia: any;
}) {
  const nivel     = (cliente.nivel as string | null | undefined) ?? membresia?.planes_membresia?.nombre ?? null;
  const sellos    = (cliente.sellos as number | undefined) ?? 0;
  const esVip     = (cliente.vip as boolean | undefined) ?? false;
  const descuento = membresia?.planes_membresia?.descuento_servicios;

  const nivelColor = nivel === "Black" ? "#888" : nivel === "Gold" ? "#C9A84C" : nivel === "Silver" ? "#aaa" : "#666";

  return (
    <section className="py-8 px-4 sm:px-6 min-h-screen vip-section" style={{ background: "var(--vip-bg)" }}>
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Install prompt — solo visible cuando no está instalado */}
        <InstallPrompt />

        {/* Saludo */}
        <div>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-px w-8" style={{ background: "var(--vip-border)" }} />
                <span className="section-label text-[10px]">Espacio VIP · Members Only</span>
              </div>
              <h2 className="font-serif text-3xl font-bold flex items-center gap-2" style={{ color: "var(--vip-text)" }}>
                Hola, {cliente.nombre.split(" ")[0]}
                {esVip && <Crown className="w-6 h-6 text-[#C9A84C]" />}
              </h2>
              <div className="h-px w-16 bg-[#C9A84C]/50 mt-2" />
            </div>
            <Link href="/espacio-vip/reservar" className="inline-flex btn-gold text-sm self-start shrink-0">
              + Nueva reserva
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total visitas",   value: String(cliente.total_visitas ?? 0) },
            { label: "Sellos",          value: `${sellos}/8` },
            { label: "Nivel",           value: nivel ?? "Estándar", color: nivelColor },
            {
              label: "Última visita",
              value: cliente.ultima_visita
                ? new Date(cliente.ultima_visita).toLocaleDateString("es-ES", { day: "numeric", month: "short" })
                : "—",
            },
          ].map(s => (
            <div key={s.label} className="card-premium p-5 text-center">
              <p className="text-2xl font-bold mb-1" style={{ color: s.color ?? "var(--vip-text)" }}>{s.value}</p>
              <p className="text-xs tracking-widest uppercase" style={{ color: "var(--vip-muted)" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Membresía activa */}
        {membresia && (
          <div className="border border-[#C9A84C]/30 bg-[#C9A84C]/5 p-5 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="section-label mb-0.5">Membresía activa</p>
              <p className="font-serif text-xl font-bold" style={{ color: nivelColor }}>
                La Orden · {nivel}
              </p>
              {descuento && (
                <p className="text-xs mt-0.5" style={{ color: "var(--vip-muted)" }}>{descuento}% de descuento en todos los servicios</p>
              )}
            </div>
            <Link href="/espacio-vip/beneficios" className="btn-outline text-xs inline-flex shrink-0">
              Ver beneficios →
            </Link>
          </div>
        )}

        {/* Tarjeta de sellos */}
        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="section-label">Mis sellos de fidelidad</p>
            <span className="text-xs" style={{ color: "var(--vip-dimmed)" }}>Solo tu barbero puede añadirlos</span>
          </div>
          <SellosVisuales sellos={sellos} />
        </div>

        {/* Próximas citas */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="section-label flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#C9A84C]" />
              Próximas citas
            </p>
            {proximas.length > 0 && (
              <Link href="/espacio-vip/citas" className="text-[#C9A84C] text-xs flex items-center gap-0.5 hover:underline">
                Ver todas <ChevronRight className="w-3 h-3" />
              </Link>
            )}
          </div>

          {proximas.length === 0 ? (
            <div className="card-premium p-8 text-center">
              <p className="text-sm mb-4" style={{ color: "var(--vip-muted)" }}>No tienes citas próximas.</p>
              <Link href="/espacio-vip/reservar" className="inline-flex btn-gold text-sm">
                Reservar ahora →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {proximas.slice(0, 3).map(cita => (
                <CitaCardCliente key={cita.id} cita={cita} />
              ))}
              {proximas.length > 3 && (
                <Link href="/espacio-vip/citas"
                  className="flex items-center justify-center gap-1.5 text-xs py-3 transition-colors"
                  style={{ border: "1px solid var(--vip-border)", color: "var(--vip-muted)" }}>
                  Ver {proximas.length - 3} citas más <ChevronRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Historial reciente */}
        {pasadas.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="section-label">Últimas visitas</p>
              <Link href="/espacio-vip/citas" className="text-[#C9A84C] text-xs flex items-center gap-0.5 hover:underline">
                Historial completo <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {pasadas.slice(0, 3).map(cita => (
                <CitaCardCliente key={cita.id} cita={cita} pasada />
              ))}
            </div>
          </div>
        )}

        {/* Accesos rápidos */}
        <div className="grid sm:grid-cols-3 gap-3">
          <Link href="/espacio-vip/beneficios"
            className="card-premium p-5 flex items-center gap-3 group hover:border-[#C9A84C]/30 transition-colors">
            <Zap className="w-5 h-5 text-[#C9A84C] shrink-0" />
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--vip-text)" }}>Ofertas VIP</p>
              <p className="text-xs" style={{ color: "var(--vip-muted)" }}>Descuentos exclusivos</p>
            </div>
            <ChevronRight className="w-4 h-4 ml-auto text-[#C9A84C] group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link href="/espacio-vip/perfil"
            className="card-premium p-5 flex items-center gap-3 group hover:border-[#C9A84C]/30 transition-colors">
            <span className="text-xl shrink-0">✦</span>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--vip-text)" }}>Mi perfil</p>
              <p className="text-xs" style={{ color: "var(--vip-muted)" }}>Editar mis datos</p>
            </div>
            <ChevronRight className="w-4 h-4 ml-auto text-[#C9A84C] group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link href="/espacio-vip/reservar" className="btn-gold flex items-center justify-center text-sm py-4">
            + Nueva reserva
          </Link>
        </div>

      </div>
    </section>
  );
}
