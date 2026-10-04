import type { EventRow } from "./types";
import { eventStatus } from "./format";

/** K akci se dá připojit ještě během ní: pozvánka (úvod, Kam vyrazíš?) zmizí den po jejím začátku. */
export function isJoinable(startsAt: string, now = Date.now()) {
  return now < new Date(startsAt).getTime() + 24 * 60 * 60 * 1000;
}

/** Nejbližší otevřená akce: probíhající má přednost, jinak ta, co začíná nejdřív. */
export function pickFeatured(events: EventRow[]): EventRow | undefined {
  return events
    .filter((e) => eventStatus(e) !== "closed")
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
    .sort((a, b) => Number(eventStatus(b) === "live") - Number(eventStatus(a) === "live"))[0];
}
