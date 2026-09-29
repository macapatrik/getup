import { chatMessage, type PushTarget } from "@/lib/push";
import { handlePushWebhook } from "@/lib/push-webhook";

// Webhook z databáze po nové zprávě (trigger messages_push).
type MessageNotification = {
  match_id: string;
  name: string;
  photo: string | null;
  body: string;
  subscriptions: PushTarget[];
};

export function POST(request: Request) {
  return handlePushWebhook<MessageNotification>(request, chatMessage);
}
