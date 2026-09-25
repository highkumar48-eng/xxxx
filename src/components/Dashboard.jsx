"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import UploadForm from "./UploadForm";
import { formatViews } from "@/lib/utils";
export default function Dashboard({ videos, count, demo, page }) {
  const router = useRouter();
  const [editing, setEditing] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function mutate(id, method, body) {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/admin/videos/" + id, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setEditing(null);
      router.refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    setBusy(true);
    try {
      const r = await fetch("/api/admin/logout", { method: "POST" });
      if (!r.ok) throw new Error("Could not sign out. Please try again.");
      router.push("/admin");
      router.refresh();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }
  return (
    <div className="page-wrap">
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow">CREATOR STUDIO</p>
          <h1>
            Your collection<span>.</span>
          </h1>
        </div>
        <button className="button secondary" disabled={busy} onClick={logout}>
          Sign out
        </button>
      </div>
      {demo && (
        <div className="setup-note">
          Connect your Supabase project in .env.local and run npm run setup to
          enable uploads.
        </div>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="dashboard-grid">
        <UploadForm onComplete={() => router.refresh()} />
        <section className="panel">
          <h2>
            Manage media <span className="muted">({count})</span>
          </h2>
          {!videos.length && (
            <p className="muted">
              Your collection starts here. Upload your first moment.
            </p>
          )}
          {videos.map((v) => (
            <div className="manage-item" key={v.id}>
              <div>
                <h3>{v.title}</h3>
                <span
                  className={
                    "status " + (!v.is_published ? "hidden-status" : "")
                  }
                >
                  {v.is_published ? "Published" : "Hidden from collection"}
                </span>
                <p>
                  {formatViews(v.views)} views · {v.media_type} ·{" "}
                  {(v.file_size / 1048576).toFixed(1)} MB
                </p>
                {editing === v.id ? (
                  <form
                    className="edit-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const f = new FormData(e.currentTarget);
                      mutate(v.id, "PATCH", {
                        title: f.get("title"),
                        description: f.get("description"),
                        tags: String(f.get("tags"))
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean),
                        is_published: v.is_published,
                      });
                    }}
                  >
                    <label className="form-field">
                      Title
                      <input
                        name="title"
                        defaultValue={v.title}
                        required
                        maxLength={160}
                      />
                    </label>
                    <label className="form-field">
                      Description
                      <textarea
                        name="description"
                        defaultValue={v.description}
                        maxLength={5000}
                      />
                    </label>
                    <label className="form-field">
                      Tags
                      <input name="tags" defaultValue={v.tags?.join(", ")} />
                    </label>
                    <div className="manage-actions">
                      <button disabled={busy} type="submit">
                        Save changes
                      </button>
                      <button type="button" onClick={() => setEditing(null)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="manage-actions">
                    {v.is_published && (
                      <Link href={"/video/" + v.id}>View</Link>
                    )}
                    <button disabled={busy} onClick={() => setEditing(v.id)}>
                      Edit
                    </button>
                    <button
                      disabled={busy}
                      onClick={() =>
                        mutate(v.id, "PATCH", {
                          title: v.title,
                          description: v.description,
                          tags: v.tags,
                          is_published: !v.is_published,
                        })
                      }
                    >
                      {v.is_published ? "Hide" : "Publish"}
                    </button>
                    <button
                      disabled={busy}
                      className="danger"
                      onClick={() => {
                        if (
                          confirm(
                            "Permanently delete “" +
                              v.title +
                              "” and its uploaded files?",
                          )
                        )
                          mutate(v.id, "DELETE");
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div className="pagination">
            {page > 0 && (
              <Link className="button secondary" href={"?page=" + (page - 1)}>
                Previous
              </Link>
            )}
            {(page + 1) * 20 < count && (
              <Link className="button secondary" href={"?page=" + (page + 1)}>
                Next
              </Link>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
