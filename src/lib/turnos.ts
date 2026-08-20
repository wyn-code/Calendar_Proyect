import type { Appointment, ObraSocial, Patient } from "./api";

export type TipoConsulta = "particular" | "obra_social";

export const OBRAS_SOCIALES = [
  "OSDE",
  "Swiss Medical",
  "Galeno",
  "Medifé",
  "OMINT",
  "IOMA",
  "PAMI",
  "OSECAC",
  "Sancor Salud",
  "Unión Personal",
  "Otra",
];

export interface Turno {
  id: number;
  patientId: number;
  fecha: string; // yyyy-MM-dd
  hora: string; // HH:mm
  nombre: string;
  tipo: TipoConsulta;
  obraSocial?: string;
  observacion?: string;
}

export function appointmentsToTurnos(
  appointments: Appointment[],
  patients: Patient[],
  obrasSociales: ObraSocial[],
): Turno[] {
  const patientById = new Map(patients.map((p) => [p.id, p]));
  const obraSocialById = new Map(obrasSociales.map((o) => [o.id, o]));

  return appointments.map((a) => {
    const patient = patientById.get(a.patient_id);
    const obraSocial = a.obra_social_id != null ? obraSocialById.get(a.obra_social_id) : undefined;
    const esObraSocial = a.tipo_consulta.trim().toLowerCase() === "obra social";

    return {
      id: a.id,
      patientId: a.patient_id,
      fecha: a.fecha,
      hora: a.hora_inicio.slice(0, 5),
      nombre: patient?.nombre_completo ?? `Paciente #${a.patient_id}`,
      tipo: esObraSocial ? "obra_social" : "particular",
      ...(obraSocial ? { obraSocial: obraSocial.nombre } : {}),
      ...(a.observaciones ? { observacion: a.observaciones } : {}),
    };
  });
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

export function fromKey(key: string): Date {
  const parts = key.split("-").map(Number);
  return new Date(parts[0] ?? 0, (parts[1] ?? 1) - 1, parts[2] ?? 1);
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

export function startOfWeek(d: Date): Date {
  return addDays(d, -d.getDay());
}

/** Días (Dom→Sáb) de la semana que contiene la fecha. */
export function weekDays(d: Date): Date[] {
  const start = startOfWeek(d);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function formatFechaLarga(key: string) {
  const parts = key.split("-").map(Number);
  const y = parts[0] ?? 0;
  const m = parts[1] ?? 1;
  const d = parts[2] ?? 1;
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
