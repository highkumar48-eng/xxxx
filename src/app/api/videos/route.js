import { listVideos } from "@/lib/data";
import { handle } from "@/lib/api";
export const dynamic = "force-dynamic";
export async function GET(request) {
  const p = new URL(request.url).searchParams;
  return handle(async () =>
    Response.json(
      await listVideos({
        page: Math.min(10000, Math.max(0, parseInt(p.get("page")) || 0)),
        tag: (p.get("tag") || "").slice(0, 40),
        type: ["video", "image"].includes(p.get("type")) ? p.get("type") : "",
        sort: p.get("sort"),
      }),
    ),
  );
}
