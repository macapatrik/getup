import { isHalloween } from "@/lib/theme";

/**
 * Zapne halloweenský motiv na halloweenské adrese: globals.css přebarví tokeny přes `:root:has(.hm)`
 * a ukáže halloweenské texty (`.hm-only`) místo běžných (`.hm-hide`).
 */
export async function HalloweenMode() {
  return (await isHalloween()) ? <span hidden className="hm" /> : null;
}
