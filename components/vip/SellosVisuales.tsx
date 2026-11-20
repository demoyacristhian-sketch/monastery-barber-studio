import { Scissors } from "lucide-react";

export default function SellosVisuales({ sellos }: { sellos: number }) {
  const TOTAL     = 8;
  const filled    = Math.min(sellos, TOTAL);
  const canCanjear = filled >= TOTAL;

  return (
    <div>
      <div className="flex gap-2 flex-wrap items-center">
        {Array.from({ length: TOTAL }).map((_, i) => {
          const activo = i < filled;
          return (
            <div
              key={i}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
              style={{
                background: activo
                  ? "var(--vip-sello-filled, rgba(201,168,76,0.15))"
                  : "var(--vip-sello-empty, rgba(255,255,255,0.04))",
                border: activo
                  ? "1px solid rgba(201,168,76,0.4)"
                  : "1px solid var(--vip-border)",
              }}
              title={activo ? `Sello ${i + 1} conseguido` : `Sello ${i + 1} pendiente`}
            >
              {activo && (
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#C9A84C]">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                </svg>
              )}
            </div>
          );
        })}

        {/* Separador */}
        <div className="shrink-0" style={{ width: 1, height: 32, background: "var(--vip-border)" }} />

        {/* Sello del 9.º corte gratis */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all"
          style={{
            background: canCanjear
              ? "linear-gradient(135deg, #C9A84C 0%, #f0c060 100%)"
              : "transparent",
            border: canCanjear ? "none" : "2px dashed var(--vip-border)",
          }}
          title={canCanjear ? "¡Corte gratis disponible! Avisa a tu barbero." : "Completa los 8 sellos para tu 9.º corte gratis"}
        >
          <Scissors
            className="w-4 h-4"
            style={{ color: canCanjear ? "#000" : "var(--vip-muted)" }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <p className="text-xs" style={{ color: "var(--vip-muted)" }}>
          {filled}/{TOTAL} sellos · {canCanjear
            ? "¡9.º corte gratis disponible!"
            : `${TOTAL - filled} ${TOTAL - filled === 1 ? "sello" : "sellos"} para el 9.º corte gratis`}
        </p>
        {canCanjear && (
          <p className="text-xs font-medium animate-pulse" style={{ color: "#C9A84C" }}>
            Comunícaselo a tu barbero →
          </p>
        )}
      </div>
    </div>
  );
}
