import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Play, Sparkles, SlidersHorizontal } from "lucide-react";
import { listVideos } from "@/lib/data";
import VideoGrid from "@/components/VideoGrid";
import AdBanner from "@/components/AdBanner";
export const dynamic = "force-dynamic";
export default async function Home({ searchParams }) {
  const tag = (await searchParams).tag || "",
    type = ["video", "image"].includes((await searchParams).type)
      ? (await searchParams).type
      : "",
    sort = (await searchParams).sort === "popular" ? "popular" : "latest";
  const page = Math.max(0, parseInt((await searchParams).page) || 0);
  const { videos, count, demo } = await listVideos({ tag, type, sort, page });
  const featured = videos[0];
  const query = (values) =>
    "/?" +
    new URLSearchParams({ ...{ tag, type, sort }, ...values }).toString();
  return (
    <div className="page-wrap">
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            <span /> A SPACE FOR THE CURIOUS
          </p>
          <h1>
            Something worth watching<span>.</span>
          </h1>
          <p className="intro">
            New perspectives. Real moments. All in one place.
          </p>
        </div>
        <span className="collection-label">
          THE VIDSHARE COLLECTION <ArrowUpRight size={16} />
        </span>
      </div>
      <AdBanner />
      {!tag &&
        !type &&
        page === 0 &&
        sort === "latest" &&
        featured?.thumbnail_url && (
          <Link className="featured" href={"/video/" + featured.id}>
            <Image
              src={featured.thumbnail_url}
              alt=""
              fill
              sizes="100vw"
              priority
            />
            <div className="featured-shade" />
            <div className="featured-content">
              <span className="featured-kicker">
                <Sparkles size={13} /> THE EDITOR’S PICK
              </span>
              <h2>
                {demo ? (
                  <>
                    Get a little lost.
                    <br />
                    Find something beautiful.
                  </>
                ) : (
                  featured.title
                )}
              </h2>
              <p>A fresh perspective is just a play away.</p>
              <span className="watch-button">
                <Play size={15} fill="currentColor" />
                Watch now <span>↗</span>
              </span>
            </div>
            <div className="featured-corner">
              <span>01 / 0{Math.min(count, 9)}</span>
              <div>
                <i />
                <i />
                <i />
              </div>
            </div>
          </Link>
        )}
      <div className="discovery-bar">
        <div className="filter-chips">
          {[
            "All",
            "Travel",
            "Nature",
            "Lifestyle",
            "Cinematic",
            "Music",
            "Technology",
          ].map((t) => (
            <Link
              className={
                "chip " + (tag === t || (!tag && t === "All") ? "selected" : "")
              }
              href={query({ tag: t === "All" ? "" : t, page: 0 })}
              key={t}
            >
              {t}
            </Link>
          ))}
        </div>
        <Link
          className="sort-link"
          href={query({
            sort: sort === "latest" ? "popular" : "latest",
            page: 0,
          })}
        >
          <SlidersHorizontal size={15} />
          {sort === "latest" ? "Latest first" : "Most viewed"}
        </Link>
      </div>
      <div className="section-heading">
        <h2>
          {tag ||
            (type === "image"
              ? "Through the lens"
              : type === "video"
                ? "Press play"
                : sort === "popular"
                  ? "Trending now"
                  : "Fresh finds")}
          <span>{count}</span>
        </h2>
        <p>
          {demo
            ? "Preview collection · Demo content"
            : "Handpicked moments, ready to discover"}
        </p>
      </div>
      <VideoGrid videos={videos} />
      {count > 20 && (
        <div className="pagination">
          {page > 0 && (
            <Link className="button secondary" href={query({ page: page - 1 })}>
              Previous
            </Link>
          )}
          {(page + 1) * 20 < count && (
            <Link className="button secondary" href={query({ page: page + 1 })}>
              Load more
            </Link>
          )}
        </div>
      )}
      <footer className="footer">
        <span className="footer-brand">VidShare.</span>
        <span>A world of moments. Yours to explore.</span>
        <Link href="/admin">
          Made for sharing <ArrowUpRight size={13} />
        </Link>
      </footer>
    </div>
  );
}
