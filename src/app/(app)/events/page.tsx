import type { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Icon } from "@/components/icons";
import { RefreshAt } from "@/components/refresh-at";
import { card, largeTitle, pill, sectionTitle } from "@/components/ui";
import { requireProfile } from "@/lib/auth";
import { COSTUME_PRIZE } from "@/lib/config";
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
import { isHalloween } from "@/lib/theme";
import type { CostumeResults, EventRow, PastEvent } from "@/lib/types";
import { EVENT as HALLOWEEN_EVENT } from "../../halloween/event";
import { EVENT } from "../../tinder/event";
import { HalloweenCard } from "./halloween-card";
import { JoinForm } from "./join-form";
import { LiveVoting } from "./live-voting";
import { QrScanButton } from "./qr-scanner";
import { TinderCard } from "./tinder-card";

export const metadata: Metadata = { title: "Akce" };

export default async function EventsPage(props: PageProps<"/events">) {
  const { user, profile } = await requireProfile();
  const { error } = await props.searchParams;

  const supabase = await createClient();
  const { data } = await supabase
    .from("event_attendees")
    .select("joined_at, event:events(id, name, venue, starts_at, ends_at, join_code, costume_contest)")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false });

  const events = ((data ?? []) as unknown as { event: (EventRow & { costume_contest?: boolean }) | null }[])
    .map((row) => row.event)
    .filter((e): e is EventRow & { costume_contest?: boolean } => e !== null);
  // Akce se soutěží o kostým, která ještě neskončila (odkaz nahoře na stránce)
  const contestEvent = events.find((e) => e.costume_contest && eventStatus(e) !== "closed");
  const halloween = await isHalloween();
  const [{ data: countRows }, { data: pastRows }, opensAt, { data: contestResults }] = await Promise.all([
    supabase.rpc("attendee_counts", { p_event_ids: events.map((e) => e.id) }),
    supabase.rpc("past_events"),
    getSwipingOpensAt(),
    // Živé výsledky soutěže o kostým (karta nahoře, dál se obnovuje v prohlížeči)
    contestEvent ? supabase.rpc("costume_results", { p_event_id: contestEvent.id }) : Promise.resolve({ data: null }),
  ]);
  const paused = swipingClosed(opensAt);
  const pastCount = ((pastRows ?? []) as PastEvent[]).length;
  const counts = new Map(((countRows ?? []) as { event_id: string; attendees: number }[]).map((r) => [r.event_id, Number(r.attendees)]));

  // Nejbližší otevřená akce (probíhající má přednost) dostane velkou kartu nahoře, ostatní jsou v seznamu.
  const featured = pickFeatured(events);
  const rest = events.filter((e) => e.id !== featured?.id);
  // Pozvánka na Tinder party, dokud se k ní člověk nepřipojí – bez skenování QR kódu (odkaz /j/KÓD).
  const invite = isJoinable(EVENT.startsAt) && !events.some((e) => e.join_code === EVENT.joinCode);
  // Na halloweenské adrese pozvánka a karta Halloweenu podle plakátu
  const halloweenInvite =
    halloween && isJoinable(HALLOWEEN_EVENT.startsAt) && !events.some((e) => e.join_code === HALLOWEEN_EVENT.joinCode);
  const featuredHalloween = halloween && featured?.join_code === HALLOWEEN_EVENT.joinCode;

  return (
    <main className="mx-auto max-w-md pb-nav lg:pt-6">
      <AppHeader right={<QrScanButton compact />} />
      {paused && opensAt && <RefreshAt at={opensAt.toISOString()} />}

      <div className="px-4">
        <header className="pt-5">
          <p className="text-[15px] font-semibold text-muted">Čau {profile.display_name}</p>
          <h1 className={largeTitle}>{halloween ? "Kdo tě o Halloweenu uhrane?" : "Kam vyrazíš?"}</h1>
        </header>

        {contestEvent && contestResults && (
          <div className="mt-5">
            <LiveVoting eventId={contestEvent.id} initial={contestResults as CostumeResults} />
          </div>
        )}

        {/* Upozornění pro všechny: v profilu musí být aspoň jedna fotka, na které je člověk sám (moderujeme ručně). */}
        <Link
          href="/profile/edit"
          className="mt-5 flex items-center gap-3 rounded-[16px] bg-accent p-4 text-white shadow-[0_18px_40px_-18px_rgb(var(--accent-rgb)/0.9)] transition active:scale-[0.98]"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white/20">
            <Icon name="cameraPlus" className="size-6" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[16px] leading-snug font-bold">Dej si do profilu svoji fotku</span>
            <span className="mt-0.5 block text-[13px] leading-snug text-white/90">
              Aspoň jedna fotka, na které jsi ty. Profily bez tvé fotky mažeme.
            </span>
          </span>
          <Icon name="chevron" className="size-5 shrink-0" />
        </Link>

        {halloweenInvite && (
          <section className="mt-5">
            <HalloweenCard />
          </section>
        )}

        {invite && (
          <section className="mt-5">
            <TinderCard />
          </section>
        )}

        {/* Soutěž o kostým má vlastní tlačítko na halloweenské kartě, jinak samostatný odkaz */}
        {contestEvent && !(featuredHalloween && featured?.id === contestEvent.id) && (
          <Link
            href={`/e/${contestEvent.id}/kostymy`}
            className="relative mt-5 flex items-center gap-3 overflow-hidden rounded-[16px] border border-blood/50 bg-night p-4 text-bone shadow-[0_18px_40px_-20px_rgb(224_20_28/0.8)] transition active:scale-[0.98]"
          >
            <img src="/halloween/hero-800.webp" alt="" className="absolute inset-0 size-full object-cover object-[72%_center] opacity-45" />
            <span className="hw-red relative grid size-11 shrink-0 place-items-center rounded-full">
              <Icon name="camera" className="size-6" />
            </span>
            <span className="relative min-w-0 flex-1">
              <span className="block text-[16px] leading-snug font-bold uppercase">Soutěž o nejlepší kostým</span>
              <span className="mt-0.5 block truncate text-[13px] text-bone/85">
                {contestEvent.name} · výhra {COSTUME_PRIZE}
              </span>
            </span>
            <Icon name="chevron" className="relative size-5 shrink-0" />
          </Link>
        )}

        {featured && (
          <section className="mt-5">
            {featuredHalloween ? (
              <HalloweenCard
                event={featured}
                attendees={counts.get(featured.id) ?? 0}
                opensAt={paused ? opensAt : null}
                contest={contestEvent?.id === featured.id}
              />
            ) : featured.join_code === EVENT.joinCode ? (
              <TinderCard event={featured} attendees={counts.get(featured.id) ?? 0} opensAt={paused ? opensAt : null} />
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
          !invite && !halloweenInvite && <p className="mt-6 text-center text-[15px] text-muted">Zatím žádná akce. Jakmile se připojíš, objeví se tady.</p>
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
      className="relative block overflow-hidden rounded-[32px] bg-gradient-to-br from-indigo via-violet to-accent p-5 text-white shadow-[0_24px_40px_-20px_rgb(var(--indigo-rgb)/0.5)] transition active:scale-[0.98]"
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
