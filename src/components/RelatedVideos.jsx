import VideoCard from "./VideoCard";
export default function RelatedVideos({ videos }) {
  return (
    <section className="related">
      <h2>Keep exploring</h2>
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} compact />
      ))}
    </section>
  );
}
