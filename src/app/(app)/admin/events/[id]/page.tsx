import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { Icon } from "@/components/icons";
import { btnSecondary, card } from "@/components/ui";
import { getOrigin, isOrganizer } from "@/lib/auth";
import { STATUS_LABELS, eventStatus, formatDateTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { EventRow } from "@/lib/types";
import { PrintButton } from "./print-button";

export const metadata: Metadata = { title: "QR kód akce" };

type Stats = {
  attendees: number;
  visible_attendees: number;
  swipes: number;
  likes: number;
  matches: number;
  messages: number;
};

export default async function AdminEventPage(props: PageProps<"/admin/events/[id]">) {
  if (!(await isOrganizer())) notFound();
  const { id } = await props.params;

  const supabase = await createClient();
  const [{ data: event }, { data: statsRows }] = await Promise.all([
    supabase
      .from("events")
      .select("id, name, venue, starts_at, ends_at, join_code")
      .eq("id", id)
      .maybeSingle<Required<EventRow>>(),
    supabase.rpc("event_stats", { p_event_id: id }),
  ]);
  if (!event) notFound();

  const stats = (statsRows as Stats[] | null)?.[0];
  const joinUrl = `${await getOrigin()}/j/${event.join_code}`;
  const qr = await QRCode.toDataURL(joinUrl, { width: 1024, margin: 2, errorCorrectionLevel: "M" });

  const tiles: [string, number | undefined][] = [
    ["Lidí na akci", stats?.attendees],
    ["Swipů", stats?.swipes],
    ["Lajků", stats?.likes],
    ["Matchů", stats?.matches],
    ["Zpráv", stats?.messages],
    ["Viditelných", stats?.visible_attendees],
  ];

  return (
    <main className="px-5 pt-6">
      <Link href="/admin" className="no-print inline-flex items-center gap-1 text-sm text-muted hover:text-white">
        <Icon name="back" className="size-4" /> Všechny akce
      </Link>

      <h1 className="mt-4 text-3xl font-black">{event.name}</h1>
      <p className="text-muted">
        {[event.venue, formatDateTime(event.starts_at)].filter(Boolean).join(" · ")} · {STATUS_LABELS[eventStatus(event)]}
      </p>

      <section className="mt-6 rounded-3xl bg-white p-6 text-center text-black">
        <p className="text-sm font-bold tracking-widest uppercase">Seznam se s lidmi z akce</p>
        <img src={qr} alt={`QR kód pro ${event.name}`} className="mx-auto mt-2 w-full max-w-xs" />
        <p className="text-sm">nebo zadej kód</p>
        <p className="font-mono text-4xl font-black tracking-[0.3em]">{event.join_code}</p>
        <p className="mt-2 text-xs break-all text-neutral-500">{joinUrl}</p>
      </section>

      <div className="no-print mt-4 flex gap-3">
        <a href={qr} download={`getup-${event.join_code}.png`} className={`${btnSecondary} flex-1`}>
          Stáhnout PNG
        </a>
        <PrintButton />
      </div>

      <section className="no-print mt-8">
        <h2 className="mb-3 text-lg font-bold">Statistiky</h2>
        <div className="grid grid-cols-3 gap-3">
          {tiles.map(([title, value]) => (
            <div key={title} className={`${card} p-4 text-center`}>
              <p className="text-2xl font-black">{value ?? "–"}</p>
              <p className="text-xs text-muted">{title}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
