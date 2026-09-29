"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/** Při novém matchi nebo zprávě (které uživatel smí vidět – hlídá RLS) obnoví serverová data stránky. */
export function LiveRefresh() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    let channel: RealtimeChannel | null = null;
    let cancelled = false;

    (async () => {
      await supabase.realtime.setAuth();
      if (cancelled) return;
      channel = supabase
        .channel("live-refresh")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "matches" }, () => router.refresh())
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => router.refresh())
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) void supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
