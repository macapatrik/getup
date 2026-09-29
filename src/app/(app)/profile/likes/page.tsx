import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { btnSecondary, card, largeTitle } from "@/components/ui";
import { requireProfile } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { photoUrl } from "@/lib/photos";
import { createClient } from "@/lib/supabase/server";
import type { MyLike } from "@/lib/types";
import { unlikeAction } from "../../actions";

export const metadata: Metadata = { title: "Moje lajky" };

export default async function LikesPage() {
  await requireProfile();
  const supabase = await createClient();
  const { data } = await supabase.rpc("my_likes");
  const likes = (data ?? []) as MyLike[];

  return (
    <main className="mx-auto max-w-md px-5 pt-safe lg:max-w-2xl lg:pt-6">
      <Link href="/profile" className="inline-flex items-center gap-0.5 pt-4 text-[17px] font-medium text-ink">
        <Icon name="back" className="size-5" /> Můj účet
      </Link>
      <h1 className={`${largeTitle} pt-2`}>Koho jsem lajknul/a</h1>
      <p className="mt-1 text-[15px] text-muted">Druhá strana se o lajku dozví, jen když ti ho oplatí.</p>

      {likes.length === 0 ? (
        <p className={`${card} mt-6 text-center text-[15px] text-muted`}>Zatím nikoho.</p>
      ) : (
        <ul className="glass mt-6 divide-y divide-line overflow-hidden rounded-[20px]">
          {likes.map((like) => (
            <li key={like.user_id} className="flex items-center gap-3 px-4 py-3">
              <img src={photoUrl(like.photo)} alt="" className="size-12 shrink-0 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[16px] font-semibold">
                  {like.display_name}, {like.age}
                </p>
                <p className="truncate text-[13px] text-muted">
                  {[like.event_name, formatDate(like.liked_at)].filter(Boolean).join(" · ")}
                </p>
              </div>
              {like.match_id ? (
                <Link href={`/matches/${like.match_id}`} className="shrink-0 rounded-full bg-accent/10 px-3.5 py-1.5 text-[13px] font-semibold text-ink">
                  Match · napsat
                </Link>
              ) : (
                <form action={unlikeAction.bind(null, like.user_id)}>
                  <button type="submit" className={`${btnSecondary} !px-3.5 !py-1.5 !text-[13px]`}>
                    Zrušit lajk
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
