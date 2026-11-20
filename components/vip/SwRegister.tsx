"use client";
import { useEffect } from "react";

export default function SwRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/espacio-vip/sw.js", { scope: "/espacio-vip/" }).catch(() => {});
    }
  }, []);
  return null;
}
