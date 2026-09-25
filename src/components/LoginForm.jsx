"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight } from "lucide-react";
export default function LoginForm() {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const router = useRouter();
  async function login(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: new FormData(e.currentTarget).get("password"),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      router.push("/admin/dashboard");
      router.refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-wrap">
      <div className="auth-icon">
        <ShieldCheck size={25} />
      </div>
      <p className="eyebrow">YOUR CREATIVE CORNER</p>
      <h1>Welcome to the studio.</h1>
      <p>
        A home for your next great moment.
        <br />
        Sign in to upload and manage your collection.
      </p>
      <form onSubmit={login}>
        <label className="form-field">
          Admin password
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            maxLength={256}
            placeholder="Enter your password"
          />
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="button full-width" disabled={busy}>
          {busy ? "Signing in…" : "Enter creator studio"}
          <ArrowRight size={16} />
        </button>
      </form>
      <a href="/" className="back-link" style={{ marginTop: 28 }}>
        ← Back to the collection
      </a>
    </div>
  );
}
