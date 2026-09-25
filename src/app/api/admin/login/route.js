import { timingSafeEqual, createHash } from "node:crypto";
import { cookies } from "next/headers";
import { COOKIE, signToken } from "@/lib/auth";
import { fail, handle } from "@/lib/api";
import { serverClient, configured } from "@/lib/supabase-server";
export async function POST(request) {
  return handle(async () => {
    const origin = request.headers.get("origin");
    if (
      !origin ||
      origin !== new URL(process.env.NEXT_PUBLIC_APP_URL || request.url).origin
    )
      return fail("Invalid origin", 403);
    if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_JWT_SECRET)
      return fail(
        "Admin access is not configured. Set ADMIN_PASSWORD and ADMIN_JWT_SECRET in .env.local.",
        503,
      );
    if (!configured())
      return fail("Connect Supabase and run setup before signing in.", 503);
    const forwarded = process.env.VERCEL
      ? request.headers.get("x-vercel-forwarded-for")
      : "local";
    const key = createHash("sha256")
      .update((forwarded || "unknown").split(",")[0])
      .digest("hex");
    const { data: allowed, error } = await serverClient(true).rpc(
      "consume_login_attempt",
      { client_key: key },
    );
    if (error) throw error;
    if (!allowed)
      return fail("Too many attempts. Try again in 15 minutes.", 429);
    const body = await request.json();
    if (typeof body.password !== "string" || body.password.length > 256)
      return fail("Incorrect password", 401);
    const digest = (s) => createHash("sha256").update(s).digest();
    if (
      !timingSafeEqual(
        digest(body.password),
        digest(process.env.ADMIN_PASSWORD),
      )
    )
      return fail("Incorrect password", 401);
    (await cookies()).set(COOKIE, await signToken({ role: "admin" }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 28800,
    });
    return Response.json({ ok: true });
  });
}
