export const GTM_ID = "GTM-KD74XP4D";

export interface GtmCartItem {
  id?: string | number;
  title?: string;
  name?: string;
  category?: string;
  category_name?: string;
  price?: number | string;
  selling_price?: number | string;
  final_price?: number | string;
  quantity?: number | string;
}

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function pushToDataLayer(payload: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}

/**
 * Track website phone-number clicks (tel: links) for GTM & Google Ads conversion tracking
 */
export function trackPhoneClick({
  phoneNumber,
  linkText,
  pagePath,
}: {
  phoneNumber: string;
  linkText?: string;
  pagePath?: string;
}) {
  const path = pagePath || (typeof window !== "undefined" ? window.location.pathname : "/");

  pushToDataLayer({
    event: "phone_call_click",
    event_category: "conversion",
    event_label: phoneNumber,
    phone_number: phoneNumber,
    click_text: linkText || "",
    page_path: path,
  });

  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", "phone_call_click", {
      event_category: "engagement",
      event_label: phoneNumber,
      phone_number: phoneNumber,
      page_path: path,
    });
  }
}

/**
 * Track service booking submissions for GTM & Google Ads conversion tracking
 */
export function trackServiceBooking({
  orderId,
  value,
  paymentMethod,
  items = [],
}: {
  orderId: string;
  value: number;
  paymentMethod?: string;
  items?: GtmCartItem[];
}) {
  const normalizedValue = Number(value) || 0;
  const formattedItems = items.map((item) => ({
    item_id: String(item.id || ""),
    item_name: item.title || item.name || "",
    item_category: item.category || item.category_name || "",
    price: Number(item.selling_price ?? item.price ?? item.final_price ?? 0),
    quantity: Number(item.quantity || 1),
  }));

  pushToDataLayer({
    event: "service_booking_submitted",
    event_category: "conversion",
    transaction_id: orderId,
    value: normalizedValue,
    currency: "INR",
    payment_method: paymentMethod || "cod",
    service_names: items.map((i) => i.title).filter(Boolean).join(", "),
    items: formattedItems,
  });

  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", "purchase", {
      transaction_id: orderId,
      value: normalizedValue,
      currency: "INR",
      items: formattedItems,
    });
  }
}

/**
 * Track contact / service inquiry form submissions
 */
export function trackContactSubmission(subject?: string) {
  const path = typeof window !== "undefined" ? window.location.pathname : "/";

  pushToDataLayer({
    event: "contact_form_submitted",
    event_category: "conversion",
    event_label: subject || "Contact Inquiry",
    page_path: path,
  });

  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", "generate_lead", {
      event_category: "engagement",
      event_label: subject || "Contact Inquiry",
      page_path: path,
    });
  }
}
