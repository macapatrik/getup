import type { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Icon } from "@/components/icons";
import { PushSettings } from "@/components/push-settings";
import { SubmitButton } from "@/components/submit-button";
import { btnSecondary, card, pill, sectionTitle } from "@/components/ui";
import { isOrganizer, requireProfile } from "@/lib/auth";
import { contactLinks, hasContact } from "@/lib/contacts";
import { STATUS_LABELS, ageFromBirthdate, eventStatus, formatDate, formatNumber } from "@/lib/format";
import { photoUrl } from "@/lib/photos";
import { createClient } from "@/lib/supabase/server";
import type { EventRow, MatchRow, MyLike, MyStats } from "@/lib/types";
import { signOutAction } from "../actions";
import { DeleteAccount } from "./delete-account";

export const metadata: Metadata = { title: "Můj účet" };

const linkRow = "flex items-center gap-3 px-4 py-3 transition hover:bg-fill/60 active:bg-fill";

export default async function AccountPage() {
  const { user, profile } = await requireProfile();
  const supabase = await createClient();
  const [organizer, { data: statsRows }, { data: likeRows }, { data: matchRows }, { data: attendance }] = await Promise.all([
    isOrganizer(),
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
  ];

  return (
    <main className="mx-auto max-w-md pb-nav lg:max-w-5xl lg:pt-6">
      <AppHeader
        right={
          <Link href="/profile/edit" aria-label="Upravit profil" className="grid size-10 place-items-center text-ink transition active:scale-90">
            <Icon name="pencil" className="size-6" />
          </Link>
        }
      />

      <div className="px-4">
        {/* Fotka s růžovým odznakem jako u Romio (account) */}
        <section className="flex flex-col items-center pt-6 text-center">
          <Link href="/profile/edit" className="relative" aria-label="Upravit profil a fotky">
            <span className="grid size-[104px] place-items-center rounded-full border-2 border-indigo shadow-[0_16px_30px_-16px_rgb(62_54_237/0.5)]">
              {profile.photos[0] ? (
                <img src={photoUrl(profile.photos[0])} alt="" className="size-[92px] rounded-full bg-fill object-cover" />
              ) : (
                <span className="size-[92px] rounded-full bg-fill" />
              )}
            </span>
            <span className="fill-accent absolute right-0 bottom-0 grid size-9 place-items-center rounded-full border-[3px] border-white">
              <Icon name="cameraPlus" className="size-[18px]" />
            </span>
          </Link>
          <p className="mt-4 text-[24px] leading-tight font-bold">
            {profile.display_name} <span className="font-normal text-muted">{ageFromBirthdate(profile.birthdate)}</span>
          </p>
          <p className="mt-0.5 truncate text-[14px] text-muted">{user.email}</p>
          {profile.bio && <p className="mt-3 line-clamp-3 max-w-xs text-[15px] leading-snug text-muted">{profile.bio}</p>}
        </section>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
          <div className="space-y-6">
            <section>
              <h2 className={sectionTitle}>Můj kontakt pro matche</h2>
              {hasContact(profile) ? (
                <Link href="/profile/edit" className="surface flex flex-wrap items-center gap-2 rounded-[16px] p-3.5">
                  {contactLinks(profile)
                    .filter((link) => link.kind !== "sms")
                    .map((link) => (
                      <span key={link.kind} className={pill}>
                        <Icon name={link.icon} className="size-4" /> {link.detail}
                      </span>
                    ))}
                  <Icon name="chevron" className="ml-auto size-4 text-faint" />
                </Link>
              ) : (
                <Link href="/profile/edit" className="fill-accent-soft flex items-center gap-3 rounded-[16px] p-3.5 transition active:scale-[0.98]">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white">
                    <Icon name="instagram" className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1 text-[14px] leading-snug font-medium">
                    Doplň Instagram, Snapchat nebo telefon, ať se ti matche můžou ozvat.
                  </span>
                  <Icon name="chevron" className="size-4 shrink-0" />
                </Link>
              )}
            </section>

            <div className="grid grid-cols-3 gap-2">
              {tiles.map(([label, value]) => (
                <div key={label} className="surface rounded-[16px] px-1 py-3.5 text-center">
                  <p className="text-[22px] leading-none font-bold">{value === undefined ? "–" : formatNumber(value)}</p>
                  <p className="mt-1 text-[12px] font-medium text-muted">{label}</p>
                </div>
              ))}
            </div>

            <section>
              <h2 className={sectionTitle}>Moje akce</h2>
              {events.length === 0 ? (
                <p className={`${card} text-center text-[15px] text-muted`}>Zatím žádná.</p>
              ) : (
                <ul className="surface divide-y-2 divide-fill overflow-hidden rounded-[16px]">
                  {events.map((event) => {
                    const status = eventStatus(event);
                    return (
                      <li key={event.id}>
                        <Link href={status === "closed" ? "/matches" : `/e/${event.id}`} className={linkRow}>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[16px] font-bold">{event.name}</span>
                            <span className="mt-1 flex items-center gap-2 text-[13px] text-muted">
                              {formatDate(event.starts_at)}
                              <span className={pill}>{STATUS_LABELS[status]}</span>
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
              <div className="mb-3 flex items-center justify-between">
                <h2 className={`${sectionTitle} mb-0`}>Moje matche</h2>
                <Link href="/matches" className="inline-flex items-center gap-0.5 text-[15px] font-semibold text-muted">
                  Všechny <Icon name="chevron" className="size-4" />
                </Link>
              </div>
              {matches.length === 0 ? (
                <p className={`${card} text-center text-[15px] text-muted`}>Zatím žádný match.</p>
              ) : (
                <ul className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4">
                  {matches.map((m) => (
                    <li key={m.match_id} className="shrink-0">
                      <Link href={`/matches/${m.match_id}`} className="flex w-[72px] flex-col items-center gap-1.5">
                        <img src={photoUrl(m.photos[0])} alt="" className="size-[68px] rounded-full border-2 border-accent-soft bg-fill object-cover" />
                        <span className="w-full truncate text-center text-[13px] font-semibold">{m.display_name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className={`${sectionTitle} mb-0`}>Koho jsem lajknul/a</h2>
                {likes.length > 0 && (
                  <Link href="/profile/likes" className="inline-flex items-center gap-0.5 text-[15px] font-semibold text-muted">
                    Všechny ({likes.length}) <Icon name="chevron" className="size-4" />
                  </Link>
                )}
              </div>
              {likes.length === 0 ? (
                <p className={`${card} text-center text-[15px] text-muted`}>Zatím nikoho. Běž swipovat!</p>
              ) : (
                <Link href="/profile/likes" className="surface flex items-center gap-3 rounded-[16px] p-3.5">
                  <span className="flex -space-x-3">
                    {likes.slice(0, 5).map((like) => (
                      <img
                        key={like.user_id}
                        src={photoUrl(like.photo)}
                        alt=""
                        className="size-11 rounded-full border-2 border-white bg-fill object-cover"
                      />
                    ))}
                  </span>
                  <span className="min-w-0 flex-1 text-[14px] font-medium text-muted">
                    {likes.filter((l) => l.match_id).length} z nich je match
                  </span>
                  <Icon name="chevron" className="size-4 text-faint" />
                </Link>
              )}
            </section>

            <PushSettings />

            <section className={`${card} space-y-3`}>
              <p className="text-[17px] font-bold">Soukromí a účet</p>
              <a href="/profile/export" className={`${btnSecondary} w-full`}>
                <Icon name="download" className="size-5" /> Stáhnout moje data
              </a>
              <form action={signOutAction}>
                <SubmitButton className={`${btnSecondary} w-full`} pendingText="Odhlašuji…">
                  <Icon name="logout" className="size-5" /> Odhlásit se
                </SubmitButton>
              </form>
              <DeleteAccount userId={user.id} email={user.email ?? ""} organizer={organizer} />
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
