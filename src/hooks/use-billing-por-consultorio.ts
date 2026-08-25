import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface BillingPorConsultorio {
  consultorio: string;
  particular_sessions: number;
  obra_social_sessions: number;
  particular_amount: number;
  obra_social_amount: number;
  total: number;
  total_bruto: number;
  a_favor: number;
  particular_pct: number;
  obra_social_pct: number;
}

export interface BillingPorConsultorioResponse {
  year: number;
  month: number;
  consultorios: BillingPorConsultorio[];
  total_a_pagar: number;
  total_bruto: number;
  a_favor: number;
}

export function useBillingPorConsultorio(
  year: number,
  month: number,
  consultorio?: string,
) {
  return useQuery<BillingPorConsultorioResponse>({
    queryKey: ["billing-por-consultorio", year, month, consultorio ?? "all"],
    queryFn: () => {
      const params = new URLSearchParams({
        year: String(year),
        month: String(month + 1),
      });
      if (consultorio) params.set("consultorio", consultorio);
      return api.get<BillingPorConsultorioResponse>(
        `/billing/por-consultorio?${params.toString()}`,
      );
    },
    staleTime: 60_000,
  });
}
