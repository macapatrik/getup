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

/** ISO čas → hodnota pro <input type="datetime-local"> v české zóně */
export function toLocalInput(iso: string) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
    .format(new Date(iso))
    .replace(" ", "T");
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("cs-CZ", { timeZone: TIME_ZONE, day: "numeric", month: "numeric", year: "numeric" }).format(
    new Date(iso),
  );
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

/** Počet kalendářních dní (v české zóně) do začátku akce; 0 = dnes. */
export function daysUntilStart(startsAt: string, now = new Date()) {
  const dayKey = (d: Date) => new Intl.DateTimeFormat("sv-SE", { timeZone: TIME_ZONE, dateStyle: "short" }).format(d);
  return Math.round((Date.parse(dayKey(new Date(startsAt))) - Date.parse(dayKey(now))) / 86_400_000);
}

/** „1 člověk“, „3 lidi“, „12 lidí“ (počet lidí na akci). */
export function peopleLabel(count: number) {
  return `${formatNumber(count)} ${count === 1 ? "člověk" : count < 5 ? "lidi" : "lidí"}`;
}

/** Krátký odpočet do začátku (a stav během akce) – „za 12 dní“, „zítra“, „dnes ve 21:00“. */
export function eventCountdown(event: { starts_at: string; ends_at: string }, now = new Date()): string {
  const status = eventStatus(event, now.getTime());
  if (status === "live") return "právě probíhá";
  if (status === "after") return "skončila, ještě můžeš swipovat";
  if (status === "closed") return "skončila";

  const days = daysUntilStart(event.starts_at, now);
  if (days <= 0) return `dnes ve ${formatTime(event.starts_at)}`;
  if (days === 1) return `zítra ve ${formatTime(event.starts_at)}`;
  if (days < 5) return `za ${days} dny`;
  return `za ${days} dní`;
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

const dayFormat = new Intl.DateTimeFormat("cs-CZ", { timeZone: TIME_ZONE, day: "numeric" });
const monthFormat = new Intl.DateTimeFormat("cs-CZ", { timeZone: TIME_ZONE, month: "short" });

/** Pro "kalendářovou" dlaždici: { day: "29", month: "zář" } */
export function dayAndMonth(iso: string) {
  const date = new Date(iso);
  return { day: dayFormat.format(date).replace(".", ""), month: monthFormat.format(date).replace(".", "") };
}

/** "16. 10." (bez roku) pro štítky */
export function formatDayMonth(iso: string) {
  return new Intl.DateTimeFormat("cs-CZ", { timeZone: TIME_ZONE, day: "numeric", month: "numeric" }).format(new Date(iso));
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("cs-CZ").format(value);
}
