import { cache } from "react";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export const getUser = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) return null;
  return { id: claims.sub, email: typeof claims.email === "string" ? claims.email : "" };
});

export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

export const getProfile = cache(async (): Promise<Profile | null> => {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, birthdate, gender, interested_in, bio, photos")
    .eq("id", user.id)
    .maybeSingle();
  return data as Profile | null;
});

/** Přihlášený uživatel s vyplněným profilem, jinak přesměrování. */
export async function requireProfile() {
  const user = await requireUser();
  const profile = await getProfile();
  if (!profile) redirect("/onboarding");
  return { user, profile };
}

export const isOrganizer = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.rpc("is_organizer");
  return data === true;
});

/** Přihlášený organizátor (tým GetUp), jinak 404. */
export async function requireOrganizer() {
  const user = await requireUser();
  if (!(await isOrganizer())) notFound();
  return user;
}

/** Veřejná adresa aplikace – pro odkazy v QR kódech. */
export async function getOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
