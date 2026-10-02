// Fotky z Halloweenu 2025 (Google Drive, veřejná složka) pro web: stáhne originály podle files.tsv,
// bez select.txt vyrobí náhledy do thumbs/ (k výběru), se select.txt vyrobí vybrané fotky pro web
// do public/halloween/gallery (1600 px + 800 px WebP). Běží ve workflow na GitHubu (Drive není z vývojového
// prostředí dostupný). Originály se cachují v photos/.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const here = path.dirname(new URL(import.meta.url).pathname);
const files = readFileSync(path.join(here, "files.tsv"), "utf8")
  .trim()
  .split("\n")
  .map((l) => l.split("\t"))
  .map(([id, name]) => ({ id, name: name.trim(), num: name.match(/(\d{3})\.jpg$/)[1] }));
const selectFile = path.join(here, "select.txt");
const selected = existsSync(selectFile)
  ? readFileSync(selectFile, "utf8").split("\n").map((l) => l.trim()).filter(Boolean).map((l) => l.match(/(\d{3})/)[1])
  : [];

const photosDir = "photos";
mkdirSync(photosDir, { recursive: true });

async function download(file) {
  const target = path.join(photosDir, file.name);
  if (existsSync(target)) return target;
  const urls = [
    `https://drive.usercontent.google.com/download?id=${file.id}&export=download&confirm=t`,
    `https://drive.google.com/uc?export=download&id=${file.id}&confirm=t`,
  ];
  for (let attempt = 0; attempt < 4; attempt++) {
    for (const url of urls) {
      try {
        const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(120_000) });
        const type = res.headers.get("content-type") || "";
        if (!res.ok || !type.startsWith("image/")) throw new Error(`HTTP ${res.status} ${type}`);
        writeFileSync(target, Buffer.from(await res.arrayBuffer()));
        return target;
      } catch (err) {
        console.warn(`  ${file.name}: ${err.message}`);
      }
    }
    await new Promise((r) => setTimeout(r, 3000 * (attempt + 1)));
  }
  return null;
}

async function pool(items, size, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: size }, async () => {
    while (i < items.length) await fn(items[i++]);
  }));
}

const wanted = selected.length ? files.filter((f) => selected.includes(f.num)) : files;
console.log(`${wanted.length} fotek (${selected.length ? "výběr" : "náhledy"})`);

let failed = 0;
await pool(wanted, 4, async (file) => {
  const src = await download(file);
  if (!src) return failed++;
  if (selected.length) {
    const out = "public/halloween/gallery";
    mkdirSync(out, { recursive: true });
    const img = sharp(src).rotate();
    await img.clone().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.join(out, `${file.num}.webp`));
    await img.clone().resize({ width: 800 }).webp({ quality: 78 }).toFile(path.join(out, `${file.num}-800.webp`));
    console.log(`✓ gallery/${file.num}.webp`);
  } else {
    const out = path.join(here, "thumbs");
    mkdirSync(out, { recursive: true });
    const meta = await sharp(src).metadata();
    await sharp(src).rotate().resize({ width: 400 }).webp({ quality: 70 }).toFile(path.join(out, `${file.num}.webp`));
    console.log(`✓ thumbs/${file.num}.webp ${meta.width}x${meta.height}`);
  }
});
if (failed) console.warn(`⚠ ${failed} fotek se nepodařilo stáhnout`);
if (!selected.length) {
  const list = readdirSync(path.join(here, "thumbs")).filter((f) => f.endsWith(".webp")).sort();
  writeFileSync(path.join(here, "thumbs", "index.txt"), list.join("\n") + "\n");
}
