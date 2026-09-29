import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { PushSettings } from "@/components/push-settings";
import { SubmitButton } from "@/components/submit-button";
import { btnSecondary, card, largeTitle, sectionTitle } from "@/components/ui";
import { requireProfile } from "@/lib/auth";
import { STATUS_LABELS, ageFromBirthdate, eventStatus, formatDate, formatNumber } from "@/lib/format";
import { photoUrl } from "@/lib/photos";
import { createClient } from "@/lib/supabase/server";
import type { EventRow, MatchRow, MyLike, MyStats } from "@/lib/types";
import { signOutAction } from "../actions";
import { DeleteAccount } from "./delete-account";

export const metadata: Metadata = { title: "Můj účet" };

const linkRow = "flex items-center gap-3 px-4 py-3 transition hover:bg-black/[0.03] active:bg-black/5";

export default async function AccountPage() {
  const { user, profile } = await requireProfile();
  const supabase = await createClient();
  const [{ data: statsRows }, { data: likeRows }, { data: matchRows }, { data: attendance }] = await Promise.all([
    supabase.rpc("my_stats"),
    supabase.rpc("my_likes"),
    supabase.rpc("get_matches"),
    supabase
      .from("event_attendees")
      .select("event:events(id, name, venue, starts_at, ends_at)")
      .eq("user_id", user.id)
      .order("joined_at", { ascending: false }),
  ]);

  const stats = (statsRows as MyStats[] | null)?.[0];
  const likes = (likeRows ?? []) as MyLike[];
  const matches = (matchRows ?? []) as MatchRow[];
  const events = ((attendance ?? []) as unknown as { event: EventRow | null }[])
    .map((row) => row.event)
    .filter((e): e is EventRow => e !== null);

  const tiles: [string, number | undefined][] = [
    ["Akcí", stats?.events],
    ["Lajků", stats?.likes],
    ["Matchů", stats?.matches],
    ["Zpráv", stats?.messages],
  ];

  return (
    <main className="mx-auto max-w-md px-5 pt-safe lg:max-w-5xl lg:pt-6">
      <h1 className={`${largeTitle} pt-6`}>Můj účet</h1>
      <p className="mt-1 text-[15px] text-muted">Tvoje akce, lajky a matche. Tyhle údaje vidíš jen ty.</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
        <div className="space-y-6">
          <section className={card}>
            <div className="flex items-center gap-4">
              {profile.photos[0] ? (
                <img src={photoUrl(profile.photos[0])} alt="" className="size-20 shrink-0 rounded-full object-cover" />
              ) : (
                <span className="size-20 shrink-0 rounded-full bg-fill" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-display text-[24px] leading-tight font-bold">
                  {profile.display_name} <span className="font-normal text-muted">{ageFromBirthdate(profile.birthdate)}</span>
                </p>
                <p className="truncate text-[14px] text-muted">{user.email}</p>
              </div>
            </div>
            {profile.bio && <p className="mt-4 line-clamp-3 text-[15px] leading-snug">{profile.bio}</p>}
            <Link href="/profile/edit" className={`${btnSecondary} mt-4 w-full`}>
              <Icon name="pencil" className="size-5" /> Upravit profil a fotky
            </Link>
          </section>

          <div className="grid grid-cols-4 gap-2">
            {tiles.map(([label, value]) => (
              <div key={label} className={`${card} !px-1 !py-3.5 text-center`}>
                <p className="font-display text-[22px] leading-none font-bold">{value === undefined ? "–" : formatNumber(value)}</p>
                <p className="mt-1 text-[12px] text-muted">{label}</p>
              </div>
            ))}
          </div>

          <section>
            <h2 className={sectionTitle}>Moje akce</h2>
            {events.length === 0 ? (
              <p className={`${card} text-center text-[15px] text-muted`}>Zatím žádná.</p>
            ) : (
              <ul className="glass divide-y divide-line overflow-hidden rounded-[24px]">
                {events.map((event) => {
                  const status = eventStatus(event);
                  return (
                    <li key={event.id}>
                      <Link href={status === "closed" ? "/matches" : `/e/${event.id}`} className={linkRow}>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[16px] font-semibold">{event.name}</span>
                          <span className="block text-[13px] text-muted">
                            {formatDate(event.starts_at)} · {STATUS_LABELS[status]}
                          </span>
                        </span>
                        <Icon name="chevron" className="size-4 text-faint" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section>
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className={`${sectionTitle} mb-0`}>Moje matche</h2>
              <Link href="/matches" className="text-[14px] font-semibold text-accent">
                Chaty
              </Link>
            </div>
            {matches.length === 0 ? (
              <p className={`${card} text-center text-[15px] text-muted`}>Zatím žádný match.</p>
            ) : (
              <ul className="glass flex gap-4 overflow-x-auto rounded-[24px] p-4 [scrollbar-width:none]">
                {matches.map((m) => (
                  <li key={m.match_id} className="shrink-0">
                    <Link href={`/matches/${m.match_id}`} className="flex w-16 flex-col items-center gap-1">
                      <img src={photoUrl(m.photos[0])} alt="" className="size-16 rounded-full object-cover" />
                      <span className="w-full truncate text-center text-[13px] font-semibold">{m.display_name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className={`${sectionTitle} mb-0`}>Koho jsem lajknul/a</h2>
              {likes.length > 0 && (
                <Link href="/profile/likes" className="text-[14px] font-semibold text-accent">
                  Všechny ({likes.length})
                </Link>
              )}
            </div>
            {likes.length === 0 ? (
              <p className={`${card} text-center text-[15px] text-muted`}>Zatím nikoho. Běž swipovat!</p>
            ) : (
              <Link href="/profile/likes" className="glass flex items-center gap-3 rounded-[24px] p-4">
                <span className="flex -space-x-3">
                  {likes.slice(0, 5).map((like) => (
                    <img
                      key={like.user_id}
                      src={photoUrl(like.photo)}
                      alt=""
                      className="size-11 rounded-full border-2 border-white object-cover"
                    />
                  ))}
                </span>
                <span className="min-w-0 flex-1 text-[14px] text-muted">
                  {likes.filter((l) => l.match_id).length} z nich je match
                </span>
                <Icon name="chevron" className="size-4 text-faint" />
              </Link>
            )}
          </section>

          <PushSettings />

          <section className={`${card} space-y-3`}>
            <p className="text-[17px] font-semibold">Soukromí a účet</p>
            <a href="/profile/export" className={`${btnSecondary} w-full`}>
              <Icon name="download" className="size-5" /> Stáhnout moje data
            </a>
            <form action={signOutAction}>
              <SubmitButton className={`${btnSecondary} w-full`} pendingText="Odhlašuji…">
                <Icon name="logout" className="size-5" /> Odhlásit se
              </SubmitButton>
            </form>
            <DeleteAccount userId={user.id} />
          </section>
        </div>
      </div>
    </main>
  );
}
