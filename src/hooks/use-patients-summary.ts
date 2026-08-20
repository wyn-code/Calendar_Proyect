import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface PatientSummary {
  patient_id: number;
  sesiones_mes: number;
  ultima_factura: string | null;
}

export function usePatientsSummary(year?: number, month?: number) {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = month ?? now.getMonth() + 1;
  return useQuery<PatientSummary[]>({
    queryKey: ["patients-summary", y, m],
    queryFn: () => api.get<PatientSummary[]>(`/patients/summary?year=${y}&month=${m}`),
    staleTime: 60_000,
  });
}
