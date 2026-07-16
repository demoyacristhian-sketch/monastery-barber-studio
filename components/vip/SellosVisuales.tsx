import { Scissors } from "lucide-react";

export default function SellosVisuales({ sellos }: { sellos: number }) {
  const filled  = Math.min(sellos, 10);
  const canCanjear = filled >= 10;

  return (
    <div>
      <div className="flex gap-2 flex-wrap items-center">
        {Array.from({ length: 10 }).map((_, i) => {
          const activo = i < filled;
          return (
            <div
              key={i}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
              style={{ background: activo ? "#18181b" : "#111" }}
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
        <div className="w-px h-8 bg-[#222] mx-1 shrink-0" />

        {/* Sello del corte gratis */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all"
          style={{
            background: canCanjear
              ? "linear-gradient(135deg, #C9A84C 0%, #f0c060 100%)"
              : "transparent",
            border: canCanjear ? "none" : "2px dashed #2a2a2a",
          }}
          title={canCanjear ? "¡Corte gratis disponible! Avisa a tu barbero." : "Completa los 10 sellos para obtener un corte gratis"}
        >
          <Scissors
            className="w-4 h-4"
            style={{ color: canCanjear ? "#000" : "#333" }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <p className="text-[#999] text-xs">
          {filled}/10 sellos · {canCanjear ? "¡Corte gratis disponible!" : `${10 - filled} para el próximo corte gratis`}
        </p>
        {canCanjear && (
          <p className="text-[#C9A84C] text-xs font-medium animate-pulse">
            Comunícaselo a tu barbero →
          </p>
        )}
      </div>
    </div>
  );
}
