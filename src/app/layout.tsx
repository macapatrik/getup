import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { APP_NAME, APP_TAGLINE, SITE_URL } from "@/lib/config";

// Na Apple zařízeních se použije systémové SF Pro, jinde Geist.
const geistSans = Geist({
  variable: "--font-geist-sans",
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
  themeColor: "#f5f5f7",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="cs" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full font-sans text-ink">
        <div aria-hidden className="aurora no-print fixed inset-0 -z-10" />
        {children}
      </body>
    </html>
  );
}
