import type { MetadataRoute } from "next";
import { APP_NAME, APP_TAGLINE } from "@/lib/config";
import { EVENT as HALLOWEEN_EVENT } from "./halloween/event";
import { isHalloween } from "@/lib/theme";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const halloween = await isHalloween();
  const icon = halloween ? "h" : "";
  return {
    // Na halloweenské adrese je to appka soutěže o kostým, otevře se rovnou soutěž
    name: halloween ? "Halloween · Soutěž o kostým" : APP_NAME,
    short_name: halloween ? "Halloween" : APP_NAME,
    description: halloween ? "Hlasuj o nejlepší kostým večera" : APP_TAGLINE,
    lang: "cs",
    start_url: halloween ? `/j/${HALLOWEEN_EVENT.joinCode}?soutez=1` : "/events",
    display: "standalone",
    orientation: "portrait",
    background_color: halloween ? "#07060a" : "#ffffff",
    theme_color: halloween ? "#07060a" : "#ffffff",
    icons: [
      { src: `/pwa-icon/${icon}192`, sizes: "192x192", type: "image/png" },
      { src: `/pwa-icon/${icon}512`, sizes: "512x512", type: "image/png" },
      { src: `/pwa-icon/${icon}512`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
