import { toApexAssetUrl } from "@/lib/site-url";

export function publicAssetUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith("data:")) return "";
  if (trimmed.length > 2048) return "";
  return toApexAssetUrl(trimmed);
}

export function mediaResponseFromStored(value: unknown, requestUrl?: string): Response {
  if (typeof value !== "string" || !value.trim()) {
    return new Response("Not found", { status: 404 });
  }
  const trimmed = value.trim();
  const cache = "public, max-age=86400, stale-while-revalidate=604800";

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return Response.redirect(toApexAssetUrl(trimmed), 302);
  }

  if (trimmed.startsWith("/") && requestUrl) {
    return Response.redirect(new URL(trimmed, requestUrl).toString(), 302);
  }

  // Never stream DB base64 through Vercel functions (each banner is ~2.5MB origin transfer).
  if (trimmed.startsWith("data:")) {
    try {
      const match = trimmed.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        const mimeType = match[1];
        const base64Data = match[2];
        const buffer = Buffer.from(base64Data, "base64");
        return new Response(buffer, {
          headers: {
            "Content-Type": mimeType,
            "Cache-Control": cache,
          },
        });
      }
    } catch (e) {
      // ignore parsing error and fallback
    }

    if (requestUrl) {
      return Response.redirect(new URL("/Hero1.webp", requestUrl).toString(), 302);
    }
    return new Response("Not found", { status: 404 });
  }

  return new Response("Not found", { status: 404 });
}
