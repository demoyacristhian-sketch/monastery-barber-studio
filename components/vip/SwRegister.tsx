"use client";
import { useEffect } from "react";

export default function SwRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const isApp = window.location.hostname === "app.monasterybarbers.es";
      if (isApp) {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      } else {
        navigator.serviceWorker.register("/espacio-vip/sw.js", { scope: "/espacio-vip/" }).catch(() => {});
      }
    }
  }, []);
  return null;
}
