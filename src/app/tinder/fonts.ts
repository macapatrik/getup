import { Anton, Yellowtail } from "next/font/google";

// Písma z plakátu Tinder party: úzký tučný grotesk na velké nápisy a psací písmo na akcenty („Eventlook.cz“, „Hasy“).
// Proměnné čtou utility `font-display` a `font-script` v globals.css; používá je layout /tinder i karta akce v aplikaci.
export const anton = Anton({ weight: "400", subsets: ["latin", "latin-ext"], variable: "--font-anton", display: "swap" });
export const yellowtail = Yellowtail({ weight: "400", subsets: ["latin"], variable: "--font-yellowtail", display: "swap" });
