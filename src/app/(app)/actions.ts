"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { errorMessage } from "@/lib/errors";
import { TEST_MESSAGE, pushConfigured, sendPush } from "@/lib/push";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error: string | null };

// ---------- Akce ----------

export async function joinEventAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const code = String(formData.get("code") ?? "")
    .replace(/\s/g, "")
    .toUpperCase();
  if (!/^[A-Z0-9]{4,12}$/.test(code)) return { error: "Zadej kód akce (6 znaků)." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("join_event", { p_code: code });
  if (error || !data) return { error: errorMessage(error) };

  redirect(`/e/${data}`);
}

export async function setVisibilityAction(eventId: string, visible: boolean) {
  await requireUser();
  const supabase = await createClient();
  await supabase.rpc("set_event_visibility", { p_event_id: eventId, p_visible: visible });
  revalidatePath(`/e/${eventId}`);
}

export async function leaveEventAction(eventId: string) {
  const user = await requireUser();
  const supabase = await createClient();
  await supabase.from("event_attendees").delete().eq("event_id", eventId).eq("user_id", user.id);
  redirect("/events");
}

// ---------- Matche ----------

export async function unmatchAction(matchId: string) {
  await requireUser();
  const supabase = await createClient();
  await supabase.from("matches").delete().eq("id", matchId);
  redirect("/matches");
}

export async function reportAction(matchId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) return { error: "Napiš prosím, co se stalo." };

  const supabase = await createClient();
  const { data: rows } = await supabase.rpc("get_matches", { p_match_id: matchId });
  const otherId = (rows as { other_id: string }[] | null)?.[0]?.other_id;
  if (!otherId) return { error: "Tenhle match už neexistuje." };

  const { error } = await supabase.from("reports").insert({ reported_id: otherId, reason: reason.slice(0, 1000) });
  if (error) return { error: errorMessage(error) };

  // Nahlášením se match zároveň zruší.
  await supabase.from("matches").delete().eq("id", matchId);
  redirect("/matches");
}

// ---------- Účet ----------

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

// ---------- Můj účet ----------

/** Zrušení lajku (jen dokud z něj není match). */
export async function unlikeAction(userId: string) {
  await requireUser();
  const supabase = await createClient();
  await supabase.rpc("unlike", { p_target: userId });
  revalidatePath("/profile", "layout");
}

/** Souhlas s novinkami e-mailem – zapnutí i odvolání. */
export async function setMarketingAction(marketing: boolean): Promise<FormState> {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_marketing_consent", { p_marketing: marketing });
  if (error) return { error: errorMessage(error) };
  revalidatePath("/profile");
  return { error: null };
}

// ---------- Upozornění ----------

/** Zkušební push na tohle zařízení (endpoint jeho odběru). */
export async function sendTestPushAction(endpoint: string): Promise<FormState> {
  await requireUser();
  if (!pushConfigured()) return { error: "Upozornění zatím nejsou na serveru nastavená." };

  const supabase = await createClient();
  const { data } = await supabase.from("push_subscriptions").select("endpoint, p256dh, auth").eq("endpoint", endpoint);
  if (!data?.length) return { error: "Na tomhle zařízení nemáš upozornění zapnutá." };

  const { sent, gone } = await sendPush(data, TEST_MESSAGE);
  if (gone.length > 0) await supabase.from("push_subscriptions").delete().in("endpoint", gone);
  return { error: sent > 0 ? null : "Upozornění se nepodařilo odeslat. Zkus je vypnout a znovu zapnout." };
}
