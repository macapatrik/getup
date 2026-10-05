import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Vložení stránky /halloween do webu get-up.fun (WordPress): embed.js si stáhne embed.html z jiné domény.
        source: "/halloween/embed.html",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
      {
        // Totéž pro stránku /tinder (Tinder party + Halloween), scripts/export-tinder-wordpress.mjs.
        source: "/tinder/embed.html",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
      {
        // Service worker se musí vždy stáhnout čerstvý (jinak by se nové verze nedostaly k uživatelům).
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ];
  },
};

export default nextConfig;
