// Údaje provozovatele pro právní stránky (/podminky, /soukromi).
export const OPERATOR = {
  name: "Patrik Máca",
  id: "17738700",
  address: "Zlukovská 794, 391 81 Veselí nad Lužnicí",
  vat: "neplátce DPH",
  email: "info@get-up.fun", // TODO: potvrdit kontaktní e-mail pro soukromí a nahlášení
  web: "https://get-up.fun",
};

export const LEGAL_UPDATED = "4. 10. 2026";

// Verze podmínek, se kterou uživatel souhlasí na obrazovce /souhlas (ukládá se do public.consents).
// Zvyš ji jen při podstatné změně podmínek – všem se pak souhlas ukáže znovu.
export const TERMS_VERSION = "2026-10-04";
