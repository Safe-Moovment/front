export const DASHBOARD_AUTH_KEY = "safe-moovment-dashboard-auth";
const DEFAULT_API_BASE_URL = "http://localhost:3000";

type ApiResponse = {
  message?: string;
  email?: string;
  verified?: boolean;
};

type RequestOptions = {
  email: string;
  code?: string;
  password?: string;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function getApiBaseUrl(): string {
  return (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || DEFAULT_API_BASE_URL;
}

async function requestJson(path: string, body: Record<string, string>): Promise<ApiResponse> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const rawText = await response.text();
  let payload: ApiResponse = {};

  if (rawText) {
    try {
      payload = JSON.parse(rawText) as ApiResponse;
    } catch {
      payload = { message: rawText };
    }
  }

  if (!response.ok) {
    const errorMessage = payload.message || "No se pudo completar la solicitud.";
    throw new Error(errorMessage);
  }

  return payload;
}

export function isDashboardAuthenticated(): boolean {
  return window.localStorage.getItem(DASHBOARD_AUTH_KEY) === "true";
}

export function setDashboardAuthenticated(): void {
  window.localStorage.setItem(DASHBOARD_AUTH_KEY, "true");
}

export function clearDashboardAuthenticated(): void {
  window.localStorage.removeItem(DASHBOARD_AUTH_KEY);
}

export async function isBackendReachable(timeoutMs = 3000): Promise<boolean> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${getApiBaseUrl()}/`, {
      method: "GET",
      signal: controller.signal,
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function requestRegistrationCode(email: string): Promise<string> {
  const payload = await requestJson("/auth/register/start", { email: normalizeEmail(email) });
  return payload.message || "Codigo enviado al correo.";
}

export async function verifyRegistrationCode(email: string, code: string): Promise<string> {
  const payload = await requestJson("/auth/register/verify", { email: normalizeEmail(email), code: code.trim() });
  return payload.message || "Correo verificado.";
}

export async function completeRegistration(email: string, password: string): Promise<string> {
  const payload = await requestJson("/auth/register/complete", {
    email: normalizeEmail(email),
    password,
  });
  return payload.message || "Cuenta creada correctamente.";
}

export async function loginDashboardUser(email: string, password: string): Promise<string> {
  const payload = await requestJson("/auth/login", {
    email: normalizeEmail(email),
    password,
  });
  return payload.message || "Autenticacion correcta.";
}

export async function requestResetCode(email: string): Promise<string> {
  const payload = await requestJson("/auth/reset/request", { email: normalizeEmail(email) });
  return payload.message || "Codigo enviado al correo.";
}

export async function confirmResetPassword(email: string, code: string, password: string): Promise<string> {
  const payload = await requestJson("/auth/reset/confirm", {
    email: normalizeEmail(email),
    code: code.trim(),
    password,
  });
  return payload.message || "Contrasena actualizada correctamente.";
}
