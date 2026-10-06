import { NextResponse, type NextRequest } from "next/server";
import { SITE_URL, WEB_HOSTS, WEB_URL } from "@/lib/config";
import { updateSession } from "@/lib/supabase/proxy";

// Stará adresa aplikace. Zůstává na Vercelu kvůli vytištěným QR kódům a starým odkazům a přesměruje se na SITE_URL;
// blok pro WordPress (/halloween/embed.*) se z ní dál načítá, dokud nebude ve WordPressu nový odkaz.
const LEGACY_HOST = "together.get-up.fun";

// Stránky, které jsou stejné na webu get-up.fun i v aplikaci (kampaně, právní texty).
const SHARED_PATHS = ["/tinder", "/halloween", "/podminky", "/soukromi"];
// Soubory webu, které na doméně get-up.fun nahradí ikony aplikace (viz matcher níže).
const WEB_FILES: Record<string, string> = {
  "/icon.svg": "/web/icon.png",
  "/apple-icon": "/web/apple-icon.png",
  "/robots.txt": "/web/robots.txt",
  "/sitemap.xml": "/web/sitemap.xml",
  "/manifest.webmanifest": "/web/manifest.webmanifest",
};

const startsWithAny = (pathname: string, prefixes: string[]) => prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
  const target = new URL(SITE_URL);
  if (host === LEGACY_HOST && target.host !== LEGACY_HOST && !pathname.startsWith("/halloween/embed")) {
    return NextResponse.redirect(new URL(pathname + search, target), 308);
  }

  // Web GetUp: veřejné stránky ze src/app/web, bez přihlašování. www. se sjednotí na hlavní doménu.
  if (WEB_HOSTS.includes(host)) {
    const web = new URL(WEB_URL);
    if (host.startsWith("www.") && web.host !== host) return NextResponse.redirect(new URL(pathname + search, web), 308);
    if (startsWithAny(pathname, SHARED_PATHS) || pathname.startsWith("/web/")) return NextResponse.next();
    const file = WEB_FILES[pathname.replace(/\.png$/, "")] ?? WEB_FILES[pathname];
    const url = request.nextUrl.clone();
    url.pathname = file ?? `/web${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  // Ikony a manifest aplikace (matcher je přidává jen kvůli webu) jdou bez kontroly přihlášení.
  if (pathname in WEB_FILES) return NextResponse.next();

  // V aplikaci stránky webu nejsou: odkaz na ně vede na get-up.fun.
  if (pathname === "/web" || pathname.startsWith("/web/")) {
    return NextResponse.redirect(new URL(pathname.replace(/^\/web/, "") + search || "/", WEB_URL), 308);
  }
  return updateSession(request);
}

export const config = {
  matcher: [
    // Vše kromě statických souborů, ikon, manifestu, service workeru a webhooku push upozornění.
    "/((?!_next/static|_next/image|icon|apple-icon|pwa-icon|manifest.webmanifest|sw\\.js|api/push/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
    // Ikony zvlášť: na doméně webu je nahradí logo GetUp (WEB_FILES).
    "/icon.svg",
    "/apple-icon",
    "/manifest.webmanifest",
  ],
};
