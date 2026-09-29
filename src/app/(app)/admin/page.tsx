import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icons";
import { card, largeTitle, sectionTitle } from "@/components/ui";
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
    <main className="px-5 pt-safe">
      <p className="pt-6 text-[13px] font-semibold tracking-wide text-muted uppercase">GetUp tým</p>
      <h1 className={largeTitle}>Akce a QR kódy</h1>

      <section className={`${card} mt-6`}>
        <h2 className="mb-4 font-display text-[20px] font-bold">Nová akce</h2>
        <CreateEventForm />
      </section>

      <h2 className={`${sectionTitle} mt-9`}>Všechny akce</h2>
      {events.length === 0 ? (
        <p className={`${card} text-center text-[15px] text-muted`}>Zatím žádné.</p>
      ) : (
        <ul className="glass overflow-hidden rounded-[24px]">
          {events.map((event) => (
            <li key={event.id} className="border-b border-line last:border-0">
              <Link href={`/admin/events/${event.id}`} className="flex items-center gap-3 px-4 py-3.5 active:bg-white/10">
                <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-[17px] font-semibold">{event.name}</p>
                  <span className="shrink-0 glass-inner rounded-full px-2.5 py-0.5 font-mono text-[13px] font-semibold tracking-widest">
                    {event.join_code}
                  </span>
                </div>
                <p className="mt-0.5 text-[14px] text-muted">
                  {formatDateTime(event.starts_at)} · {STATUS_LABELS[eventStatus(event)]}
                </p>
                </div>
                <Icon name="chevron" className="size-4 shrink-0 text-faint" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
