import { listVideos } from "@/lib/data";
import VideoGrid from "@/components/VideoGrid";
import Link from "next/link";
export const dynamic = "force-dynamic";
export const metadata = { title: "Search" };
export default async function Search({ searchParams }) {
  const q = String((await searchParams).q || "")
    .trim()
    .slice(0, 200);
  const page = Math.max(0, parseInt((await searchParams).page) || 0);
  const { videos, count } = await listVideos({ q, page });
  return (
    <div className="page-wrap">
      <p className="eyebrow">FIND YOUR NEXT FAVORITE</p>
      <h1>{q ? "Results for “" + q + "”" : "Explore the collection"}</h1>
      <p className="intro">
        {count} {count === 1 ? "moment" : "moments"} to discover
      </p>
      <VideoGrid videos={videos} />
      <div className="pagination">
        {page > 0 && (
          <Link
            className="button secondary"
            href={"/search?" + new URLSearchParams({ q, page: page - 1 })}
          >
            Previous
          </Link>
        )}
        {(page + 1) * 20 < count && (
          <Link
            className="button"
            href={"/search?" + new URLSearchParams({ q, page: page + 1 })}
          >
            Load more
          </Link>
        )}
      </div>
    </div>
  );
}
