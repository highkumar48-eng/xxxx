export default function Loading() {
  return (
    <div className="page-wrap">
      <div className="skeleton skeleton-heading" />
      <div className="skeleton skeleton-hero" />
      <div className="video-grid">
        {[1, 2, 3].map((n) => (
          <div key={n} className="skeleton skeleton-card" />
        ))}
      </div>
    </div>
  );
}
