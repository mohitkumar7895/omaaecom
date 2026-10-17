export interface AuthUser {
  uid?: string;
  email: string;
  name?: string;
  referral_code?: string;
  referral_link?: string;
  [key: string]: any;
}

const USER_KEY = "omaa_user";
const TOKEN_KEY = "omaa_auth_token";

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch (e) {
    return null;
  }
}

export function isLoggedIn(): boolean {
  const user = getStoredUser();
  const token = getStoredToken();
  return Boolean((user && (user.email || user.uid)) || token);
}

export function saveStoredUser(user: AuthUser, token?: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
  } catch (e) {
    console.error("Failed to save auth to localStorage", e);
  }
}

export function persistLogin(user: AuthUser, token?: string) {
  saveStoredUser(user, token);
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("auth_changed", { detail: { user } }));
}

export function clearStoredUser() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem("omaa_user_cache");
  } catch (e) {}
}

export async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = getStoredToken();
  const headers = new Headers(init?.headers || {});
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(input, {
    ...init,
    headers,
    credentials: "include",
  });
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  try {
    const res = await authFetch("/api/auth/me");
    if (res.ok) {
      const data = await res.json();
      if (data.user) {
        saveStoredUser(data.user, data.token || getStoredToken() || undefined);
        return data.user;
      }
    }
  } catch (err) {
    console.warn("Failed to fetch fresh user from /api/auth/me", err);
  }
  // Return local stored user on error/timeout to avoid premature logout
  return getStoredUser();
}
