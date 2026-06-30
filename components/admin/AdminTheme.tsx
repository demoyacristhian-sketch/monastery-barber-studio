"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

export type Tema = {
  id: string; label: string;
  bg: string; card: string; border: string;
  text1: string; text2: string; text3: string;
  input: string; hover: string;
  claro: boolean;
};

export const TEMAS: Tema[] = [
  { id:"zinc",    label:"Zinc",    bg:"#f4f4f5", card:"#ffffff", border:"#e4e4e7", text1:"#18181b", text2:"#71717a", text3:"#a1a1aa", input:"#ffffff", hover:"#f4f4f5", claro:true  },
  { id:"blanco",  label:"Blanco",  bg:"#ffffff",  card:"#f9f9f9", border:"#e5e5e5", text1:"#171717", text2:"#737373", text3:"#a3a3a3", input:"#f5f5f5", hover:"#f5f5f5", claro:true  },
  { id:"piedra",  label:"Piedra",  bg:"#f5f5f4", card:"#ffffff", border:"#e7e5e4", text1:"#1c1917", text2:"#78716c", text3:"#a8a29e", input:"#ffffff", hover:"#fafaf9", claro:true  },
  { id:"pizarra", label:"Pizarra", bg:"#f1f5f9", card:"#ffffff", border:"#e2e8f0", text1:"#0f172a", text2:"#64748b", text3:"#94a3b8", input:"#ffffff", hover:"#f8fafc", claro:true  },
  { id:"verde",   label:"Verde",   bg:"#f0fdf4", card:"#ffffff", border:"#dcfce7", text1:"#14532d", text2:"#16a34a", text3:"#86efac", input:"#ffffff", hover:"#f0fdf4", claro:true  },
  { id:"grafito", label:"Grafito", bg:"#18181b", card:"#27272a", border:"#3f3f46", text1:"#f4f4f5", text2:"#a1a1aa", text3:"#71717a", input:"#3f3f46", hover:"#3f3f46", claro:false },
  { id:"noche",   label:"Noche",   bg:"#0f172a", card:"#1e293b", border:"#334155", text1:"#f1f5f9", text2:"#94a3b8", text3:"#64748b", input:"#334155", hover:"#334155", claro:false },
];

export type TemaId = string;

const TemaCtx = createContext<{ tema: TemaId; setTema: (t: TemaId) => void }>({
  tema: "zinc", setTema: () => {},
});

export function useTema() { return useContext(TemaCtx); }

function injectCSS(t: Tema) {
  const notDark = `[data-tema="${t.id}"]`;
  return `
${notDark} { background: ${t.bg}; }
${notDark} main { background: ${t.bg}; color: ${t.text1}; }
${notDark} main .bg-white { background: ${t.card} !important; }
${t.claro ? `${notDark} main .rounded-2xl.bg-white { box-shadow: 0 1px 4px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04); }` : ""}
${notDark} main .bg-zinc-50\\/50 { background: ${t.claro ? "rgba(250,250,250,0.5)" : "rgba(0,0,0,0.15)"} !important; }
${notDark} main .border-zinc-200 { border-color: ${t.border} !important; }
${notDark} main .border-zinc-100 { border-color: ${t.claro ? "#f0f0f0" : t.border} !important; }
${notDark} main .divide-zinc-50 > * { border-color: ${t.claro ? "#fafafa" : t.border} !important; }
${notDark} main .text-zinc-900 { color: ${t.text1} !important; }
${notDark} main .text-zinc-800 { color: ${t.text1} !important; }
${notDark} main .text-zinc-700 { color: ${t.text1} !important; }
${notDark} main .text-zinc-600 { color: ${t.text2} !important; }
${notDark} main .text-zinc-500 { color: ${t.text2} !important; }
${notDark} main .text-zinc-400 { color: ${t.text3} !important; }
${notDark} main .text-zinc-300 { color: ${t.text3} !important; }
${notDark} main input, ${notDark} main select { background: ${t.input} !important; border-color: ${t.border} !important; color: ${t.text1} !important; }
${notDark} main input::placeholder { color: ${t.text3} !important; }
${notDark} main tr.hover\\:bg-zinc-50\\/50:hover { background: ${t.hover} !important; }
`.trim();
}

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [tema, setTemaState] = useState<TemaId>("zinc");
  const styleRef = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    const guardado = localStorage.getItem("admin-tema-v2");
    if (guardado && TEMAS.find(t => t.id === guardado)) setTemaState(guardado);
  }, []);

  useEffect(() => {
    if (!styleRef.current) {
      const el = document.createElement("style");
      el.id = "admin-theme-v2";
      document.head.appendChild(el);
      styleRef.current = el;
    }
    const t = TEMAS.find(x => x.id === tema) ?? TEMAS[0];
    styleRef.current.textContent = injectCSS(t);
  }, [tema]);

  function setTema(id: TemaId) {
    setTemaState(id);
    localStorage.setItem("admin-tema-v2", id);
  }

  const t = TEMAS.find(x => x.id === tema) ?? TEMAS[0];

  return (
    <TemaCtx.Provider value={{ tema, setTema }}>
      <div
        data-tema={t.id}
        style={{
          "--admin-bg": t.bg, "--admin-card": t.card, "--admin-border": t.border,
          "--admin-text-1": t.text1, "--admin-text-2": t.text2, "--admin-text-3": t.text3,
        } as React.CSSProperties}
        className="min-h-screen"
      >
        {children}
      </div>
    </TemaCtx.Provider>
  );
}
