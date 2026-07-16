import AuthForm from "@/components/AuthForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acceso | Monastery Barber Studio",
  description: "Inicia sesión o crea tu cuenta en Monastery Barber Studio.",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4 pt-20">
      {/* Atmospheric glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(201,168,76,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="h-px w-8 bg-[#C9A84C]/40" />
            <span className="section-label">Acceso exclusivo</span>
            <div className="h-px w-8 bg-[#C9A84C]/40" />
          </div>
          <h1 className="font-serif text-4xl font-black">
            <span className="gold-text">Monastery</span>
          </h1>
          <p className="text-[#999] text-xs tracking-widest uppercase mt-1">
            Barber Studio · Valladolid
          </p>
        </div>

        <AuthForm />
      </div>
    </main>
  );
}
