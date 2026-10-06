import { WEB_URL } from "@/lib/config";

// robots.txt pro web get-up.fun (proxy na něj přepíše /robots.txt). Stránky pod /web nejsou veřejná adresa.
export function GET() {
  return new Response(`User-agent: *\nAllow: /\nDisallow: /web/\nSitemap: ${WEB_URL}/sitemap.xml\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
