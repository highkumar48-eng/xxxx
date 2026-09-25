import { cookies } from "next/headers";
import { COOKIE } from "@/lib/auth";
import { authorized, fail } from "@/lib/api";
export async function POST(request) {
  if (!(await authorized(request))) return fail("Unauthorized", 401);
  (await cookies()).delete(COOKIE);
  return Response.json({ ok: true });
}
