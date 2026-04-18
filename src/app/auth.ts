export const DASHBOARD_AUTH_KEY = "safe-moovment-dashboard-auth";

export function isDashboardAuthenticated(): boolean {
  return window.localStorage.getItem(DASHBOARD_AUTH_KEY) === "true";
}

export function setDashboardAuthenticated(): void {
  window.localStorage.setItem(DASHBOARD_AUTH_KEY, "true");
}

export function clearDashboardAuthenticated(): void {
  window.localStorage.removeItem(DASHBOARD_AUTH_KEY);
}
