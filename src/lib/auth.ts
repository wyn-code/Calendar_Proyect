import { api } from "./api";

export interface User {
  id: number;
  email: string;
  nombre: string;
  activo: boolean;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type?: string;
  user: User;
}

export interface Session {
  token: string;
  user: User;
}

const STORAGE_KEY = "turnos-sesion";

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Session>;
    if (typeof parsed?.token !== "string" || !parsed?.user) return null;
    return parsed as Session;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  return getSession()?.token ?? null;
}

export function setSession(session: Session): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export async function login(
  email: string,
  password: string,
  rememberMe: boolean,
): Promise<Session> {
  const response = await api.post<LoginResponse>("/auth/login", {
    email,
    password,
    remember_me: rememberMe,
  });
  const session: Session = { token: response.access_token, user: response.user };
  setSession(session);
  return session;
}
