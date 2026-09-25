import { cookies } from "next/headers";
import { serverClient, configured } from "@/lib/supabase-server";
import { handle, fail } from "@/lib/api";
import { isUuid } from "@/lib/validation.mjs";
export async function POST(request, { params }) {
  return handle(async () => {
    if (!isUuid((await params).id)) return fail("Invalid media ID");
    if (!configured()) return fail("Demo views are not recorded", 503);
    const origin = request.headers.get("origin");
    if (
      !origin ||
      origin !== new URL(process.env.NEXT_PUBLIC_APP_URL || request.url).origin
    )
      return fail("Invalid origin", 403);
    const cookie = "view_" + (await params).id;
    if ((await cookies()).get(cookie)) return Response.json({ counted: false });
    const { data, error } = await serverClient(true).rpc(
      "increment_view_count",
      { video_id: (await params).id },
    );
    if (error) throw error;
    if (!data) return fail("Media not found", 404);
    (await cookies()).set(cookie, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600,
      path: "/",
    });
    return Response.json({ counted: true });
  });
}
