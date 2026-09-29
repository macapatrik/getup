import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icons";
import { requireProfile } from "@/lib/auth";
import { photoUrl } from "@/lib/photos";
import { createClient } from "@/lib/supabase/server";
import type { MatchRow, Message } from "@/lib/types";
import { unmatchAction } from "../../actions";
import { Chat } from "./chat";
import { ChatMenu } from "./chat-menu";

export const metadata: Metadata = { title: "Chat" };

export default async function ChatPage(props: PageProps<"/matches/[id]">) {
  const { id } = await props.params;
  const { user } = await requireProfile();
  const supabase = await createClient();

  const [{ data: rows }, { data: latest }] = await Promise.all([
    supabase.rpc("get_matches", { p_match_id: id }),
    supabase
      .from("messages")
      .select("id, match_id, sender_id, body, created_at")
      .eq("match_id", id)
      .order("id", { ascending: false })
      .limit(200),
  ]);

  const match = (rows as MatchRow[] | null)?.[0];
  if (!match) notFound();
  const messages = ((latest ?? []) as Message[]).reverse();

  return (
    <main className="fixed inset-x-0 top-0 mx-auto flex h-dvh max-w-md flex-col bg-night">
      <header className="flex items-center gap-3 border-b border-line px-3 py-2">
        <Link href="/matches" aria-label="Zpět" className="grid size-10 place-items-center rounded-full hover:bg-surface">
          <Icon name="back" />
        </Link>
        <img src={photoUrl(match.photos[0])} alt="" className="size-10 rounded-full object-cover" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">
            {match.display_name}, {match.age}
          </p>
          {match.event_name && <p className="truncate text-xs text-muted">📍 {match.event_name}</p>}
        </div>
        <ChatMenu matchId={id} name={match.display_name} unmatch={unmatchAction.bind(null, id)} />
      </header>

      <Chat matchId={id} meId={user.id} other={match} initialMessages={messages} />
    </main>
  );
}
