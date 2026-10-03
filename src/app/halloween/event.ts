// Fakta o akci na jednom místě (podle plakátu). Při změně line-upu, ceny nebo odkazů uprav jen tenhle soubor.

export const EVENT = {
  name: "Halloween by GetUp",
  // Pátek 30. 10. 2026, 21:00 (po konci letního času = UTC+1)
  startsAt: "2026-10-30T21:00:00+01:00",
  dateLabel: "30. 10. 2026",
  weekday: "pátek",
  doors: "21:00",
  city: "České Budějovice",
  venue: "Klub K2",
  venueStreet: "Sokolský ostrov 462",
  mapUrl: "https://www.google.com/maps/search/?api=1&query=Klub+K2+Sokolsk%C3%BD+ostrov+462+%C4%8Cesk%C3%A9+Bud%C4%9Bjovice",
  ticketsUrl: "https://www.eventlook.cz/udalosti/halloween-wjcfya/",
  ticketsLabel: "eventlook.cz",
  prize: "5\u00a0000\u00a0Kč", // pevné mezery, ať se částka nezalomí
  // Kód akce v GetCrush – odkaz /j/KÓD připojí návštěvníka k akci. TODO: kód skutečné akce z administrace.
  joinCode: "HALLO26",
  instagram: "https://www.instagram.com/getup.fun/",
  instagramHandle: "@getup.fun",
  stages: [
    { label: "Stage 1", genre: "Mainstream / Rap", acts: ["DJ Raivox", "Hasy"] },
    { label: "Stage 2", genre: "Techno", acts: ["DJ Hugoteyy", "Winterz"] },
  ],
} as const;
