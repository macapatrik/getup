import { NextResponse, type NextRequest } from "next/server";
import { SITE_URL } from "@/lib/config";
import { updateSession } from "@/lib/supabase/proxy";

// Stará adresa aplikace. Zůstává na Vercelu kvůli vytištěným QR kódům a starým odkazům a přesměruje se na SITE_URL;
// blok pro WordPress (/halloween/embed.*) se z ní dál načítá, dokud nebude ve WordPressu nový odkaz.
const LEGACY_HOST = "together.get-up.fun";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const target = new URL(SITE_URL);
  if (request.headers.get("host") === LEGACY_HOST && target.host !== LEGACY_HOST && !pathname.startsWith("/halloween/embed")) {
    return NextResponse.redirect(new URL(pathname + search, target), 308);
  }
  return updateSession(request);
}

export const config = {
  matcher: [
    // Vše kromě statických souborů, ikon, manifestu, service workeru a webhooku push upozornění.
    "/((?!_next/static|_next/image|icon|apple-icon|pwa-icon|manifest.webmanifest|sw\\.js|api/push/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
