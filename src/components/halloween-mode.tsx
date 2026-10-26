import { HALLOWEEN } from "@/lib/config";

/** Zapne halloweenský motiv na stránce: globals.css přebarví tokeny přes `:root:has(.hm)`. */
export function HalloweenMode() {
  return HALLOWEEN ? <span hidden className="hm" /> : null;
}
