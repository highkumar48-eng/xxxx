import { notFound } from "next/navigation";
import Link from "next/link";
import { getVideo, listVideos } from "@/lib/data";
import VideoPlayer from "@/components/VideoPlayer";
import ShareButton from "@/components/ShareButton";
import RelatedVideos from "@/components/RelatedVideos";
import AdBanner from "@/components/AdBanner";
import { formatViews } from "@/lib/utils";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }) {
  const video = await getVideo((await params).id);
  return { title: video?.title || "Media not found" };
}
export default async function Video({ params }) {
  const video = await getVideo((await params).id);
  if (!video) notFound();
  const { videos } = await listVideos({ tag: video.tags?.[0] || "" });
  return (
    <div className="page-wrap">
      <Link href="/" className="back-link">
        ← Back to discover
      </Link>
      <div className="watch-layout">
        <article>
          <VideoPlayer video={video} />
          <div className="watch-title">
            <h1>{video.title}</h1>
            <ShareButton />
          </div>
          <p className="muted">
            {formatViews(video.views)} views ·{" "}
            {new Date(video.created_at).toLocaleDateString("en", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <div className="description">
            <p>{video.description || "A moment worth sharing."}</p>
            <div className="tags">
              {video.tags?.map((t) => (
                <Link key={t} href={"/?tag=" + encodeURIComponent(t)}>
                  #{t}
                </Link>
              ))}
            </div>
          </div>
          <AdBanner placement="player" />
        </article>
        <aside>
          <RelatedVideos
            videos={videos.filter((v) => v.id !== video.id).slice(0, 5)}
          />
          <AdBanner placement="sidebar" />
        </aside>
      </div>
    </div>
  );
}
