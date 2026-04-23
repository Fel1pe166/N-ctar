import { setAuthTokenGetter } from "@workspace/api-client-react";

const STORAGE_KEY = "nectar-admin-token";

export function getAdminToken(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage.getItem(STORAGE_KEY);
}

export function setAdminToken(token: string): void {
  sessionStorage.setItem(STORAGE_KEY, token);
}

export function clearAdminToken(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function registerAdminTokenGetter(): void {
  setAuthTokenGetter(() => getAdminToken());
}
