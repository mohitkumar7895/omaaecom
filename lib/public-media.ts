export function publicAssetUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith("data:")) return "";
  if (trimmed.length > 2048) return "";
  return trimmed;
}

export const PUBLIC_IMAGE_SQL = `CASE WHEN image_url IS NULL OR image_url LIKE 'data:%' OR CHAR_LENGTH(image_url) > 2048 THEN NULL ELSE image_url END AS image_url`;
