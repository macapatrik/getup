// Kódy chyb, které vyhazují SQL funkce (supabase/migrations/*_init.sql).
const MESSAGES: Record<string, string> = {
  GU001: "Nejdřív si vyplň profil.",
  GU002: "Akce s tímto kódem neexistuje. Zkontroluj ho prosím.",
  GU003: "Tahle akce už skončila.",
  GU004: "Na téhle akci nejsi – naskenuj její QR kód.",
  GU005: "Tenhle profil už není k dispozici.",
  GU010: "Musí ti být alespoň 18 let.",
  GU011: "Nepodařilo se uložit fotky, zkus to znovu.",
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
