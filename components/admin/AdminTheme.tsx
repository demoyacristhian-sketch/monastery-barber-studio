"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

export type Tema = {
  id: string;
  label: string;
  bg: string;
  surface: string;
  border: string;
  text1: string;   // títulos / texto principal
  text2: string;   // texto secundario
  text3: string;   // texto muy tenue / metadatos
  claro: boolean;
};

export const TEMAS: Tema[] = [
  {
    id: "onyx", label: "Onyx",
    bg: "#0a0a0a", surface: "#111111", border: "#1e1e1e",
    text1: "#f0ede8", text2: "#8a8070", text3: "#4a4035",
    claro: false,
  },
  {
    id: "grafito", label: "Grafito",
    bg: "#1c1c1e", surface: "#2c2c2e", border: "#3a3a3c",
    text1: "#f5f5f7", text2: "#aeaeb2", text3: "#636366",
    claro: false,
  },
  {
    id: "noche", label: "Noche",
    bg: "#0a0f1e", surface: "#111827", border: "#1f2937",
    text1: "#e8eef8", text2: "#7b8cad", text3: "#3d4e6e",
    claro: false,
  },
  {
    id: "bosque", label: "Bosque",
    bg: "#0a1a0f", surface: "#111f18", border: "#1a3024",
    text1: "#e8f5ec", text2: "#7a9e82", text3: "#3d6048",
    claro: false,
  },
  {
    id: "burdeos", label: "Burdeos",
    bg: "#1a0810", surface: "#240d16", border: "#3a1525",
    text1: "#f5e8ec", text2: "#a87580", text3: "#6a3a45",
    claro: false,
  },
  {
    id: "tostado", label: "Tostado",
    bg: "#160e07", surface: "#1e1510", border: "#302015",
    text1: "#f5ede0", text2: "#a88860", text3: "#6a5535",
    claro: false,
  },
  {
    id: "plata", label: "Plata",
    bg: "#ededeb", surface: "#f5f5f3", border: "#d8d5cf",
    text1: "#1a1a18", text2: "#5a5850", text3: "#9a9890",
    claro: true,
  },
  {
    id: "crema", label: "Crema",
    bg: "#f5f0e8", surface: "#fffdf8", border: "#e0d8cc",
    text1: "#1a120a", text2: "#5e4e38", text3: "#9e8e78",
    claro: true,
  },
];

export type TemaId = string;

const TemaCtx = createContext<{ tema: TemaId; setTema: (t: TemaId) => void }>({
  tema: "onyx",
  setTema: () => {},
});

export function useTema() { return useContext(TemaCtx); }

function css(t: Tema) {
  const esc = (s: string) => s.replace(/[[\]#]/g, "\\$&");
  return `
[data-tema="${t.id}"] main { color: ${t.text2}; }
[data-tema="${t.id}"] main h1,
[data-tema="${t.id}"] main h2 { color: ${t.text1}; }
[data-tema="${t.id}"] main .text-white { color: ${t.text1} !important; }
[data-tema="${t.id}"] main .font-bold,
[data-tema="${t.id}"] main .font-medium,
[data-tema="${t.id}"] main .font-semibold { color: ${t.text1}; }
[data-tema="${t.id}"] main .text-${esc("[#888]")},
[data-tema="${t.id}"] main .text-${esc("[#777]")},
[data-tema="${t.id}"] main .text-${esc("[#999]")} { color: ${t.text2} !important; }
[data-tema="${t.id}"] main .text-${esc("[#555]")},
[data-tema="${t.id}"] main .text-${esc("[#444]")},
[data-tema="${t.id}"] main .text-${esc("[#333]")},
[data-tema="${t.id}"] main .text-${esc("[#222]")} { color: ${t.text3} !important; }
[data-tema="${t.id}"] main input,
[data-tema="${t.id}"] main select,
[data-tema="${t.id}"] main textarea { color: ${t.text1}; }
[data-tema="${t.id}"] main input::placeholder { color: ${t.text3}; }
`.trim();
}

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [tema, setTemaState] = useState<TemaId>("onyx");
  const styleRef = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    const guardado = localStorage.getItem("admin-tema");
    if (guardado && TEMAS.find(t => t.id === guardado)) setTemaState(guardado);
  }, []);

  useEffect(() => {
    if (!styleRef.current) {
      const el = document.createElement("style");
      el.id = "admin-theme-text";
      document.head.appendChild(el);
      styleRef.current = el;
    }
    const t = TEMAS.find(x => x.id === tema) ?? TEMAS[0];
    styleRef.current.textContent = css(t);
    return () => { /* keep element, just update content */ };
  }, [tema]);

  function setTema(id: TemaId) {
    setTemaState(id);
    localStorage.setItem("admin-tema", id);
  }

  const t = TEMAS.find(x => x.id === tema) ?? TEMAS[0];

  return (
    <TemaCtx.Provider value={{ tema, setTema }}>
      <div
        style={{
          "--admin-bg":      t.bg,
          "--admin-surface": t.surface,
          "--admin-border":  t.border,
          "--admin-text-1":  t.text1,
          "--admin-text-2":  t.text2,
          "--admin-text-3":  t.text3,
        } as React.CSSProperties}
        data-tema={t.id}
        data-claro={t.claro ? "true" : "false"}
        className="min-h-screen"
      >
        {children}
      </div>
    </TemaCtx.Provider>
  );
}
