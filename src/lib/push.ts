// Odesílání Web Push upozornění (jen na serveru – potřebuje VAPID_PRIVATE_KEY).
import webpush from "web-push";
import { APP_NAME } from "./config";
import { photoUrl } from "./photos";

export type PushTarget = { endpoint: string; p256dh: string; auth: string };

/** Obsah upozornění – čte ho public/sw.js */
export type PushMessage = { title: string; body: string; url: string; icon?: string; tag?: string };

let configured = false;

export function pushConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

function configure() {
  if (configured) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || process.env.NEXT_PUBLIC_SITE_URL || "https://together.get-up.fun",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  configured = true;
}

/** Pošle zprávu na všechna zařízení. Vrací počet doručených a endpointy, které už neplatí (smazat). */
export async function sendPush(targets: PushTarget[], message: PushMessage) {
  configure();
  const payload = JSON.stringify(message);
  const results = await Promise.allSettled(
    targets.map((t) =>
      webpush.sendNotification({ endpoint: t.endpoint, keys: { p256dh: t.p256dh, auth: t.auth } }, payload, {
        TTL: 60 * 60 * 24,
        urgency: "high",
      }),
    ),
  );

  let sent = 0;
  const gone: string[] = [];
  results.forEach((result, i) => {
    if (result.status === "fulfilled") sent++;
    else if (result.reason instanceof webpush.WebPushError && [404, 410].includes(result.reason.statusCode)) {
      gone.push(targets[i].endpoint);
    } else {
      console.error("Push se nepodařilo odeslat", result.reason);
    }
  });
  return { sent, gone };
}

export function matchMessage(match: { match_id: string; name: string; photo: string | null; event: string | null }): PushMessage {
  return {
    title: "Je to match! 💘",
    body: `Ty a ${match.name} se navzájem líbíte${match.event ? ` (${match.event})` : ""}. Napiš první zprávu 👋`,
    url: `/matches/${match.match_id}`,
    icon: match.photo ? photoUrl(match.photo) : undefined,
    tag: `match-${match.match_id}`,
  };
}

/** Nová zpráva v chatu. Stejný `tag` pro jeden chat = upozornění se nahrazuje, nehromadí. */
export function chatMessage(message: { match_id: string; name: string; photo: string | null; body: string }): PushMessage {
  return {
    title: message.name,
    body: message.body,
    url: `/matches/${message.match_id}`,
    icon: message.photo ? photoUrl(message.photo) : undefined,
    tag: `chat-${message.match_id}`,
  };
}

export const TEST_MESSAGE: PushMessage = {
  title: `${APP_NAME} 💘`,
  body: "Takhle ti přijde upozornění, až budeš mít nový match.",
  url: "/matches",
  tag: "test",
};
