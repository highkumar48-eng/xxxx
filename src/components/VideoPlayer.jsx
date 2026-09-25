"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
const ReactPlayer = dynamic(() => import("react-player/lazy"), {
  ssr: false,
  loading: () => <div className="player-loading">Loading player…</div>,
});
export default function VideoPlayer({ video }) {
  const counted = useRef(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!counted.current && !video.id.startsWith("demo-")) {
      counted.current = true;
      fetch("/api/videos/" + video.id + "/view", { method: "POST" }).catch(
        () => {},
      );
    }
  }, [video.id]);
  return (
    <div className="player">
      {video.media_type === "image" ? (
        <Image
          src={video.video_url}
          alt={video.title}
          fill
          sizes="100vw"
          style={{ objectFit: "contain" }}
        />
      ) : (
        <ReactPlayer
          url={video.video_url}
          controls
          width="100%"
          height="100%"
          onError={() => setError(true)}
        />
      )}
      {error && (
        <div className="player-error">
          This media could not be played.{" "}
          <a href={video.video_url} target="_blank" rel="noreferrer">
            Open the original file
          </a>
        </div>
      )}
    </div>
  );
}
