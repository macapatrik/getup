// Přibalí písmo Urbanist a fotky pro náhled při sdílení (src/app/opengraph-image.tsx) jako base64 modul.
// Spusť po změně souborů v src/app/_og: node scripts/og-assets.mjs
import { readFile, writeFile } from "node:fs/promises";

const dir = new URL("../src/app/_og/", import.meta.url);
const FILES = {
  fontMedium: "Urbanist-Medium.ttf",
  fontBold: "Urbanist-Bold.ttf",
  fontExtraBold: "Urbanist-ExtraBold.ttf",
  tereza: "tereza.jpg",
  veronika: "veronika.jpg",
  jakub: "jakub.jpg",
  meAvatar: "patrik-avatar.jpg",
  klaraAvatar: "klara-avatar.jpg",
};

let out = "// Vygenerováno skriptem scripts/og-assets.mjs – needitovat ručně.\n";
for (const [name, file] of Object.entries(FILES)) {
  const b64 = (await readFile(new URL(file, dir))).toString("base64");
  out += `export const ${name} = "${b64}";\n`;
}
await writeFile(new URL("assets.ts", dir), out);
console.log("assets.ts ok");
