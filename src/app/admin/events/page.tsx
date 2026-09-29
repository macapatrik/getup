import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { btnPrimary } from "@/components/ui";
import { requireOrganizer } from "@/lib/auth";
import { eventStatus, formatDateTime, formatNumber } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { AdminEvent } from "@/lib/types";
import { Empty, PageHeader, StatusBadge, list, row } from "../ui";

export const metadata: Metadata = { title: "Akce" };

export default async function AdminEventsPage() {
  await requireOrganizer();
  const supabase = await createClient();
  const { data } = await supabase.rpc("admin_events");
  const events = (data ?? []) as AdminEvent[];

  return (
    <>
      <PageHeader
        title="Akce"
        subtitle={`${events.length} akcí · QR kódy, statistiky a úpravy`}
        action={
          <Link href="/admin/events/new" className={`${btnPrimary} !px-5 !py-3 !text-[15px]`}>
            <Icon name="plus" className="size-5" /> Nová akce
          </Link>
        }
      />

      {events.length === 0 ? (
        <Empty>Zatím žádné akce.</Empty>
      ) : (
        <div className={list}>
          <div className="hidden items-center gap-3 px-4 py-2.5 text-[12px] font-semibold tracking-wide text-muted uppercase md:flex">
            <span className="flex-1">Akce</span>
            <span className="w-24">Kód</span>
            <span className="w-20 text-right">Lidí</span>
            <span className="w-20 text-right">Matchů</span>
            <span className="w-32 text-right">Stav</span>
          </div>
          {events.map((event) => (
            <Link key={event.id} href={`/admin/events/${event.id}`} className={row}>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[16px] font-semibold">{event.name}</span>
                <span className="block truncate text-[13px] text-muted">
                  {[event.venue, formatDateTime(event.starts_at)].filter(Boolean).join(" · ")}
                </span>
                <span className="mt-1 block text-[13px] text-muted md:hidden">
                  {event.join_code} · {formatNumber(event.attendees)} lidí · {formatNumber(event.matches)} matchů
                </span>
              </span>
              <span className="hidden w-24 font-mono text-[14px] font-semibold tracking-widest md:block">{event.join_code}</span>
              <span className="hidden w-20 text-right text-[15px] font-semibold md:block">{formatNumber(event.attendees)}</span>
              <span className="hidden w-20 text-right text-[15px] font-semibold md:block">{formatNumber(event.matches)}</span>
              <span className="flex shrink-0 justify-end md:w-32">
                <StatusBadge status={eventStatus(event)} />
              </span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
