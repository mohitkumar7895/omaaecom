export const CANONICAL_SITE_URL = "https://omaacompany.com";

export function getSiteUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_BASE_URL || CANONICAL_SITE_URL).trim().replace(/\/$/, "");
  return raw.replace(/^https?:\/\/www\.omaacompany\.com/i, CANONICAL_SITE_URL);
}

export function toCanonicalUrl(url: string): string {
  return url
    .trim()
    .replace(/^https?:\/\/www\.omaacompany\.com/i, CANONICAL_SITE_URL)
    .replace(/\/$/, "");
}
