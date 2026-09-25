import "server-only";
import { serverClient, configured } from "./supabase-server";
import { demoVideos } from "./demo";
export async function listVideos({
  q = "",
  tag = "",
  type = "",
  sort = "latest",
  page = 0,
  admin = false,
} = {}) {
  if (!configured()) {
    if (admin) return { videos: [], count: 0, demo: true };
    let items = demoVideos.filter(
      (v) =>
        (!q ||
          `${v.title} ${v.description} ${v.tags.join(" ")}`
            .toLowerCase()
            .includes(q.toLowerCase())) &&
        (!tag || v.tags.includes(tag)) &&
        (!type || v.media_type === type),
    );
    if (sort === "popular") items = items.toSorted((a, b) => b.views - a.views);
    return {
      videos: items.slice(page * 20, page * 20 + 20),
      count: items.length,
      demo: true,
    };
  }
  let query = serverClient(admin)
    .from("videos")
    .select("*", { count: "exact" });
  if (!admin) query = query.eq("is_published", true);
  if (q)
    query = query.textSearch("search_vector", q, {
      type: "websearch",
      config: "english",
    });
  if (tag) query = query.contains("tags", [tag]);
  if (type) query = query.eq("media_type", type);
  const { data, error, count } = await query
    .order(sort === "popular" ? "views" : "created_at", { ascending: false })
    .order("id")
    .range(page * 20, page * 20 + 19);
  if (error) throw error;
  return { videos: data, count, demo: false };
}
export async function getVideo(id) {
  if (!configured()) return demoVideos.find((v) => v.id === id);
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data, error } = await serverClient()
    .from("videos")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw error;
  return data;
}
