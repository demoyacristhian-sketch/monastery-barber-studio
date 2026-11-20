"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { LayoutDashboard, Calendar, User, Star, Tag, LogOut, Sun, Moon, Download, Share, CheckCircle, X, ArrowUp } from "lucide-react";
import { useVipTheme } from "./VipThemeProvider";
import { useState, useEffect } from "react";

const ITEMS = [
  { href: "/espacio-vip",            label: "Inicio",     icon: LayoutDashboard, exact: true },
  { href: "/espacio-vip/citas",      label: "Citas",      icon: Calendar        },
  { href: "/espacio-vip/ofertas",    label: "Ofertas",    icon: Tag             },
  { href: "/espacio-vip/perfil",     label: "Perfil",     icon: User            },
  { href: "/espacio-vip/beneficios", label: "Beneficios", icon: Star            },
];

function detectPlatformNav() {
  if (typeof window === "undefined") return null;
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  if (/android/i.test(ua)) return "android";
  return "desktop";
}

export default function VipNav({ nombre }: { nombre: string }) {
  const pathname    = usePathname();
  const router      = useRouter();
  const supabase    = createClient();
  const { theme, toggle } = useVipTheme();
  const isLight     = theme === "light";
  const [closing, setClosing]           = useState(false);
  const [appInstalled, setAppInstalled] = useState(true); // asumir instalada hasta confirmar
  const [platform, setPlatform]         = useState<"ios" | "android" | "desktop" | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showGuide, setShowGuide]       = useState(false);

  useEffect(() => {
    const installed =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setAppInstalled(installed);
    if (!installed) setPlatform(detectPlatformNav());

    const handler = (e: Event) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstalar() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      if (outcome === "accepted") setAppInstalled(true);
    } else {
      setShowGuide(true);
    }
  }

  async function cerrarSesion() {
    setClosing(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  /* Colores según tema */
  const navBg      = "var(--vip-nav)";
  const textActive = "#C9A84C";
  const textInactive = isLight ? "#7A6A5E" : "#666666";
  const textHover  = isLight ? "#1A1210" : "#aaaaaa";
  const borderColor = isLight ? "rgba(229,214,195,0.6)" : "rgba(26,26,26,0.9)";

  return (
    <>
      {/* ── Desktop: sticky top tab bar ── */}
      <nav
        className="hidden sm:flex sticky top-0 z-40 backdrop-blur items-center justify-between h-12 px-6"
        style={{ background: navBg, borderBottom: `1px solid ${borderColor}`, transition: "background 0.4s" }}
      >
        <div className="flex items-center gap-1 overflow-x-auto">
          {ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const activo = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-wide whitespace-nowrap transition-all rounded-sm"
                style={{
                  color: activo ? textActive : textInactive,
                  borderBottom: activo ? `2px solid ${textActive}` : "2px solid transparent",
                  marginBottom: activo ? "-1px" : "0",
                  fontWeight: activo ? 600 : 400,
                }}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-4">
          <span className="text-xs truncate max-w-[120px]" style={{ color: textInactive }}>{nombre}</span>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            title={isLight ? "Cambiar a tema oscuro" : "Cambiar a tema claro"}
            className="p-1.5 rounded-lg transition-all"
            style={{ color: textInactive, background: isLight ? "rgba(201,168,76,0.08)" : "rgba(255,255,255,0.04)" }}
          >
            {isLight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={cerrarSesion}
            disabled={closing}
            className="flex items-center gap-1 text-xs transition-colors hover:opacity-70"
            style={{ color: textInactive }}
            title="Cerrar sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Salir</span>
          </button>
        </div>
      </nav>

      {/* ── Mobile: sticky top header ── */}
      <header
        className="sm:hidden sticky top-0 z-40 backdrop-blur flex items-center justify-between px-5 h-14"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          background: navBg,
          borderBottom: `1px solid ${borderColor}`,
          transition: "background 0.4s",
        }}
      >
        <Image
          src="/images/logo.svg"
          alt="Monastery Barber Studio"
          width={140}
          height={24}
          className="h-5 w-auto"
          style={{ filter: isLight ? "brightness(0.2)" : "none" }}
        />
        <div className="flex items-center gap-1.5">
          {/* Instalar app — solo cuando no está instalada */}
          {!appInstalled && platform !== "desktop" && (
            <button
              onClick={handleInstalar}
              className="p-2 rounded-lg transition-all"
              style={{ color: "#C9A84C", background: "rgba(201,168,76,0.1)" }}
              title="Instalar app"
              aria-label="Instalar app en tu teléfono"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="p-2 rounded-lg transition-all"
            style={{ color: textInactive, background: isLight ? "rgba(201,168,76,0.08)" : "rgba(255,255,255,0.04)" }}
            title={isLight ? "Tema oscuro" : "Tema claro"}
          >
            {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          <button
            onClick={cerrarSesion}
            disabled={closing}
            className="p-2 transition-colors hover:opacity-70"
            style={{ color: textInactive }}
            aria-label="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── Modal guía de instalación ── */}
      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
          onClick={() => setShowGuide(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl overflow-hidden"
            style={{ background: isLight ? "#FFFFFF" : "#0d0d0d", border: "1px solid rgba(201,168,76,0.25)" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid rgba(201,168,76,0.12)" }}>
              <div>
                <p className="font-bold text-sm" style={{ color: isLight ? "#1A1210" : "#FFFFFF" }}>
                  {platform === "ios" ? "Instalar en iPhone / iPad" : "Instalar en Android"}
                </p>
                <p className="text-xs mt-0.5" style={{ color: isLight ? "#7A6A5E" : "#999" }}>
                  Acceso directo desde tu pantalla de inicio
                </p>
              </div>
              <button onClick={() => setShowGuide(false)} style={{ color: isLight ? "#7A6A5E" : "#999" }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 py-5 space-y-4">
              {platform === "ios" ? (
                <>
                  {[
                    { n: "1", icon: <Share className="w-5 h-5 text-[#C9A84C]" />, title: "Toca el botón Compartir", desc: "El ícono □↑ en la barra inferior de Safari" },
                    { n: "2", icon: <ArrowUp className="w-5 h-5 text-[#C9A84C]" />, title: 'Desplázate y toca', desc: '"Añadir a pantalla de inicio"' },
                    { n: "3", icon: <CheckCircle className="w-5 h-5 text-[#C9A84C]" />, title: 'Toca "Añadir"', desc: "La app aparece en tu pantalla de inicio" },
                  ].map(s => (
                    <div key={s.n} className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm"
                        style={{ background: "rgba(201,168,76,0.1)", color: "#C9A84C" }}>{s.n}</div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: isLight ? "#1A1210" : "#FFFFFF" }}>{s.title}</p>
                        <p className="text-xs" style={{ color: isLight ? "#7A6A5E" : "#999" }}>{s.desc}</p>
                      </div>
                    </div>
                  ))}
                  <div className="p-3 rounded-xl text-xs text-center" style={{ background: "rgba(201,168,76,0.07)", color: "#C9A84C" }}>
                    ⚠️ Debe abrirse en Safari para poder instalar
                  </div>
                </>
              ) : (
                <>
                  {[
                    { n: "1", title: "Abre el menú de Chrome", desc: "Toca los tres puntos ⋮ en la esquina superior derecha" },
                    { n: "2", title: 'Busca "Instalar app"', desc: '"Añadir a pantalla de inicio" también funciona' },
                    { n: "3", title: "Confirma la instalación", desc: "La app aparece en tu pantalla de inicio" },
                  ].map(s => (
                    <div key={s.n} className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm"
                        style={{ background: "rgba(201,168,76,0.1)", color: "#C9A84C" }}>{s.n}</div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: isLight ? "#1A1210" : "#FFFFFF" }}>{s.title}</p>
                        <p className="text-xs" style={{ color: isLight ? "#7A6A5E" : "#999" }}>{s.desc}</p>
                      </div>
                    </div>
                  ))}
                  <div className="p-3 rounded-xl text-xs text-center" style={{ background: "rgba(201,168,76,0.07)", color: "#C9A84C" }}>
                    ⚠️ Debe abrirse en Chrome para poder instalar
                  </div>
                </>
              )}

              <button onClick={() => setShowGuide(false)}
                className="w-full py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: "rgba(201,168,76,0.12)", color: "#C9A84C" }}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile: fixed bottom tab bar ── */}
      <nav
        className="sm:hidden fixed bottom-0 inset-x-0 z-40 backdrop-blur"
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
          background: navBg,
          borderTop: `1px solid ${borderColor}`,
          transition: "background 0.4s",
        }}
      >
        <div className="flex h-14">
          {ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const activo = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex-1 flex flex-col items-center justify-center gap-1 transition-colors"
                style={{ color: activo ? textActive : textInactive }}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] tracking-wide">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
