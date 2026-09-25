import { authorized, fail, handle } from "@/lib/api";
import { serverClient } from "@/lib/supabase-server";
import { metadata, isUuid } from "@/lib/validation.mjs";
export async function PATCH(request, { params }) {
  return handle(async () => {
    if (!(await authorized(request))) return fail("Unauthorized", 401);
    if (!isUuid((await params).id)) return fail("Invalid ID");
    let fields;
    try {
      fields = metadata(await request.json());
    } catch (e) {
      return fail(e.message);
    }
    const { data, error } = await serverClient(true)
      .from("videos")
      .update(fields)
      .eq("id", (await params).id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data ? Response.json(data) : fail("Media not found", 404);
  });
}
export async function DELETE(request, { params }) {
  return handle(async () => {
    if (!(await authorized(request))) return fail("Unauthorized", 401);
    if (!isUuid((await params).id)) return fail("Invalid ID");
    const db = serverClient(true);
    const { data: video, error } = await db
      .from("videos")
      .select("*")
      .eq("id", (await params).id)
      .maybeSingle();
    if (error) throw error;
    if (!video) return fail("Media not found", 404);
    const { error: hideError } = await db
      .from("videos")
      .update({ is_published: false })
      .eq("id", (await params).id);
    if (hideError) throw hideError;
    for (const [bucket, file] of [
      [video.media_bucket, video.media_path],
      ["thumbnails", video.thumbnail_path],
    ]) {
      if (file) {
        const { error } = await db.storage.from(bucket).remove([file]);
        if (error) throw error;
      }
    }
    const { error: deleteError } = await db
      .from("videos")
      .delete()
      .eq("id", (await params).id);
    if (deleteError) throw deleteError;
    return Response.json({ ok: true });
  });
}
