import pool from "./db";

export const ADMIN_PAGE_SIZE = 50;

export function parsePage(raw?: string | string[]) {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const n = Number(value);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

function searchFragment(q?: string) {
  const term = (q || "").trim();
  if (!term) return { sql: "", params: [] as string[] };
  const like = `%${term}%`;
  return {
    sql: `(order_id LIKE ? OR customer_name LIKE ? OR mobile LIKE ? OR CAST(id AS CHAR) LIKE ?)`,
    params: [like, like, like, like],
  };
}

export function parseServices(row: any) {
  let parsedServices = row.services;
  try {
    if (typeof row.services === "string") {
      parsedServices = JSON.parse(row.services);
    }
  } catch {}
  return { ...row, services: parsedServices };
}

export async function pagedBookings({
  where,
  params = [],
  page,
  q,
  orderBy = "created_at DESC",
}: {
  where: string;
  params?: any[];
  page: number;
  q?: string;
  orderBy?: string;
}) {
  const search = searchFragment(q);
  const parts = [where, search.sql].filter(Boolean);
  const whereClause = parts.length ? `WHERE ${parts.join(" AND ")}` : "";
  const queryParams = [...params, ...search.params];
  const offset = (Math.max(page, 1) - 1) * ADMIN_PAGE_SIZE;
  const limit = ADMIN_PAGE_SIZE;

  const [countRes, rowsRes] = await Promise.all([
    pool.query(`SELECT COUNT(*) as count FROM bookings ${whereClause}`, queryParams),
    pool.query(
      `SELECT * FROM bookings ${whereClause} ORDER BY ${orderBy} LIMIT ${limit} OFFSET ${offset}`,
      queryParams
    ),
  ]);

  const total = Number((countRes[0] as any)[0]?.count || 0);
  const rows = ((rowsRes[0] as any[]) || []).map(parseServices);
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));

  return { rows, total, page: Math.min(Math.max(page, 1), totalPages), totalPages };
}

export function listHref(path: string, page: number, extra?: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  Object.entries(extra || {}).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}
