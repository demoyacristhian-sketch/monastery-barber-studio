import { createAdminClient } from "@/lib/supabase-admin";
import { Crown, Star, Gift, TrendingUp, Users, ChevronRight, Settings } from "lucide-react";
import type { Metadata } from "next";
import BackButton from "@/components/admin/BackButton";

export const metadata: Metadata = { title: "Fidelización | Admin Monastery" };
export const dynamic = "force-dynamic";

const PLANES = [
  {
    id: "silver", nombre: "Silver", precio: 29, cortes: 2,
    iconColor: "text-zinc-500", bgCard: "bg-white", borderCard: "border-zinc-200",
    priceColor: "text-zinc-700",
  },
  {
    id: "gold", nombre: "Gold", precio: 49, cortes: 4,
    iconColor: "text-amber-500", bgCard: "bg-amber-50", borderCard: "border-amber-200",
    priceColor: "text-amber-600",
  },
  {
    id: "black", nombre: "Black", precio: 79, cortes: 8,
    iconColor: "text-[#C9A84C]", bgCard: "bg-white", borderCard: "border-[#C9A84C]/30",
    priceColor: "text-[#C9A84C]",
  },
] as const;

function euros(n: number) {
  return n.toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
}

export default async function FidelizacionPage() {
  const admin = createAdminClient();

  const { data: clientes } = await (admin.from("clientes") as any)
    .select("id, nombre, sellos, vip, nivel")
    .order("sellos", { ascending: false })
    .limit(200);

  const lista = (clientes ?? []) as {
    id: string; nombre: string; sellos: number; vip: boolean; nivel: string | null;
  }[];

  // Stats membresías
  const miembrosSilver = lista.filter(c => c.nivel === "silver").length;
  const miembrosGold   = lista.filter(c => c.nivel === "gold").length;
  const miembrosBlack  = lista.filter(c => c.nivel === "black").length;
  const totalMembresias = miembrosSilver + miembrosGold + miembrosBlack;

  // Tarjetas activas (con al menos 1 sello)
  const tarjetasActivas = lista.filter(c => (c.sellos ?? 0) > 0).length;

  // Cortes gratis canjeados (=clientes VIP, se marca al canjear)
  const cortesCanjeados = lista.filter(c => c.vip === true).length;

  // MRR
  const mrr = miembrosSilver * 29 + miembrosGold * 49 + miembrosBlack * 79;

  // Top 5 para el panel de tarjetas
  const topClientes = lista.slice(0, 5);

  return (
    <div className="p-6 space-y-6">

      {/* ── Cabecera ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <BackButton />
          <h1 className="text-2xl font-bold text-zinc-900">Fidelización</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Puntos, membresías y recompensas para tus clientes</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#C9A84C] hover:bg-[#B8964A] transition-colors flex-shrink-0">
          <Settings className="w-4 h-4" /> Configurar programa
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<Crown className="w-5 h-5 text-amber-500" />}
          bg="bg-amber-50"
          value={String(totalMembresias)}
          label="Membresías activas"
          sub="Silver · Gold · Black"
        />
        <KpiCard
          icon={<Star className="w-5 h-5 text-[#C9A84C]" />}
          bg="bg-[#C9A84C]/5"
          value={String(tarjetasActivas)}
          label="Tarjetas de sellos"
          sub="En programa de puntos"
        />
        <KpiCard
          icon={<Gift className="w-5 h-5 text-emerald-500" />}
          bg="bg-emerald-50"
          value={String(cortesCanjeados)}
          label="Cortes gratis canjeados"
          sub="Total histórico"
        />
        <KpiCard
          icon={<TrendingUp className="w-5 h-5 text-blue-500" />}
          bg="bg-blue-50"
          value={`${euros(mrr)}`}
          label="MRR membresías"
          sub="Ingresos fijos/mes"
        />
      </div>

      {/* ── Cuerpo en dos columnas ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Planes de membresía */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-3">
          <h2 className="font-semibold text-zinc-900 text-base">Planes de membresía</h2>
          {PLANES.map(p => {
            const miembros = p.id === "silver" ? miembrosSilver
              : p.id === "gold" ? miembrosGold
              : miembrosBlack;
            return (
              <div key={p.id}
                className={`rounded-xl border ${p.borderCard} ${p.bgCard} px-4 py-3.5 flex items-center justify-between gap-3`}>
                <div className="flex items-center gap-3">
                  <Crown className={`w-5 h-5 ${p.iconColor}`} />
                  <div>
                    <p className={`font-semibold text-sm ${p.iconColor}`}>{p.nombre}</p>
                    <p className="text-xs text-zinc-400">{p.cortes} cortes incluidos/mes</p>
                    <p className="text-xs text-zinc-400">
                      <Users className="w-3 h-3 inline-block mr-1 mb-0.5" />
                      {miembros} miembro{miembros !== 1 ? "s" : ""} activo{miembros !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <p className={`text-sm font-bold whitespace-nowrap ${p.priceColor}`}>
                  {p.precio} €/mes
                </p>
              </div>
            );
          })}
        </div>

        {/* Tarjetas de sellos */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-zinc-900 text-base">Tarjetas de sellos</h2>
            <a href="/admin/clientes" className="flex items-center gap-0.5 text-xs text-[#C9A84C] hover:text-[#B8964A] font-medium">
              Ver todos <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {lista.length === 0 ? (
            <div className="py-10 text-center text-sm text-zinc-400">Sin clientes aún</div>
          ) : (
            <div className="space-y-4">
              {topClientes.map(c => {
                const sellos = Math.min(c.sellos ?? 0, 10);
                const canCanjear = (c.sellos ?? 0) >= 10;
                const iniciales = c.nombre.split(" ").map((p: string) => p[0]).join("").slice(0, 2).toUpperCase();
                return (
                  <div key={c.id} className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-zinc-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-zinc-600">{iniciales}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Nombre + badge */}
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-medium text-zinc-900 truncate">{c.nombre}</span>
                        {canCanjear && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-100 text-orange-700">
                            🎁 Corte gratis
                          </span>
                        )}
                        {c.vip && !canCanjear && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700">
                            👑 VIP
                          </span>
                        )}
                      </div>

                      {/* Sellos */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 10 }, (_, i) => (
                          <div key={i}
                            className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                              i < sellos
                                ? "bg-zinc-900"
                                : "bg-zinc-200"
                            }`}>
                            {i < sellos && <Star className="w-2.5 h-2.5 fill-[#C9A84C] text-[#C9A84C]" />}
                          </div>
                        ))}
                      </div>

                      <p className="text-[11px] text-zinc-400 mt-0.5">{sellos}/10 sellos</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Clientes en riesgo (sin sellos en 60+ días, si aplica) ── */}
      <ClientesEnRiesgoSection clientes={lista} />
    </div>
  );
}

function KpiCard({ icon, bg, value, label, sub }: {
  icon: React.ReactNode; bg: string; value: string; label: string; sub: string;
}) {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl px-5 py-4">
      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-zinc-900">{value}</p>
      <p className="text-sm text-zinc-600 mt-0.5">{label}</p>
      <p className="text-xs text-zinc-400 mt-0.5">{sub}</p>
    </div>
  );
}

function ClientesEnRiesgoSection({ clientes }: {
  clientes: { id: string; nombre: string; sellos: number; vip: boolean; nivel: string | null }[];
}) {
  // Sin fecha de última visita en los datos — mostramos clientes sin sellos como "inactivos"
  const sinActividad = clientes.filter(c => (c.sellos ?? 0) === 0 && !c.vip);
  if (sinActividad.length === 0) return null;

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-100 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <h2 className="font-semibold text-zinc-900">Clientes sin actividad</h2>
        <span className="text-xs text-zinc-400">({sinActividad.length} sin sellos)</span>
      </div>
      <div className="divide-y divide-zinc-50">
        {sinActividad.slice(0, 8).map(c => {
          const iniciales = c.nombre.split(" ").map((p: string) => p[0]).join("").slice(0, 2).toUpperCase();
          return (
            <div key={c.id} className="px-6 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-zinc-500">{iniciales}</span>
                </div>
                <p className="text-sm font-medium text-zinc-900">{c.nombre}</p>
              </div>
              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full ring-1 ring-amber-200">
                Sin sellos
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
