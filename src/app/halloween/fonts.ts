import { Metal_Mania } from "next/font/google";

// Písmo titulků jako na plakátu; latin-ext kvůli češtině. Proměnnou čte utility `font-metal` v globals.css
// (layout /halloween i sekce Halloween pod Tinder party na /tinder).
export const metalMania = Metal_Mania({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  variable: "--font-metal-mania",
  display: "swap",
});
