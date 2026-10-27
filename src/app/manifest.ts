import type { MetadataRoute } from "next";
import { APP_NAME, APP_TAGLINE, HALLOWEEN } from "@/lib/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: APP_NAME,
    description: APP_TAGLINE,
    lang: "cs",
    start_url: "/events",
    display: "standalone",
    orientation: "portrait",
    background_color: HALLOWEEN ? "#07060a" : "#ffffff",
    theme_color: HALLOWEEN ? "#07060a" : "#ffffff",
    icons: [
      { src: "/pwa-icon/192", sizes: "192x192", type: "image/png" },
      { src: "/pwa-icon/512", sizes: "512x512", type: "image/png" },
      { src: "/pwa-icon/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
