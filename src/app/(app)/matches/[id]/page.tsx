import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icons";
import { iconButton } from "@/components/ui";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { MatchRow, Message } from "@/lib/types";
import { unmatchAction } from "../../actions";
import { Chat } from "./chat";
import { ChatMenu } from "./chat-menu";
import { ProfileHeader } from "./profile-header";

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
    <main className="fixed inset-x-0 top-0 mx-auto flex h-dvh max-w-md flex-col lg:left-72 lg:py-4">
      <header className="flex items-center gap-2 px-3 pt-safe pb-2">
        <Link href="/matches" aria-label="Zpět" className={iconButton}>
          <Icon name="back" className="size-5" />
        </Link>
        <ProfileHeader match={match} />
        <ChatMenu matchId={id} name={match.display_name} unmatch={unmatchAction.bind(null, id)} />
      </header>

      <Chat matchId={id} meId={user.id} other={match} initialMessages={messages} />
    </main>
  );
}
