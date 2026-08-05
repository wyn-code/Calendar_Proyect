import { API_V1_PREFIX, getApiBaseUrl } from "./config";

export interface ObraSocial {
  id: number;
  nombre: string;
}

export interface Patient {
  id: number;
  nombre_completo: string;
  telefono: string | null;
  obra_social_id: number | null;
  observaciones: string | null;
}

export interface PatientCreate {
  nombre_completo: string;
  telefono: string | null;
  obra_social_id: number | null;
  observaciones: string | null;
}

export interface Appointment {
  id: number;
  patient_id: number;
  obra_social_id: number | null;
  fecha: string;
  hora_inicio: string;
  tipo_consulta: string;
  observaciones: string | null;
}

export interface AppointmentCreate {
  patient_id: number;
  obra_social_id: number | null;
  fecha: string;
  hora_inicio: string;
  tipo_consulta: string;
  observaciones: string | null;
}

function authToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("turnos-sesion");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { token?: unknown };
    return typeof parsed?.token === "string" ? parsed.token : null;
  } catch {
    return null;
  }
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const token = authToken();
  const response = await fetch(`${getApiBaseUrl()}${API_V1_PREFIX}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...init,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = body?.detail;
    let message = `HTTP ${response.status}`;
    if (typeof detail === "string") {
      message = detail;
    } else if (Array.isArray(detail)) {
      message = detail
        .map((d: { msg?: unknown }) => (typeof d?.msg === "string" ? d.msg : ""))
        .filter(Boolean)
        .join(", ");
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T = void>(path: string) => request<T>(path, { method: "DELETE" }),
};
