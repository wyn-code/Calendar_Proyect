import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface PreciosResponse {
  particular: number;
  obra_social: number;
  discapacidad: number;
}

export interface PorcentajesResponse {
  particular: number;
  obra_social: number;
}

export function usePrecios() {
  return useQuery<PreciosResponse>({
    queryKey: ["precios"],
    queryFn: () => api.get<PreciosResponse>("/config/precios"),
  });
}

export function useSetPrecio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ clave, valor }: { clave: string; valor: number }) =>
      api.put(`/config/precios/${clave}`, { valor }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["precios"] }),
  });
}

export function usePorcentajes() {
  return useQuery<PorcentajesResponse>({
    queryKey: ["porcentajes"],
    queryFn: () => api.get<PorcentajesResponse>("/config/porcentajes"),
  });
}

export function useSetPorcentaje() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ clave, valor }: { clave: string; valor: number }) =>
      api.put(`/config/porcentajes/${clave}`, { valor }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["porcentajes"] }),
  });
}
