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

  // Fast extraction of data:mime;base64,data
  if (trimmed.startsWith("data:")) {
    try {
      const commaIdx = trimmed.indexOf(",");
      if (commaIdx !== -1) {
        const header = trimmed.substring(0, commaIdx);
        const base64Data = trimmed.substring(commaIdx + 1);
        const mimeMatch = header.match(/^data:([^;]+);base64/);
        const mimeType = mimeMatch ? mimeMatch[1] : "image/png";
        const buffer = Buffer.from(base64Data, "base64");
        return new Response(buffer, {
          headers: {
            "Content-Type": mimeType,
            "Content-Length": String(buffer.byteLength),
            "Cache-Control": cache,
          },
        });
      }
    } catch (e) {
      console.error("Failed to parse base64 media:", e);
    }

    if (requestUrl) {
      return Response.redirect(new URL("/banners/desktop-banner-1.png", requestUrl).toString(), 302);
    }
    return new Response("Not found", { status: 404 });
  }

  return new Response("Not found", { status: 404 });
}
