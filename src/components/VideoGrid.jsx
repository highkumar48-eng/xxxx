import { Fragment } from "react";
import VideoCard from "./VideoCard";
import AdBanner from "./AdBanner";
import { SearchX } from "lucide-react";
export default function VideoGrid({ videos }) {
  if (!videos.length)
    return (
      <div className="empty-state">
        <SearchX size={36} />
        <h2>No results found</h2>
        <p>Try another search or explore a different topic.</p>
        <a className="button" href="/">
          Explore all media
        </a>
      </div>
    );
  return (
    <div className="video-grid">
      {videos.map((video, i) => (
        <Fragment key={video.id}>
          <VideoCard video={video} />
          {(i + 1) % 6 === 0 && i < videos.length - 1 && (
            <div className="feed-ad">
              <AdBanner placement="feed" />
            </div>
          )}
        </Fragment>
      ))}
    </div>
  );
}
