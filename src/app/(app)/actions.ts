"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isOrganizer, requireUser } from "@/lib/auth";
import { TIME_ZONE } from "@/lib/config";
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

// ---------- Organizátor ----------

export async function createEventAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  if (!(await isOrganizer())) return { error: errorMessage("GU403") };

  const name = String(formData.get("name") ?? "").trim();
  const venue = String(formData.get("venue") ?? "").trim();
  const startsAt = String(formData.get("starts_at") ?? "");
  const endsAt = String(formData.get("ends_at") ?? "");

  if (!name) return { error: "Vyplň název akce." };
  if (!startsAt || !endsAt) return { error: "Vyplň začátek i konec akce." };
  if (endsAt <= startsAt) return { error: "Konec musí být po začátku." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_event", {
    p_name: name,
    p_venue: venue,
    p_starts_at: startsAt,
    p_ends_at: endsAt,
    p_time_zone: TIME_ZONE,
  });
  if (error || !data) return { error: errorMessage(error) };

  redirect(`/admin/events/${(data as { id: string }).id}`);
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
