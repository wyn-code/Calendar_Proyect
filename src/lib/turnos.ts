export type TipoConsulta = "particular" | "obra_social";

export interface Turno {
  id: string;
  fecha: string; // yyyy-MM-dd
  hora: string; // HH:mm
  nombre: string;
  tipo: TipoConsulta;
}

const STORAGE_KEY = "turnos-v1";

export function loadTurnos(): Turno[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Turno[]) : [];
  } catch {
    return [];
  }
}

export function saveTurnos(turnos: Turno[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(turnos));
}

export const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export const DIAS = ["DOM", "LUN", "MAR", "MIE", "JUE", "VIE", "SAB"];

export function toKey(d: Date) {
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function formatFechaLarga(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return `${DIAS[date.getDay()]} ${d} de ${MESES[m - 1]} ${y}`;
}

/** Matriz de semanas (6x7) que cubre el mes indicado. */
export function buildMonthGrid(year: number, month: number): Date[][] {
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - first.getDay());
  const weeks: Date[][] = [];
  for (let w = 0; w < 6; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + w * 7 + d));
    }
    weeks.push(week);
  }
  return weeks;
}
