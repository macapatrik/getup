import type { Metadata } from "next";
import { AppHeader } from "@/components/app-header";
import { LiveRefresh } from "@/components/live-refresh";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { MatchRow } from "@/lib/types";
import { MessagesList } from "./messages-list";

export const metadata: Metadata = { title: "Zprávy" };

/** Záložka „Zprávy“: seznam chatů s hledáním jako u Romio. */
export default async function MessagesPage() {
  const { user } = await requireProfile();
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_matches");
  const matches = (data ?? []) as MatchRow[];

  // Chaty s poslední zprávou nahoře, matche bez zprávy pod nimi (podle data matche).
  const chats = [...matches].sort((a, b) => (b.last_message_at ?? b.matched_at).localeCompare(a.last_message_at ?? a.matched_at));

  return (
    <main className="mx-auto max-w-md pb-nav lg:pt-6">
      <LiveRefresh userId={user.id} />
      <AppHeader />
      <div className="px-4">
        <MessagesList meId={user.id} chats={chats} />
      </div>
    </main>
  );
}
