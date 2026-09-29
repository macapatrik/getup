// Stáhne ilustrační fotky vygenerované přes Higgsfield (Nano Banana) do public/people
// a zmenší je na WebP. Běží automaticky před `npm run build` (i na Vercelu),
// ručně: npm run photos. Už stažené fotky přeskočí; když stažení selže, build nespadne –
// úvodní stránka pak ukáže jen barevné karty.
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

const BASE = "https://d8j0ntlcm91z4.cloudfront.net/user_3Byp0QuDRtgSsewOSg7DwvV38lR/hf_20260929_";

const PHOTOS = {
  tereza: "114717_2e418caf-3ef7-497d-873a-a50e8c58902b",
  veronika: "114717_a344d1b7-76a1-4e1c-beb1-cbfefa79a92b",
  eliska: "114717_d0c7b9ea-5af6-4f86-8b54-13d22bc8c382",
  klara: "114719_61b375d9-d992-4e27-bc9f-e06e4b373795",
  nikola: "114717_b0bcdf6f-045c-439e-8bf8-93f407837033",
  adela: "114717_a5ade355-08fd-4ca7-9cc5-812ddc2a9155",
  patrik: "114717_c4793336-4490-4e56-89ed-09faf90c28c0",
  jakub: "125905_ba105b81-617f-499c-b96f-4c58713790f5",
  matej: "125906_b95e94b0-8915-42f0-aa05-820e19dab82f",
  tomas: "125905_4999e604-70db-4646-a0df-fed1bfc8c418",
};

const outDir = new URL("../public/people/", import.meta.url);
await mkdir(outDir, { recursive: true });

let failed = 0;
for (const [name, id] of Object.entries(PHOTOS)) {
  const target = new URL(`${name}.webp`, outDir);
  if (existsSync(target)) continue;
  try {
    const res = await fetch(`${BASE}${id}.png`, { signal: AbortSignal.timeout(20_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const webp = await sharp(Buffer.from(await res.arrayBuffer()))
      .resize({ width: 720 })
      .webp({ quality: 80 })
      .toBuffer();
    await writeFile(target, webp);
    console.log(`✓ ${name}.webp (${Math.round(webp.length / 1024)} kB)`);
  } catch (err) {
    failed++;
    console.warn(`⚠ ${name}: ${err instanceof Error ? err.message : err}`);
  }
}
if (failed) console.warn(`⚠ ${failed} fotek se nepodařilo stáhnout – úvodní stránka ukáže barevné karty.`);
