import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { Icon } from "@/components/icons";
import { AppIcon } from "@/components/logo";
import { btnSecondary, card, sectionTitle } from "@/components/ui";
import { getOrigin, isOrganizer } from "@/lib/auth";
import { STATUS_LABELS, eventStatus, formatDateTime, formatNumber, formatTime } from "@/lib/format";
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
    <main className="px-5 pt-safe">
      <Link href="/admin" className="no-print inline-flex items-center gap-0.5 pt-4 text-[17px] font-medium text-accent">
        <Icon name="back" className="size-5" /> Akce
      </Link>

      <h1 className="mt-3 font-display text-[30px] leading-tight font-bold tracking-tight">{event.name}</h1>
      <p className="mt-1 text-[15px] text-muted">
        {[event.venue, formatDateTime(event.starts_at)].filter(Boolean).join(" · ")} · {STATUS_LABELS[eventStatus(event)]}
      </p>

      <DigitCounter label="Matchů na akci" value={stats?.matches ?? 0} time={formatTime(new Date().toISOString())} />

      <section className="mt-6 rounded-[32px] border-[3px] border-white bg-white p-6 text-center text-black [text-shadow:none] shadow-[0_24px_60px_-24px_rgb(40_20_80/0.45)]">
        <p className="text-[13px] font-bold tracking-widest text-accent uppercase [text-shadow:none]">Seznam se s lidmi z akce</p>
        <img src={qr} alt={`QR kód pro ${event.name}`} className="mx-auto mt-2 w-full max-w-xs" />
        <p className="text-[13px] text-neutral-500">nebo zadej kód</p>
        <p className="font-mono text-4xl font-bold tracking-[0.3em]">{event.join_code}</p>
        <p className="mt-2 text-xs break-all text-neutral-500">{joinUrl}</p>
      </section>

      <div className="no-print mt-4 flex gap-3">
        <a href={qr} download={`getup-${event.join_code}.png`} className={`${btnSecondary} flex-1`}>
          Stáhnout PNG
        </a>
        <PrintButton />
      </div>

      <section className="no-print mt-8">
        <h2 className={sectionTitle}>Statistiky</h2>
        <div className="grid grid-cols-3 gap-3">
          {tiles.map(([title, value]) => (
            <div key={title} className={`${card} px-2 py-4 text-center`}>
              <p className="font-display text-[22px] font-bold tracking-tight">{value === undefined ? "–" : formatNumber(value)}</p>
              <p className="text-[12px] text-muted">{title}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

/** Widget ve stylu iOS: číslice v dlaždicích na tónovaném skle */
function DigitCounter({ label, value, time }: { label: string; value: number; time: string }) {
  const digits = String(Math.min(Math.max(value, 0), 99999)).padStart(5, "0").split("");
  return (
    <section className="glass-tint no-print mt-6 rounded-[36px] p-5">
      <div className="flex items-center gap-3">
        <AppIcon className="size-10 rounded-full" mark="size-6" />
        <div>
          <p className="text-[17px] leading-tight font-semibold">{label}</p>
          <p className="text-[13px] text-white/85">k {time}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-5 gap-2" aria-label={`${label}: ${value}`}>
        {digits.map((digit, i) => (
          <span
            key={i}
            aria-hidden
            className="grid aspect-[3/4] place-items-center rounded-[18px] border border-white/40 bg-white/15 font-display text-[52px] leading-none font-bold shadow-[inset_0_1px_0.5px_rgb(255_255_255/0.6),inset_0_0_14px_rgb(255_255_255/0.08)] [text-shadow:0_1px_2px_rgb(150_60_0/0.25)]"
          >
            {digit}
          </span>
        ))}
      </div>
    </section>
  );
}
