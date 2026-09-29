import { matchMessage, type PushTarget } from "@/lib/push";
import { handlePushWebhook } from "@/lib/push-webhook";

// Webhook z databáze po vzniku matche (trigger matches_push).
type MatchNotification = {
  match_id: string;
  name: string;
  photo: string | null;
  event: string | null;
  subscriptions: PushTarget[];
};

export function POST(request: Request) {
  return handlePushWebhook<MatchNotification>(request, matchMessage);
}
