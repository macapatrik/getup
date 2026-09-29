"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Icon } from "@/components/icons";
import { errorMessage } from "@/lib/errors";
import { formatTime } from "@/lib/format";
import { photoUrl } from "@/lib/photos";
import { createClient } from "@/lib/supabase/client";
import type { MatchRow, Message } from "@/lib/types";

const COLUMNS = "id, match_id, sender_id, body, created_at";

function merge(current: Message[], incoming: Message[]) {
  const known = new Set(current.map((m) => m.id));
  const added = incoming.filter((m) => !known.has(m.id));
  if (added.length === 0) return current;
  return [...current, ...added].sort((a, b) => a.id - b.id);
}

export function Chat({
  matchId,
  meId,
  other,
  initialMessages,
}: {
  matchId: string;
  meId: string;
  other: MatchRow;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const lastId = useRef(initialMessages.at(-1)?.id ?? 0);

  useEffect(() => {
    lastId.current = messages.at(-1)?.id ?? 0;
    bottom.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  // Dotažení zpráv, které přišly, zatímco bylo spojení dole (zamčený telefon apod.)
  const catchUp = useCallback(async () => {
    const { data } = await createClient()
      .from("messages")
      .select(COLUMNS)
      .eq("match_id", matchId)
      .gt("id", lastId.current)
      .order("id");
    if (data?.length) setMessages((current) => merge(current, data as Message[]));
  }, [matchId]);

  useEffect(() => {
    const supabase = createClient();
    let channel: RealtimeChannel | null = null;
    let cancelled = false;

    (async () => {
      await supabase.realtime.setAuth();
      if (cancelled) return;
      channel = supabase
        .channel(`chat:${matchId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages", filter: `match_id=eq.${matchId}` },
          (payload) => setMessages((current) => merge(current, [payload.new as Message])),
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") void catchUp();
        });
    })();

    return () => {
      cancelled = true;
      if (channel) void supabase.removeChannel(channel);
    };
  }, [matchId, catchUp]);

  async function send(e: FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setError(null);
    const { data, error } = await createClient()
      .from("messages")
      .insert({ match_id: matchId, body })
      .select(COLUMNS)
      .single();
    setSending(false);
    if (error) {
      setError(errorMessage(error, "Zprávu se nepodařilo odeslat."));
      return;
    }
    setText("");
    setMessages((current) => merge(current, [data as Message]));
  }

  return (
    <>
      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center pt-10 text-center">
            <img
              src={photoUrl(other.photos[0])}
              alt=""
              className="size-28 rounded-full border-4 border-accent object-cover"
            />
            <p className="mt-4 text-lg font-bold">Matchli jste se{other.event_name ? ` na ${other.event_name}` : ""}!</p>
            <p className="mt-1 text-muted">Napiš něco. Třeba kde zrovna stojíš 🎤</p>
          </div>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === meId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-3xl px-4 py-2 ${
                  mine ? "rounded-br-md bg-party text-white" : "rounded-bl-md bg-surface-2"
                }`}
              >
                <p className="break-words whitespace-pre-wrap">{m.body}</p>
                <p className={`mt-0.5 text-right text-[10px] ${mine ? "text-white/70" : "text-muted"}`}>
                  {formatTime(m.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottom} />
      </div>

      <form onSubmit={send} className="flex items-end gap-2 border-t border-line bg-night px-3 pt-3 pb-safe">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          rows={1}
          maxLength={2000}
          placeholder="Napiš zprávu…"
          aria-label="Zpráva"
          className="max-h-32 flex-1 resize-none rounded-3xl border border-line bg-surface px-4 py-3 text-base outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          aria-label="Odeslat"
          className="grid size-12 shrink-0 place-items-center rounded-full bg-party transition active:scale-90 disabled:opacity-40"
        >
          <Icon name="send" className="size-5" />
        </button>
      </form>
      {error && <p className="bg-night px-4 pb-2 text-sm text-red-300">{error}</p>}
    </>
  );
}
