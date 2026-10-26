import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { CostumeContest } from "@/lib/types";
import { metalMania } from "../../../../halloween/fonts";
import { CostumeContestView } from "./contest";

export const metadata: Metadata = { title: "Soutěž o kostým" };

/**
 * Soutěž o nejlepší kostým: přihláška s fotkou a hlasování lidí z akce (RPC costume_contest).
 * Celá stránka je v halloweenském motivu plakátu (třída .hw přebarví i spodní lištu, viz globals.css).
 */
export default async function CostumeContestPage(props: PageProps<"/e/[id]/kostymy">) {
  const { id } = await props.params;
  const { user } = await requireProfile();
  const supabase = await createClient();

  const [{ data: event }, { data, error }] = await Promise.all([
    supabase.from("events").select("id, name, venue").eq("id", id).maybeSingle<{ id: string; name: string; venue: string }>(),
    supabase.rpc("costume_contest", { p_event_id: id }),
  ]);
  if (!event || error || !data) notFound();

  return (
    <main className={`hw ${metalMania.variable} relative mx-auto min-h-dvh max-w-md bg-night pb-nav text-bone lg:pt-6`}>
      <CostumeContestView userId={user.id} event={event} contest={data as CostumeContest} />
    </main>
  );
}
