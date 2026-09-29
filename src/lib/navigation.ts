/** Povolí jen interní cesty (ochrana proti open redirectu). */
export function safeNext(next: string | null | undefined, fallback = "/events") {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}

/** `next` může být i absolutní URL (z e-mailové šablony) – bereme ji jen ze stejného originu. */
export function resolveNext(next: string | null, origin: string, fallback = "/events") {
  if (!next) return fallback;
  try {
    const url = new URL(next, origin);
    if (url.origin !== origin) return fallback;
    return safeNext(url.pathname + url.search, fallback);
  } catch {
    return fallback;
  }
}
