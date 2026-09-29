import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { card } from "@/components/ui";
import { requireProfile } from "@/lib/auth";
import { errorMessage } from "@/lib/errors";
import { STATUS_LABELS, eventStatus, formatDateTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { EventRow } from "@/lib/types";
import { JoinForm } from "./join-form";

export const metadata: Metadata = { title: "Akce" };

const STATUS_STYLES = {
  upcoming: "bg-sky-500/15 text-sky-300",
  live: "bg-party text-white",
  after: "bg-amber-500/15 text-amber-300",
  closed: "bg-surface-2 text-muted",
} as const;

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
    <main className="px-5 pt-8">
      <p className="text-muted">Čau {profile.display_name} 👋</p>
      <h1 className="text-3xl font-black">Kde dneska paříš?</h1>

      <section className={`${card} mt-6`}>
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface-2 text-accent">
            <Icon name="qr" />
          </span>
          <div>
            <p className="font-semibold">Naskenuj QR kód foťákem v mobilu</p>
            <p className="text-sm text-muted">Najdeš ho u vstupu, na baru nebo na vstupence. Nebo opiš kód:</p>
          </div>
        </div>
        <div className="mt-4">
          <JoinForm initialError={typeof error === "string" ? errorMessage(error) : null} />
        </div>
      </section>

      <h2 className="mt-10 mb-3 text-lg font-bold">Tvoje akce</h2>
      {events.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-line p-6 text-center text-muted">
          Zatím žádná. Jakmile se připojíš k akci, objeví se tady.
        </p>
      ) : (
        <ul className="space-y-3">
          {events.map((event) => {
            const status = eventStatus(event);
            const closed = status === "closed";
            return (
              <li key={event.id}>
                <Link
                  href={closed ? "/matches" : `/e/${event.id}`}
                  className={`${card} flex items-center gap-4 transition hover:border-muted ${closed ? "opacity-60" : ""}`}
                >
                  <div className="min-w-0 flex-1">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status]}`}
                    >
                      {STATUS_LABELS[status]}
                    </span>
                    <p className="mt-2 truncate text-lg font-bold">{event.name}</p>
                    <p className="truncate text-sm text-muted">
                      {[event.venue, formatDateTime(event.starts_at)].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  {!closed && <span className="text-2xl text-accent">→</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
