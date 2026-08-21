"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#f3ece3", color: "#111a24", fontFamily: "system-ui, sans-serif" }}>
        <title>Something went wrong | Marsh &amp; Ember</title>
        <main style={{ minHeight: "100vh", padding: "3rem 1.25rem", display: "grid", placeItems: "center" }}>
          <div style={{ width: "min(100%, 42rem)", textAlign: "center" }}>
            <p style={{ color: "#4b5661", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>
              Marsh &amp; Ember
            </p>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(2rem, 6vw, 3.5rem)", fontWeight: 400 }}>
              We couldn&apos;t set the table.
            </h1>
            <p style={{ color: "#4b5661", lineHeight: 1.6 }}>
              This page is temporarily unavailable. Try again, or return to the homepage.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1rem", marginTop: "2rem" }}>
              <button
                type="button"
                onClick={() => retry()}
                style={{ minHeight: "44px", padding: ".85rem 1.5rem", color: "white", background: "#152f4e", border: 0, borderRadius: ".25rem", font: "inherit", fontWeight: 700, cursor: "pointer" }}
              >
                Try Again
              </button>
              <Link
                href="/"
                style={{ minHeight: "44px", padding: ".85rem 1.5rem", display: "inline-flex", alignItems: "center", color: "#111a24", background: "white", border: "1px solid #4b5661", borderRadius: ".25rem", fontWeight: 700, textDecoration: "none" }}
              >
                Return Home
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
