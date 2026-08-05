export const API_V1_PREFIX: string = "/api/v1";

const DEFAULT_API_URL = "http://127.0.0.1:8000";

/**
 * Base URL de la API.
 * - `VITE_API_URL` (si está definida) siempre gana.
 * - En dev, el cliente usa la misma origin y Vite proxea `/api` al backend
 *   (evita errores de CORS). En SSR dev usamos la URL absoluta.
 * - En producción (build), se usa la URL absoluta por defecto.
 */
export function getApiBaseUrl(): string {
  const envUrl: string | undefined = import.meta.env["VITE_API_URL"];
  if (envUrl) return envUrl;
  if (typeof window === "undefined") return DEFAULT_API_URL;
  if (import.meta.env.DEV) return "";
  return DEFAULT_API_URL;
}
