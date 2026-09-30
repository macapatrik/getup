import type { Metadata } from "next";
import Link from "next/link";
import { BackHeader } from "@/components/app-header";
import { btnSecondary, card, pill } from "@/components/ui";
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
    <main className="mx-auto max-w-md pb-nav lg:max-w-2xl lg:pt-6">
      <BackHeader href="/profile" title="Koho jsem lajknul/a" subtitle="Druhá strana se o lajku dozví, jen když ti ho oplatí." />

      <div className="px-4">
        {likes.length === 0 ? (
          <p className={`${card} mt-6 text-center text-[15px] text-muted`}>Zatím nikoho.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {likes.map((like) => (
              <li key={like.user_id} className="surface flex items-center gap-3 rounded-[36px] p-1 pr-3">
                <img src={photoUrl(like.photo)} alt="" className="size-16 shrink-0 rounded-full bg-fill object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[16px] font-bold">
                    {like.display_name}, {like.age}
                  </p>
                  <p className="truncate text-[13px] text-muted">
                    {[like.event_name, formatDate(like.liked_at)].filter(Boolean).join(" · ")}
                  </p>
                </div>
                {like.match_id ? (
                  <Link href={`/matches/${like.match_id}`} className={`${pill} shrink-0 !px-3.5 !py-2 !text-[13px]`}>
                    Match · napsat
                  </Link>
                ) : (
                  <form action={unlikeAction.bind(null, like.user_id)}>
                    <button type="submit" className={`${btnSecondary} !bg-fill !px-3.5 !py-2 !text-[13px] !text-ink`}>
                      Zrušit lajk
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
