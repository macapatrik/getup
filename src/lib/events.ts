import type { EventRow } from "./types";
import { eventStatus } from "./format";

/** Nejbližší otevřená akce: probíhající má přednost, jinak ta, co začíná nejdřív. */
export function pickFeatured(events: EventRow[]): EventRow | undefined {
  return events
    .filter((e) => eventStatus(e) !== "closed")
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
    .sort((a, b) => Number(eventStatus(b) === "live") - Number(eventStatus(a) === "live"))[0];
}
