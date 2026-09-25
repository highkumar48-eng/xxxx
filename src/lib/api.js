import "server-only";
import { cookies } from "next/headers";
import { COOKIE, verifyToken } from "./auth";
export function fail(message, status = 400) {
  return Response.json({ error: message }, { status });
}
export async function authorized(request) {
  const origin = request.headers.get("origin");
  if (
    !origin ||
    origin !== new URL(process.env.NEXT_PUBLIC_APP_URL || request.url).origin
  )
    return false;
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
