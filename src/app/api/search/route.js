import { listVideos } from "@/lib/data";
import { handle } from "@/lib/api";
export const dynamic = "force-dynamic";
export async function GET(request) {
  const p = new URL(request.url).searchParams;
  return handle(async () =>
    Response.json(
      await listVideos({
        q: (p.get("q") || "").slice(0, 200),
        page: Math.min(10000, Math.max(0, parseInt(p.get("page")) || 0)),
      }),
    ),
  );
}
