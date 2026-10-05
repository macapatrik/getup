import { cache } from "react";
import { EVENT as HALLOWEEN } from "@/app/halloween/event";
import { EVENT as TINDER } from "@/app/tinder/event";
import { publicClient } from "./supabase/public";
import type { PublicEvent } from "./types";

// Web GetUp (get-up.fun): akce bere z databáze (RPC public_events), kampaňové stránky mají vlastní grafiku.

/** Akce s vlastní kampaňovou stránkou, podle kódu akce. */
export const CAMPAIGNS: Record<string, { href: string; poster: string; accent: string; tagline: string }> = {
  [TINDER.joinCode]: { href: "/tinder", poster: "/tinder/poster-540.webp", accent: "#f759f5", tagline: TINDER.claim },
  [HALLOWEEN.joinCode]: { href: "/halloween", poster: "/halloween/poster-540.webp", accent: "#e0141c", tagline: `Nejlepší kostým vyhraje ${HALLOWEEN.prize}` },
};

export const campaignFor = (event: Pick<PublicEvent, "join_code">) => CAMPAIGNS[event.join_code];

/** Odkaz na stránku akce na webu: kampaň, nebo obecný detail. */
export const eventHref = (event: Pick<PublicEvent, "id" | "join_code">) => campaignFor(event)?.href ?? `/akce/${event.id}`;

/** Všechny veřejné akce (nejnovější první). Během jednoho požadavku se načítají jen jednou. */
export const getPublicEvents = cache(async (): Promise<PublicEvent[]> => {
  const { data, error } = await publicClient().rpc("public_events");
  if (error) {
    console.error("public_events", error.message);
    return [];
  }
  return (data ?? []) as PublicEvent[];
});

/** Nadcházející (včetně právě probíhajících, nejbližší první) a proběhlé (nejnovější první). */
export function splitEvents(events: PublicEvent[], now = Date.now()) {
  const upcoming = events.filter((e) => new Date(e.ends_at).getTime() > now).sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  const past = events.filter((e) => new Date(e.ends_at).getTime() <= now);
  return { upcoming, past };
}

/** Odstín pro obecnou grafiku akce bez plakátu: stabilní podle názvu. */
export function eventHue(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
}

export function groupByYear<T extends { starts_at: string }>(events: T[]) {
  const byYear = new Map<number, T[]>();
  for (const event of events) {
    const year = new Date(event.starts_at).getFullYear();
    byYear.set(year, [...(byYear.get(year) ?? []), event]);
  }
  return [...byYear.entries()].sort((a, b) => b[0] - a[0]);
}
