// Statická verze stránky /halloween pro vložení do WordPressu (blok „Vlastní HTML“ na prázdné šabloně).
// Vychází z hotového buildu (`npm run build`), výsledek je v out/halloween-wordpress/:
//   halloween.html  – kompletní blok (fonty, CSS, HTML, skript odpočtu a spodní lišty)
//   images/         – obrázky pro případ, že je chceš nahrát do Knihovny médií
//   snippet.html    – dva řádky do HTML widgetu, obsah se načte z aplikace (public/halloween/embed.html + embed.js)
//   NAVOD.md        – postup vložení
// Obrázky a odkazy vedou na SITE_URL (výchozí https://getcrush.get-up.fun).
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import sharp from "sharp";

const require = createRequire(import.meta.url);
const terser = require("next/dist/compiled/terser");
const postcss = require("postcss");

const SITE = (process.env.SITE_URL || "https://getcrush.get-up.fun").replace(/\/$/, "");
const OUT = process.env.OUT_DIR || "out/halloween-wordpress";
// Volitelně: obrázky nahrané do Knihovny médií WordPressu (všechny v jedné složce), např.
// IMAGE_BASE=https://get-up.fun/wp-content/uploads/2026/10/
const IMAGE_BASE = process.env.IMAGE_BASE ? process.env.IMAGE_BASE.replace(/\/?$/, "/") : "";
const pageFile = ".next/server/app/halloween.html";
if (!existsSync(pageFile)) {
  console.error("Chybí build: nejdřív spusť `npm run build`.");
  process.exit(1);
}

const html = readFileSync(pageFile, "utf8");
const startsAt = readFileSync("src/app/halloween/event.ts", "utf8").match(/startsAt: "([^"]+)"/)[1];

// ---- Obrázky: menší varianty pro mobil (srcset) a malé avatary; generují se jen jednou, pak se commitují.
const VARIANTS = { hero: [800, 1200], title: [600, 900], reaper: [540], poster: [540] };
const SIZES = {
  hero: "100vw",
  title: "(min-width: 1024px) 680px, 100vw",
  reaper: "(min-width: 768px) 360px, 80vw",
  poster: "300px",
};
const widthOf = {};
for (const [name, widths] of Object.entries(VARIANTS)) {
  const source = `public/halloween/${name}.webp`;
  widthOf[name] = (await sharp(source).metadata()).width;
  for (const w of widths) {
    const target = `public/halloween/${name}-${w}.webp`;
    if (!existsSync(target)) await sharp(source).resize({ width: w }).webp({ quality: 82, alphaQuality: 90 }).toFile(target);
  }
}
for (const file of readdirSync("public/people").filter((f) => f.endsWith(".webp"))) {
  const target = `public/halloween/avatar-${file}`;
  if (!existsSync(target)) await sharp(`public/people/${file}`).resize({ width: 160, height: 160, fit: "cover" }).webp({ quality: 80 }).toFile(target);
}

// ---- HTML: jen obal .hw z těla stránky, bez skriptů Next.js
let body = html.slice(html.indexOf("<body"), html.indexOf("</body>"));
body = body.slice(body.indexOf(">") + 1);
body = body.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<script[^>]*\/>/g, "");
body = body.replace(/<div hidden=""><!--\$--><!--\/\$--><\/div>/g, "").replace(/<next-route-announcer[\s\S]*?<\/next-route-announcer>/g, "");
body = body.trim();
if (!body.startsWith('<div class="hw ')) throw new Error("Nenašel jsem obal .hw");
body = body.replace('<div class="hw ', '<div id="hw-page" class="alignfull hw ');

