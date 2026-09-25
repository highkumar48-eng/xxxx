import Link from "next/link";
import Image from "next/image";
import { Play, Image as ImageIcon, ArrowUpRight } from "lucide-react";
import { formatViews, durationLabel, ago } from "@/lib/utils";
export default function VideoCard({ video, compact = false }) {
  return (
    <Link
      href={"/video/" + video.id}
      className={"video-card " + (compact ? "compact" : "")}
    >
      <div className="thumbnail">
        {video.thumbnail_url ? (
          <Image
            src={video.thumbnail_url}
            alt=""
            fill
            sizes="(max-width: 700px) 100vw, 33vw"
          />
        ) : (
          <div className="empty-thumbnail">
            <Play size={40} />
          </div>
        )}
        <span className="thumbnail-play">
          <Play size={24} fill="currentColor" />
        </span>
        <span className="duration">
          {video.media_type === "image" ? (
            <ImageIcon size={14} />
          ) : (
            durationLabel(video.duration)
          )}
        </span>
      </div>
      <div className="card-copy">
        <h3>{video.title}</h3>
        <p>
          {formatViews(video.views)} views <span>·</span>{" "}
          {ago(video.created_at)}
        </p>
        {!compact && (
          <span className="card-tag">
            {video.tags?.[0] || "Discover"}
            <ArrowUpRight size={12} />
          </span>
        )}
      </div>
    </Link>
  );
}
