"use client";
import { Share2, Check } from "lucide-react";
import { useState } from "react";
export default function ShareButton() {
  const [state, setState] = useState("Share");
  async function share() {
    try {
      await navigator.clipboard.writeText(location.href);
      setState("Link copied");
      setTimeout(() => setState("Share"), 2500);
    } catch {
      setState("Copy this page’s URL");
    }
  }
  return (
    <button className="button secondary" onClick={share}>
      {state === "Link copied" ? <Check size={16} /> : <Share2 size={16} />}
      {state}
    </button>
  );
}
