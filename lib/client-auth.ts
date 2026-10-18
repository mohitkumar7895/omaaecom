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

export function getRandomReferralCode(): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  let result = "";
  do {
    const chars: string[] = [];
    for (let i = 0; i < 3; i++) {
      chars.push(letters.charAt(Math.floor(Math.random() * letters.length)));
    }
    for (let i = 0; i < 3; i++) {
      chars.push(digits.charAt(Math.floor(Math.random() * digits.length)));
    }
    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    result = chars.join("");
  } while (/^[A-Z]{3}[0-9]{3}$/.test(result) || /^[0-9]{3}[A-Z]{3}$/.test(result));
  return result;
}

const DEFAULT_CODE = "O226SC";

export function getActiveReferralCode(): string {
  if (typeof window === "undefined") return DEFAULT_CODE;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) {
      const u = JSON.parse(raw);
      if (u?.referral_code && !u.referral_code.startsWith("OC") && u.referral_code !== "UKP250" && u.referral_code.length === 6) {
        localStorage.setItem("omaa_active_ref", u.referral_code);
        return u.referral_code;
      }
    }
    const cached = localStorage.getItem("omaa_active_ref");
    if (cached && !cached.startsWith("OC") && cached !== "UKP250" && cached.length === 6) {
      return cached;
    }
    localStorage.setItem("omaa_active_ref", DEFAULT_CODE);
    return DEFAULT_CODE;
  } catch (e) {
    return DEFAULT_CODE;
  }
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.referral_code && (parsed.referral_code.startsWith("OC") || parsed.referral_code === "UKP250" || parsed.referral_code.length !== 6)) {
      parsed.referral_code = DEFAULT_CODE;
      parsed.referral_link = `https://omaacompany.com/wallet?ref=${DEFAULT_CODE}`;
      try {
        localStorage.setItem(USER_KEY, JSON.stringify(parsed));
      } catch (e) {}
    }
    return parsed;
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
    if (user?.referral_code && !user.referral_code.startsWith("OC") && user.referral_code.length === 6) {
      localStorage.setItem("omaa_active_ref", user.referral_code);
    }
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
