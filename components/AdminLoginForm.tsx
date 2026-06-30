"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { Lock, Loader2, AlertCircle } from "lucide-react";

export default function AdminLoginForm() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const router  = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError("Credenciales incorrectas o cuenta no autorizada.");
      setLoading(false);
      return;
    }

    // Verificar que el usuario tiene rol staff
    const role = data.user?.app_metadata?.role;
    if (role !== "staff") {
      await supabase.auth.signOut();
      setError("Tu cuenta no tiene acceso al panel de administración.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo + título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="bg-zinc-900 px-6 py-4 rounded-2xl">
              <Image
                src="/images/logo.svg"
                alt="Monastery Barber Studio"
                width={160}
                height={28}
                className="h-8 w-auto"
                priority
              />
            </div>
          </div>
          <h1 className="text-xl font-bold text-zinc-900">Panel de administración</h1>
          <p className="text-sm text-zinc-400 mt-1">Acceso restringido al personal autorizado</p>
        </div>

        {/* Formulario */}
        <div className="bg-white border border-zinc-100 rounded-2xl p-7 shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                placeholder="admin@monastery.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 rounded-xl bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 transition-all"
                style={{ WebkitBoxShadow: "0 0 0px 1000px #ffffff inset", WebkitTextFillColor: "#18181b" }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide">
                Contraseña
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 rounded-xl bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 transition-all"
                style={{ WebkitBoxShadow: "0 0 0px 1000px #ffffff inset", WebkitTextFillColor: "#18181b" }}
              />
            </div>

            {error && (
              <div className="flex items-start gap-2.5 px-3.5 py-3 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-600 text-xs leading-relaxed">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-700 text-white font-medium text-sm py-2.5 rounded-xl transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Verificando...</>
              ) : (
                <><Lock className="w-4 h-4" /> Acceder al panel</>
              )}
            </button>
          </form>
        </div>

        {/* Aviso */}
        <p className="text-center text-[11px] text-zinc-400 mt-5 leading-relaxed">
          Este acceso es exclusivo para administradores de Monastery Barber Studio.<br />
          Si eres cliente, accede al{" "}
          <a href="/espacio-vip" className="text-zinc-500 hover:text-zinc-700 underline underline-offset-2">
            Espacio VIP
          </a>.
        </p>
      </div>
    </div>
  );
}
