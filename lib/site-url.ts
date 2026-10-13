export const CANONICAL_SITE_URL = "https://omaacompany.com";
const CANONICAL_HOST = "omaacompany.com";

function stripTrailingSlash(path: string): string {
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

export function getSiteUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_BASE_URL || CANONICAL_SITE_URL).trim();
  try {
    const parsed = new URL(raw.includes("://") ? raw : `https://${raw}`);
    const host = parsed.hostname.replace(/^www\./i, "").toLowerCase();
    if (host === CANONICAL_HOST) return CANONICAL_SITE_URL;
    parsed.protocol = "https:";
    return `${parsed.protocol}//${parsed.host}`.replace(/\/$/, "");
  } catch {
    return CANONICAL_SITE_URL;
  }
}

export function toCanonicalUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return getSiteUrl();
  try {
    const base = getSiteUrl();
    const parsed = new URL(trimmed.startsWith("http") ? trimmed : `${base}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`);
    if (parsed.hostname.replace(/^www\./i, "").toLowerCase() === CANONICAL_HOST) {
      parsed.protocol = "https:";
      parsed.hostname = CANONICAL_HOST;
      parsed.hash = "";
      const path = stripTrailingSlash(parsed.pathname);
      return `${CANONICAL_SITE_URL}${path === "/" ? "" : path}${parsed.search}`;
    }
    return stripTrailingSlash(parsed.toString());
  } catch {
    return trimmed.replace(/\/$/, "");
  }
}

export function toApexAssetUrl(url: string): string {
  return url.replace(/^https?:\/\/www\.omaacompany\.com/i, CANONICAL_SITE_URL);
}
