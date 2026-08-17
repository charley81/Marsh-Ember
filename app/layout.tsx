import type { Metadata } from "next";
import { Libre_Baskerville, Outfit } from "next/font/google";
import { SiteShell } from "@/components/site/site-shell";
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

const announcementScript = `try{if(localStorage.getItem('marsh-ember-announcement-dismissed')==='true'){document.documentElement.dataset.announcementDismissed='true'}}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${libre.variable} ${outfit.variable}`} suppressHydrationWarning >
      <head><script dangerouslySetInnerHTML={{ __html: announcementScript }} /></head>
      <body><a className="sr-only" href="#main-content">Skip to content</a><SiteShell>{children}</SiteShell></body>
    </html>
  );
}
