import { NextResponse } from "next/server";
import { COOKIE, verifyToken } from "./lib/auth";
export async function middleware(request) {
  if (!(await verifyToken(request.cookies.get(COOKIE)?.value)))
    return NextResponse.redirect(new URL("/admin", request.url));
  return NextResponse.next();
}
export const config = { matcher: ["/admin/dashboard/:path*"] };
