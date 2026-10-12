import { cookies } from "next/headers";

export async function getAuthToken(req?: Request): Promise<string | null> {
  // 1. Try Authorization header if req is provided
  if (req) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const bearer = authHeader.substring(7).trim();
      if (bearer) return bearer;
    }
  }

  // 2. Try cookie
  try {
    const cookieStore = await cookies();
    const cookieVal = cookieStore.get("omaa_auth_token")?.value;
    if (cookieVal) return cookieVal;
  } catch (e) {
    // Cookie store may fail in non-request contexts
  }

  return null;
}
