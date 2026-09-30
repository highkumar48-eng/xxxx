import "server-only";
import { cookies } from "next/headers";
import { COOKIE, verifyToken } from "./auth";
export function fail(message, status = 400) {
  return Response.json({ error: message }, { status });
}
export function trustedOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const requestOrigin = new URL(request.url).origin;
    const appOrigin = process.env.NEXT_PUBLIC_APP_URL || "";
    const platformOrigin =
      process.env.DEPLOY_PRIME_URL || process.env.URL || "";
    const configuredOrigin = new URL(
      platformOrigin && /^https?:\/\/localhost(?::\d+)?$/i.test(appOrigin)
        ? platformOrigin
        : appOrigin || platformOrigin || request.url,
    ).origin;
    if (origin === configuredOrigin) return true;
    const candidate = new URL(origin);
    return (
      process.env.NODE_ENV !== "production" &&
      candidate.hostname === "localhost" &&
      candidate.protocol === "http:"
    ) || (process.env.NODE_ENV !== "production" && origin === requestOrigin);
  } catch {
    return false;
  }
}
export async function authorized(request) {
  if (!trustedOrigin(request)) return false;
  return Boolean(await verifyToken((await cookies()).get(COOKIE)?.value));
}
export async function handle(fn) {
  try {
    return await fn();
  } catch (error) {
    console.error(error.message);
    return fail(
      "Unable to complete this request. Check your connection and server configuration.",
      500,
    );
  }
}
