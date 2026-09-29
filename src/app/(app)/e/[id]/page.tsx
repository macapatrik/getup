import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icons";
import { ShareButton } from "@/components/share-button";
import { btnSecondary, card, iconButton } from "@/components/ui";
import { getOrigin, requireProfile } from "@/lib/auth";
import { STATUS_LABELS, eventCountdown, eventStatus, formatNumber } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { DeckCard, EventRow } from "@/lib/types";
import { leaveEventAction, setVisibilityAction } from "../../actions";
import { Deck } from "./deck";

export const metadata: Metadata = { title: "Swipování" };

export default async function EventPage(props: PageProps<"/e/[id]">) {
  const { id } = await props.params;
  const { user, profile } = await requireProfile();
  const supabase = await createClient();

  const [{ data: event }, { data: attendance }, { data: counts }] = await Promise.all([
    supabase.from("events").select("id, name, venue, starts_at, ends_at, join_code").eq("id", id).maybeSingle<Required<EventRow>>(),
    supabase
      .from("event_attendees")
      .select("visible")
      .eq("event_id", id)
      .eq("user_id", user.id)
      .maybeSingle<{ visible: boolean }>(),
    supabase.rpc("attendee_counts", { p_event_ids: [id] }),
  ]);
  if (!event || !attendance) notFound();

  const status = eventStatus(event);
  const attendees = Number((counts as { attendees: number }[] | null)?.[0]?.attendees ?? 0);
  const joinUrl = `${await getOrigin()}/j/${event.join_code}`;
  let cards: DeckCard[] = [];
  if (status !== "closed") {
    const { data } = await supabase.rpc("get_deck", { p_event_id: id });
    cards = (data ?? []) as DeckCard[];
  }

  return (
    <main className="fixed inset-x-0 top-0 mx-auto flex h-dvh max-w-md flex-col px-4 pt-safe pb-nav-tight lg:left-72 lg:pt-6 lg:pb-8">
      <header className="flex shrink-0 items-center gap-3 pt-2">
        <Link href="/events" aria-label="Zpět" className={iconButton}>
          <Icon name="back" className="size-5" />
        </Link>
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-[17px] font-semibold">{event.name}</p>
          <p className="truncate text-[12px] font-medium text-muted">{event.venue || STATUS_LABELS[status]}</p>
        </div>
        <details className="relative">
          <summary aria-label="Nastavení" className={`${iconButton} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}>
            <Icon name="dots" className="size-5" />
          </summary>
          <div className="glass absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-[20px] p-1.5">
            <form action={setVisibilityAction.bind(null, id, !attendance.visible)}>
              <button type="submit" className="w-full rounded-[14px] px-4 py-3 text-left text-[15px] font-medium hover:bg-black/5">
                {attendance.visible ? "Skrýt mě před ostatními" : "Zase mě ukazuj ostatním"}
              </button>
            </form>
            <form action={leaveEventAction.bind(null, id)}>
              <button
                type="submit"
                className="w-full rounded-[14px] px-4 py-3 text-left text-[15px] font-medium text-danger hover:bg-danger/10"
              >
                Opustit akci
              </button>
            </form>
          </div>
        </details>
      </header>

      {status !== "closed" && (
        <div className="glass mt-3 flex shrink-0 items-center gap-2 rounded-full py-1.5 pr-1.5 pl-4">
          <span className="flex min-w-0 flex-1 items-center gap-3 text-[13px] font-semibold">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              {status === "live" ? (
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-accent" />
                </span>
              ) : (
                <Icon name="clock" className="size-4 text-accent" />
              )}
              {eventCountdown(event)}
            </span>
            <span className="h-3.5 w-px bg-line" />
            <span className="inline-flex items-center gap-1.5 truncate text-muted">
              <Icon name="users" className="size-4" />
              {formatNumber(attendees)} {attendees === 1 ? "člověk" : attendees < 5 ? "lidi" : "lidí"}
            </span>
          </span>
          <ShareButton
            title={event.name}
            text={`Jsem na ${event.name} v GetTogether. Přidej se, ať se na akci najdeme 👋`}
            url={joinUrl}
            className="glass-inner inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold text-accent transition active:scale-95"
          />
        </div>
      )}

      {!attendance.visible && (
        <p className="glass mt-3 shrink-0 rounded-full px-4 py-2 text-center text-[13px] font-medium text-amber-700">
          Jsi skrytý/á – ostatní tě neuvidí, matche a chat fungují dál.
        </p>
      )}

      {status === "closed" ? (
        <div className="flex flex-1 items-center">
          <div className={`${card} w-full text-center`}>
            <p className="font-display text-[22px] font-bold">Tahle akce už skončila</p>
            <p className="mt-1 text-[15px] text-muted">Tvoje matche a zprávy ti ale zůstávají.</p>
            <Link href="/matches" className={`${btnSecondary} mt-5`}>
              Moje matche
            </Link>
          </div>
        </div>
      ) : (
        <Deck eventId={id} eventName={event.name} initialCards={cards} myPhoto={profile.photos[0]} />
      )}
    </main>
  );
}
