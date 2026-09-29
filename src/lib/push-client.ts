// Push upozornění v prohlížeči: service worker, odběr a jeho uložení k účtu.
import { createClient } from "./supabase/client";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export type PushState = "loading" | "unsupported" | "install" | "denied" | "off" | "on";

function isIos() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
}

export function pushSupported() {
  return Boolean(VAPID_PUBLIC_KEY) && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

export function registerServiceWorker() {
  return navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" });
}

async function currentSubscription() {
  const registration = await navigator.serviceWorker.getRegistration("/");
  return (await registration?.pushManager.getSubscription()) ?? null;
}

export async function saveSubscription(subscription: PushSubscription) {
  const { keys } = subscription.toJSON();
  const { error } = await createClient().rpc("save_push_subscription", {
    p_endpoint: subscription.endpoint,
    p_p256dh: keys?.p256dh,
    p_auth: keys?.auth,
  });
  if (error) throw error;
}

/** Zjistí stav upozornění na tomhle zařízení. */
export async function detectPushState(): Promise<PushState> {
  if (!pushSupported()) return isIos() && !isStandalone() ? "install" : "unsupported";
  if (Notification.permission === "denied") return "denied";
  await registerServiceWorker();
  const subscription = await currentSubscription();
  return subscription && Notification.permission === "granted" ? "on" : "off";
}

function base64UrlToBytes(value: string) {
  const base64 = (value + "=".repeat((4 - (value.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

/** Musí se volat přímo z klepnutí (iOS jinak o povolení vůbec nezažádá). */
export async function enablePush(): Promise<PushState> {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return permission === "denied" ? "denied" : "off";

  const registration = await registerServiceWorker();
  await navigator.serviceWorker.ready;
  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlToBytes(VAPID_PUBLIC_KEY!),
    }));
  await saveSubscription(subscription);
  return "on";
}

export async function disablePush(): Promise<PushState> {
  const subscription = await currentSubscription();
  if (subscription) {
    await createClient().from("push_subscriptions").delete().eq("endpoint", subscription.endpoint);
    await subscription.unsubscribe();
  }
  return "off";
}

export async function currentEndpoint() {
  return (await currentSubscription())?.endpoint ?? null;
}

/** Při každém otevření aplikace: odběr tohohle zařízení patří přihlášenému účtu. */
export async function syncPushSubscription() {
  if (!pushSupported() || Notification.permission !== "granted") return;
  await registerServiceWorker();
  const subscription = await currentSubscription();
  if (subscription) await saveSubscription(subscription);
}
