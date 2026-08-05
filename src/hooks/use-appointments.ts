import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, type Appointment, type AppointmentCreate } from "@/lib/api";

export function useAppointments() {
  return useQuery({
    queryKey: ["appointments"],
    queryFn: () => api.get<Appointment[]>("/appointments/?limit=1000"),
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AppointmentCreate) => api.post<Appointment>("/appointments/", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appointments"] }),
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: AppointmentCreate & { id: number }) =>
      api.put<Appointment>(`/appointments/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appointments"] }),
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/appointments/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appointments"] }),
  });
}