// Obrázky: místo optimalizovaných variant Next.js přímo soubory ze SITE
const assetName = (url) => {
  const u = decodeURIComponent(url);
  const m = u.match(/_next\/static\/media\/([a-z0-9-]+)\.[a-z0-9_-]+\.(webp|png|jpg)/i);
  if (m) return /^\d{3}$/.test(m[1]) ? `/halloween/gallery/${m[1]}.${m[2]}` : `/halloween/${m[1]}.${m[2]}`;
  const q = u.match(/_next\/image\?url=([^&]+)/);
  if (q) return q[1];
  return u;
};
body = body.replace(/<img\b([^>]*)>/g, (tag, attrs) => {
  const get = (name) => (attrs.match(new RegExp(`\\s${name}="([^"]*)"`)) || [])[1];
  const source = get("srcSet") || get("src");
  const first = source ? source.split(",")[0].trim().split(/\s+/)[0] : null;
  const rest = attrs.replace(/\s(srcSet|sizes|src)="[^"]*"/g, "").replace(/\s*\/$/, "");
  let asset = first ? assetName(first) : "";
  const people = asset.match(/^\/people\/([a-z]+\.webp)$/);
  if (people) asset = `/halloween/avatar-${people[1]}`;
  const name = path.basename(asset, path.extname(asset));
  const src = !first ? "" : first.startsWith("http") ? first : IMAGE_BASE ? IMAGE_BASE + path.basename(asset) : SITE + asset;
  let extra = "";
  if (!IMAGE_BASE && VARIANTS[name]) {
    const set = [...VARIANTS[name].map((w) => `${SITE}/halloween/${name}-${w}.webp ${w}w`), `${src} ${widthOf[name]}w`];
    extra = ` srcset="${set.join(", ")}" sizes="${SIZES[name]}"`;
  }
  const gallery = asset.match(/^\/halloween\/gallery\/(\d{3})\.webp$/);
  if (!IMAGE_BASE && gallery) {
    extra = ` srcset="${SITE}/halloween/gallery/${gallery[1]}-800.webp 800w, ${src} 1600w" sizes="${get("sizes") || "100vw"}"`;
  }
  if (name === "hero" || name === "title") extra += ' fetchpriority="high"';
  return `<img${rest}${extra} src="${src}">`;
});
// Odkazy do aplikace (připojení k akci, podmínky, plakát) absolutně
body = body.replace(/href="\/(?!\/)([^"]*)"/g, (m, p) => `href="${SITE}/${p}"`);
if (IMAGE_BASE) body = body.replaceAll(`${SITE}/halloween/poster.webp`, `${IMAGE_BASE}poster.webp`);
// Háčky pro skript
body = body.replace('role="timer"', `role="timer" data-target="${startsAt}"`);
body = body.replace('<div class="fixed inset-x-0 bottom-0 z-30', '<div id="hw-ticket-bar" class="fixed inset-x-0 bottom-0 z-30');

const behavior = `
  var page = document.getElementById("hw-page");
  if (!page) return;
  // Odpočet do začátku akce
  var timer = page.querySelector("[role=timer]");
  if (timer) {
    var target = new Date(timer.getAttribute("data-target")).getTime();
    var labels = [["den", "dny", "dní"], ["hodina", "hodiny", "hodin"], ["minuta", "minuty", "minut"], ["sekunda", "sekundy", "sekund"]];
    var tiles = Array.prototype.slice.call(timer.children);
    function word(n, w) { return n === 1 ? w[0] : n >= 2 && n <= 4 ? w[1] : w[2]; }
    function tick() {
      var left = target - Date.now();
      if (left <= 0) {
        var done = document.createElement("p");
        done.className = "font-metal text-[28px] text-blood hw-glow";
        done.textContent = "Právě teď v Klubu K2";
        timer.replaceWith(done);
        clearInterval(id);
        return;
      }
      var total = Math.floor(left / 1000);
      var parts = [Math.floor(total / 86400), Math.floor((total % 86400) / 3600), Math.floor((total % 3600) / 60), total % 60];
      tiles.forEach(function (tile, i) {
        tile.children[0].textContent = String(parts[i]).padStart(2, "0");
        tile.children[1].textContent = word(parts[i], labels[i]);
      });
    }
    var id = setInterval(tick, 1000);
    tick();
  }
  // Mobil: lišta se vstupenkami vyjede po odscrollování úvodu
  var bar = document.getElementById("hw-ticket-bar");
  var hero = document.getElementById("top");
  if (bar && hero && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      var shown = !entries[0].isIntersecting;
      bar.classList.toggle("translate-y-full", !shown);
      bar.classList.toggle("translate-y-0", shown);
      bar.setAttribute("aria-hidden", shown ? "false" : "true");
      bar.querySelector("a").tabIndex = shown ? 0 : -1;
    }, { threshold: 0.12 }).observe(hero);
  }
`;
// ---- CSS: sloučit chunky, zrušit @layer (nevrstvené styly šablony by jinak vyhrály), vyhodit @font-face
// (fonty jdou z Google Fonts) a všechny selektory omezit na #hw-page, ať se netlučou se šablonou WordPressu.
const cssFiles = [...html.matchAll(/<link rel="stylesheet" href="\/_next\/static\/chunks\/([^"]+\.css)"/g)].map((m) => m[1]);
let css = cssFiles.map((f) => readFileSync(path.join(".next/static/chunks", f), "utf8")).join("\n");
css = css.replaceAll("var(--font-urbanist)", "'Urbanist'").replaceAll("var(--font-metal-mania)", "'Metal Mania'");

