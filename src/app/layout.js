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
  const publisher = process.env.NEXT_PUBLIC_ADSTARK_PUBLISHER_ID;
  return (
    <html lang="en">
      <body>
        <Suspense fallback={<header className="navbar"/>}><Navbar /></Suspense>
        <main className="main-content">{children}</main>
        {publisher && /^[a-zA-Z0-9_-]+$/.test(publisher) && (
          <Script
            src={"https://cdn.adstark.com/" + publisher + ".js"}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}

