import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BackHeader } from "@/components/app-header";
import { ContactButtons } from "@/components/contact-buttons";
import { Icon } from "@/components/icons";
import { PhotoGallery } from "@/components/photo-gallery";
import { outlineChip, sectionTitle } from "@/components/ui";
import { requireProfile } from "@/lib/auth";
import { hasContact } from "@/lib/contacts";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { MatchRow } from "@/lib/types";
import { unmatchAction } from "../../actions";
import { MatchMenu } from "./match-menu";

export const metadata: Metadata = { title: "Match" };

/** Stránka matche: profil protějšku a tlačítka na jeho kontakty (Instagram, Snapchat, telefon). */
export default async function MatchPage(props: PageProps<"/matches/[id]">) {
  const { id } = await props.params;
  const { profile } = await requireProfile();
  const supabase = await createClient();
  const { data: rows } = await supabase.rpc("get_matches", { p_match_id: id });
  const match = (rows as MatchRow[] | null)?.[0];
  if (!match) notFound();

  return (
    <main className="mx-auto max-w-md pb-nav lg:pt-6">
      <BackHeader
        href="/matches"
        title={match.display_name}
        subtitle={`Match${match.event_name ? ` z ${match.event_name}` : ""} · ${formatDate(match.matched_at)}`}
        right={<MatchMenu matchId={id} name={match.display_name} unmatch={unmatchAction.bind(null, id)} />}
      />

      <div className="px-4 pt-3">
        <PhotoGallery photos={match.photos} alt={match.display_name} className="aspect-[4/5] max-h-[58dvh] w-full" />

        <div className="mt-4">
          <h1 className="text-[24px] leading-tight font-bold">{match.display_name}</h1>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <span className={outlineChip}>
              <Icon name="gender" className="size-4" /> {match.age} let
            </span>
            {match.event_name && (
              <span className={`${outlineChip} min-w-0`}>
                <Icon name="ticket" className="size-4 shrink-0" /> <span className="truncate">{match.event_name}</span>
              </span>
            )}
          </div>
        </div>

        <section className="mt-6">
          <h2 className={sectionTitle}>Ozvi se</h2>
          <ContactButtons person={match} name={match.display_name} />
          {!hasContact(profile) && (
            <Link href="/profile/edit" className="fill-accent-soft mt-3 flex items-center gap-3 rounded-[16px] p-3.5 transition active:scale-[0.98]">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white">
                <Icon name="instagram" className="size-5" />
              </span>
              <span className="min-w-0 flex-1 text-[14px] leading-snug font-medium">
                Ty zatím žádný kontakt nemáš. Doplň Instagram, Snapchat nebo telefon, ať se ti {match.display_name} může ozvat.
              </span>
              <Icon name="chevron" className="size-4 shrink-0" />
            </Link>
          )}
        </section>

        <section className="mt-6">
          <h2 className={sectionTitle}>O mně</h2>
          <p className="text-[16px] leading-relaxed text-muted">{match.bio || "Zatím o sobě nic nenapsal/a."}</p>
        </section>
      </div>
    </main>
  );
}
