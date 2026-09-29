"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { onResume, subscribeRealtime } from "@/lib/realtime";

/** Při novém matchi nebo zprávě (přijde do mého soukromého kanálu) obnoví serverová data stránky. */
export function LiveRefresh({ userId }: { userId: string }) {
  const router = useRouter();

  useEffect(() => {
    const refresh = () => router.refresh();
    const unsubscribes = [
      subscribeRealtime(userId, "message", refresh),
      subscribeRealtime(userId, "match", refresh),
      onResume(refresh),
    ];
    return () => unsubscribes.forEach((u) => u());
  }, [router, userId]);

  return null;
}
