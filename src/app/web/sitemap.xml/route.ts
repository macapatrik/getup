import { WEB_URL } from "@/lib/config";
import { campaignFor, getPublicEvents } from "@/lib/web";

export const revalidate = 3600;

// Sitemap webu get-up.fun (proxy na ni přepíše /sitemap.xml): stálé stránky, kampaně a detaily akcí.
export async function GET() {
  const events = await getPublicEvents();
  const urls = ["/", "/akce", "/kontakt", "/tinder", "/halloween", ...events.filter((e) => !campaignFor(e)).map((e) => `/akce/${e.id}`)];
  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${WEB_URL}${u}</loc></url>`).join("\n") +
    `\n</urlset>\n`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
