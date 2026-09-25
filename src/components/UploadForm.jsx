"use client";
import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { browserClient } from "@/lib/supabase";
import { validateFile } from "@/lib/validation.mjs";
async function api(body) {
  const r = await fetch("/api/admin/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error);
  return data;
}
async function readDuration(file) {
  if (!file.type.startsWith("video/")) return null;
  return new Promise((resolve) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);
    let timer;
    const done = (value) => {
      clearTimeout(timer);
      video.onloadedmetadata = null;
      video.onerror = null;
      URL.revokeObjectURL(url);
      video.removeAttribute("src");
      video.load();
      resolve(value);
    };
    timer = setTimeout(() => done(null), 5000);
    video.onloadedmetadata = () =>
      done(Number.isFinite(video.duration) ? Math.round(video.duration) : null);
    video.onerror = () => done(null);
    video.src = url;
  });
}
export default function UploadForm({ onComplete }) {
  const [file, setFile] = useState(null),
    [status, setStatus] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const input = useRef();
  function choose(f) {
    try {
      validateFile(f);
      setFile(f);
      setError("");
    } catch (e) {
      setError(e.message);
      setFile(null);
      if (input.current) input.current.value = "";
    }
  }
  async function submit(e) {
    e.preventDefault();
    if (!file) {
      setError("Choose a media file first.");
      return;
    }
    const form = e.currentTarget;
    const values = new FormData(form);
    const thumbnail = values.get("thumbnail");
    const thumb = thumbnail?.size ? thumbnail : null;
    let ticket;
    setBusy(true);
    setError("");
    setStatus("Preparing upload…");
    try {
      const duration = await readDuration(file);
      const prepared = await api({
        action: "prepare",
        file: { type: file.type, size: file.size },
        thumbnail: thumb ? { type: thumb.type, size: thumb.size } : null,
      });
      ticket = prepared.ticket;
      for (let i = 0; i < prepared.uploads.length; i++) {
        setStatus(i ? "Uploading thumbnail…" : "Uploading media…");
        const item = prepared.uploads[i];
        const { error } = await browserClient()
          .storage.from(item.bucket)
          .uploadToSignedUrl(item.path, item.token, i ? thumb : file, {
            contentType: item.type,
          });
        if (error) throw error;
      }
      setStatus("Saving your moment…");
      await api({
        action: "complete",
        ticket,
        title: values.get("title"),
        description: values.get("description"),
        tags: String(values.get("tags"))
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        is_published: values.get("published") === "on",
        duration,
      });
      ticket = null;
      form.reset();
      setFile(null);
      setStatus("Your moment has been saved.");
      onComplete();
    } catch (e) {
      setError(e.message);
      setStatus("");
      if (ticket)
        try {
          await api({ action: "cancel", ticket });
        } catch {
          setError(
            e.message +
              " Some uploaded files may need cleanup in Supabase Storage.",
          );
        }
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="panel" onSubmit={submit}>
      <h2>Share a new moment</h2>
      <fieldset disabled={busy} style={{ border: 0, padding: 0, margin: 0 }}>
        <label
          className="drop-zone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (!busy) choose(e.dataTransfer.files[0]);
          }}
        >
          <UploadCloud size={28} />
          <span>{file ? file.name : "Drop your video or image here"}</span>
          <small>Videos up to 50 MB · Images up to 5 MB</small>
          <input
            ref={input}
            type="file"
            accept="video/mp4,video/webm,video/quicktime,image/jpeg,image/png,image/webp"
            onChange={(e) => choose(e.target.files[0])}
            aria-label="Media file"
          />
        </label>
        <label className="form-field">
          Title
          <input
            name="title"
            required
            maxLength={160}
            placeholder="Give your moment a name"
          />
        </label>
        <label className="form-field">
          Description
          <textarea
            name="description"
            maxLength={5000}
            placeholder="Tell the story behind it…"
          />
        </label>
        <label className="form-field">
          Tags
          <input name="tags" placeholder="Travel, Nature, Cinematic" />
        </label>
        <label className="form-field">
          Thumbnail (optional)
          <input
            name="thumbnail"
            type="file"
            accept="image/jpeg,image/png,image/webp"
          />
        </label>
        <label className="check-field">
          <input name="published" type="checkbox" defaultChecked />
          Publish to the collection
        </label>
        <button className="button full-width" disabled={busy}>
          {busy ? "Uploading…" : "Upload media"}
          <UploadCloud size={16} />
        </button>
      </fieldset>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {status && (
        <p className="form-success" role="status">
          {status}
        </p>
      )}
    </form>
  );
}
