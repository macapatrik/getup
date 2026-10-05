import type { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Icon } from "@/components/icons";
import { card, largeTitle, pill, sectionTitle } from "@/components/ui";
import { requireProfile } from "@/lib/auth";
import { errorMessage } from "@/lib/errors";
import { isJoinable, pickFeatured } from "@/lib/events";
import {
  STATUS_LABELS,
  dayAndMonth,
  daysUntilStart,
  eventCountdown,
  eventStatus,
  formatDateTime,
  formatDayMonth,
  formatNumber,
  formatTime,
  peopleLabel,
} from "@/lib/format";
import { getSwipingOpensAt, swipingClosed } from "@/lib/settings";
import { createClient } from "@/lib/supabase/server";
import type { EventRow, PastEvent } from "@/lib/types";
import { EVENT } from "../../halloween/event";
import { HalloweenCard } from "./halloween-card";
import { JoinForm } from "./join-form";
import { QrScanButton } from "./qr-scanner";

export const metadata: Metadata = { title: "Akce" };

export default async function EventsPage(props: PageProps<"/events">) {
  const { user, profile } = await requireProfile();
  const { error } = await props.searchParams;

  const supabase = await createClient();
  const { data } = await supabase
    .from("event_attendees")
    .select("joined_at, event:events(id, name, venue, starts_at, ends_at, join_code)")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false });

  const events = ((data ?? []) as unknown as { event: EventRow | null }[])
    .map((row) => row.event)
    .filter((e): e is EventRow => e !== null);
  const [{ data: countRows }, { data: pastRows }, opensAt] = await Promise.all([
    supabase.rpc("attendee_counts", { p_event_ids: events.map((e) => e.id) }),
    supabase.rpc("past_events"),
    getSwipingOpensAt(),
  ]);
  const paused = swipingClosed(opensAt);
  const pastCount = ((pastRows ?? []) as PastEvent[]).length;
  const counts = new Map(((countRows ?? []) as { event_id: string; attendees: number }[]).map((r) => [r.event_id, Number(r.attendees)]));

  // Nejbližší otevřená akce (probíhající má přednost) dostane velkou kartu nahoře, ostatní jsou v seznamu.
  const featured = pickFeatured(events);
  const rest = events.filter((e) => e.id !== featured?.id);
  // Pozvánka na Halloween, dokud se k němu člověk nepřipojí – bez skenování QR kódu (odkaz /j/KÓD).
  const invite = isJoinable(EVENT.startsAt) && !events.some((e) => e.join_code === EVENT.joinCode);

  return (
    <main className="mx-auto max-w-md pb-nav lg:pt-6">
      <AppHeader right={<QrScanButton compact />} />

      <div className="px-4">
        <header className="pt-5">
          <p className="text-[15px] font-semibold text-muted">Čau {profile.display_name}</p>
          <h1 className={largeTitle}>Kam vyrazíš?</h1>
        </header>

        {invite && (
          <section className="mt-5">
            <HalloweenCard />
          </section>
        )}

        {featured && (
          <section className="mt-5">
            {featured.join_code === EVENT.joinCode ? (
              <HalloweenCard event={featured} attendees={counts.get(featured.id) ?? 0} />
            ) : (
              <NextEventCard event={featured} attendees={counts.get(featured.id) ?? 0} opensAt={paused ? opensAt : null} />
            )}
          </section>
        )}

        <section className={`${card} mt-5`}>
          <div className="flex items-start gap-3">
            <span className="fill-accent-soft grid size-11 shrink-0 place-items-center rounded-[12px]">
              <Icon name="qr" className="size-6" />
            </span>
            <div>
              <p className="text-[17px] font-bold">Připoj se k akci</p>
              <p className="text-[14px] leading-snug text-muted">
                Naskenuj QR kód u vstupu nebo na vstupence, klikni na odkaz od GetUp, nebo opiš kód.
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <QrScanButton />
            <div className="flex items-center gap-3 text-[12px] font-bold tracking-wide text-muted uppercase">
              <span className="h-px flex-1 bg-line" /> nebo kód <span className="h-px flex-1 bg-line" />
            </div>
            <JoinForm initialError={typeof error === "string" ? errorMessage(error) : null} />
          </div>
        </section>

        {rest.length > 0 && <h2 className={`${sectionTitle} mt-8`}>{featured ? "Další akce" : "Tvoje akce"}</h2>}
        {events.length === 0 ? (
          !invite && <p className="mt-6 text-center text-[15px] text-muted">Zatím žádná akce. Jakmile se připojíš, objeví se tady.</p>
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
                    className={`surface flex items-center gap-3.5 rounded-[16px] p-3 pr-4 transition active:scale-[0.98] ${
                      closed ? "opacity-60" : ""
                    }`}
                  >
                    <div className="fill-soft flex size-14 shrink-0 flex-col items-center justify-center rounded-[12px]">
                      <span className="text-[11px] font-bold text-muted uppercase">{month}</span>
                      <span className="text-[22px] leading-none font-bold">{day}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[16px] font-bold">{event.name}</p>
                      <p className="truncate text-[13px] text-muted">
                        {[event.venue, formatTime(event.starts_at)].filter(Boolean).join(" · ")}
                      </p>
                      <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className={pill}>
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

        <Link
          href="/events/history"
          className="surface mt-8 flex items-center gap-3.5 rounded-[16px] p-3 pr-4 transition active:scale-[0.98]"
        >
          <span className="fill-accent-soft grid size-14 shrink-0 place-items-center rounded-[12px]">
            <Icon name="clock" className="size-6" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[16px] font-bold">Historie akcí</span>
            <span className="block text-[13px] text-muted">
              {pastCount > 0 ? `${formatNumber(pastCount)} proběhlých párty GetUp` : "Všechny proběhlé párty GetUp"}
            </span>
          </span>
          <Icon name="chevron" className="size-5 text-faint" />
        </Link>
      </div>
    </main>
  );
}

/** Velká karta nejbližší akce – přechod jako na kartách Romio, odpočet a tlačítko Swipovat. */
function NextEventCard({ event, attendees, opensAt }: { event: EventRow; attendees: number; opensAt: Date | null }) {
  const status = eventStatus(event);
  const days = daysUntilStart(event.starts_at);
  const big = status === "live" ? "LIVE" : status === "after" ? "24 h" : days <= 0 ? "DNES" : days === 1 ? "ZÍTRA" : String(days);
  const caption =
    status === "live"
      ? "právě probíhá, lidi jsou tady"
      : status === "after"
        ? "po akci, ještě můžeš swipovat"
        : days <= 1
          ? `začíná ve ${formatTime(event.starts_at)}`
          : days < 5
            ? "dny do startu"
            : "dní do startu";

  return (
    <Link
      href={`/e/${event.id}`}
      className="relative block overflow-hidden rounded-[32px] bg-gradient-to-br from-indigo via-[#7a3ff0] to-accent p-5 text-white shadow-[0_24px_40px_-20px_rgb(62_54_237/0.5)] transition active:scale-[0.98]"
    >
      <span className="absolute -top-10 -right-10 size-40 rounded-full bg-white/10" aria-hidden />
      <span className="absolute -bottom-16 -left-6 size-40 rounded-full bg-white/10" aria-hidden />
      <p className="relative text-[12px] font-bold tracking-wide text-white/80 uppercase">
        {status === "live" ? "Právě teď" : "Nejbližší akce"}
      </p>
      <p className="relative mt-1 truncate text-[24px] leading-tight font-bold">{event.name}</p>
      <div className="relative mt-3 flex flex-wrap gap-2">
        {event.venue && (
          <span className="photo-chip inline-flex items-center gap-1.5 rounded-[30px] px-3 py-1 text-[12px] font-medium">
            <Icon name="pin" className="size-4" /> {event.venue}
          </span>
        )}
        <span className="photo-chip inline-flex items-center gap-1.5 rounded-[30px] px-3 py-1 text-[12px] font-medium">
          <Icon name="calendar" className="size-4" /> {formatDateTime(event.starts_at)}
        </span>
      </div>
      <div className="relative mt-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-[56px] leading-[0.9] font-bold tracking-tight">{big}</p>
          <p className="mt-1.5 text-[13px] font-semibold text-white/85">{caption}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2.5">
          <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white/85">
            <Icon name="users" className="size-4" />
            {peopleLabel(attendees)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-[12px] bg-white px-4 py-2 text-[14px] font-bold text-accent">
            {opensAt ? (
              <>
                <Icon name="clock" className="size-4" /> Od {formatDayMonth(opensAt.toISOString())}
              </>
            ) : (
              <>
                Swipovat <Icon name="chevron" className="size-4" />
              </>
            )}
          </span>
        </div>
      </div>
    </Link>
  );
}
