import type { Metadata, Viewport } from "next";
import { APP_NAME, HALLOWEEN_URL } from "./config";
import { isHalloween } from "./theme";

// Barvy lišty, ikona na ploše iPhonu a náhled při sdílení podle adresy (halloweenská verze vs. původní).
// Používají je layout aplikace a stránky mimo něj (úvod, přihlášení, souhlas, profil).

export async function themeViewport(): Promise<Viewport> {
  return { themeColor: (await isHalloween()) ? "#07060a" : "#ffffff", viewportFit: "cover" };
}

export async function themeMetadata(metadata: Metadata = {}): Promise<Metadata> {
  if (!(await isHalloween())) return metadata;
  const description = "Seznamka jen pro lidi z Halloweenu v Klubu K2. Swipuj, a když se lajknete oba, ukážou se vám kontakty.";
  const image = { url: `${HALLOWEEN_URL}/halloween/crush-og`, width: 1200, height: 630, alt: `${APP_NAME} – najdi si crush na Halloween` };
  return {
    ...metadata,
    metadataBase: new URL(HALLOWEEN_URL),
    description,
    appleWebApp: { capable: true, title: APP_NAME, statusBarStyle: "black" },
    // halloweenská ikona (statické PNG z /pwa-icon/h…), výchozí z icon.tsx a apple-icon.tsx je růžová
    icons: { icon: [{ url: "/pwa-icon/h64", type: "image/png", sizes: "64x64" }], apple: [{ url: "/pwa-icon/h180", sizes: "180x180" }] },
    openGraph: { title: `${APP_NAME} · Halloween`, description, siteName: APP_NAME, locale: "cs_CZ", type: "website", images: [image] },
    twitter: { card: "summary_large_image", title: `${APP_NAME} · Halloween`, description, images: [image.url] },
  };
}
