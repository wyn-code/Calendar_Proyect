import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, type Patient, type PatientCreate, type PatientUpdate } from "@/lib/api";

export function usePatients() {
  return useQuery<Patient[]>({
    queryKey: ["patients"],
    queryFn: () => api.get<Patient[]>("/patients/?limit=1000"),
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PatientCreate) => api.post<Patient>("/patients/", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["patients"] }),
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PatientUpdate }) =>
      api.put<Patient>(`/patients/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["patients"] }),
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/patients/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["patients"] }),
  });
}
