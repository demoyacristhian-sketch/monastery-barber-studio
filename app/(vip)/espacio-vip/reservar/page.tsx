import { Suspense } from "react";
import VipReservar from "@/components/vip/VipReservar";

export default function ReservarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--vip-bg)" }}>
        <p className="text-sm" style={{ color: "var(--vip-muted)" }}>Cargando...</p>
      </div>
    }>
      <VipReservar />
    </Suspense>
  );
}
