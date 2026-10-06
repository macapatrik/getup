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
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {upcoming.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-[28px] border-[3px] border-white bg-[#1d0f3f] p-8 text-center shadow-[8px_8px_0_#f759f5]">
          <p className="font-party text-[32px] text-white uppercase">Další akci právě chystáme</p>
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
              <h3 className="font-party text-[28px] text-white/50 uppercase">{year}</h3>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {list.map((event) => {
                  const { day, month } = dayAndMonth(event.starts_at);
                  return (
                    <li key={event.id}>
                      <WebLink
                        href={eventHref(event)}
                        className="reveal flex items-center gap-4 rounded-[18px] border-[3px] border-white bg-[#1d0f3f] p-3 pr-4 transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#2ee7ff]"
                      >
                        <span className="flex size-14 shrink-0 flex-col items-center justify-center rounded-[14px] bg-sun text-party">
                          <span className="text-[11px] font-extrabold uppercase">{month}</span>
                          <span className="font-party text-[22px] leading-none">{day}</span>
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
