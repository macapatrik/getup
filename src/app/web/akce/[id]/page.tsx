import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Icon } from "@/components/icons";
import { LogoMark } from "@/components/logo";
import { APP_NAME, INSTAGRAM_HANDLE, INSTAGRAM_URL, SITE_URL } from "@/lib/config";
import { eventStatus, formatDate, formatTime } from "@/lib/format";
import { VENUE, campaignFor, getPublicEvents, splitEvents, weekdayOf } from "@/lib/web";
import { Countdown } from "../../countdown";
import { WebLink } from "../../link";
import { Chip, EventArt, EventCard, SectionTitle, btnGhost, btnWhite } from "../../ui";

export const revalidate = 300;

async function findEvent(id: string) {
  return (await getPublicEvents()).find((e) => e.id === id) ?? null;
}

export async function generateMetadata(props: PageProps<"/web/akce/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const event = await findEvent(id);
  if (!event) return { title: "Akce" };
  const description = `${weekdayOf(event.starts_at)} ${formatDate(event.starts_at)} od ${formatTime(event.starts_at)}, ${event.venue || VENUE.name}. ${event.description || "Párty GetUp v Českých Budějovicích."}`;
  return {
    title: event.name,
    description,
    alternates: { canonical: `/akce/${event.id}` },
    openGraph: { title: `${event.name} · ${formatDate(event.starts_at)}`, description, url: `/akce/${event.id}` },
  };
}

export default async function WebEventPage(props: PageProps<"/web/akce/[id]">) {
  const { id } = await props.params;
  const event = await findEvent(id);
  if (!event) notFound();
  const campaign = campaignFor(event);
  if (campaign) redirect(campaign.href);

  const status = eventStatus(event);
  const upcoming = status === "upcoming" || status === "live";
  const others = splitEvents(await getPublicEvents()).upcoming.filter((e) => e.id !== event.id).slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-24 pb-16 sm:px-6 sm:pt-28">
      <WebLink href="/akce" className="inline-flex items-center gap-1 text-[14px] font-bold text-white/60 transition hover:text-white">
        <Icon name="back" className="size-4" /> Všechny akce
      </WebLink>

      <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-start">
        <EventArt event={event} className="aspect-[4/5] rounded-[32px]" />
        <div>
          <p className="text-[13px] font-bold tracking-[0.22em] text-indigo-300 uppercase">
            {status === "live" ? "Právě probíhá" : upcoming ? "Nadcházející akce" : "Proběhlá akce"}
          </p>
          <h1 className="font-display mt-3 text-[44px] leading-[0.95] text-white uppercase sm:text-[64px]">{event.name}</h1>
          <div className="mt-4 flex flex-wrap gap-2">
            <Chip icon="calendar">
              <span className="capitalize">{weekdayOf(event.starts_at)}</span> {formatDate(event.starts_at)}
            </Chip>
            <Chip icon="clock">
              {formatTime(event.starts_at)} až {formatTime(event.ends_at)}
            </Chip>
            <Chip icon="pin">{event.venue || VENUE.name}</Chip>
          </div>
          {event.description && <p className="mt-5 max-w-lg text-[17px] leading-snug text-white/75">{event.description}</p>}

          {upcoming ? (
            <>
              <Countdown target={event.starts_at} liveText={`Právě teď v ${VENUE.name}`} className="mt-7 max-w-md" />
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {event.tickets_url ? (
                  <a href={event.tickets_url} target="_blank" rel="noopener" className={btnWhite}>
                    <Icon name="ticket" className="size-5" /> Koupit vstupenku
                  </a>
                ) : (
                  <a href={INSTAGRAM_URL} target="_blank" rel="noopener" className={btnWhite}>
                    <Icon name="instagram" className="size-5" /> Vstupenky a info: {INSTAGRAM_HANDLE}
                  </a>
                )}
                <a href={`${SITE_URL}/j/${event.join_code}`} className={`${btnGhost} text-accent`}>
                  <LogoMark className="size-5" /> Připojit se v {APP_NAME}
                </a>
              </div>
              <p className="mt-3 text-[13px] text-white/50">
                V {APP_NAME} uvidíš jen lidi, kteří jdou na tuhle akci. Zdarma, jen 18+.
              </p>
            </>
          ) : (
            <div className="hw-surface mt-7 rounded-[16px] p-5">
              <p className="text-[17px] font-bold text-white">Tahle párty už proběhla.</p>
              <p className="mt-1 text-[14px] text-white/60">Fotky a videa najdeš na Instagramu {INSTAGRAM_HANDLE}. Další akce jsou níž.</p>
            </div>
          )}

          <div className="hw-surface mt-7 flex flex-wrap items-center justify-between gap-3 rounded-[16px] p-5">
            <div>
              <p className="text-[13px] font-bold tracking-[0.2em] text-white/50 uppercase">Kde</p>
              <p className="mt-1 text-[17px] font-bold text-white">{event.venue || VENUE.name}</p>
              <p className="text-[14px] text-white/60">
                {VENUE.street}, {VENUE.city}
              </p>
            </div>
            <a href={VENUE.mapUrl} target="_blank" rel="noopener" className={`${btnGhost} !py-2.5 !text-[14px]`}>
              <Icon name="pin" className="size-4" /> Otevřít mapu
            </a>
          </div>
        </div>
      </div>

      {others.length > 0 && (
        <section className="mt-20">
          <SectionTitle kicker="Program" title="Další akce" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
