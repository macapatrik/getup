export const APP_NAME = "GetTogether";
export const APP_TAGLINE = "Seznam se s lidmi z akcí GetUp";

// Veřejná adresa aplikace (odkazy v QR kódech, náhledy při sdílení). Na Vercelu nastav NEXT_PUBLIC_SITE_URL.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://together.get-up.fun").replace(/\/$/, "");

// Časy akcí zadáváme i zobrazujeme v české časové zóně.
export const TIME_ZONE = "Europe/Prague";

export const MAX_PHOTOS = 6;
export const MIN_AGE = 18;

// Po skončení akce je "místnost" otevřená ještě 24 h (musí sedět s SQL event_is_open).
export const EVENT_GRACE_HOURS = 24;

// Režim „připravujeme“: úvodní stránka ukáže jen upoutávku bez přihlášení (tým se dál přihlásí přes /login).
// Zapíná se proměnnou prostředí COMING_SOON=1 (na Vercelu v nastavení projektu, pak nový deploy).
export const isComingSoon = () => process.env.COMING_SOON === "1";
