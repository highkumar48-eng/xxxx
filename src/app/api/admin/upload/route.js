import { serverClient } from "@/lib/supabase-server";
import { authorized, fail, handle } from "@/lib/api";
import { signToken, verifyToken } from "@/lib/auth";
import { validateFile, metadata } from "@/lib/validation.mjs";
export async function POST(request) {
  return handle(async () => {
    if (!(await authorized(request))) return fail("Unauthorized", 401);
    const body = await request.json();
    const db = serverClient(true);
    if (body.action === "prepare") {
      let spec;
      try {
        spec = validateFile(body.file);
        if (body.thumbnail) {
          validateFile(body.thumbnail);
          if (!body.thumbnail.type.startsWith("image/"))
            throw new Error("Thumbnail must be an image.");
        }
      } catch (e) {
        return fail(e.message);
      }
      const id = crypto.randomUUID();
      const media = {
        bucket: spec[0],
        path: id + "/media." + spec[1],
        type: body.file.type,
        size: body.file.size,
      };
      const thumb = body.thumbnail
        ? {
            bucket: "thumbnails",
            path: id + "/cover." + validateFile(body.thumbnail)[1],
            type: body.thumbnail.type,
            size: body.thumbnail.size,
          }
        : null;
      const uploads = [];
      for (const item of [media, thumb].filter(Boolean)) {
        const { data, error } = await db.storage
          .from(item.bucket)
          .createSignedUploadUrl(item.path);
        if (error) throw error;
        uploads.push({ ...item, token: data.token });
      }
      return Response.json({
        uploads,
        ticket: await signToken({ id, media, thumb }, "2h", "upload"),
      });
    }
    const ticket = await verifyToken(body.ticket, "upload");
    if (!ticket)
      return fail(
        "Upload session expired. Please choose your files again.",
        401,
      );
    if (body.action === "cancel") {
      const { data: existing, error: checkError } = await db
        .from("videos")
        .select("id")
        .eq("id", ticket.id)
        .maybeSingle();
      if (checkError) throw checkError;
      if (!existing)
        for (const item of [ticket.media, ticket.thumb].filter(Boolean)) {
          const { error } = await db.storage
            .from(item.bucket)
            .remove([item.path]);
          if (error) throw error;
        }
      return Response.json({ ok: true });
    }
    if (body.action !== "complete") return fail("Invalid upload action");
    let fields;
    try {
      fields = metadata(body);
    } catch (e) {
      return fail(e.message);
    }
    for (const item of [ticket.media, ticket.thumb].filter(Boolean)) {
      const { data, error } = await db.storage
        .from(item.bucket)
        .list(ticket.id);
      if (error) throw error;
      const stored = data.find((f) => f.name === item.path.split("/")[1]);
      if (!stored || Number(stored.metadata?.size) !== item.size)
        return fail("Upload is incomplete. Please retry.");
    }
    const url = (item) =>
      db.storage.from(item.bucket).getPublicUrl(item.path).data.publicUrl;
    const { data, error } = await db
      .from("videos")
      .insert({
        ...fields,
        id: ticket.id,
        video_url: url(ticket.media),
        thumbnail_url: ticket.thumb
          ? url(ticket.thumb)
          : ticket.media.type.startsWith("image/")
            ? url(ticket.media)
            : null,
        media_type: ticket.media.type.startsWith("image/") ? "image" : "video",
        media_path: ticket.media.path,
        media_bucket: ticket.media.bucket,
        thumbnail_path: ticket.thumb?.path || null,
        file_size: ticket.media.size,
        duration:
          Number.isInteger(body.duration) &&
          body.duration > 0 &&
          body.duration < 864000
            ? body.duration
            : null,
      })
      .select()
      .single();
    if (error) throw error;
    return Response.json(data, { status: 201 });
  });
}
