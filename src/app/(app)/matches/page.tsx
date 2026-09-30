import type { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Icon } from "@/components/icons";
import { LiveRefresh } from "@/components/live-refresh";
import { PushPrompt } from "@/components/push-settings";
import { btnPrimary, card, photoBadge, sectionTitle } from "@/components/ui";
import { requireProfile } from "@/lib/auth";
import { photoUrl } from "@/lib/photos";
import { createClient } from "@/lib/supabase/server";
import type { MatchRow } from "@/lib/types";

export const metadata: Metadata = { title: "Matche" };

/** Záložka „Matche“ jako u Romio: nové matche jako velké karty, pod tím mřížka všech. */
export default async function MatchesPage() {
  const { user } = await requireProfile();
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_matches");
  const matches = (data ?? []) as MatchRow[];

  const fresh = matches.filter((m) => !m.last_message);

  return (
    <main className="mx-auto max-w-md pb-nav lg:pt-6">
      <LiveRefresh userId={user.id} />
      <AppHeader />

      <div className="px-4">
        <PushPrompt />

        {matches.length === 0 && (
          <div className={`${card} mt-6 text-center`}>
            <span className="fill-accent-soft mx-auto grid size-16 place-items-center rounded-full">
              <Icon name="heartOutline" className="size-8" />
            </span>
            <p className="mt-4 text-[22px] font-bold">Zatím žádný match</p>
            <p className="mt-1 text-[15px] text-muted">Běž swipovat. Match vznikne, když se lajknete oba.</p>
            <Link href="/swipe" className={`${btnPrimary} mt-5 w-full`}>
              Swipovat
            </Link>
          </div>
        )}

        {fresh.length > 0 && (
          <section className="mt-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className={`${sectionTitle} mb-0`}>Nové matche</h2>
              <Link href="/messages" className="inline-flex items-center gap-0.5 text-[15px] font-semibold text-muted">
                Zprávy <Icon name="chevron" className="size-4" />
              </Link>
            </div>
            <ul className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1">
              {fresh.map((m) => (
                <li key={m.match_id} className="shrink-0 snap-start">
                  <Link
                    href={`/matches/${m.match_id}`}
                    className="relative block h-[300px] w-[200px] overflow-hidden rounded-[32px] bg-fill transition active:scale-[0.98]"
                  >
                    <img src={photoUrl(m.photos[0])} alt="" className="size-full object-cover" />
                    <div className="photo-fade absolute inset-x-0 bottom-0 h-1/2" />
                    <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                      <p className="truncate text-[20px] leading-tight font-semibold">{m.display_name}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className={`${photoBadge} !px-2.5 !py-1 !text-[12px]`}>
                          <Icon name="gender" className="size-4" /> {m.age} let
                        </span>
                        {m.event_name && (
                          <span className={`${photoBadge} min-w-0 !px-2.5 !py-1 !text-[12px]`}>
                            <Icon name="ticket" className="size-4 shrink-0" /> <span className="truncate">{m.event_name}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {matches.length > 0 && (
          <section className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className={`${sectionTitle} mb-0`}>Všechny matche ({matches.length})</h2>
            </div>
            <ul className="grid grid-cols-3 gap-4">
              {matches.map((m) => (
                <li key={m.match_id}>
                  <Link href={`/matches/${m.match_id}`} className="block transition active:scale-[0.97]">
                    <span className="relative block aspect-[120/170] overflow-hidden rounded-[32px] bg-fill">
                      <img src={photoUrl(m.photos[0])} alt="" className="size-full object-cover" />
                      {m.last_message && m.last_sender_id !== user.id && (
                        <span className="absolute top-2.5 right-2.5 size-3.5 rounded-full border-2 border-white bg-accent" aria-label="Nová zpráva" />
                      )}
                    </span>
                    <span className="mt-2 block truncate text-center text-[14px] font-semibold">{m.display_name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
