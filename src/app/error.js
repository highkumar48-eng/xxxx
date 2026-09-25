"use client";
export default function ErrorPage({ reset }) {
  return (
    <div className="empty-state">
      <h1>We couldn’t load the collection.</h1>
      <p>
        Please try again. If this continues, check the Supabase configuration.
      </p>
      <button className="button" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
