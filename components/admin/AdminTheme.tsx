"use client";

import { createContext, useContext, useEffect, useState } from "react";

export const TEMAS = [
  { id: "negro",    label: "Negro",    bg: "#080808", surface: "#0a0a0a", border: "#111111", claro: false },
  { id: "carbon",   label: "Carbón",   bg: "#0d0d0d", surface: "#111111", border: "#1a1a1a", claro: false },
  { id: "petroleo", label: "Petróleo", bg: "#050e0b", surface: "#081410", border: "#0f2018", claro: false },
  { id: "marino",   label: "Marino",   bg: "#05080f", surface: "#080d18", border: "#0d1525", claro: false },
  { id: "granate",  label: "Granate",  bg: "#0f0508", surface: "#160609", border: "#240810", claro: false },
  { id: "cafe",     label: "Café",     bg: "#0e0905", surface: "#150e07", border: "#22160a", claro: false },
  { id: "blanco",   label: "Blanco",   bg: "#f8f7f4", surface: "#ffffff", border: "#e0ddd6", claro: true  },
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
          "--admin-text":    t.claro ? "#1a1a1a" : "#ffffff",
          "--admin-muted":   t.claro ? "#555555" : "#888888",
          "--admin-faint":   t.claro ? "#888888" : "#444444",
        } as React.CSSProperties}
        className="min-h-screen"
        data-tema={tema}
        data-claro={t.claro ? "true" : "false"}
      >
        {children}
      </div>
    </TemaCtx.Provider>
  );
}
