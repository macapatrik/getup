import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { card } from "@/components/ui";
import { isOrganizer } from "@/lib/auth";
import { STATUS_LABELS, eventStatus, formatDateTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { EventRow } from "@/lib/types";
import { CreateEventForm } from "./create-event-form";

export const metadata: Metadata = { title: "Organizátor" };

export default async function AdminPage() {
  if (!(await isOrganizer())) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("id, name, venue, starts_at, ends_at, join_code")
    .order("starts_at", { ascending: false })
    .limit(100);
  const events = (data ?? []) as EventRow[];

  return (
    <main className="px-5 pt-8">
      <p className="text-sm font-semibold tracking-widest text-accent uppercase">GetUp tým</p>
      <h1 className="text-3xl font-black">Akce a QR kódy</h1>

      <section className={`${card} mt-6`}>
        <h2 className="mb-4 text-lg font-bold">Nová akce</h2>
        <CreateEventForm />
      </section>

      <h2 className="mt-10 mb-3 text-lg font-bold">Všechny akce</h2>
      {events.length === 0 ? (
        <p className="text-muted">Zatím žádné.</p>
      ) : (
        <ul className="space-y-3">
          {events.map((event) => (
            <li key={event.id}>
              <Link href={`/admin/events/${event.id}`} className={`${card} block transition hover:border-muted`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate font-bold">{event.name}</p>
                  <span className="shrink-0 font-mono text-sm tracking-widest text-accent">{event.join_code}</span>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {formatDateTime(event.starts_at)} · {STATUS_LABELS[eventStatus(event)]}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
