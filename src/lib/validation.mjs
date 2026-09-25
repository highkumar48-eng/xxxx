export const TYPES = {
  "video/mp4": ["videos", "mp4", 52428800],
  "video/webm": ["videos", "webm", 52428800],
  "video/quicktime": ["videos", "mov", 52428800],
  "image/jpeg": ["thumbnails", "jpg", 5242880],
  "image/png": ["thumbnails", "png", 5242880],
  "image/webp": ["thumbnails", "webp", 5242880],
};
export function validateFile(file) {
  const spec = TYPES[file?.type];
  if (
    !spec ||
    !Number.isSafeInteger(file.size) ||
    file.size <= 0 ||
    file.size > spec[2]
  )
    throw new Error(
      "Choose an MP4, WebM or MOV up to 50 MB, or a JPG, PNG or WebP up to 5 MB.",
    );
  return spec;
}
export function metadata(body) {
  if (
    typeof body.title !== "string" ||
    !body.title.trim() ||
    body.title.trim().length > 160
  )
    throw new Error("A title of 1–160 characters is required.");
  if (
    body.description != null &&
    (typeof body.description !== "string" || body.description.length > 5000)
  )
    throw new Error("Description must be under 5,000 characters.");
  const tags = body.tags || [];
  if (
    !Array.isArray(tags) ||
    tags.length > 12 ||
    tags.some((t) => typeof t !== "string" || t.length > 40)
  )
    throw new Error("Use up to 12 tags, each under 40 characters.");
  if (typeof body.is_published !== "boolean")
    throw new Error("Choose a publication status.");
  return {
    title: body.title.trim(),
    description: body.description || "",
    tags: [...new Set(tags.map((t) => t.trim()).filter(Boolean))],
    is_published: body.is_published,
  };
}
export const isUuid = (id) =>
  typeof id === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id,
  );
