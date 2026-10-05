"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOrganizer } from "@/lib/auth";
import { TIME_ZONE } from "@/lib/config";
import { errorMessage } from "@/lib/errors";
import { PHOTOS_BUCKET } from "@/lib/photos";
import { createClient } from "@/lib/supabase/server";

export type AdminFormState = { error: string | null; ok?: string | null };

/** Hodnoty formuláře akce, nebo text chyby */
function readEventForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const venue = String(formData.get("venue") ?? "").trim();
  const startsAt = String(formData.get("starts_at") ?? "");
  const endsAt = String(formData.get("ends_at") ?? "");

  if (!name) return "Vyplň název akce.";
  if (!startsAt || !endsAt) return "Vyplň začátek i konec akce.";
  if (endsAt <= startsAt) return "Konec musí být po začátku.";
  return { name, venue, startsAt, endsAt };
}

// ---------- Akce ----------

export async function createEventAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireOrganizer();
  const form = readEventForm(formData);
  if (typeof form === "string") return { error: form };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_event", {
    p_name: form.name,
    p_venue: form.venue,
    p_starts_at: form.startsAt,
    p_ends_at: form.endsAt,
    p_time_zone: TIME_ZONE,
  });
  if (error || !data) return { error: errorMessage(error) };

  revalidatePath("/admin", "layout");
  redirect(`/admin/events/${(data as { id: string }).id}`);
}

export async function updateEventAction(eventId: string, _prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireOrganizer();
  const form = readEventForm(formData);
  if (typeof form === "string") return { error: form };

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_update_event", {
    p_event_id: eventId,
    p_name: form.name,
    p_venue: form.venue,
    p_starts_at: form.startsAt,
    p_ends_at: form.endsAt,
    p_time_zone: TIME_ZONE,
  });
  if (error) return { error: errorMessage(error) };

  revalidatePath("/admin", "layout");
  return { error: null, ok: "Uloženo." };
}

export async function deleteEventAction(eventId: string) {
  await requireOrganizer();
  const supabase = await createClient();
  await supabase.from("events").delete().eq("id", eventId);
  revalidatePath("/admin", "layout");
  redirect("/admin/events");
}

// ---------- Nastavení ----------

/** Odkdy jde swipovat (datetime-local v české zóně); tlačítko „Otevřít hned“ pošle open_now. */
export async function setSwipingOpensAtAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireOrganizer();
  const openNow = formData.get("open_now") === "1";
  const local = String(formData.get("opens_at") ?? "").trim();
  if (!openNow && !local) return { error: "Zadej čas, nebo klikni na Otevřít hned." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_set_swiping_opens_at", { p_local: openNow ? null : local, p_time_zone: TIME_ZONE });
  if (error) return { error: errorMessage(error) };

  revalidatePath("/", "layout");
  return { error: null, ok: openNow ? "Swipování je otevřené." : "Uloženo, swipování se otevře v zadaný čas." };
}

// ---------- Moderace ----------

export async function setBanAction(
  userId: string,
  banned: boolean,
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireOrganizer();
  const reason = String(formData.get("reason") ?? "").trim();
  if (banned && !reason) return { error: "Napiš důvod blokace (uvidí ho jen tým)." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_set_ban", { p_user_id: userId, p_banned: banned, p_reason: reason });
  if (error) return { error: errorMessage(error) };

  revalidatePath("/admin", "layout");
  return { error: null, ok: banned ? "Účet je zablokovaný." : "Účet je zase aktivní." };
}

/** Úplné smazání cizího účtu: fotky přes Storage API, zbytek zmizí kaskádou v databázi (admin_delete_user). */
export async function deleteUserAction(userId: string, _prev: AdminFormState): Promise<AdminFormState> {
  await requireOrganizer();
  const supabase = await createClient();

  const storage = supabase.storage.from(PHOTOS_BUCKET);
  const { data: files } = await storage.list(userId, { limit: 100 });
  if (files?.length) await storage.remove(files.map((f) => `${userId}/${f.name}`));

  const { error } = await supabase.rpc("admin_delete_user", { p_user_id: userId });
  if (error) return { error: errorMessage(error) };

  revalidatePath("/admin", "layout");
  redirect("/admin/users");
}

// ---------- Účast na akcích ----------

export async function addAttendanceAction(userId: string, _prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireOrganizer();
  const eventId = String(formData.get("event_id") ?? "");
  if (!eventId) return { error: "Vyber akci." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_set_attendance", { p_user_id: userId, p_event_id: eventId, p_present: true });
  if (error) return { error: errorMessage(error) };

  revalidatePath("/admin", "layout");
  return { error: null, ok: "Přidáno na akci." };
}

export async function removeAttendanceAction(userId: string, eventId: string) {
  await requireOrganizer();
  const supabase = await createClient();
  await supabase.rpc("admin_set_attendance", { p_user_id: userId, p_event_id: eventId, p_present: false });
  revalidatePath("/admin", "layout");
}

/** Rychlá blokace přímo z nahlášení – důvodem je text nahlášení. */
export async function banFromReportAction(userId: string, reason: string) {
  await requireOrganizer();
  const supabase = await createClient();
  await supabase.rpc("admin_set_ban", { p_user_id: userId, p_banned: true, p_reason: `Nahlášení: ${reason}`.slice(0, 500) });
  revalidatePath("/admin", "layout");
}

export async function resolveReportAction(reportId: number, resolved: boolean) {
  await requireOrganizer();
  const supabase = await createClient();
  await supabase.rpc("admin_resolve_report", { p_report_id: reportId, p_resolved: resolved });
  revalidatePath("/admin", "layout");
}

// ---------- Tým ----------

export async function addOrganizerAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireOrganizer();
  const email = String(formData.get("email") ?? "").trim();
  if (!email.includes("@")) return { error: "Zadej e-mail." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_add_organizer", { p_email: email });
  if (error) return { error: errorMessage(error) };

  revalidatePath("/admin/team");
  return { error: null, ok: `${email} je teď v týmu.` };
}

export async function removeOrganizerAction(userId: string) {
  await requireOrganizer();
  const supabase = await createClient();
  await supabase.rpc("admin_remove_organizer", { p_user_id: userId });
  revalidatePath("/admin/team");
}
