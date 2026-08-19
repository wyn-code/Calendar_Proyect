/** Datos mock (sin backend). Todo vive en memoria durante la sesión. */

export type CoberturaMock = "Particular" | "Obra Social";

export interface PacienteMock {
  id: number;
  nombre: string;
  dni: string;
  cobertura: CoberturaMock;
  obraSocial: string | null;
  consultorio: string;
  sesionesMes: number;
  ultimaFactura: string | null; // YYYY-MM-DD
}

export interface FacturaForm {
  paciente: string;
  dni: string;
  obraSocial: string;
  nroAfiliado: string;
  periodo: string;
  fechaEmision: string;
  nroFactura: string;
  sesiones: string;
  monto: string;
  porcentaje: string;
  fechaPago: string;
}

export const EMPTY_FACTURA: FacturaForm = {
  paciente: "",
  dni: "",
  obraSocial: "",
  nroAfiliado: "",
  periodo: "",
  fechaEmision: "",
  nroFactura: "",
  sesiones: "",
  monto: "",
  porcentaje: "",
  fechaPago: "",
};

export const PACIENTES_MOCK: PacienteMock[] = [
  {
    id: 1,
    nombre: "Camila Rossi",
    dni: "38.412.905",
    cobertura: "Obra Social",
    obraSocial: "OSDE",
    consultorio: "Neurovital",
    sesionesMes: 4,
    ultimaFactura: "2026-08-05",
  },
  {
    id: 2,
    nombre: "Martín Aguirre",
    dni: "41.220.187",
    cobertura: "Particular",
    obraSocial: null,
    consultorio: "Infancias",
    sesionesMes: 2,
    ultimaFactura: null,
  },
  {
    id: 3,
    nombre: "Lucía Fernández",
    dni: "35.987.442",
    cobertura: "Obra Social",
    obraSocial: "Swiss Medical",
    consultorio: "Neurovital",
    sesionesMes: 3,
    ultimaFactura: "2026-07-28",
  },
  {
    id: 4,
    nombre: "Tomás Benítez",
    dni: "44.105.633",
    cobertura: "Obra Social",
    obraSocial: "IOMA",
    consultorio: "Infancias",
    sesionesMes: 5,
    ultimaFactura: "2026-08-11",
  },
  {
    id: 5,
    nombre: "Valentina Suárez",
    dni: "39.774.018",
    cobertura: "Particular",
    obraSocial: null,
    consultorio: "Neurovital",
    sesionesMes: 1,
    ultimaFactura: null,
  },
];

export interface ConsultorioMock {
  id: number;
  nombre: string;
  porcentaje: number; // % que se paga al consultorio
  totalFacturado: number;
}

export const CONSULTORIOS_MOCK: ConsultorioMock[] = [
  { id: 1, nombre: "Neurovital", porcentaje: 40, totalFacturado: 80511.8 },
  { id: 2, nombre: "Infancias", porcentaje: 35, totalFacturado: 52340.5 },
];

export const PRECIOS_MOCK = {
  particular: 20000,
  obraSocial: 15000,
  discapacidad: 12000,
};

export const USUARIO_MOCK = { email: "agustina.peralta@email.com" };

export function formatFechaCorta(iso: string | null): string {
  if (!iso) return "Sin facturas";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
