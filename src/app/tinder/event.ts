// Fakta o Tinder party na jednom místě (podle plakátu ze složky na Drive). Při změně času, odkazů nebo kódu uprav jen tenhle soubor.

export const EVENT = {
  name: "Tinder Party",
  // Velký nápis z plakátu a podtitul pod ním
  title: "Tinder",
  claim: "Naše swipovací aplikace pouze s lidmi z akce",
  // Pátek 16. 10. 2026, 22:00 (ještě letní čas = UTC+2); v administraci je akce TINDER26 se stejným časem
  startsAt: "2026-10-16T22:00:00+02:00",
  dateLabel: "16. 10. 2026",
  weekday: "pátek",
  doors: "22:00",
  // Swipování je v aplikaci pozastavené do 16. 10. (nastavení v administraci), do té doby si lidi jen zakládají profily
  swipingFrom: "16. 10.",
  city: "České Budějovice",
  venue: "Klub K2",
  venueStreet: "Sokolský ostrov 462",
  mapUrl: "https://www.google.com/maps/search/?api=1&query=Klub+K2+Sokolsk%C3%BD+ostrov+462+%C4%8Cesk%C3%A9+Bud%C4%9Bjovice",
  ticketsUrl: "https://www.eventlook.cz/udalosti/tinder-luxouo/",
  ticketsLabel: "Eventlook.cz",
  // Kód akce v GetCrush – odkaz /j/KÓD připojí návštěvníka k akci (akce Tinder Party v administraci)
  joinCode: "TINDER26",
  instagram: "https://www.instagram.com/getup.fun/",
  instagramHandle: "@getup.fun",
  // Sleva na vstup se domlouvá přes zprávy na Instagramu (ig.me otevře rovnou konverzaci)
  instagramDm: "https://ig.me/m/getup.fun",
  lineup: ["Hasy"],
} as const;
