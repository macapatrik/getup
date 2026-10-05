import { createClient } from "./supabase/server";

/** Odkdy jde swipovat (null = hned). Nastavuje tým v administraci (tabulka app_settings, RPC admin_set_swiping_opens_at). */
export async function getSwipingOpensAt(): Promise<Date | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("app_settings").select("value").eq("key", "swiping_opens_at").maybeSingle<{ value: string | null }>();
  return data?.value ? new Date(data.value) : null;
}

/** Swipování je zatím zavřené (datum otevření je v budoucnu). */
export function swipingClosed(opensAt: Date | null, now = Date.now()) {
  return opensAt !== null && opensAt.getTime() > now;
}
