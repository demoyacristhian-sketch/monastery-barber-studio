"use client";

import { useEffect, useState } from "react";
import { Download, Share, X, Smartphone, CheckCircle, ArrowUp } from "lucide-react";
import { useVipTheme } from "./VipThemeProvider";

type Platform = "ios" | "android" | "desktop" | null;

function detectPlatform(): Platform {
  if (typeof window === "undefined") return null;
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  if (/android/i.test(ua)) return "android";
  return "desktop";
}

function isInstalled(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
}

export default function InstallPrompt() {
  const { theme } = useVipTheme();
  const [platform, setPlatform] = useState<Platform>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  useEffect(() => {
    if (isInstalled()) { setInstalled(true); return; }

    try {
      if (localStorage.getItem("vip-install-dismissed") === "1") {
        setDismissed(true);
        return;
      }
    } catch {}

    setPlatform(detectPlatform());

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const [showAndroidGuide, setShowAndroidGuide] = useState(false);

  async function handleInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      if (outcome === "accepted") {
        setJustInstalled(true);
        setTimeout(() => setInstalled(true), 2500);
      }
    } else if (platform === "ios") {
      setShowIosGuide(true);
    } else {
      // Android: deferredPrompt not ready → show manual guide
      setShowAndroidGuide(true);
    }
  }

  function dismiss() {
    try { localStorage.setItem("vip-install-dismissed", "1"); } catch {}
    setDismissed(true);
  }

  // Already installed → show brief success badge
  if (justInstalled) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-5"
        style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.3)" }}>
        <CheckCircle className="w-4 h-4 text-[#C9A84C] shrink-0" />
        <p className="text-sm font-medium" style={{ color: "var(--vip-text)" }}>
          ¡App instalada! Ya puedes abrirla desde tu pantalla de inicio.
        </p>
      </div>
    );
  }

  if (installed || dismissed || !platform) return null;

  const isLight = theme === "light";
  const cardBg   = isLight ? "rgba(255,255,255,0.9)" : "rgba(201,168,76,0.04)";
  const cardBorder = isLight ? "#E5D6C3" : "rgba(201,168,76,0.18)";
  const textPrimary = isLight ? "#1A1210" : "#FFFFFF";
  const textMuted   = isLight ? "#7A6A5E" : "#999999";

  return (
    <>
      {/* Install card */}
      <div className="relative mb-5 rounded-xl overflow-hidden"
        style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>

        {/* Subtle gold shimmer top */}
        <div className="h-px w-full" style={{ background: "linear-gradient(to right, transparent, #C9A84C60, transparent)" }} />

        <div className="p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: "rgba(201,168,76,0.12)" }}>
            <Smartphone className="w-5 h-5 text-[#C9A84C]" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-sm font-bold" style={{ color: textPrimary }}>
                Instala la app Monastery VIP
              </p>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold tracking-wide"
                style={{ background: "rgba(201,168,76,0.15)", color: "#C9A84C" }}>
                GRATIS
              </span>
            </div>
            <p className="text-xs mb-3 leading-relaxed" style={{ color: textMuted }}>
              {platform === "ios"
                ? "Accede directamente desde tu pantalla de inicio, sin abrir el navegador."
                : "Acceso directo desde tu pantalla de inicio. Sin App Store, sin descargas."}
            </p>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleInstall}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold tracking-wide uppercase transition-all hover:opacity-90 active:scale-95"
                style={{ background: "linear-gradient(135deg,#F5D98B,#C9A84C,#8B6914)", color: "#000" }}
              >
                {platform === "ios" ? (
                  <><Share className="w-3.5 h-3.5" /> Cómo instalar</>
                ) : (
                  <><Download className="w-3.5 h-3.5" /> Instalar app</>
                )}
              </button>
              <button onClick={dismiss}
                className="text-xs underline underline-offset-2 transition-colors"
                style={{ color: textMuted }}>
                No, gracias
              </button>
            </div>
          </div>

          <button onClick={dismiss} className="p-1 shrink-0 mt-0.5 transition-opacity hover:opacity-70"
            style={{ color: textMuted }}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Android manual guide modal */}
      {showAndroidGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}>
          <div className="w-full max-w-sm rounded-2xl overflow-hidden"
            style={{ background: isLight ? "#FFFFFF" : "#0d0d0d", border: "1px solid rgba(201,168,76,0.2)" }}>
            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid rgba(201,168,76,0.12)" }}>
              <p className="font-bold text-sm" style={{ color: textPrimary }}>Instalar en Android</p>
              <button onClick={() => setShowAndroidGuide(false)} style={{ color: textMuted }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 py-5 space-y-4">
              {[
                { n: "1", title: "Abre el menú de Chrome", desc: 'Toca los tres puntos ⋮ en la esquina superior derecha' },
                { n: "2", title: 'Busca "Instalar app"', desc: '"Añadir a pantalla de inicio" también funciona' },
                { n: "3", title: "Confirma la instalación", desc: "La app aparece en tu pantalla de inicio" },
              ].map(step => (
                <div key={step.n} className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm"
                    style={{ background: "rgba(201,168,76,0.1)", color: "#C9A84C" }}>
                    {step.n}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: textPrimary }}>{step.title}</p>
                    <p className="text-xs" style={{ color: textMuted }}>{step.desc}</p>
                  </div>
                </div>
              ))}
              <div className="mt-2 p-3 rounded-xl text-xs text-center"
                style={{ background: "rgba(201,168,76,0.07)", color: "#C9A84C" }}>
                ⚠️ Debe abrirse en Chrome para poder instalar
              </div>
              <button onClick={() => { setShowAndroidGuide(false); dismiss(); }}
                className="w-full py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
                style={{ background: "rgba(201,168,76,0.12)", color: "#C9A84C" }}>
                Entendido, lo haré después
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS guide modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}>
          <div className="w-full max-w-sm rounded-2xl overflow-hidden"
            style={{ background: isLight ? "#FFFFFF" : "#0d0d0d", border: "1px solid rgba(201,168,76,0.2)" }}>

            {/* Top bar */}
            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid rgba(201,168,76,0.12)" }}>
              <p className="font-bold text-sm" style={{ color: textPrimary }}>Instalar en iPhone / iPad</p>
              <button onClick={() => setShowIosGuide(false)} style={{ color: textMuted }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 py-5 space-y-4">
              {[
                {
                  n: "1",
                  icon: <Share className="w-5 h-5 text-[#C9A84C]" />,
                  title: "Toca el botón Compartir",
                  desc: 'El ícono □↑ en la barra inferior de Safari',
                },
                {
                  n: "2",
                  icon: <ArrowUp className="w-5 h-5 text-[#C9A84C]" />,
                  title: "Desplázate y toca",
                  desc: '"Añadir a pantalla de inicio"',
                },
                {
                  n: "3",
                  icon: <CheckCircle className="w-5 h-5 text-[#C9A84C]" />,
                  title: 'Toca "Añadir"',
                  desc: "La app aparece en tu pantalla de inicio",
                },
              ].map(step => (
                <div key={step.n} className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm"
                    style={{ background: "rgba(201,168,76,0.1)", color: "#C9A84C" }}>
                    {step.n}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: textPrimary }}>{step.title}</p>
                    <p className="text-xs" style={{ color: textMuted }}>{step.desc}</p>
                  </div>
                </div>
              ))}

              <div className="mt-2 p-3 rounded-xl text-xs text-center"
                style={{ background: "rgba(201,168,76,0.07)", color: "#C9A84C" }}>
                ⚠️ Debe abrirse en Safari para poder instalar
              </div>

              <button onClick={() => { setShowIosGuide(false); dismiss(); }}
                className="w-full py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
                style={{ background: "rgba(201,168,76,0.12)", color: "#C9A84C" }}>
                Entendido, lo haré después
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
