export const DASHBOARD_AUTH_KEY = "safe-moovment-dashboard-auth";
const DASHBOARD_USERS_KEY = "safe-moovment-dashboard-users";

type DashboardUsers = Record<string, string>;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function getDashboardUsers(): DashboardUsers {
  const rawUsers = window.localStorage.getItem(DASHBOARD_USERS_KEY);

  if (!rawUsers) {
    return {};
  }

  try {
    const parsedUsers = JSON.parse(rawUsers) as DashboardUsers;
    if (parsedUsers && typeof parsedUsers === "object") {
      return parsedUsers;
    }
    return {};
  } catch {
    return {};
  }
}

function saveDashboardUsers(users: DashboardUsers): void {
  window.localStorage.setItem(DASHBOARD_USERS_KEY, JSON.stringify(users));
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

export function dashboardUserExists(email: string): boolean {
  const users = getDashboardUsers();
  const normalizedEmail = normalizeEmail(email);
  return Boolean(users[normalizedEmail]);
}

export function registerDashboardUser(email: string, password: string): boolean {
  const users = getDashboardUsers();
  const normalizedEmail = normalizeEmail(email);

  if (users[normalizedEmail]) {
    return false;
  }

  users[normalizedEmail] = password;
  saveDashboardUsers(users);
  return true;
}

export function validateDashboardCredentials(email: string, password: string): boolean {
  const users = getDashboardUsers();
  const normalizedEmail = normalizeEmail(email);
  return users[normalizedEmail] === password;
}

export function updateDashboardPassword(email: string, password: string): boolean {
  const users = getDashboardUsers();
  const normalizedEmail = normalizeEmail(email);

  if (!users[normalizedEmail]) {
    return false;
  }

  users[normalizedEmail] = password;
  saveDashboardUsers(users);
  return true;
}
