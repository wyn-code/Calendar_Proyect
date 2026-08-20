import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Consultorio {
  id: number;
  nombre: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConsultorioCreate {
  nombre: string;
}

export interface ConsultorioUpdate {
  nombre?: string;
}

export function useConsultorios() {
  return useQuery<Consultorio[]>({
    queryKey: ["consultorios"],
    queryFn: () => api.get<Consultorio[]>("/consultorios/?limit=100"),
  });
}

export function useCreateConsultorio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ConsultorioCreate) => api.post<Consultorio>("/consultorios/", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["consultorios"] }),
  });
}

export function useUpdateConsultorio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ConsultorioUpdate }) =>
      api.put<Consultorio>(`/consultorios/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["consultorios"] }),
  });
}

export function useDeleteConsultorio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/consultorios/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["consultorios"] }),
  });
}
