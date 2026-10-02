import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { Suspense } from "react";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Script from "next/script";

export const metadata = {
  title: {
    default: "VidShare — Moments worth sharing",
    template: "%s · VidShare",
  },
  description:
    "Discover videos, explore new perspectives, and share the moments that matter.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={<header className="navbar"/>}>
          <Navbar />
        </Suspense>

        <main className="main-content">{children}</main>

        {/* ── profitableratecpmnetwork.com — Ad Unit 1 (Native/Display) ── */}
        <div id="container-5ff21f820c67dbdefe82b39ffba2f6f9" />
        <Script
          src="https://pl31619303.profitableratecpmnetwork.com/5ff21f820c67dbdefe82b39ffba2f6f9/invoke.js"
          strategy="afterInteractive"
          data-cfasync="false"
        />

        {/* ── profitableratecpmnetwork.com — Ad Unit 2 (Pop/Push) ── */}
        <Script
          src="https://pl31619305.profitableratecpmnetwork.com/59/ab/42/59ab427d68b6a88472822722d3193994.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
