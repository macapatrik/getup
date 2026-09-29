import { timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { pushConfigured, sendPush, type PushMessage, type PushTarget } from "./push";
import { supabaseEnv } from "./supabase/env";

// Společná obsluha webhooků z databáze (triggery matches_push a messages_push).
// Tělo: { notifications: [{ ..., subscriptions: PushTarget[] }] }, hlavička Authorization: Bearer <PUSH_WEBHOOK_SECRET>.

function authorized(header: string | null, secret: string) {
  const got = Buffer.from(header ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return got.length === expected.length && timingSafeEqual(got, expected);
}

export async function handlePushWebhook<T extends { subscriptions: PushTarget[] }>(
  request: Request,
  toMessage: (notification: T) => PushMessage,
) {
  const secret = process.env.PUSH_WEBHOOK_SECRET;
  if (!secret || !pushConfigured()) {
    return Response.json({ error: "Push upozornění nejsou nastavená." }, { status: 503 });
  }
  if (!authorized(request.headers.get("authorization"), secret)) {
    return new Response(null, { status: 401 });
  }

  const { notifications = [] } = (await request.json()) as { notifications?: T[] };
  const results = await Promise.all(notifications.map((n) => sendPush(n.subscriptions, toMessage(n))));
  const sent = results.reduce((sum, r) => sum + r.sent, 0);
  const gone = results.flatMap((r) => r.gone);

  // Zařízení, která upozornění vypnula, z databáze smažeme.
  if (gone.length > 0) {
    const { url, key } = supabaseEnv();
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { error } = await supabase.rpc("prune_push_subscriptions", { p_secret: secret, p_endpoints: gone });
    if (error) console.error("Nepodařilo se smazat neplatné odběry", error);
  }

  return Response.json({ sent, pruned: gone.length });
}
