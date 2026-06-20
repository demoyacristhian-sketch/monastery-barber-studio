"use client";

import { createContext, useContext, useEffect, useState } from "react";

export const TEMAS = [
  { id: "negro",    label: "Negro",    bg: "#080808", surface: "#0a0a0a", border: "#111111" },
  { id: "carbon",   label: "Carbón",   bg: "#0d0d0d", surface: "#111111", border: "#1a1a1a" },
  { id: "petroleo", label: "Petróleo", bg: "#050e0b", surface: "#081410", border: "#0f2018" },
  { id: "marino",   label: "Marino",   bg: "#05080f", surface: "#080d18", border: "#0d1525" },
  { id: "granate",  label: "Granate",  bg: "#0f0508", surface: "#160609", border: "#240810" },
  { id: "cafe",     label: "Café",     bg: "#0e0905", surface: "#150e07", border: "#22160a" },
] as const;

export type TemaId = (typeof TEMAS)[number]["id"];

const TemaCtx = createContext<{ tema: TemaId; setTema: (t: TemaId) => void }>({
  tema: "negro",
  setTema: () => {},
});

export function useTema() { return useContext(TemaCtx); }

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [tema, setTemaState] = useState<TemaId>("negro");

  useEffect(() => {
    const guardado = localStorage.getItem("admin-tema") as TemaId | null;
    if (guardado && TEMAS.find((t) => t.id === guardado)) setTemaState(guardado);
  }, []);

  function setTema(id: TemaId) {
    setTemaState(id);
    localStorage.setItem("admin-tema", id);
  }

  const t = TEMAS.find((t) => t.id === tema)!;

  return (
    <TemaCtx.Provider value={{ tema, setTema }}>
      <div
        style={{
          "--admin-bg":      t.bg,
          "--admin-surface": t.surface,
          "--admin-border":  t.border,
        } as React.CSSProperties}
        className="min-h-screen"
        data-tema={tema}
      >
        {children}
      </div>
    </TemaCtx.Provider>
  );
}
