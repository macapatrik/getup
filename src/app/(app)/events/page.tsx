import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { card, largeTitle, sectionTitle } from "@/components/ui";
import { requireProfile } from "@/lib/auth";
import { errorMessage } from "@/lib/errors";
import {
  STATUS_LABELS,
  dayAndMonth,
  daysUntilStart,
  eventCountdown,
  eventStatus,
  formatDateTime,
  formatNumber,
  formatTime,
  type EventStatus,
} from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { EventRow } from "@/lib/types";
import { JoinForm } from "./join-form";

export const metadata: Metadata = { title: "Akce" };

const STATUS_STYLES: Record<EventStatus, string> = {
  upcoming: "bg-info/10 text-info",
  live: "bg-accent/10 text-accent",
  after: "bg-amber-400/20 text-amber-700",
  closed: "bg-fill text-muted",
};

export default async function EventsPage(props: PageProps<"/events">) {
  const { user, profile } = await requireProfile();
  const { error } = await props.searchParams;

  const supabase = await createClient();
  const { data } = await supabase
    .from("event_attendees")
    .select("joined_at, event:events(id, name, venue, starts_at, ends_at)")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false });

  const events = ((data ?? []) as unknown as { event: EventRow | null }[])
    .map((row) => row.event)
    .filter((e): e is EventRow => e !== null);
  const { data: countRows } = await supabase.rpc("attendee_counts", { p_event_ids: events.map((e) => e.id) });
  const counts = new Map(((countRows ?? []) as { event_id: string; attendees: number }[]).map((r) => [r.event_id, Number(r.attendees)]));

  // Nejbližší otevřená akce (probíhající má přednost) dostane widget nahoře, ostatní jsou v seznamu.
  const featured = events
    .filter((e) => eventStatus(e) !== "closed")
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
    .sort((a, b) => Number(eventStatus(b) === "live") - Number(eventStatus(a) === "live"))[0];
  const rest = events.filter((e) => e.id !== featured?.id);

  return (
    <main className="mx-auto max-w-md px-5 pt-safe lg:pt-6">
      <header className="pt-6">
        <p className="text-[15px] font-medium text-muted">Čau {profile.display_name} 👋</p>
        <h1 className={largeTitle}>Kam vyrazíš?</h1>
      </header>

      <section className={`${card} mt-6`}>
        <div className="flex items-start gap-3.5">
          <span className="glass-inner grid size-11 shrink-0 place-items-center rounded-[13px] text-accent">
            <Icon name="qr" className="size-6" />
          </span>
          <div>
            <p className="text-[17px] font-semibold">Připoj se k akci</p>
            <p className="text-[15px] leading-snug text-muted">
              Klikni na odkaz ze vstupenky nebo od GetUp, naskenuj QR kód u vstupu, nebo opiš kód:
            </p>
          </div>
        </div>
        <div className="mt-4">
          <JoinForm initialError={typeof error === "string" ? errorMessage(error) : null} />
        </div>
      </section>

      {featured && (
        <section className="mt-8">
          <h2 className={sectionTitle}>{eventStatus(featured) === "live" ? "Právě teď" : "Nejbližší akce"}</h2>
          <NextEventWidget event={featured} attendees={counts.get(featured.id) ?? 0} />
        </section>
      )}

      {rest.length > 0 && <h2 className={`${sectionTitle} mt-9`}>{featured ? "Další akce" : "Tvoje akce"}</h2>}
      {events.length === 0 ? (
        <p className={`${card} text-center text-[15px] text-muted`}>
          Zatím žádná. Jakmile se připojíš k akci, objeví se tady.
        </p>
      ) : (
        <ul className="space-y-3">
          {rest.map((event) => {
            const status = eventStatus(event);
            const closed = status === "closed";
            const { day, month } = dayAndMonth(event.starts_at);
            const attendees = counts.get(event.id) ?? 0;
            return (
              <li key={event.id}>
                <Link
                  href={closed ? "/matches" : `/e/${event.id}`}
                  className={`glass flex items-center gap-4 rounded-[24px] p-3.5 pr-4 transition active:scale-[0.98] ${
                    closed ? "opacity-60" : ""
                  }`}
                >
                  <div className="glass-inner flex size-14 shrink-0 flex-col items-center justify-center rounded-[16px]">
                    <span className="text-[11px] font-bold text-accent uppercase">{month}</span>
                    <span className="font-display text-[22px] leading-none font-bold">{day}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[17px] font-semibold">{event.name}</p>
                    <p className="truncate text-[14px] text-muted">
                      {[event.venue, formatTime(event.starts_at)].filter(Boolean).join(" · ")}
                    </p>
                    <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${STATUS_STYLES[status]}`}
                      >
                        {status === "live" && <span className="size-1.5 animate-pulse rounded-full bg-accent" />}
                        {status === "upcoming" ? eventCountdown(event) : STATUS_LABELS[status]}
                      </span>
                      {!closed && attendees > 0 && (
                        <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-muted">
                          <Icon name="users" className="size-3.5" />
                          {formatNumber(attendees)}
                        </span>
                      )}
                    </span>
                  </div>
                  {!closed && <Icon name="chevron" className="size-5 text-faint" />}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

/** Widget ve stylu iOS: nejbližší akce s velkým odpočtem a počtem lidí */
function NextEventWidget({ event, attendees }: { event: EventRow; attendees: number }) {
  const status = eventStatus(event);
  const days = daysUntilStart(event.starts_at);
  const big = status === "live" ? "LIVE" : status === "after" ? "24 h" : days <= 0 ? "DNES" : days === 1 ? "ZÍTRA" : String(days);
  const caption =
    status === "live"
      ? "swipuj, lidi jsou tady"
      : status === "after"
        ? "chat ještě běží"
        : days <= 1
          ? `začíná ve ${formatTime(event.starts_at)}`
          : days < 5
            ? "dny do startu"
            : "dní do startu";

  return (
    <Link href={`/e/${event.id}`} className="glass block rounded-[32px] p-5 transition active:scale-[0.98]">
      <p className="truncate font-display text-[24px] leading-tight font-bold">{event.name}</p>
      <p className="mt-0.5 truncate text-[14px] text-muted">
        {[event.venue, formatDateTime(event.starts_at)].filter(Boolean).join(" · ")}
      </p>

      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <p className="font-display text-[60px] leading-[0.9] font-bold tracking-tight text-gradient">{big}</p>
          <p className="mt-1.5 text-[13px] font-semibold text-muted">{caption}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2.5">
          <span className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-muted">
            <Icon name="users" className="size-4" />
            {formatNumber(attendees)} {attendees === 1 ? "člověk" : attendees < 5 ? "lidi" : "lidí"}
          </span>
          <span className="gloss-ink inline-flex items-center gap-1 rounded-full px-4 py-2 text-[14px] font-bold">
            Swipovat <Icon name="chevron" className="size-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
