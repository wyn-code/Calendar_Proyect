import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface FacturaCreate {
  paciente_nombre: string;
  consultorio: string;
  dni?: string;
  obra_social?: string;
  nro_afiliado?: string;
  periodo?: string;
  fecha_emision?: string;
  nro_factura?: string;
  sesiones: number;
  monto: number;
  porcentaje?: number;
  fecha_pago?: string;
}

export interface FacturaResponse extends FacturaCreate {
  id: number;
  created_at: string;
}

export function useCreateFactura() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: FacturaCreate) => api.post<FacturaResponse>("/facturas/", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["facturas"] }),
  });
}
