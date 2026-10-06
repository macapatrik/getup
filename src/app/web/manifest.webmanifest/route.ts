// Manifest webu get-up.fun (proxy na něj přepíše /manifest.webmanifest): jen název a ikona, bez instalace jako aplikace.
export function GET() {
  const manifest = {
    name: "GetUp",
    short_name: "GetUp",
    description: "Párty v Českých Budějovicích",
    lang: "cs",
    start_url: "/",
    display: "browser",
    background_color: "#07060a",
    theme_color: "#07060a",
    icons: [{ src: "/web/icon-512.png", sizes: "512x512", type: "image/png" }],
  };
  return Response.json(manifest, { headers: { "Content-Type": "application/manifest+json" } });
}
