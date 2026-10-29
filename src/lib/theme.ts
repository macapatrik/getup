import { headers } from "next/headers";
import { HALLOWEEN_HOSTS } from "./config";

/** Běží stránka na halloweenské adrese? (čte hlavičku Host, takže stránka je dynamická) */
export async function isHalloween() {
  const h = await headers();
  return HALLOWEEN_HOSTS.includes(h.get("x-forwarded-host") ?? h.get("host") ?? "");
}
