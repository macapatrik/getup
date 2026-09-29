import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Vše kromě statických souborů, ikon, manifestu, service workeru a webhooku push upozornění.
    "/((?!_next/static|_next/image|icon|apple-icon|pwa-icon|manifest.webmanifest|sw\\.js|api/push/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
