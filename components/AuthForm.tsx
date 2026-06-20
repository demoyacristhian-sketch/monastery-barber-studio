"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

type Mode = "login" | "register";

export default function AuthForm() {
  const [mode, setMode] = useState<Mode>("login");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (mode === "register") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { nombre },
          emailRedirectTo: `${location.origin}/auth/callback?next=/espacio-vip`,
        },
      });

      if (signUpError) {
        setError(traducirError(signUpError.message));
      } else if (data.user?.identities?.length === 0) {
        setError("Este email ya está registrado. Inicia sesión.");
      } else {
        setSuccess("Revisa tu email y confirma tu cuenta para continuar.");
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        setError(traducirError(signInError.message));
      } else {
        router.push("/espacio-vip");
        router.refresh();
      }
    }

    setLoading(false);
  }

  function traducirError(msg: string): string {
    if (msg.includes("Invalid login credentials")) return "Email o contraseña incorrectos.";
    if (msg.includes("Email not confirmed")) return "Confirma tu email antes de iniciar sesión.";
    if (msg.includes("Password should be")) return "La contraseña debe tener al menos 6 caracteres.";
    if (msg.includes("rate limit")) return "Demasiados intentos. Espera unos minutos.";
    return "Ha ocurrido un error. Inténtalo de nuevo.";
  }

  return (
    <div className="border border-[#1a1a1a] bg-[#050505] p-8">
      {/* Tabs */}
      <div className="flex mb-8 border-b border-[#1a1a1a]">
        {(["login", "register"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setError(null); setSuccess(null); }}
            className={`flex-1 pb-3 text-xs tracking-widest uppercase transition-colors ${
              mode === m
                ? "text-[#C9A84C] border-b border-[#C9A84C] -mb-px"
                : "text-[#444] hover:text-[#888]"
            }`}
          >
            {m === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {mode === "register" && (
          <div>
            <label>Nombre</label>
            <input
              type="text"
              placeholder="Tu nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
        )}

        <div>
          <label>Email</label>
          <input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Contraseña</label>
          <input
            type="password"
            placeholder={mode === "register" ? "Mínimo 6 caracteres" : "••••••••"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <p className="text-red-400 text-xs border border-red-900/40 bg-red-950/20 px-3 py-2">
            {error}
          </p>
        )}

        {success && (
          <p className="text-[#C9A84C] text-xs border border-[#C9A84C]/30 bg-[#C9A84C]/5 px-3 py-2">
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-gold inline-flex justify-center mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? "Procesando..."
            : mode === "login"
            ? "Entrar al Espacio VIP →"
            : "Crear mi cuenta →"}
        </button>
      </form>

      {mode === "login" && (
        <p className="text-center text-[#333] text-xs mt-6">
          ¿No tienes cuenta?{" "}
          <button
            onClick={() => setMode("register")}
            className="text-[#C9A84C] hover:underline"
          >
            Regístrate gratis
          </button>
        </p>
      )}
    </div>
  );
}
