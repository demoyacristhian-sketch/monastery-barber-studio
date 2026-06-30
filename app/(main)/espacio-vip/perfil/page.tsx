"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase-browser";
import { actualizarPerfilCliente } from "@/app/actions/cliente";
import { User, Mail, Phone, Calendar, Save } from "lucide-react";
import Link from "next/link";

export default function PerfilPage() {
  const [cliente, setCliente] = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const [nombre,   setNombre]   = useState("");
  const [telefono, setTelefono] = useState("");
  const [fnac,     setFnac]     = useState("");

  useEffect(() => {
    async function fetchPerfil() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await (supabase.from("clientes") as any)
        .select("*")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (data) {
        setCliente({ ...data, email: user.email });
        setNombre(data.nombre ?? "");
        setTelefono(data.telefono ?? "");
        setFnac(data.fecha_nacimiento ?? "");
      }
      setLoading(false);
    }
    fetchPerfil();
  }, []);

  function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await actualizarPerfilCliente({ nombre, telefono, fecha_nacimiento: fnac });
      setFeedback({ ok: res.ok, msg: res.ok ? "Perfil actualizado" : (res.error ?? "Error") });
      setTimeout(() => setFeedback(null), 3000);
    });
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-[#444] text-sm">Cargando...</p>
      </main>
    );
  }

  if (!cliente) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#444] text-sm mb-4">Perfil no encontrado.</p>
          <Link href="/reservas" className="btn-gold inline-flex text-sm">Reservar primera cita →</Link>
        </div>
      </main>
    );
  }

  const nivel = cliente.nivel;
  const nivelColor = nivel === "Black" ? "#888" : nivel === "Gold" ? "#C9A84C" : nivel === "Silver" ? "#aaa" : "#555";

  return (
    <main className="min-h-screen bg-black py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <p className="section-label mb-1">Tu cuenta</p>
          <h1 className="font-serif text-3xl font-bold">Mi perfil</h1>
          <div className="h-px w-12 bg-[#C9A84C]/50 mt-3" />
        </div>

        {/* Avatar + nivel */}
        <div className="card-premium p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-[#1a1a1a] border border-[#222] flex items-center justify-center text-xl font-bold text-[#C9A84C] shrink-0">
            {cliente.nombre?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <p className="text-white font-semibold text-lg">{cliente.nombre}</p>
            <p className="text-[#444] text-xs">{cliente.email}</p>
            {nivel && (
              <span className="text-xs mt-1.5 inline-block px-2 py-0.5 border" style={{ color: nivelColor, borderColor: nivelColor + "40" }}>
                Miembro {nivel}
              </span>
            )}
            {cliente.vip && (
              <span className="text-xs mt-1.5 ml-1.5 inline-block px-2 py-0.5 border border-[#C9A84C]/40 text-[#C9A84C]">
                👑 VIP
              </span>
            )}
          </div>
        </div>

        {/* Formulario edición */}
        <div className="card-premium p-6">
          <p className="section-label mb-5">Editar datos</p>
          <form onSubmit={handleGuardar} className="space-y-5">

            <div>
              <label className="flex items-center gap-1.5 text-[#666] text-xs uppercase tracking-wider mb-1.5">
                <User className="w-3.5 h-3.5" /> Nombre
              </label>
              <input
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                required
                className="w-full bg-[#0a0a0a] border border-[#222] text-white px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]/40 placeholder:text-[#333]"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-[#666] text-xs uppercase tracking-wider mb-1.5">
                <Mail className="w-3.5 h-3.5" /> Email
              </label>
              <input
                type="email"
                value={cliente.email ?? ""}
                disabled
                className="w-full bg-[#050505] border border-[#111] text-[#444] px-3 py-2.5 text-sm cursor-not-allowed"
              />
              <p className="text-[#333] text-xs mt-1">El email no se puede cambiar</p>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-[#666] text-xs uppercase tracking-wider mb-1.5">
                <Phone className="w-3.5 h-3.5" /> Teléfono
              </label>
              <input
                type="tel"
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
                placeholder="612 345 678"
                className="w-full bg-[#0a0a0a] border border-[#222] text-white px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]/40 placeholder:text-[#333]"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-[#666] text-xs uppercase tracking-wider mb-1.5">
                <Calendar className="w-3.5 h-3.5" /> Fecha de nacimiento
              </label>
              <input
                type="date"
                value={fnac}
                onChange={e => setFnac(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#222] text-white px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]/40"
              />
              <p className="text-[#333] text-xs mt-1">Para tu regalo de cumpleaños</p>
            </div>

            {feedback && (
              <p className={`text-xs px-3 py-2 border ${feedback.ok ? "text-emerald-400 border-emerald-900/40 bg-emerald-950/20" : "text-red-400 border-red-900/40 bg-red-950/20"}`}>
                {feedback.msg}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="btn-gold inline-flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {pending ? "Guardando..." : "Guardar cambios"}
            </button>
          </form>
        </div>

        {/* Info solo lectura */}
        <div className="card-premium p-6 space-y-4">
          <p className="section-label">Estadísticas</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{cliente.total_visitas ?? 0}</p>
              <p className="text-[#444] text-xs mt-1">Visitas totales</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: nivelColor }}>{(cliente.sellos ?? 0)}/10</p>
              <p className="text-[#444] text-xs mt-1">Sellos actuales</p>
            </div>
          </div>
          <p className="text-[#333] text-xs text-center pt-2">
            Miembro desde {new Date(cliente.created_at).toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
          </p>
        </div>

      </div>
    </main>
  );
}
