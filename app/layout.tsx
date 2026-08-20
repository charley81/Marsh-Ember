import type { Metadata } from "next";
import { Libre_Baskerville, Outfit } from "next/font/google";
import { ContentLive } from "@/components/sanity/content-live";
import { PreviewTools } from "@/components/sanity/preview-tools";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteShell } from "@/components/site/site-shell";
import { getSiteSettings } from "@/lib/content";
import { createPageMetadata, DEFAULT_DESCRIPTION, DEFAULT_TITLE, SITE_NAME, SITE_URL } from "@/lib/seo";
import { createRestaurantJsonLd } from "@/lib/structured-data";
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

const rootMetadata = createPageMetadata({title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION, path: "/"});

export const metadata: Metadata = {
  ...rootMetadata,
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: { default: DEFAULT_TITLE, template: `%s | ${SITE_NAME}` },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const settings = await getSiteSettings();

  return (
    <html lang="en" className={`${libre.variable} ${outfit.variable}`} suppressHydrationWarning >
      <body><JsonLd data={createRestaurantJsonLd(settings)} /><a className="sr-only" href="#main-content">Skip to content</a><SiteShell settings={settings}>{children}</SiteShell><ContentLive /><PreviewTools /></body>
    </html>
  );
}