const root = postcss.parse(css);
root.walkAtRules("layer", (at) => (at.nodes ? at.replaceWith(at.nodes) : at.remove()));
root.walkAtRules("font-face", (at) => at.remove());

// Jen pravidla pro třídy, které stránka opravdu používá (plus třídy přepínané skriptem).
const used = new Set(["translate-y-0", "translate-y-full", "font-metal", "text-[28px]", "text-blood", "hw-glow", "hidden", "hw-lock"]);
for (const m of body.matchAll(/class="([^"]*)"/g)) for (const c of m[1].split(/\s+/)) if (c) used.add(c);
const classesOf = (sel) => [...sel.matchAll(/\.((?:\\.|[A-Za-z0-9_-])+)/g)].map((m) => m[1].replace(/\\(.)/g, "$1"));
root.walkRules((rule) => {
  if (rule.parent?.type === "atrule" && /keyframes$/.test(rule.parent.name)) return;
  const kept = rule.selectors.filter((sel) => classesOf(sel).every((c) => used.has(c)));
  if (!kept.length) rule.remove();
  else rule.selectors = kept;
});
root.walkAtRules((at) => {
  if (at.nodes && !at.nodes.length) at.remove();
});
root.walkRules((rule) => {
  if (rule.parent?.type === "atrule" && /keyframes$/.test(rule.parent.name)) return;
  if (rule.selector.includes(":root:has(.hw)")) return rule.remove();
  rule.selectors = rule.selectors.map((sel) => {
    const s = sel.trim();
    if (/^:root(,|$)|^:host(,|$)/.test(s)) return s;
    if (s === ":root" || s === ":host") return s;
    if (/^html\b/.test(s)) return s.replace(/^html/, "#hw-page");
    if (/^body\b/.test(s)) return s.replace(/^body/, "#hw-page");
    return `#hw-page ${s}`;
  });
});
const scopedCss = root.toString();

const extraCss = `
/* Obal stránky: celá šířka i uvnitř obsahu šablony, písmo a tmavé pozadí */
#hw-page{width:100vw;max-width:100vw;margin-left:calc(50% - 50vw);margin-right:calc(50% - 50vw);overflow-x:clip;font-family:'Urbanist',system-ui,sans-serif;line-height:1.5;-webkit-font-smoothing:antialiased;color:#f3ede6;background:#07060a}
#hw-page,#hw-page *,#hw-page ::before,#hw-page ::after{box-sizing:border-box}
#hw-page img{max-width:none}
#hw-page a{text-decoration:none}
#hw-page h1,#hw-page h2,#hw-page p,#hw-page ul,#hw-page ol{margin:0;padding:0}
#hw-page ul,#hw-page ol{list-style:none}
#hw-page :where(div,span,p,a,li,ol,ul,h1,h2,nav,header,footer,section,svg){color:inherit;font-family:inherit;font-size:inherit;font-weight:inherit;line-height:inherit;letter-spacing:inherit;text-transform:inherit;text-shadow:inherit;background:none;border:0;box-shadow:none;border-radius:0}
#hw-page :where(img){border:0;box-shadow:none;max-width:none;height:auto}
html.hw-lock,body.hw-lock{overflow:hidden}
`;


