"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Cliente = {
  id: string;
  nombre: string;
  email: string | null;
  telefono: string | null;
  notas: string | null;
  created_at: string;
  activo: boolean;
};

type ConteosCitas = Record<string, { total: number; completadas: number }>;

export default function ClientesAdmin({
  clientes,
  conteosCitas,
  busqueda,
}: {
  clientes: Cliente[];
  conteosCitas: ConteosCitas;
  busqueda?: string;
}) {
  const router  = useRouter();
  const [q, setQ] = useState(busqueda ?? "");
  const [detalle, setDetalle] = useState<string | null>(null);

  function buscar(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    router.push(`/admin/clientes?${params.toString()}`);
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-white">Clientes</h1>
        <p className="text-[#444] text-sm mt-1">{clientes.length} clientes</p>
      </div>

      {/* Búsqueda */}
      <form onSubmit={buscar} className="flex gap-3 mb-6">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre, email o teléfono..."
          className="flex-1 bg-[var(--admin-surface)] border border-[var(--admin-border)] text-white text-sm px-4 py-2.5 placeholder-[#333] focus:outline-none focus:border-[#C9A84C]"
        />
        <button
          type="submit"
          className="px-5 py-2.5 bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] text-sm hover:bg-[#C9A84C]/20 transition-colors"
        >
          Buscar
        </button>
        {busqueda && (
          <button
            type="button"
            onClick={() => { setQ(""); router.push("/admin/clientes"); }}
            className="px-4 py-2.5 border border-[var(--admin-border)] text-[#444] text-sm hover:text-[#999]"
          >
            ×
          </button>
        )}
      </form>

      {/* Lista */}
      <div className="border border-[var(--admin-border)] divide-y divide-[var(--admin-border)]">
        {clientes.length === 0 ? (
          <p className="px-6 py-10 text-[#444] text-sm text-center">
            {busqueda ? `Sin resultados para "${busqueda}"` : "No hay clientes aún."}
          </p>
        ) : (
          clientes.map((c) => {
            const stats    = conteosCitas[c.id];
            const esDetalle = detalle === c.id;

            return (
              <div key={c.id} className="bg-[var(--admin-surface)]">
                <div
                  className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap cursor-pointer hover:bg-[var(--admin-border)] transition-colors"
                  onClick={() => setDetalle(esDetalle ? null : c.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <p className="text-white text-sm font-medium">{c.nombre}</p>
                      {!c.activo && (
                        <span className="text-[10px] px-2 py-0.5 text-[#333] bg-[#111]">inactivo</span>
                      )}
                    </div>
                    <p className="text-[#444] text-xs mt-0.5">{c.email}{c.telefono ? ` · ${c.telefono}` : ""}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {stats ? (
                      <>
                        <p className="text-[#888] text-xs">{stats.total} cita{stats.total !== 1 ? "s" : ""}</p>
                        <p className="text-[#444] text-xs mt-0.5">{stats.completadas} completadas</p>
                      </>
                    ) : (
                      <p className="text-[#333] text-xs">Sin citas</p>
                    )}
                    <p className="text-[#333] text-[10px] mt-1">
                      Desde {new Date(c.created_at).toLocaleDateString("es-ES", { month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>

                {esDetalle && (
                  <div className="px-6 pb-5 border-t border-[var(--admin-border)] pt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-[#333] uppercase tracking-widest mb-1">Email</p>
                        <p className="text-[#777]">{c.email}</p>
                      </div>
                      <div>
                        <p className="text-[#333] uppercase tracking-widest mb-1">Teléfono</p>
                        <p className="text-[#777]">{c.telefono ?? "—"}</p>
                      </div>
                    </div>
                    {c.notas && (
                      <div>
                        <p className="text-[#333] text-xs uppercase tracking-widest mb-1">Notas</p>
                        <p className="text-[#777] text-sm">{c.notas}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[#333] text-[10px] uppercase tracking-widest mb-1">ID</p>
                      <p className="text-[#222] text-xs font-mono">{c.id}</p>
                    </div>
                    <a
                      href={`/admin/citas?cliente=${c.id}`}
                      className="inline-block text-xs text-[#C9A84C] hover:underline mt-1"
                    >
                      Ver citas →
                    </a>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
