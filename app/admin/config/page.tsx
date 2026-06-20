import { createAdminClient } from "@/lib/supabase-admin";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Configuración | Admin Monastery" };
export const revalidate = 300;

async function getConfig() {
  const admin = createAdminClient();
  const [
    { data: sedes },
    { data: barberos },
    { data: servicios },
  ] = await Promise.all([
    admin.from("sedes").select("id, nombre, direccion, activa").order("nombre"),
    admin.from("barberos").select("id, nombre, email, activo, sede_id").order("nombre"),
    admin.from("servicios").select("id, nombre, precio, duracion_min, categoria, activo").order("categoria").order("nombre"),
  ]);

  return {
    sedes:    sedes    ?? [],
    barberos: barberos ?? [],
    servicios: servicios ?? [],
  };
}

const ESTADO = ({ activo }: { activo: boolean }) => (
  <span className={`text-[10px] px-2 py-0.5 ${activo ? "text-green-400 bg-green-950/30" : "text-[#333] bg-[#111]"}`}>
    {activo ? "activo" : "inactivo"}
  </span>
);

export default async function ConfigPage() {
  const { sedes, barberos, servicios } = await getConfig();

  const serviciosPorCategoria = (servicios as any[]).reduce(
    (acc: Record<string, any[]>, s) => {
      const cat = s.categoria ?? "Sin categoría";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(s);
      return acc;
    },
    {}
  );

  return (
    <div className="p-8 space-y-10">
      <div>
        <h1 className="font-serif text-2xl font-bold text-white">Configuración</h1>
        <p className="text-[#444] text-sm mt-1">Gestión de sedes, equipo y catálogo de servicios</p>
      </div>

      {/* Sedes */}
      <section>
        <h2 className="text-sm font-semibold text-white mb-4 uppercase tracking-widest">Sedes</h2>
        <div className="border border-[#111] divide-y divide-[#0f0f0f]">
          {sedes.map((sede: any) => (
            <div key={sede.id} className="px-5 py-4 flex items-center justify-between bg-[#0a0a0a]">
              <div>
                <p className="text-white text-sm font-medium">{sede.nombre}</p>
                <p className="text-[#444] text-xs mt-0.5">{sede.direccion}</p>
              </div>
              <ESTADO activo={sede.activa} />
            </div>
          ))}
        </div>
      </section>

      {/* Barberos */}
      <section>
        <h2 className="text-sm font-semibold text-white mb-4 uppercase tracking-widest">Equipo</h2>
        <div className="border border-[#111] divide-y divide-[#0f0f0f]">
          {barberos.map((b: any) => {
            const sede = (sedes as any[]).find((s) => s.id === b.sede_id);
            return (
              <div key={b.id} className="px-5 py-4 flex items-center justify-between bg-[#0a0a0a]">
                <div>
                  <p className="text-white text-sm font-medium">{b.nombre}</p>
                  <p className="text-[#444] text-xs mt-0.5">{b.email} {sede ? `· ${sede.nombre}` : ""}</p>
                </div>
                <ESTADO activo={b.activo} />
              </div>
            );
          })}
        </div>
      </section>

      {/* Servicios */}
      <section>
        <h2 className="text-sm font-semibold text-white mb-4 uppercase tracking-widest">Servicios</h2>
        <div className="space-y-6">
          {Object.entries(serviciosPorCategoria).map(([cat, svcs]) => (
            <div key={cat}>
              <p className="text-[#C9A84C] text-xs uppercase tracking-widest mb-2">{cat}</p>
              <div className="border border-[#111] divide-y divide-[#0f0f0f]">
                {(svcs as any[]).map((s) => (
                  <div key={s.id} className="px-5 py-3 flex items-center justify-between bg-[#0a0a0a]">
                    <p className="text-white text-sm">{s.nombre}</p>
                    <div className="flex items-center gap-4">
                      <p className="text-[#555] text-xs">{s.duracion_min} min</p>
                      <p className="text-[#888] text-xs font-medium">{s.precio}€</p>
                      <ESTADO activo={s.activo} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
