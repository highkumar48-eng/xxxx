import { getVideo } from "@/lib/data";
import { handle, fail } from "@/lib/api";
export const dynamic = "force-dynamic";
export async function GET(request, { params }) {
  return handle(async () => {
    const video = await getVideo((await params).id);
    return video ? Response.json(video) : fail("Media not found", 404);
  });
}
