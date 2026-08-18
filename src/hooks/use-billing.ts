import { useQuery } from "@tanstack/react-query";
import { api, type MonthlyBillingResponse } from "@/lib/api";

export function useBilling(year: number, month: number) {
  return useQuery<MonthlyBillingResponse>({
    queryKey: ["billing", year, month],
    queryFn: () =>
      api.get<MonthlyBillingResponse>(`/billing/total?year=${year}&month=${month + 1}`),
    staleTime: 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
