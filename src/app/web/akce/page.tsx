import type { Metadata } from "next";
import { Icon } from "@/components/icons";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/config";
import { dayAndMonth, formatNumber, formatTime } from "@/lib/format";
import { eventHref, getPublicEvents, groupByYear, splitEvents } from "@/lib/web";
import { WebLink } from "../link";
import { EventCard, SectionTitle, btnGhost } from "../ui";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Akce",
  description: "Program párty GetUp v Klubu K2 v Českých Budějovicích: nadcházející akce s předprodejem a archiv všech proběhlých večerů.",
  alternates: { canonical: "/akce" },
  openGraph: { title: "Akce GetUp", url: "/akce" },
};

export default async function WebEventsPage() {
  const { upcoming, past } = splitEvents(await getPublicEvents());

  return (
    <div className="mx-auto max-w-6xl px-4 pt-28 pb-16 sm:px-6 sm:pt-36">
      <SectionTitle kicker="Program" title="Akce GetUp" text="Všechno, co chystáme v Klubu K2, a archiv toho, co už proběhlo." />

      {upcoming.length > 0 ? (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="hw-surface mt-10 rounded-[32px] p-8 text-center">
          <p className="font-display text-[32px] text-white uppercase">Další akci právě chystáme</p>
          <p className="mt-2 text-[15px] text-white/60">První se to dozvíš na Instagramu.</p>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener" className={`${btnGhost} mt-5`}>
            <Icon name="instagram" className="size-5" /> {INSTAGRAM_HANDLE}
          </a>
        </div>
      )}

      {past.length > 0 && (
        <section id="archiv" className="mt-20 scroll-mt-24">
          <SectionTitle kicker="Archiv" title={`${formatNumber(past.length)} proběhlých párty`} />
          {groupByYear(past).map(([year, list]) => (
            <div key={year} className="mt-10">
              <h3 className="font-display text-[28px] text-white/50">{year}</h3>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {list.map((event) => {
                  const { day, month } = dayAndMonth(event.starts_at);
                  return (
                    <li key={event.id}>
                      <WebLink
                        href={eventHref(event)}
                        className="hw-surface reveal flex items-center gap-4 rounded-[16px] p-3 pr-4 transition hover:bg-white/10"
                      >
                        <span className="flex size-14 shrink-0 flex-col items-center justify-center rounded-[12px] bg-white/10">
                          <span className="text-[11px] font-bold text-white/60 uppercase">{month}</span>
                          <span className="font-display text-[24px] leading-none text-white">{day}</span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[17px] font-bold text-white">{event.name}</span>
                          <span className="block truncate text-[13px] text-white/60">
                            {[event.venue, formatTime(event.starts_at)].filter(Boolean).join(" · ")}
                          </span>
                        </span>
                        <Icon name="chevron" className="size-5 text-white/40" />
                      </WebLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
