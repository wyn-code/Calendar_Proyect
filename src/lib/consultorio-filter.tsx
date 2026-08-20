import { createContext, useContext, useState, type ReactNode } from "react";

interface Ctx {
  filtroConsultorio: string;
  setFiltroConsultorio: (v: string) => void;
}

const ConsultorioFilterCtx = createContext<Ctx>({
  filtroConsultorio: "Todos",
  setFiltroConsultorio: () => {},
});

export function ConsultorioFilterProvider({ children }: { children: ReactNode }) {
  const [filtro, setFiltro] = useState("Todos");
  return (
    <ConsultorioFilterCtx.Provider
      value={{ filtroConsultorio: filtro, setFiltroConsultorio: setFiltro }}
    >
      {children}
    </ConsultorioFilterCtx.Provider>
  );
}

export function useConsultorioFiltro() {
  return useContext(ConsultorioFilterCtx);
}
