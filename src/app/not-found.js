export default function NotFound() {
  return (
    <div className="empty-state">
      <h1>This moment isn’t here.</h1>
      <p>It may have been removed or is not published yet.</p>
      <a href="/" className="button">
        Back to discover
      </a>
    </div>
  );
}
