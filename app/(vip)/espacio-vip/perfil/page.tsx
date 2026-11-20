"use client";

import { useEffect, useState, useTransition } from "react";
import { actualizarPerfilCliente, crearPerfil, fetchMiPerfil } from "@/app/actions/cliente";
import { User, Mail, Phone, Calendar, Save, Plus } from "lucide-react";
import Link from "next/link";

export default function PerfilPage() {
  const [cliente, setCliente]   = useState<any>(null);
  const [email, setEmail]       = useState<string>("");
  const [loading, setLoading]   = useState(true);
  const [modo, setModo]         = useState<"ver" | "crear">("ver");
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const [nombre,   setNombre]   = useState("");
  const [telefono, setTelefono] = useState("");
  const [fnac,     setFnac]     = useState("");

  useEffect(() => {
    fetchMiPerfil().then(res => {
      if (res.cliente) {
        setCliente({ ...res.cliente, email: res.user?.email ?? res.cliente.email });
        setNombre(res.cliente.nombre ?? "");
        setTelefono(res.cliente.telefono ?? "");
        setFnac(res.cliente.fecha_nacimiento ?? "");
        setModo("ver");
      } else {
        setEmail(res.user?.email ?? "");
        setModo("crear");
      }
      setLoading(false);
    });
  }, []);

  function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await actualizarPerfilCliente({ nombre, telefono, fecha_nacimiento: fnac });
      setFeedback({ ok: res.ok, msg: res.ok ? "Perfil actualizado" : (res.error ?? "Error") });
      if (res.ok) setCliente((c: any) => ({ ...c, nombre, telefono, fecha_nacimiento: fnac }));
      setTimeout(() => setFeedback(null), 3000);
    });
  }

  function handleCrear(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await crearPerfil({ nombre, telefono, fecha_nacimiento: fnac });
      if (res.ok) {
        setFeedback({ ok: true, msg: "Perfil creado correctamente" });
        // Recargar el perfil recién creado
        const updated = await fetchMiPerfil();
        if (updated.cliente) {
          setCliente({ ...updated.cliente, email: updated.user?.email ?? email });
          setModo("ver");
        }
      } else {
        setFeedback({ ok: false, msg: res.error ?? "Error al crear perfil" });
      }
      setTimeout(() => setFeedback(null), 4000);
    });
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center pb-20 sm:pb-0" style={{ background: "var(--vip-bg)" }}>
        <p className="text-sm" style={{ color: "var(--vip-muted)" }}>Cargando...</p>
      </main>
    );
  }

  // ── Estado "crear perfil" ──────────────────────────────────────────────
  if (modo === "crear") {
    return (
      <main className="min-h-screen pt-6 pb-24 sm:py-10 px-4 sm:px-6" style={{ background: "var(--vip-bg)" }}>
        <div className="max-w-2xl mx-auto space-y-8">

          <div>
            <p className="section-label mb-1">Tu cuenta</p>
            <h1 className="font-serif text-3xl font-bold" style={{ color: "var(--vip-text)" }}>Crear perfil</h1>
            <div className="h-px w-12 bg-[#C9A84C]/50 mt-3" />
          </div>

          <div className="card-premium p-6">
            <div className="flex items-center gap-3 mb-6">
              <Plus className="w-5 h-5 text-[#C9A84C]" />
              <p className="section-label">Completa tus datos para activar el Espacio VIP</p>
            </div>
            <form onSubmit={handleCrear} className="space-y-5">

              <div>
                <label className="flex items-center gap-1.5 text-xs uppercase tracking-wider mb-1.5" style={{ color: "var(--vip-muted)" }}>
                  <User className="w-3.5 h-3.5" /> Nombre *
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  required
                  placeholder="Tu nombre completo"
                  className="w-full px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]/40"
                  style={{ background: "var(--vip-bg-card)", border: "1px solid var(--vip-border)", color: "var(--vip-text)" }}
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs uppercase tracking-wider mb-1.5" style={{ color: "var(--vip-muted)" }}>
                  <Mail className="w-3.5 h-3.5" /> Email
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-3 py-2.5 text-sm cursor-not-allowed"
                  style={{ background: "var(--vip-bg)", border: "1px solid var(--vip-border)", color: "var(--vip-muted)" }}
                />
                <p className="text-xs mt-1" style={{ color: "var(--vip-muted)" }}>El email no se puede cambiar</p>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs uppercase tracking-wider mb-1.5" style={{ color: "var(--vip-muted)" }}>
                  <Phone className="w-3.5 h-3.5" /> Teléfono
                </label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={e => setTelefono(e.target.value)}
                  placeholder="612 345 678"
                  className="w-full px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]/40"
                  style={{ background: "var(--vip-bg-card)", border: "1px solid var(--vip-border)", color: "var(--vip-text)" }}
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs uppercase tracking-wider mb-1.5" style={{ color: "var(--vip-muted)" }}>
                  <Calendar className="w-3.5 h-3.5" /> Fecha de nacimiento
                </label>
                <input
                  type="date"
                  value={fnac}
                  onChange={e => setFnac(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]/40"
                  style={{ background: "var(--vip-bg-card)", border: "1px solid var(--vip-border)", color: "var(--vip-text)" }}
                />
                <p className="text-xs mt-1" style={{ color: "var(--vip-muted)" }}>Para tu regalo de cumpleaños</p>
              </div>

              {feedback && (
                <p className={`text-xs px-3 py-2 border ${feedback.ok ? "text-emerald-400 border-emerald-900/40 bg-emerald-950/20" : "text-red-400 border-red-900/40 bg-red-950/20"}`}>
                  {feedback.msg}
                </p>
              )}

              <button
                type="submit"
                disabled={pending || !nombre.trim()}
                className="btn-gold inline-flex items-center gap-2 disabled:opacity-50 w-full justify-center"
              >
                <Plus className="w-4 h-4" />
                {pending ? "Creando perfil..." : "Activar mi perfil VIP"}
              </button>
            </form>
          </div>

        </div>
      </main>
    );
  }

  // ── Estado "editar perfil" ─────────────────────────────────────────────
  const nivel = cliente.nivel;
  const nivelColor = nivel === "Black" ? "#888" : nivel === "Gold" ? "#C9A84C" : nivel === "Silver" ? "#aaa" : "#555";

  return (
    <main className="min-h-screen pt-6 pb-24 sm:py-10 px-4 sm:px-6" style={{ background: "var(--vip-bg)" }}>
      <div className="max-w-2xl mx-auto space-y-8">

        <div>
          <p className="section-label mb-1">Tu cuenta</p>
          <h1 className="font-serif text-3xl font-bold" style={{ color: "var(--vip-text)" }}>Mi perfil</h1>
          <div className="h-px w-12 bg-[#C9A84C]/50 mt-3" />
        </div>

        {/* Avatar + nivel */}
        <div className="card-premium p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-[#C9A84C] shrink-0" style={{ background: "var(--vip-bg-sec)", border: "1px solid var(--vip-border)" }}>
            {cliente.nombre?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <p className="font-semibold text-lg" style={{ color: "var(--vip-text)" }}>{cliente.nombre}</p>
            <p className="text-xs" style={{ color: "var(--vip-muted)" }}>{cliente.email}</p>
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
              <label className="flex items-center gap-1.5 text-xs uppercase tracking-wider mb-1.5" style={{ color: "var(--vip-muted)" }}>
                <User className="w-3.5 h-3.5" /> Nombre
              </label>
              <input
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                required
                className="w-full px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]/40"
                style={{ background: "var(--vip-bg-card)", border: "1px solid var(--vip-border)", color: "var(--vip-text)" }}
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs uppercase tracking-wider mb-1.5" style={{ color: "var(--vip-muted)" }}>
                <Mail className="w-3.5 h-3.5" /> Email
              </label>
              <input
                type="email"
                value={cliente.email ?? ""}
                disabled
                className="w-full px-3 py-2.5 text-sm cursor-not-allowed"
                style={{ background: "var(--vip-bg)", border: "1px solid var(--vip-border)", color: "var(--vip-muted)" }}
              />
              <p className="text-xs mt-1" style={{ color: "var(--vip-muted)" }}>El email no se puede cambiar</p>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs uppercase tracking-wider mb-1.5" style={{ color: "var(--vip-muted)" }}>
                <Phone className="w-3.5 h-3.5" /> Teléfono
              </label>
              <input
                type="tel"
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
                placeholder="612 345 678"
                className="w-full px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]/40"
                style={{ background: "var(--vip-bg-card)", border: "1px solid var(--vip-border)", color: "var(--vip-text)" }}
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs uppercase tracking-wider mb-1.5" style={{ color: "var(--vip-muted)" }}>
                <Calendar className="w-3.5 h-3.5" /> Fecha de nacimiento
              </label>
              <input
                type="date"
                value={fnac}
                onChange={e => setFnac(e.target.value)}
                className="w-full px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]/40"
                style={{ background: "var(--vip-bg-card)", border: "1px solid var(--vip-border)", color: "var(--vip-text)" }}
              />
              <p className="text-xs mt-1" style={{ color: "var(--vip-muted)" }}>Para tu regalo de cumpleaños</p>
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
              <p className="text-2xl font-bold" style={{ color: "var(--vip-text)" }}>{cliente.total_visitas ?? 0}</p>
              <p className="text-xs mt-1" style={{ color: "var(--vip-muted)" }}>Visitas totales</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: nivelColor }}>{(cliente.sellos ?? 0)}/10</p>
              <p className="text-xs mt-1" style={{ color: "var(--vip-muted)" }}>Sellos actuales</p>
            </div>
          </div>
          <p className="text-xs text-center pt-2" style={{ color: "var(--vip-muted)" }}>
            Miembro desde {new Date(cliente.created_at).toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
          </p>
        </div>

      </div>
    </main>
  );
}
