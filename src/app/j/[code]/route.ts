import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

  const { data: eventId, error } = await supabase.rpc("join_event", { p_code: code });
  if (error?.code === "GU001") redirect(`/onboarding?next=${encodeURIComponent(self)}`);
  if (error || !eventId) redirect(`/events?error=${encodeURIComponent(error?.code ?? "unknown")}`);

  if (!contest) redirect(`/e/${eventId}`);
  redirect(`/e/${eventId}/kostymy${venueCode ? `?kod=${venueCode}` : ""}`);
}
