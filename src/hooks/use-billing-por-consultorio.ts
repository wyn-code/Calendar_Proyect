import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface BillingPorConsultorio {
  consultorio: string;
  particular_sessions: number;
  obra_social_sessions: number;
  particular_amount: number;
  obra_social_amount: number;
  total: number;
}

export interface BillingPorConsultorioResponse {
  year: number;
  month: number;
  consultorios: BillingPorConsultorio[];
  total_a_pagar: number;
  a_favor: number;
}

export function useBillingPorConsultorio(year: number, month: number) {
  return useQuery<BillingPorConsultorioResponse>({
    queryKey: ["billing-por-consultorio", year, month],
    queryFn: () =>
      api.get<BillingPorConsultorioResponse>(
        `/billing/por-consultorio?year=${year}&month=${month + 1}`,
      ),
    staleTime: 60_000,
  });
}
