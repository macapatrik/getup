import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { Icon } from "@/components/icons";
import { card } from "@/components/ui";
import { requireProfile } from "@/lib/auth";
import { pickFeatured } from "@/lib/events";
import { createClient } from "@/lib/supabase/server";
import type { EventRow } from "@/lib/types";
import { JoinForm } from "../events/join-form";
import { QrScanButton } from "../events/qr-scanner";

export const metadata: Metadata = { title: "Swipování" };

/** Záložka „Swipování“: otevře balíček nejbližší akce, ke které jsi připojený/á. */
export default async function SwipePage() {
  const { user } = await requireProfile();
  const supabase = await createClient();
  const { data } = await supabase.from("event_attendees").select("event:events(id, name, venue, starts_at, ends_at)").eq("user_id", user.id);
  const events = ((data ?? []) as unknown as { event: EventRow | null }[])
    .map((row) => row.event)
    .filter((e): e is EventRow => e !== null);

  const featured = pickFeatured(events);
  if (featured) redirect(`/e/${featured.id}`);

  return (
    <main className="mx-auto max-w-md pb-nav lg:pt-6">
      <AppHeader />
      <div className="px-4">
        <div className={`${card} mt-6 text-center`}>
          <span className="fill-accent-soft mx-auto grid size-16 place-items-center rounded-full">
            <Icon name="compass" className="size-8" />
          </span>
          <p className="mt-4 text-[22px] font-bold">Nejdřív se připoj k akci</p>
          <p className="mt-1 text-[15px] text-muted">
            Swipuješ jen lidi ze stejné akce. Naskenuj QR kód ze vstupenky nebo od vstupu, nebo opiš kód.
          </p>
          <div className="mt-5 space-y-3">
            <QrScanButton />
            <JoinForm initialError={null} />
          </div>
        </div>
      </div>
    </main>
  );
}
