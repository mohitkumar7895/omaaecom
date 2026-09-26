export function publicAssetUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith("data:")) return "";
  if (trimmed.length > 2048) return "";
  return trimmed;
}

export function mediaResponseFromStored(value: unknown, requestUrl?: string): Response {
  if (typeof value !== "string" || !value.trim()) {
    return new Response("Not found", { status: 404 });
  }
  const trimmed = value.trim();
  const cache = "public, max-age=86400, stale-while-revalidate=604800";

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return Response.redirect(trimmed, 302);
  }

  if (trimmed.startsWith("/") && requestUrl) {
    return Response.redirect(new URL(trimmed, requestUrl).toString(), 302);
  }

  const match = trimmed.match(/^data:([^;]+);base64,([\s\S]+)$/);
  if (match) {
    const body = Buffer.from(match[2], "base64");
    return new Response(body, {
      headers: {
        "Content-Type": match[1] || "image/jpeg",
        "Cache-Control": cache,
      },
    });
  }

  return new Response("Not found", { status: 404 });
}
