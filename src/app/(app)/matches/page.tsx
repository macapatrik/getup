import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { LiveRefresh } from "@/components/live-refresh";
import { btnSecondary, card, largeTitle, sectionTitle } from "@/components/ui";
import { requireProfile } from "@/lib/auth";
import { formatTime } from "@/lib/format";
import { photoUrl } from "@/lib/photos";
import { createClient } from "@/lib/supabase/server";
import type { MatchRow } from "@/lib/types";

export const metadata: Metadata = { title: "Matche" };

export default async function MatchesPage() {
  const { user } = await requireProfile();
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_matches");
  const matches = (data ?? []) as MatchRow[];

  const fresh = matches.filter((m) => !m.last_message);
  const chats = matches.filter((m) => m.last_message);

  return (
    <main className="px-5 pt-safe">
      <LiveRefresh />
      <h1 className={`${largeTitle} pt-6`}>Matche</h1>

      {matches.length === 0 && (
        <div className={`${card} mt-8 text-center`}>
          <p className="font-display text-[22px] font-bold">Zatím nic</p>
          <p className="mt-1 text-[15px] text-muted">Běž swipovat – match vznikne, když se lajknete oba.</p>
          <Link href="/events" className={`${btnSecondary} mt-5`}>
            Moje akce
          </Link>
        </div>
      )}

      {fresh.length > 0 && (
        <section className="mt-6">
          <h2 className={sectionTitle}>Nové matche</h2>
          <ul className="-mx-5 flex gap-4 overflow-x-auto px-5 pt-1 pb-2">
            {fresh.map((m) => (
              <li key={m.match_id} className="shrink-0">
                <Link href={`/matches/${m.match_id}`} className="flex w-[76px] flex-col items-center gap-1.5">
                  <span className="gloss rounded-full p-[3px]">
                    <img
                      src={photoUrl(m.photos[0])}
                      alt=""
                      className="size-[70px] rounded-full border-[3px] border-white object-cover"
                    />
                  </span>
                  <span className="w-full truncate text-center text-[13px] font-semibold">{m.display_name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {chats.length > 0 && (
        <section className="mt-7">
          <h2 className={sectionTitle}>Zprávy</h2>
          <ul className="glass overflow-hidden rounded-[24px]">
            {chats.map((m) => {
              const theirs = m.last_sender_id !== user.id;
              return (
                <li key={m.match_id} className="border-b border-line last:border-0">
                  <Link href={`/matches/${m.match_id}`} className="flex items-center gap-3.5 px-4 py-3 active:bg-black/5">
                    <img src={photoUrl(m.photos[0])} alt="" className="size-[52px] shrink-0 rounded-full object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-[17px] font-semibold">{m.display_name}</p>
                        {m.last_message_at && (
                          <span className="shrink-0 text-[13px] text-muted">{formatTime(m.last_message_at)}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className={`min-w-0 flex-1 truncate text-[15px] ${theirs ? "font-medium text-ink" : "text-muted"}`}>
                          {!theirs && "Ty: "}
                          {m.last_message}
                        </p>
                        {theirs && <span className="gloss size-2.5 shrink-0 rounded-full" />}
                      </div>
                      {m.event_name && <p className="truncate text-[12px] text-faint">📍 {m.event_name}</p>}
                    </div>
                    <Icon name="chevron" className="size-4 shrink-0 text-faint" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </main>
  );
}
