import type { MetadataRoute } from "next";
import { APP_NAME, APP_TAGLINE } from "@/lib/config";
import { isHalloween } from "@/lib/theme";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const halloween = await isHalloween();
  const icon = halloween ? "h" : "";
  return {
    name: APP_NAME,
    short_name: APP_NAME,
    description: APP_TAGLINE,
    lang: "cs",
    start_url: "/events",
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
