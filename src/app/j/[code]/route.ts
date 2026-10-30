import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isHalloween } from "@/lib/theme";

// Cíl QR kódu: /j/KOD → připojí přihlášeného uživatele k akci a otevře balíček.
// QR kód z obrazovky v klubu má navíc ?kod=123456 (soutěž o kostým): po připojení otevře hlasování a kód rovnou ověří.
// ?soutez=1 (krátká adresa halloween.get-up.fun) po připojení otevře soutěž o kostým bez kódu.
export async function GET(request: NextRequest, ctx: RouteContext<"/j/[code]">) {
  const { code } = await ctx.params;
  const venueCode = request.nextUrl.searchParams.get("kod")?.replace(/\D/g, "").slice(0, 6) || null;
  const contest = Boolean(venueCode) || request.nextUrl.searchParams.has("soutez");
  const self = `/j/${encodeURIComponent(code)}${venueCode ? `?kod=${venueCode}` : contest ? "?soutez=1" : ""}`;

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims) redirect(`/login?next=${encodeURIComponent(self)}`);

  const halloween = await isHalloween();
  const { data: eventId, error } = await supabase.rpc("join_event", { p_code: code });
  if (error?.code === "GU001") redirect(`/onboarding?next=${encodeURIComponent(self)}`);
  // Na halloweenské adrese stránka akcí není (vede zpátky sem), chyba se ukáže v účtu.
  if (error || !eventId) redirect(`${halloween ? "/profile" : "/events"}?error=${encodeURIComponent(error?.code ?? "unknown")}`);

  // Kdo se připojí přes halloweenskou adresu (jen kvůli soutěži), není vidět ve swipování; zapnout si to může v GetCrush.
  if (halloween) {
    const { data: row } = await supabase
      .from("event_attendees")
      .select("joined_at")
      .eq("event_id", eventId)
      .eq("user_id", auth.claims.sub)
      .maybeSingle<{ joined_at: string }>();
    if (row && Date.now() - new Date(row.joined_at).getTime() < 60_000) {
      await supabase.rpc("set_event_visibility", { p_event_id: eventId, p_visible: false });
    }
  }

  if (!contest) redirect(`/e/${eventId}`);
  redirect(`/e/${eventId}/kostymy${venueCode ? `?kod=${venueCode}` : ""}`);
}
