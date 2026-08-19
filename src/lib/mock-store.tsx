import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import {
  CONSULTORIOS_MOCK,
  PACIENTES_MOCK,
  PRECIOS_MOCK,
  type ConsultorioMock,
  type PacienteMock,
} from "@/lib/mock-data";

interface MockStore {
  pacientes: PacienteMock[];
  registrarFactura: (nombrePaciente: string, sesiones: number, fechaIso: string) => void;
  consultorios: ConsultorioMock[];
  setPorcentaje: (id: number, porcentaje: number) => void;
  agregarConsultorio: (nombre: string) => void;
  renombrarConsultorio: (id: number, nombre: string) => void;
  eliminarConsultorio: (id: number) => void;
  precios: typeof PRECIOS_MOCK;
  setPrecio: (key: keyof typeof PRECIOS_MOCK, value: number) => void;
}

const Ctx = createContext<MockStore | null>(null);

export function MockStoreProvider({ children }: { children: ReactNode }) {
  const [pacientes, setPacientes] = useState<PacienteMock[]>(PACIENTES_MOCK);
  const [consultorios, setConsultorios] = useState<ConsultorioMock[]>(CONSULTORIOS_MOCK);
  const [precios, setPrecios] = useState(PRECIOS_MOCK);

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
      setPorcentaje: (id, porcentaje) =>
        setConsultorios((prev) =>
          prev.map((c) =>
            c.id === id ? { ...c, porcentaje: Math.min(100, Math.max(0, porcentaje)) } : c,
          ),
        ),
      agregarConsultorio: (nombre) =>
        setConsultorios((prev) => [
          ...prev,
          {
            id: Math.max(0, ...prev.map((c) => c.id)) + 1,
            nombre,
            porcentaje: 40,
            totalFacturado: 0,
          },
        ]),
      renombrarConsultorio: (id, nombre) =>
        setConsultorios((prev) => prev.map((c) => (c.id === id ? { ...c, nombre } : c))),
      eliminarConsultorio: (id) => setConsultorios((prev) => prev.filter((c) => c.id !== id)),
      precios,
      setPrecio: (key, val) => setPrecios((prev) => ({ ...prev, [key]: val })),
    }),
    [pacientes, consultorios, precios],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMockStore(): MockStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useMockStore debe usarse dentro de MockStoreProvider");
  return ctx;
}
