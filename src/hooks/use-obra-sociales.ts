import { useQuery } from "@tanstack/react-query";

import { api, type ObraSocial } from "@/lib/api";

export function useObraSociales() {
  return useQuery({
    queryKey: ["obra-social"],
    queryFn: () => api.get<ObraSocial[]>("/obra-social/"),
  });
}
