import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icons";
import { btnSecondary, card, iconButton } from "@/components/ui";
import { requireProfile } from "@/lib/auth";
import { STATUS_LABELS, eventStatus } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { DeckCard, EventRow } from "@/lib/types";
import { leaveEventAction, setVisibilityAction } from "../../actions";
import { Deck } from "./deck";

export const metadata: Metadata = { title: "Swipování" };

export default async function EventPage(props: PageProps<"/e/[id]">) {
  const { id } = await props.params;
  const { user, profile } = await requireProfile();
  const supabase = await createClient();

  const [{ data: event }, { data: attendance }] = await Promise.all([
    supabase.from("events").select("id, name, venue, starts_at, ends_at").eq("id", id).maybeSingle<EventRow>(),
    supabase
      .from("event_attendees")
      .select("visible")
      .eq("event_id", id)
      .eq("user_id", user.id)
      .maybeSingle<{ visible: boolean }>(),
  ]);
  if (!event || !attendance) notFound();

  const status = eventStatus(event);
  let cards: DeckCard[] = [];
  if (status !== "closed") {
    const { data } = await supabase.rpc("get_deck", { p_event_id: id });
    cards = (data ?? []) as DeckCard[];
  }

  return (
    <main className="flex min-h-[calc(100dvh-6rem)] flex-col px-4 pt-safe">
      <header className="flex items-center gap-3 pt-2">
        <Link href="/events" aria-label="Zpět" className={iconButton}>
          <Icon name="back" className="size-5" />
        </Link>
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-[17px] font-semibold">{event.name}</p>
          <p className="truncate text-[12px] font-medium text-muted">{STATUS_LABELS[status]}</p>
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

      {!attendance.visible && (
        <p className="glass mt-3 rounded-full px-4 py-2 text-center text-[13px] font-medium text-amber-700">
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
        <Deck eventId={id} initialCards={cards} myPhoto={profile.photos[0]} />
      )}
    </main>
  );
}
