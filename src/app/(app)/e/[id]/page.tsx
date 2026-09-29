import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icons";
import { btnSecondary } from "@/components/ui";
import { requireProfile } from "@/lib/auth";
import { STATUS_LABELS, eventStatus } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { DeckCard, EventRow } from "@/lib/types";
import { leaveEventAction, setVisibilityAction } from "../../actions";
import { Deck } from "./deck";

export const metadata: Metadata = { title: "Swipování" };

export default async function EventPage(props: PageProps<"/e/[id]">) {
  const { id } = await props.params;
  const { user } = await requireProfile();
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
    <main className="flex min-h-[calc(100dvh-6rem)] flex-col px-4 pt-4">
      <header className="flex items-center gap-2">
        <Link href="/events" aria-label="Zpět" className="grid size-10 place-items-center rounded-full hover:bg-surface">
          <Icon name="back" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold">{event.name}</p>
          <p className="truncate text-xs text-muted">{STATUS_LABELS[status]}</p>
        </div>
        <details className="relative">
          <summary
            aria-label="Nastavení"
            className="grid size-10 cursor-pointer list-none place-items-center rounded-full hover:bg-surface [&::-webkit-details-marker]:hidden"
          >
            <Icon name="dots" />
          </summary>
          <div className="absolute right-0 z-20 mt-2 w-64 space-y-2 rounded-2xl border border-line bg-surface-2 p-3 shadow-xl">
            <form action={setVisibilityAction.bind(null, id, !attendance.visible)}>
              <button type="submit" className={`${btnSecondary} w-full text-sm`}>
                {attendance.visible ? "Skrýt mě před ostatními" : "Zase mě ukazuj ostatním"}
              </button>
            </form>
            <form action={leaveEventAction.bind(null, id)}>
              <button type="submit" className="w-full rounded-full px-5 py-2.5 text-sm text-red-300 hover:bg-red-500/10">
                Opustit akci
              </button>
            </form>
          </div>
        </details>
      </header>

      {!attendance.visible && (
        <p className="mt-3 rounded-2xl bg-amber-500/10 px-4 py-2 text-sm text-amber-200">
          Jsi skrytý/á – ostatní tě v balíčku neuvidí, ale matche a chat fungují dál.
        </p>
      )}

      {status === "closed" ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="text-xl font-bold">Tahle akce už skončila</p>
          <p className="mt-2 text-muted">Tvoje matche a zprávy ti ale zůstávají.</p>
          <Link href="/matches" className={`${btnSecondary} mt-6`}>
            Moje matche
          </Link>
        </div>
      ) : (
        <Deck eventId={id} initialCards={cards} />
      )}
    </main>
  );
}
