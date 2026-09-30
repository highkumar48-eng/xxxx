"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import AdBanner from "./AdBanner";
const ReactPlayer = dynamic(() => import("react-player/lazy"), {
  ssr: false,
  loading: () => <div className="player-loading">Loading player…</div>,
});
export default function VideoPlayer({ video }) {
  const counted = useRef(false);
  const breakAt = 60;
  const shownBreak = useRef(false);
  const [error, setError] = useState(false);
  const [midroll, setMidroll] = useState(false);
  useEffect(() => {
    if (!counted.current && !video.id.startsWith("demo-")) {
      counted.current = true;
      fetch("/api/videos/" + video.id + "/view", { method: "POST" }).catch(
        () => {},
      );
    }
  }, [video.id]);
  function onProgress(state) {
    if (!shownBreak.current && state.playedSeconds >= breakAt) {
      shownBreak.current = true;
      setMidroll(true);
    }
  }
  function continueWatching() {
    setMidroll(false);
  }
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
          onProgress={onProgress}
          progressInterval={1000}
          onError={() => setError(true)}
        />
      )}
      {midroll && (
        <div
          className="midroll-overlay"
          role="dialog"
          aria-label="Advertisement"
        >
          <div className="midroll-card">
            <AdBanner placement="midroll" />
            <button className="button" onClick={continueWatching}>
              Continue watching
            </button>
          </div>
        </div>
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
