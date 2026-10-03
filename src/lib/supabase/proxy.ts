import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseEnv } from "./env";

// Veřejné bez přihlášení: přihlášení (návštěvníci kódem, tým heslem), právní stránky, náhledy a kampaňová stránka /halloween.
const PUBLIC_PATHS = ["/login", "/admin/login", "/auth", "/podminky", "/soukromi", "/halloween", "/robots.txt", "/opengraph-image", "/twitter-image"];

function isPublic(pathname: string) {
  return pathname === "/" || PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

// Obnoví Supabase session v cookies a nepřihlášené pošle na /login.
export async function updateSession(request: NextRequest) {
  const { url, key } = supabaseEnv();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const { pathname, search } = request.nextUrl;

  if (!data?.claims && !isPublic(pathname)) {
    const loginUrl = request.nextUrl.clone();
    // Administrace má vlastní přihlášení e-mailem a heslem.
    loginUrl.pathname = pathname.startsWith("/admin") ? "/admin/login" : "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("next", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
