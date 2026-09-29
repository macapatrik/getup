// Jeden soukromý realtime kanál `user:<id>` na uživatele. Databáze do něj
// triggerem posílá nové zprávy a matche (migrace *_realtime_broadcast.sql).
// Kanál sdílí všechny části stránky – připojení se otevře jen jednou.
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "./supabase/client";
import type { Message } from "./types";

export type RealtimeEvents = {
  message: Message;
  match: { match_id: string };
  /** Kanál se (znovu) připojil – vhodná chvíle dotáhnout, co mezitím přišlo. */
  connected: undefined;
};

type Handler<E extends keyof RealtimeEvents> = (payload: RealtimeEvents[E]) => void;

let channel: RealtimeChannel | null = null;
let users = 0;
const handlers: { [E in keyof RealtimeEvents]: Set<Handler<E>> } = {
  message: new Set(),
  match: new Set(),
  connected: new Set(),
};

function emit<E extends keyof RealtimeEvents>(event: E, payload: RealtimeEvents[E]) {
  handlers[event].forEach((h) => h(payload));
}

async function open(userId: string) {
  const supabase = createClient();
  await supabase.realtime.setAuth();
  if (channel || users === 0) return; // mezitím se všichni odhlásili (např. rychlé přepnutí stránky)
  channel = supabase
    .channel(`user:${userId}`, { config: { private: true } })
    .on("broadcast", { event: "message" }, ({ payload }) => emit("message", payload as Message))
    .on("broadcast", { event: "match" }, ({ payload }) => emit("match", payload as { match_id: string }))
    .subscribe((status) => {
      if (status === "SUBSCRIBED") emit("connected", undefined);
    });
}

function close() {
  if (!channel) return;
  void createClient().removeChannel(channel);
  channel = null;
}

/** Přihlásí posluchače; vrací funkci na odhlášení. Při posledním odhlášení se kanál zavře. */
export function subscribeRealtime<E extends keyof RealtimeEvents>(userId: string, event: E, handler: Handler<E>) {
  handlers[event].add(handler);
  if (users++ === 0) void open(userId);

  return () => {
    handlers[event].delete(handler);
    if (--users === 0) close();
  };
}

/** Po probuzení telefonu / návratu online zavolá handler (spojení mohlo být dole). */
export function onResume(handler: () => void) {
  function onVisible() {
    if (document.visibilityState === "visible") handler();
  }
  document.addEventListener("visibilitychange", onVisible);
  window.addEventListener("online", handler);
  return () => {
    document.removeEventListener("visibilitychange", onVisible);
    window.removeEventListener("online", handler);
  };
}
