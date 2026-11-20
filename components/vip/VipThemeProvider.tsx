"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "dark" | "light";

const Ctx = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "dark",
  toggle: () => {},
});

export function VipThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("vip-theme");
      if (saved === "light" || saved === "dark") setTheme(saved);
    } catch {}
  }, []);

  function toggle() {
    setTheme(t => {
      const next = t === "dark" ? "light" : "dark";
      try { localStorage.setItem("vip-theme", next); } catch {}
      return next;
    });
  }

  return (
    <Ctx.Provider value={{ theme, toggle }}>
      <div
        data-vip-theme={theme}
        style={{
          minHeight: "100dvh",
          background: "var(--vip-bg)",
          color: "var(--vip-text)",
          transition: "background 0.4s ease, color 0.3s ease",
        }}
      >
        {children}
      </div>
    </Ctx.Provider>
  );
}

export function useVipTheme() {
  return useContext(Ctx);
}
