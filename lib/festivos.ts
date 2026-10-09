// Algoritmo de Gauss para Domingo de Pascua → Viernes Santo (−2 días)
function viernesSanto(anyo: number): string {
  const a = anyo % 19;
  const b = Math.floor(anyo / 100);
  const c = anyo % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  const pascua = new Date(Date.UTC(anyo, mes - 1, dia));
  const vs = new Date(pascua.getTime() - 2 * 86_400_000);
  return vs.toISOString().slice(0, 10);
}

// Festivos fijos nacionales [mes, día]
const FIJOS: [number, number][] = [
  [1,   1],  // Año Nuevo
  [1,   6],  // Reyes Magos
  [5,   1],  // Día del Trabajador
  [8,  15],  // Asunción de la Virgen
  [10, 12],  // Fiesta Nacional de España
  [11,  1],  // Todos los Santos
  [12,  6],  // Día de la Constitución
  [12,  8],  // Inmaculada Concepción
  [12, 25],  // Navidad
];

/**
 * Devuelve true si "fecha" (YYYY-MM-DD) es festivo nacional español.
 * No incluye festivos autonómicos ni locales.
 */
export function esFestivoNacional(fecha: string): boolean {
  const parts = fecha.split("-");
  const mes  = parseInt(parts[1], 10);
  const dia  = parseInt(parts[2], 10);
  if (FIJOS.some(([m, d]) => m === mes && d === dia)) return true;
  return fecha === viernesSanto(parseInt(parts[0], 10));
}
