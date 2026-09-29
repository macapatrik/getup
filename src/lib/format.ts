import { EVENT_GRACE_HOURS, TIME_ZONE } from "./config";

const dateTimeFormat = new Intl.DateTimeFormat("cs-CZ", {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "numeric",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const timeFormat = new Intl.DateTimeFormat("cs-CZ", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDateTime(iso: string) {
  return dateTimeFormat.format(new Date(iso));
}

export function formatTime(iso: string) {
  return timeFormat.format(new Date(iso));
}

export type EventStatus = "upcoming" | "live" | "after" | "closed";

export function eventStatus(event: { starts_at: string; ends_at: string }, now = Date.now()): EventStatus {
  const starts = Date.parse(event.starts_at);
  const ends = Date.parse(event.ends_at);
  if (now < starts) return "upcoming";
  if (now <= ends) return "live";
  if (now <= ends + EVENT_GRACE_HOURS * 3600_000) return "after";
  return "closed";
}

export const STATUS_LABELS: Record<EventStatus, string> = {
  upcoming: "Brzy",
  live: "Právě probíhá",
  after: `Po akci – ještě ${EVENT_GRACE_HOURS} h`,
  closed: "Skončila",
};

export function ageFromBirthdate(birthdate: string, today = new Date()) {
  const [y, m, d] = birthdate.split("-").map(Number);
  let age = today.getFullYear() - y;
  if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) age--;
  return age;
}
