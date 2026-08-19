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

/* ---------- Personalización (mock, sin persistencia) ---------- */

export interface FondoMock {
  id: string;
  label: string;
  /** valor CSS para background-image */
  css: string;
}

export interface TemaMock {
  /** color principal en hex */
  primary: string;
  /** id de un fondo predefinido, o "custom" cuando es una imagen subida */
  fondoId: string;
  /** background-image CSS resuelto */
  fondoCss: string;
}

export const COLORES_MOCK = [
  { id: "rosa", label: "Rosa", hex: "#d96a92" },
  { id: "violeta", label: "Violeta", hex: "#8b6ad9" },
  { id: "verde", label: "Verde", hex: "#4fa87a" },
  { id: "azul", label: "Azul", hex: "#4c7fd1" },
  { id: "coral", label: "Coral", hex: "#e2725b" },
  { id: "gris", label: "Gris", hex: "#6b6570" },
];

export const FONDOS_MOCK: FondoMock[] = [
  { id: "floral", label: "Floral", css: "" }, // se resuelve con el asset en PageShell
  {
    id: "rosa-suave",
    label: "Rosa suave",
    css: "linear-gradient(160deg, #fdf1f5 0%, #f7e2ec 60%, #efd6e6 100%)",
  },
  {
    id: "lila",
    label: "Lila",
    css: "linear-gradient(160deg, #f4f0fb 0%, #e8e0f8 60%, #ded4f3 100%)",
  },
  {
    id: "crema",
    label: "Crema",
    css: "linear-gradient(160deg, #fdfaf4 0%, #f6eee2 100%)",
  },
];

export const TEMA_DEFAULT: TemaMock = {
  primary: "#d96a92",
  fondoId: "floral",
  fondoCss: "",
};
