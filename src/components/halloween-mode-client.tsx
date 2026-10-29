"use client";

import { useSyncExternalStore } from "react";
import { HALLOWEEN_HOSTS } from "@/lib/config";

const noop = () => () => {};

/** Jako <HalloweenMode />, ale pozná adresu až v prohlížeči – pro statické stránky (404), ať nejsou kvůli tomu dynamické. */
export function HalloweenModeClient() {
  const on = useSyncExternalStore(noop, () => HALLOWEEN_HOSTS.includes(window.location.host), () => false);
  return on ? <span hidden className="hm" /> : null;
}
