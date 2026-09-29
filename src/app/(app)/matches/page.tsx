import type { Metadata } from "next";
import Link from "next/link";
import { LiveRefresh } from "@/components/live-refresh";
import { btnSecondary } from "@/components/ui";
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
    <main className="px-5 pt-8">
      <LiveRefresh />
      <h1 className="text-3xl font-black">Matche</h1>

      {matches.length === 0 && (
        <div className="mt-10 rounded-3xl border border-dashed border-line p-8 text-center">
          <p className="text-xl font-bold">Zatím nic</p>
          <p className="mt-2 text-muted">Běž swipovat – match vznikne, když se lajknete oba.</p>
          <Link href="/events" className={`${btnSecondary} mt-6`}>
            Moje akce
          </Link>
        </div>
      )}

      {fresh.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 text-sm font-semibold tracking-wider text-muted uppercase">Nové matche</h2>
          <ul className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-2">
            {fresh.map((m) => (
              <li key={m.match_id} className="shrink-0">
                <Link href={`/matches/${m.match_id}`} className="flex w-20 flex-col items-center gap-2">
                  <img
                    src={photoUrl(m.photos[0])}
                    alt=""
                    className="size-20 rounded-full border-2 border-accent object-cover"
                  />
                  <span className="w-full truncate text-center text-sm font-medium">{m.display_name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {chats.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-1 text-sm font-semibold tracking-wider text-muted uppercase">Zprávy</h2>
          <ul className="divide-y divide-line">
            {chats.map((m) => (
              <li key={m.match_id}>
                <Link href={`/matches/${m.match_id}`} className="flex items-center gap-4 py-3">
                  <img src={photoUrl(m.photos[0])} alt="" className="size-14 shrink-0 rounded-full object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate font-semibold">{m.display_name}</p>
                      {m.last_message_at && (
                        <span className="shrink-0 text-xs text-muted">{formatTime(m.last_message_at)}</span>
                      )}
                    </div>
                    <p className={`truncate text-sm ${m.last_sender_id === user.id ? "text-muted" : "text-white"}`}>
                      {m.last_sender_id === user.id && "Ty: "}
                      {m.last_message}
                    </p>
                    {m.event_name && <p className="truncate text-xs text-muted/70">📍 {m.event_name}</p>}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