// Galerie s překryvem: stejný skript, který v aplikaci načítá <Script src="/halloween/gallery.js">
const galleryJs = readFileSync("public/halloween/gallery.js", "utf8").replace(/^\/\/.*\n/gm, "");
const behaviorAll = behavior + "\n" + galleryJs;
// Skript musí přežít cokoli, co s ním udělá cache plugin (Seraphinite Accelerator na get-up.fun): bez atributu
// seraph-accel-crit="1" ho odloží až do první interakce (odpočet naskočil až po scrollu), s ním ho zase může přesunout
// do hlavičky a spustit dřív, než existuje obsah bloku. Proto se blok hledá opakovaně, dokud se neobjeví.
const boot = `
  var tries = 0;
  function boot() {
    var page = document.getElementById("hw-page");
    if (!page) { if (tries++ < 120) setTimeout(boot, 250); return; }
    if (page.getAttribute("data-hw-ready")) return;
    page.setAttribute("data-hw-ready", "1");
    ${behaviorAll}
  }
  boot();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  window.addEventListener("load", boot);
`;
// Minifikace: blok se vkládá kopírováním a náhled souboru ukazuje jen prvních ~100 řádků, takže celý soubor
// musí mít řádků co nejméně (jednou se zkopíroval uříznutý a rozbitý skript nic nespustil).
const minify = async (code) => (await terser.minify(code, { compress: { passes: 2 }, mangle: true, format: { comments: false } })).code;
const script = `<script seraph-accel-crit="1">${await minify(`(function () {${boot}})();`)}</script>`;

const out = `<!-- Halloween by GetUp – vygenerováno skriptem scripts/export-halloween-wordpress.mjs, neupravovat ručně -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Metal+Mania&amp;family=Urbanist:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet">
<style>
${scopedCss}
${extraCss}
</style>
${body}
${script}
`;

mkdirSync(OUT, { recursive: true });
writeFileSync(path.join(OUT, "halloween.html"), out);

const fonts = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Metal+Mania&amp;family=Urbanist:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet">`;
const embedHtml = `<!-- Halloween by GetUp – generuje scripts/export-halloween-wordpress.mjs -->\n${fonts}\n<style>\n${scopedCss}\n${extraCss}\n</style>\n${body}\n`;
const embedJs = `// Halloween by GetUp – vloží stránku do <div id="hw-root"></div> (generuje scripts/export-halloween-wordpress.mjs)
(function () {
  var script = document.currentScript;
  var base = script && script.src ? new URL(".", script.src).href : "${SITE}/halloween/";
  var root = document.getElementById("hw-root");
  if (!root) return;
  fetch(base + "embed.html", { credentials: "omit" })
    .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); })
    .then(function (html) { root.innerHTML = html; init(); })
    .catch(function (err) { console.error("Halloween embed:", err); });
  function init() {${await minify(`(function () {${behaviorAll}})();`)}}
})();
`;
const EMBED_DIR = process.env.EMBED_DIR || "public/halloween";
mkdirSync(EMBED_DIR, { recursive: true });
writeFileSync(path.join(EMBED_DIR, "embed.html"), embedHtml);
writeFileSync(path.join(EMBED_DIR, "embed.js"), embedJs);
writeFileSync(
  path.join(OUT, "snippet.html"),
  `<div id="hw-root"></div>\n<script src="${SITE}/halloween/embed.js" async seraph-accel-crit="1"></script>\n`,
);
mkdirSync(path.join(OUT, "images/halloween"), { recursive: true });
mkdirSync(path.join(OUT, "images/people"), { recursive: true });
cpSync("public/halloween", path.join(OUT, "images/halloween"), { recursive: true });
for (const p of [...body.matchAll(/\/people\/([a-z]+\.webp)/g)].map((m) => m[1])) {
  if (existsSync(`public/people/${p}`)) cpSync(`public/people/${p}`, path.join(OUT, "images/people", p));
}
console.log(`✓ ${OUT}/halloween.html (${Math.round(out.length / 1024)} kB) a snippet.html; embed v ${EMBED_DIR}; odkazy vedou na ${SITE}, obrázky na ${IMAGE_BASE || SITE}`);
