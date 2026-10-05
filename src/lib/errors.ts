// Kódy chyb, které vyhazují SQL funkce (supabase/migrations/*.sql).
const MESSAGES: Record<string, string> = {
  GU001: "Nejdřív si vyplň profil.",
  GU002: "Akce s tímto kódem neexistuje. Zkontroluj ho prosím.",
  GU003: "Tahle akce už skončila.",
  GU004: "Na téhle akci nejsi – naskenuj její QR kód.",
  GU005: "Tenhle profil už není k dispozici.",
  GU010: "Musí ti být alespoň 18 let.",
  GU011: "Nepodařilo se uložit fotky, zkus to znovu.",
  GU012: "Tvůj účet je zablokovaný. Pokud jde o omyl, ozvi se nám.",
  GU013: "Organizátora nejde zablokovat – nejdřív ho odeber z týmu.",
  GU014: "Uživatel s tímto e-mailem neexistuje. Musí se nejdřív aspoň jednou přihlásit do aplikace.",
  GU015: "Sám sebe z týmu odebrat nemůžeš.",
  GU016: "Jsi v týmu GetUp, účet si smazat nemůžeš. Nejdřív se nech odebrat z týmu.",
  GU017: "Instagram: zadej jen jméno účtu, třeba jmeno.prijmeni.",
  GU018: "Snapchat: zadej jen jméno účtu (3 až 15 znaků).",
  GU019: "Telefon: zadej číslo s předvolbou, třeba +420 777 123 456.",
  GU020: "Smazání účtu potvrď kódem z e-mailu.",
  GU021: "Uživatel neexistuje.",
  GU022: "Organizátora nejde smazat, nejdřív ho odeber z týmu.",
  GU023: "Uživatel nemá vyplněný profil, na akci ho nejde přidat.",
  GU024: "Akce neexistuje.",
  GU025: "Swipování ještě není otevřené.",
  GU401: "Přihlas se prosím znovu.",
  GU403: "Na tohle nemáš oprávnění.",
};

const FALLBACK = "Něco se pokazilo. Zkus to prosím znovu.";

export function errorMessage(error: unknown, fallback = FALLBACK): string {
  if (typeof error === "string") return MESSAGES[error] ?? fallback;
  if (error && typeof error === "object" && "code" in error && typeof error.code === "string") {
    return MESSAGES[error.code] ?? fallback;
  }
  return fallback;
}
