"use client";
import Link from "next/link";
import {
  Search,
  Upload,
  Menu,
  Play,
  X,
  Home,
  Compass,
  Image as ImageIcon,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const params = useSearchParams();
  const activeHref = pathname !== "/" ? "" : params.get("type") ? "/?type="+params.get("type") : params.get("sort") === "popular" ? "/?sort=popular" : "/";
  return (
    <>
      <header className="navbar">
        <button
          className="icon-button menu-toggle"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
        <Link className="brand" href="/">
          <span className="brand-mark">
            <Play size={19} fill="currentColor" />
          </span>
          VidShare<span className="brand-dot">.</span>
        </Link>
        <form className="search-box" action="/search">
          <Search size={19} />
          <input
            aria-label="Search videos and images"
            name="q"
            placeholder="Search something worth watching…"
          />
          <kbd>↵</kbd>
        </form>
        <Link href="/admin/dashboard" className="upload-link">
          <Upload size={17} />
          <span>Upload</span>
        </Link>
        <Link className="avatar" href="/admin" aria-label="Admin account">
          V
        </Link>
      </header>
      <aside className={"sidebar " + (open ? "is-open" : "")}>
        <p className="nav-caption">DISCOVER</p>
        {[
          [Home, "For you", "/"],
          [Compass, "Trending", "/?sort=popular"],
          [Play, "Videos", "/?type=video"],
          [ImageIcon, "Images", "/?type=image"],
        ].map(([Icon, label, href]) => (
          <Link
            key={label}
            onClick={() => setOpen(false)}
            className={
              "nav-item " + (href === activeHref ? "active" : "")
            }
            href={href}
          >
            <Icon size={20} />
            {label}
            {href === activeHref && <span className="active-dot" />}
          </Link>
        ))}
        <div className="nav-divider" />
        <p className="nav-caption">EXPLORE BY TOPIC</p>
        {[
          "Travel",
          "Nature",
          "Lifestyle",
          "Cinematic",
          "Music",
          "Technology",
        ].map((tag, i) => (
          <Link
            onClick={() => setOpen(false)}
            className="topic-link"
            href={"/?tag=" + tag}
            key={tag}
          >
            <span className={"topic-dot dot-" + i} />
            {tag}
          </Link>
        ))}
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="small-brand">
              <Play size={14} fill="currentColor" />
            </span>
            <strong>
              Good moments.
              <br />
              Worth sharing.
            </strong>
            <p>
              A little inspiration,
              <br />
              one video at a time.
            </p>
          </div>
          <Link href="/admin" className="admin-link">
            <ShieldCheck size={15} />
            Creator studio
          </Link>
          <p className="copyright">© {new Date().getFullYear()} VidShare</p>
        </div>
      </aside>
      {open && (
        <button
          className="nav-overlay"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
