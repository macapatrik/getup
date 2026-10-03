import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { card, sectionTitle } from "@/components/ui";
import { requireOrganizer } from "@/lib/auth";
import { STATUS_LABELS, eventStatus, formatDateTime } from "@/lib/format";
import { formatPhone } from "@/lib/contacts";
import { photoUrl } from "@/lib/photos";
import { createClient } from "@/lib/supabase/server";
import { GENDER_LABELS, INTEREST_LABELS, type AdminUserDetail, type Profile } from "@/lib/types";
import { Avatar, Badge, Empty, PageHeader, StatTile, list, row } from "../../ui";
import { BanForm } from "./ban-form";
import { ProfileEditor } from "./profile-editor";

export const metadata: Metadata = { title: "Uživatel" };

export default async function AdminUserPage(props: PageProps<"/admin/users/[id]">) {
  await requireOrganizer();
  const { id } = await props.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createClient();
  const { data } = await supabase.rpc("admin_user", { p_user_id: id });
  const user = data as AdminUserDetail | null;
  if (!user) notFound();

  const profile = user.profile;
  const editable: Profile | null = profile
    ? {
        id: user.id,
        display_name: profile.display_name,
        birthdate: profile.birthdate,
        gender: profile.gender,
        interested_in: profile.interested_in,
        bio: profile.bio,
        photos: profile.photos,
        instagram: profile.instagram,
        snapchat: profile.snapchat,
        phone: profile.phone,
      }
    : null;
  const info: [string, string][] = [
    ["E-mail", user.email],
    ["Registrace", formatDateTime(user.created_at)],
    ["Naposledy přihlášen/a", user.last_sign_in_at ? formatDateTime(user.last_sign_in_at) : "–"],
    ...(profile
      ? ([
          ["Pohlaví", GENDER_LABELS[profile.gender]],
          ["Chce potkat", profile.interested_in.map((g) => INTEREST_LABELS[g]).join(", ")],
          ["Instagram", profile.instagram ? `@${profile.instagram}` : "–"],
          ["Snapchat", profile.snapchat ?? "–"],
          ["Telefon", profile.phone ? formatPhone(profile.phone) : "–"],
        ] as [string, string][])
      : []),
  ];

  return (
    <>
      <PageHeader title={profile ? `${profile.display_name}, ${profile.age}` : "Bez profilu"} back={{ href: "/admin/users", label: "Uživatelé" }} />

      <div className="-mt-3 mb-6 flex flex-wrap gap-1.5">
        {user.organizer && <Badge tone="info">Tým GetUp</Badge>}
        {user.ban && <Badge tone="danger">Zablokovaný</Badge>}
        {user.reports.length > 0 && <Badge tone="accent">{user.reports.length}× nahlášen/a</Badge>}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:items-start">
        <div className="space-y-6">
          {profile && profile.photos.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {profile.photos.map((photo, i) => (
                <a key={photo} href={photoUrl(photo)} target="_blank" rel="noreferrer" className={i === 0 ? "col-span-3" : ""}>
                  <img
                    src={photoUrl(photo)}
                    alt=""
                    className={`w-full rounded-[16px] object-cover ${i === 0 ? "aspect-[4/5]" : "aspect-square"}`}
                  />
                </a>
              ))}
            </div>
          ) : (
            <div className={`${card} flex items-center gap-3`}>
              <Avatar name={user.email} className="size-12" />
              <p className="text-[15px] text-muted">Profil zatím nevyplnil/a.</p>
            </div>
          )}

          {profile?.bio && (
            <section className={card}>
              <p className="text-[13px] font-semibold tracking-wide text-muted uppercase">O mně</p>
              <p className="mt-1.5 text-[16px] leading-snug">{profile.bio}</p>
            </section>
          )}

          <dl className={list}>
            {info.map(([term, value]) => (
              <div key={term} className="flex justify-between gap-4 px-4 py-3 text-[15px]">
                <dt className="text-muted">{term}</dt>
                <dd className="min-w-0 truncate text-right font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-3 gap-3">
            <StatTile label="Lajků dal/a" value={user.stats.likes_given} />
            <StatTile label="Lajků dostal/a" value={user.stats.likes_received} />
            <StatTile label="Matchů" value={user.stats.matches} />
          </div>

          <section>
            <h2 className={sectionTitle}>Akce</h2>
            {user.events.length === 0 ? (
              <Empty>Zatím na žádné akci.</Empty>
            ) : (
              <ul className={list}>
                {user.events.map((event) => (
                  <li key={event.id}>
                    <Link href={`/admin/events/${event.id}`} className={row}>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-semibold">{event.name}</span>
                        <span className="block text-[13px] text-muted">
                          {formatDateTime(event.starts_at)} · {STATUS_LABELS[eventStatus(event)]}
                        </span>
                      </span>
                      {!event.visible && <Badge>Skrytý/á</Badge>}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className={sectionTitle}>Nahlášení</h2>
            {user.reports.length === 0 ? (
              <Empty>Nikdo ho/ji nenahlásil.</Empty>
            ) : (
              <ul className={list}>
                {user.reports.map((report) => (
                  <li key={report.id} className="px-4 py-3">
                    <p className="text-[15px]">„{report.reason}“</p>
                    <p className="mt-1 text-[13px] text-muted">
                      {report.reporter ?? "Smazaný účet"} · {formatDateTime(report.created_at)} ·{" "}
                      {report.resolved_at ? "vyřešeno" : <span className="font-semibold text-danger">nevyřešeno</span>}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section id="profil">
            <h2 className={sectionTitle}>Profil</h2>
            <ProfileEditor userId={user.id} profile={editable} />
          </section>

          <section id="moderace">
            <h2 className={sectionTitle}>Moderace</h2>
            <div className={card}>
              {user.organizer ? (
                <p className="text-[15px] text-muted">Člen týmu GetUp nejde zablokovat. Nejdřív ho odeber v sekci Tým.</p>
              ) : (
                <BanForm key={user.ban ? "banned" : "active"} userId={user.id} ban={user.ban} />
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
