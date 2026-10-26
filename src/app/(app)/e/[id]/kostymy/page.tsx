import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackHeader } from "@/components/app-header";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { CostumeContest } from "@/lib/types";
import { CostumeContestView } from "./contest";

export const metadata: Metadata = { title: "Soutěž o kostým" };

/** Soutěž o nejlepší kostým: přihláška s fotkou a hlasování lidí z akce (RPC costume_contest). */
export default async function CostumeContestPage(props: PageProps<"/e/[id]/kostymy">) {
  const { id } = await props.params;
  const { user } = await requireProfile();
  const supabase = await createClient();

  const [{ data: event }, { data, error }] = await Promise.all([
    supabase.from("events").select("id, name").eq("id", id).maybeSingle<{ id: string; name: string }>(),
    supabase.rpc("costume_contest", { p_event_id: id }),
  ]);
  if (!event || error || !data) notFound();

  return (
    <main className="mx-auto max-w-md pb-nav lg:pt-6">
      <BackHeader href={`/e/${id}`} title="Soutěž o kostým" subtitle={event.name} />
      <CostumeContestView userId={user.id} eventId={id} contest={data as CostumeContest} />
    </main>
  );
}
