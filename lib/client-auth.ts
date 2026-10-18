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

export function getDeterministicReferralCode(email: string): string {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // 24 letters
  const digits = "23456789";                  // 8 digits

  if (email && typeof email === "string" && email.trim().length > 0) {
    const normalized = email.trim().toLowerCase();
    let hash1 = 2166136261;
    let hash2 = 5381;
    for (let i = 0; i < normalized.length; i++) {
      const code = normalized.charCodeAt(i);
      hash1 ^= code;
      hash1 = Math.imul(hash1, 16777619);
      hash2 = (Math.imul(hash2, 33) + code) >>> 0;
    }
    hash1 = hash1 >>> 0;
    hash2 = hash2 >>> 0;

    const l1 = letters[hash1 % letters.length];
    const l2 = letters[Math.floor(hash1 / letters.length) % letters.length];
    const l3 = letters[Math.floor(hash1 / (letters.length * letters.length)) % letters.length];

    const d1 = digits[hash2 % digits.length];
    const d2 = digits[Math.floor(hash2 / digits.length) % digits.length];
    const d3 = digits[Math.floor(hash2 / (digits.length * digits.length)) % digits.length];

    return `${l1}${d1}${l2}${d2}${l3}${d3}`;
  }
  return DEFAULT_CODE;
}

export function getRandomReferralCode(email?: string): string {
  if (email) return getDeterministicReferralCode(email);
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

export function getActiveReferralCode(userEmail?: string): string {
  if (typeof window === "undefined") return userEmail ? getDeterministicReferralCode(userEmail) : DEFAULT_CODE;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) {
      const u = JSON.parse(raw);
      if (u?.referral_code && !u.referral_code.startsWith("OC") && u.referral_code !== "UKP250" && u.referral_code.length === 6) {
        localStorage.setItem("omaa_active_ref", u.referral_code);
        return u.referral_code;
      }
      if (u?.email) {
        const code = getDeterministicReferralCode(u.email);
        localStorage.setItem("omaa_active_ref", code);
        return code;
      }
    }
    if (userEmail) {
      const code = getDeterministicReferralCode(userEmail);
      localStorage.setItem("omaa_active_ref", code);
      return code;
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
    if (parsed && (!parsed.referral_code || parsed.referral_code.startsWith("OC") || parsed.referral_code === "UKP250" || parsed.referral_code.length !== 6)) {
      if (parsed.email) {
        parsed.referral_code = getDeterministicReferralCode(parsed.email);
      } else {
        parsed.referral_code = DEFAULT_CODE;
      }
      parsed.referral_link = `https://omaacompany.com/?ref=${parsed.referral_code}`;
      try {
        localStorage.setItem(USER_KEY, JSON.stringify(parsed));
        localStorage.setItem("omaa_active_ref", parsed.referral_code);
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
    if (!user.referral_code && user.email) {
      user.referral_code = getDeterministicReferralCode(user.email);
      user.referral_link = `https://omaacompany.com/?ref=${user.referral_code}`;
    }
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
