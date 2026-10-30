import type { Metadata, Viewport } from "next";
import { COSTUME_PRIZE, HALLOWEEN_URL } from "./config";
import { isHalloween } from "./theme";

// Barvy lišty, ikona na ploše iPhonu a náhled při sdílení podle adresy (halloweenská verze vs. původní).
// Používají je layout aplikace a stránky mimo něj (úvod, přihlášení, souhlas, profil).

export async function themeViewport(): Promise<Viewport> {
  return { themeColor: (await isHalloween()) ? "#07060a" : "#ffffff", viewportFit: "cover" };
}

export async function themeMetadata(metadata: Metadata = {}): Promise<Metadata> {
  if (!(await isHalloween())) return metadata;
  // Halloweenská adresa je soutěž o nejlepší kostým (ne seznamka): vlastní název, popis a náhled
  const name = "Halloween · Soutěž o kostým";
  const description = `Nahraj svůj kostým a rozdej 3 hlasy nejlepším kostýmům večera v Klubu K2. Vítěz bere ${COSTUME_PRIZE} v hotovosti.`;
  const image = { url: `${HALLOWEEN_URL}/halloween/crush-og`, width: 1200, height: 630, alt: name };
  const title = typeof metadata.title === "string" ? { absolute: `${metadata.title} · Halloween` } : { default: name, template: "%s · Halloween" };
  return {
    ...metadata,
    title,
    metadataBase: new URL(HALLOWEEN_URL),
    description,
    applicationName: "Halloween",
    appleWebApp: { capable: true, title: "Halloween", statusBarStyle: "black" },
    // halloweenská ikona (statické PNG z /pwa-icon/h…), výchozí z icon.tsx a apple-icon.tsx je růžová
    icons: { icon: [{ url: "/pwa-icon/h64", type: "image/png", sizes: "64x64" }], apple: [{ url: "/pwa-icon/h180", sizes: "180x180" }] },
    openGraph: { title: name, description, siteName: "Halloween by GetUp", locale: "cs_CZ", type: "website", images: [image] },
    twitter: { card: "summary_large_image", title: name, description, images: [image.url] },
  };
}
