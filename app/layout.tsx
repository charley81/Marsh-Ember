import type { Metadata } from "next";
import { Libre_Baskerville, Outfit } from "next/font/google";
import { ContentLive } from "@/components/sanity/content-live";
import { PreviewTools } from "@/components/sanity/preview-tools";
import { SiteShell } from "@/components/site/site-shell";
import { getSiteSettings } from "@/lib/content";
import "./globals.css";

const libre = Libre_Baskerville({
  variable: "--font-libre",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://marshandember.com"),
  title: { default: "Marsh & Ember | Charleston Restaurant", template: "%s | Marsh & Ember" },
  description: "Wood-fired cooking, seasonal ingredients, and warm Southern hospitality in Charleston, South Carolina.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const settings = await getSiteSettings();

  return (
    <html lang="en" className={`${libre.variable} ${outfit.variable}`} suppressHydrationWarning >
      <body><a className="sr-only" href="#main-content">Skip to content</a><SiteShell settings={settings}>{children}</SiteShell><ContentLive /><PreviewTools /></body>
    </html>
  );
}
