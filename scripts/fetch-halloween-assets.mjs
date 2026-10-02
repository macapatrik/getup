// Jednorázově stáhne vygenerované podklady pro stránku /halloween (Higgsfield) do public/halloween/gen
// jako WebP v plném rozlišení. Spouští ho workflow .github/workflows/fetch-halloween-assets.yml,
// protože z vývojového prostředí není CloudFront dostupný.
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

const BASE = "https://d8j0ntlcm91z4.cloudfront.net/user_3Byp0QuDRtgSsewOSg7DwvV38lR/hf_20261002_065749_";

const ASSETS = {
  "hero-flux": "b719e54d-5bcf-4ad3-afcc-d5abe4d9a5dd",
  "hero-gpt": "e96d5a63-e347-4220-8041-79a4c617c455",
  "reaper": "bf9cef9a-57a0-42ce-9bd0-4d27d8551a86",
  "title": "a88483fd-4f64-4a52-9706-a16e9abba1a7",
  "crowd": "5af22c22-faff-47c2-bb9a-fd3c2cb1a48e",
};

const outDir = new URL("../public/halloween/gen/", import.meta.url);
await mkdir(outDir, { recursive: true });

let failed = 0;
for (const [name, id] of Object.entries(ASSETS)) {
  try {
    const res = await fetch(`${BASE}${id}.png`, { signal: AbortSignal.timeout(60_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const png = Buffer.from(await res.arrayBuffer());
    const meta = await sharp(png).metadata();
    const webp = await sharp(png).webp({ quality: 92, alphaQuality: 95 }).toBuffer();
    await writeFile(new URL(`${name}.webp`, outDir), webp);
    console.log(`✓ ${name}.webp ${meta.width}x${meta.height} alpha=${meta.hasAlpha} (${Math.round(webp.length / 1024)} kB)`);
  } catch (err) {
    failed++;
    console.warn(`⚠ ${name}: ${err instanceof Error ? err.message : err}`);
  }
}
if (failed) process.exit(1);
