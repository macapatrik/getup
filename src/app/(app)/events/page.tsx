import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { card, largeTitle, sectionTitle } from "@/components/ui";
import { requireProfile } from "@/lib/auth";
import { errorMessage } from "@/lib/errors";
import { STATUS_LABELS, dayAndMonth, eventStatus, formatTime, type EventStatus } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { EventRow } from "@/lib/types";
import { JoinForm } from "./join-form";

export const metadata: Metadata = { title: "Akce" };

const STATUS_STYLES: Record<EventStatus, string> = {
  upcoming: "glass-inner text-white",
  live: "gloss",
  after: "bg-amber-300/30 text-amber-50",
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

  return (
    <main className="px-5 pt-safe">
      <header className="pt-6">
        <p className="text-[15px] font-medium text-muted">Čau {profile.display_name} 👋</p>
        <h1 className={largeTitle}>Kde dneska paříš?</h1>
      </header>

      <section className={`${card} mt-6`}>
        <div className="flex items-start gap-3.5">
          <span className="gloss grid size-11 shrink-0 place-items-center rounded-[13px]">
            <Icon name="qr" className="size-6" />
          </span>
          <div>
            <p className="text-[17px] font-semibold">Naskenuj QR kód foťákem</p>
            <p className="text-[15px] leading-snug text-muted">U vstupu, na baru nebo na vstupence. Nebo opiš kód:</p>
          </div>
        </div>
        <div className="mt-4">
          <JoinForm initialError={typeof error === "string" ? errorMessage(error) : null} />
        </div>
      </section>

      <h2 className={`${sectionTitle} mt-9`}>Tvoje akce</h2>
      {events.length === 0 ? (
        <p className={`${card} text-center text-[15px] text-muted`}>
          Zatím žádná. Jakmile se připojíš k akci, objeví se tady.
        </p>
      ) : (
        <ul className="space-y-3">
          {events.map((event) => {
            const status = eventStatus(event);
            const closed = status === "closed";
            const { day, month } = dayAndMonth(event.starts_at);
            return (
              <li key={event.id}>
                <Link
                  href={closed ? "/matches" : `/e/${event.id}`}
                  className={`glass flex items-center gap-4 rounded-[24px] p-3.5 pr-4 transition active:scale-[0.98] ${
                    closed ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex size-14 shrink-0 flex-col items-center justify-center glass-inner rounded-[16px]">
                    <span className="text-[11px] font-bold text-muted uppercase">{month}</span>
                    <span className="font-display text-[22px] leading-none font-bold">{day}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[17px] font-semibold">{event.name}</p>
                    <p className="truncate text-[14px] text-muted">
                      {[event.venue, formatTime(event.starts_at)].filter(Boolean).join(" · ")}
                    </p>
                    <span
                      className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${STATUS_STYLES[status]}`}
                    >
                      {status === "live" && <span className="size-1.5 animate-pulse rounded-full bg-white" />}
                      {STATUS_LABELS[status]}
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
