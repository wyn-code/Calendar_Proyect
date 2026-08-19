import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  CONSULTORIOS_MOCK,
  FONDOS_MOCK,
  PACIENTES_MOCK,
  PORCENTAJES_MOCK,
  PRECIOS_MOCK,
  TEMA_DEFAULT,
  type ConsultorioMock,
  type FondoMock,
  type PacienteMock,
  type TemaMock,
} from "@/lib/mock-data";

interface MockStore {
  pacientes: PacienteMock[];
  registrarFactura: (nombrePaciente: string, sesiones: number, fechaIso: string) => void;
  consultorios: ConsultorioMock[];
  /** Porcentajes globales por tipo de consulta (lo que se paga al consultorio). */
  porcentajes: typeof PORCENTAJES_MOCK;
  setPorcentajeTipo: (key: keyof typeof PORCENTAJES_MOCK, value: number) => void;
  agregarConsultorio: (nombre: string) => void;
  renombrarConsultorio: (id: number, nombre: string) => void;
  eliminarConsultorio: (id: number) => void;
  precios: typeof PRECIOS_MOCK;
  setPrecio: (key: keyof typeof PRECIOS_MOCK, value: number) => void;
  /** Filtro transversal por consultorio ("Todos" = sin filtro). */
  filtroConsultorio: string;
  setFiltroConsultorio: (nombre: string) => void;
  tema: TemaMock;
  aplicarTema: (tema: TemaMock) => void;
  resetTema: () => void;
  fondos: FondoMock[];
}

const Ctx = createContext<MockStore | null>(null);

/** Blanco o casi negro según el brillo del color elegido. */
function contraste(hex: string): string {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const r = parseInt(full.slice(0, 2), 16) || 0;
  const g = parseInt(full.slice(2, 4), 16) || 0;
  const b = parseInt(full.slice(4, 6), 16) || 0;
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.62 ? "#1c1418" : "#ffffff";
}

export function MockStoreProvider({ children }: { children: ReactNode }) {
  const [pacientes, setPacientes] = useState<PacienteMock[]>(PACIENTES_MOCK);
  const [consultorios, setConsultorios] = useState<ConsultorioMock[]>(CONSULTORIOS_MOCK);
  const [precios, setPrecios] = useState(PRECIOS_MOCK);
  const [porcentajes, setPorcentajes] = useState(PORCENTAJES_MOCK);
  const [filtroConsultorio, setFiltroConsultorio] = useState("Todos");
  const [tema, setTema] = useState<TemaMock>(TEMA_DEFAULT);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--primary", tema.primary);
    root.style.setProperty("--primary-foreground", contraste(tema.primary));
    root.style.setProperty("--ring", tema.primary);
    return () => {
      root.style.removeProperty("--primary");
      root.style.removeProperty("--primary-foreground");
      root.style.removeProperty("--ring");
    };
  }, [tema.primary]);

  const value = useMemo<MockStore>(
    () => ({
      pacientes,
      registrarFactura: (nombrePaciente, sesiones, fechaIso) =>
        setPacientes((prev) =>
          prev.map((p) =>
            p.nombre.toLowerCase() === nombrePaciente.trim().toLowerCase()
              ? {
                  ...p,
                  sesionesMes: Number.isFinite(sesiones) && sesiones > 0 ? sesiones : p.sesionesMes,
                  ultimaFactura: fechaIso,
                }
              : p,
          ),
        ),
      consultorios,
      porcentajes,
      setPorcentajeTipo: (key, val) =>
        setPorcentajes((prev) => ({ ...prev, [key]: Math.min(100, Math.max(0, val)) })),
      agregarConsultorio: (nombre) =>
        setConsultorios((prev) => [
          ...prev,
          {
            id: Math.max(0, ...prev.map((c) => c.id)) + 1,
            nombre,
            facturadoParticular: 0,
            facturadoObraSocial: 0,
          },
        ]),
      renombrarConsultorio: (id, nombre) =>
        setConsultorios((prev) => prev.map((c) => (c.id === id ? { ...c, nombre } : c))),
      eliminarConsultorio: (id) => setConsultorios((prev) => prev.filter((c) => c.id !== id)),
      precios,
      setPrecio: (key, val) => setPrecios((prev) => ({ ...prev, [key]: val })),
      filtroConsultorio,
      setFiltroConsultorio,
      tema,
      aplicarTema: setTema,
      resetTema: () => setTema(TEMA_DEFAULT),
      fondos: FONDOS_MOCK,
    }),
    [pacientes, consultorios, precios, filtroConsultorio, tema],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMockStore(): MockStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useMockStore debe usarse dentro de MockStoreProvider");
  return ctx;
}
