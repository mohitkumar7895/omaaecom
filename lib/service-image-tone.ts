export function isPremiumServiceCategory(title?: string, type?: string): boolean {
  const blob = `${title || ""} ${type || ""}`.toLowerCase();
  return (
    blob.includes("amc") ||
    blob.includes("ac repair") ||
    blob.includes("air conditioner") ||
    blob.includes("refrigerator") ||
    blob.includes("fridge") ||
    blob.includes("microwave") ||
    blob.includes("water purifier") ||
    blob.includes("product") ||
    blob.includes("new product")
  );
}

export function isRoAmcCategory(title?: string, type?: string): boolean {
  return isPremiumServiceCategory(title, type);
}
