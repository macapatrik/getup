import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Cíl QR kódu: /j/KOD → připojí přihlášeného uživatele k akci a otevře balíček.
export async function GET(_request: NextRequest, ctx: RouteContext<"/j/[code]">) {
  const { code } = await ctx.params;
  const self = `/j/${encodeURIComponent(code)}`;

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims) redirect(`/login?next=${encodeURIComponent(self)}`);

  const { data: eventId, error } = await supabase.rpc("join_event", { p_code: code });
  if (error?.code === "GU001") redirect(`/onboarding?next=${encodeURIComponent(self)}`);
  if (error || !eventId) redirect(`/events?error=${encodeURIComponent(error?.code ?? "unknown")}`);

  redirect(`/e/${eventId}`);
}
