import type { Metadata, Viewport } from "next";
import { Urbanist } from "next/font/google";
import "./globals.css";
import { APP_NAME, APP_TAGLINE, SITE_URL } from "@/lib/config";

// Písmo šablony Romio; latin-ext kvůli češtině.
const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: APP_NAME, template: `%s · ${APP_NAME}` },
  description: APP_TAGLINE,
  applicationName: APP_NAME,
  appleWebApp: { capable: true, title: APP_NAME, statusBarStyle: "default" },
  // Náhled při sdílení odkazu (obrázek generuje src/app/opengraph-image.tsx)
  openGraph: { title: APP_NAME, description: APP_TAGLINE, siteName: APP_NAME, locale: "cs_CZ", type: "website" },
  twitter: { card: "summary_large_image", title: APP_NAME, description: APP_TAGLINE },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="cs" className={`${urbanist.variable} h-full`}>
      <body className="min-h-full font-sans text-ink">{children}</body>
    </html>
  );
}
