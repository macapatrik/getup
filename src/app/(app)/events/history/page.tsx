import type { Metadata } from "next";
import { BackHeader } from "@/components/app-header";
import { Icon } from "@/components/icons";
import { pill, sectionTitle } from "@/components/ui";
import { requireProfile } from "@/lib/auth";
import { dayAndMonth, formatNumber, formatTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { PastEvent } from "@/lib/types";

export const metadata: Metadata = { title: "Historie akcí" };

/** Historie akcí GetUp: všechny proběhlé párty podle roku, s označením těch, kde jsi byl/a. */
export default async function EventHistoryPage() {
  await requireProfile();
  const supabase = await createClient();
  const { data } = await supabase.rpc("past_events");
  const events = (data ?? []) as PastEvent[];

  const byYear = new Map<number, PastEvent[]>();
  for (const event of events) {
    const year = new Date(event.starts_at).getFullYear();
    byYear.set(year, [...(byYear.get(year) ?? []), event]);
  }
  const attended = events.filter((e) => e.attended).length;

  return (
    <main className="mx-auto max-w-md pb-nav lg:pt-6">
      <BackHeader
        href="/events"
        title="Historie akcí"
        subtitle={`${formatNumber(events.length)} proběhlých párty${attended > 0 ? ` · na ${formatNumber(attended)} jsi byl/a` : ""}`}
      />

      <div className="px-4">
        {events.length === 0 && <p className="mt-10 text-center text-[15px] text-muted">Zatím žádná proběhlá akce.</p>}

        {[...byYear.entries()].map(([year, list]) => (
          <section key={year} className="mt-6">
            <h2 className={sectionTitle}>{year}</h2>
            <ul className="surface divide-y-2 divide-fill overflow-hidden rounded-[16px]">
              {list.map((event) => {
                const { day, month } = dayAndMonth(event.starts_at);
                return (
                  <li key={event.id} className="flex items-center gap-3.5 p-3 pr-4">
                    <div className="fill-soft flex size-14 shrink-0 flex-col items-center justify-center rounded-[12px]">
                      <span className="text-[11px] font-bold text-muted uppercase">{month}</span>
                      <span className="text-[22px] leading-none font-bold">{day}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-[16px] leading-tight font-bold">{event.name}</p>
                      <p className="truncate text-[13px] text-muted">
                        {[event.venue, formatTime(event.starts_at)].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    {event.attended && (
                      <span className={`${pill} shrink-0`}>
                        <Icon name="check" className="size-3.5" /> Byl/a jsi tam
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
