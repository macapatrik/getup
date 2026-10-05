import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BackHeader } from "@/components/app-header";
import { Icon } from "@/components/icons";
import { ShareButton } from "@/components/share-button";
import { btnPrimary, btnSecondary, card } from "@/components/ui";
import { getOrigin, requireProfile } from "@/lib/auth";
import { APP_NAME } from "@/lib/config";
import { STATUS_LABELS, eventCountdown, eventStatus, formatDateTime, formatNumber } from "@/lib/format";
import { getSwipingOpensAt, swipingClosed } from "@/lib/settings";
import { createClient } from "@/lib/supabase/server";
import type { DeckCard, EventRow } from "@/lib/types";
import { leaveEventAction, setVisibilityAction } from "../../actions";
import { Deck } from "./deck";

export const metadata: Metadata = { title: "Swipování" };

export default async function EventPage(props: PageProps<"/e/[id]">) {
  const { id } = await props.params;
  const { user, profile } = await requireProfile();
  const supabase = await createClient();

  const [{ data: event }, { data: attendance }, { data: counts }, opensAt] = await Promise.all([
    supabase.from("events").select("id, name, venue, starts_at, ends_at, join_code").eq("id", id).maybeSingle<Required<EventRow>>(),
    supabase
      .from("event_attendees")
      .select("visible")
      .eq("event_id", id)
      .eq("user_id", user.id)
      .maybeSingle<{ visible: boolean }>(),
    supabase.rpc("attendee_counts", { p_event_ids: [id] }),
    getSwipingOpensAt(),
  ]);
  if (!event || !attendance) notFound();

  const status = eventStatus(event);
  const paused = swipingClosed(opensAt); // tým zatím swipování neotevřel
  const attendees = Number((counts as { attendees: number }[] | null)?.[0]?.attendees ?? 0);
  const joinUrl = `${await getOrigin()}/j/${event.join_code}`;
  let cards: DeckCard[] = [];
  if (status !== "closed" && !paused) {
    const { data } = await supabase.rpc("get_deck", { p_event_id: id });
    cards = (data ?? []) as DeckCard[];
  }

  const menuItem = "w-full rounded-[12px] px-4 py-3 text-left text-[15px] font-semibold hover:bg-fill";

  return (
    <main className="fixed inset-x-0 top-0 mx-auto flex h-dvh max-w-md flex-col pb-nav-tight lg:left-72 lg:pt-6 lg:pb-8">
      <BackHeader
        href="/events"
        title={event.name}
        subtitle={event.venue || STATUS_LABELS[status]}
        right={
          <>
            <ShareButton
              title={event.name}
              text={`Jsem na ${event.name} v ${APP_NAME}. Přidej se, ať se na akci najdeme.`}
              url={joinUrl}
              iconOnly
              className="grid size-10 place-items-center text-ink transition active:scale-90"
            />
            <details className="relative">
              <summary
                aria-label="Nastavení"
                className="grid size-10 cursor-pointer list-none place-items-center text-ink [&::-webkit-details-marker]:hidden"
              >
                <Icon name="dots" className="size-6" />
              </summary>
              <div className="surface absolute right-0 z-20 mt-1 w-64 overflow-hidden rounded-[16px] p-1.5 shadow-[0_16px_40px_-20px_rgb(0_0_0/0.3)]">
                <form action={setVisibilityAction.bind(null, id, !attendance.visible)}>
                  <button type="submit" className={menuItem}>
                    {attendance.visible ? "Skrýt mě před ostatními" : "Zase mě ukazuj ostatním"}
                  </button>
                </form>
                <form action={leaveEventAction.bind(null, id)}>
                  <button type="submit" className={`${menuItem} text-danger hover:bg-danger/10`}>
                    Opustit akci
                  </button>
                </form>
              </div>
            </details>
          </>
        }
      />

      {status !== "closed" && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 px-4 pt-3">
          <span className="fill-accent-soft inline-flex items-center gap-1.5 rounded-[10px] px-3 py-1 text-[12px] font-semibold">
            {status === "live" ? (
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-accent" />
              </span>
            ) : (
              <Icon name="clock" className="size-4" />
            )}
            {eventCountdown(event)}
          </span>
          <span className="fill-soft inline-flex items-center gap-1.5 rounded-[10px] px-3 py-1 text-[12px] font-semibold text-muted">
            <Icon name="users" className="size-4" />
            {formatNumber(attendees)} {attendees === 1 ? "člověk" : attendees < 5 ? "lidi" : "lidí"}
          </span>
          {!attendance.visible && (
            <span className="inline-flex items-center rounded-[10px] bg-amber-100 px-3 py-1 text-[12px] font-semibold text-amber-800">
              Jsi skrytý/á
            </span>
          )}
        </div>
      )}

      {status === "closed" ? (
        <div className="flex flex-1 items-center px-4">
          <div className={`${card} w-full text-center`}>
            <p className="text-[22px] font-bold">Tahle akce už skončila</p>
            <p className="mt-1 text-[15px] text-muted">Tvoje matche ti ale zůstávají.</p>
            <Link href="/matches" className={`${btnSecondary} mt-5`}>
              Moje matche
            </Link>
          </div>
        </div>
      ) : paused && opensAt ? (
        <div className="flex flex-1 items-center px-4">
          <div className={`${card} w-full py-8 text-center`}>
            <span className="fill-accent-soft mx-auto grid size-16 place-items-center rounded-full">
              <Icon name="clock" className="size-8" />
            </span>
            <p className="mt-4 text-[22px] font-bold">Swipování startuje</p>
            <p className="mt-1 text-[28px] leading-tight font-bold text-accent">{formatDateTime(opensAt.toISOString())}</p>
            <p className="mt-3 text-[15px] leading-snug text-muted">
              Zatím se připojuj k akcím a dolaď si profil, ať máš fotky a kontakt hotové, až to začne. Kdo je na akci s tebou,
              uvidíš hned po startu.
            </p>
            <Link href="/profile/edit" className={`${btnPrimary} mt-5 w-full`}>
              Upravit profil
            </Link>
          </div>
        </div>
      ) : (
        <Deck eventId={id} eventName={event.name} venue={event.venue} initialCards={cards} myPhoto={profile.photos[0]} />
      )}
    </main>
  );
}
