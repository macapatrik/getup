import { createClient } from "@supabase/supabase-js";
import { supabaseEnv } from "./env";

/** Klient bez přihlášení pro veřejný web get-up.fun (RPC public_events). Bez cookies, stránky jdou cachovat. */
export function publicClient() {
  const { url, key } = supabaseEnv();
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
}
