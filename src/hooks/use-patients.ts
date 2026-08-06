import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, type Patient, type PatientCreate } from "@/lib/api";

export function usePatients() {
  return useQuery({
    queryKey: ["patients"],
    queryFn: () => api.get<Patient[]>("/patients/?limit=1000"),
  });
}

export function usePatientSearch(search: string, enabled: boolean) {
  const trimmed = search.trim();
  return useQuery({
    queryKey: ["patients", "search", trimmed],
    queryFn: () => api.get<Patient[]>(`/patients/?search=${encodeURIComponent(trimmed)}`),
    enabled: enabled && trimmed.length >= 2,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PatientCreate) => api.post<Patient>("/patients/", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["patients"] }),
  });
}
