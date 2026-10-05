// Statická verze stránky /tinder (Tinder party a pod ní Halloween) pro vložení do WordPressu (blok „Vlastní HTML“
// na prázdné šabloně). Vychází z hotového buildu (`npm run build`), výsledek je v out/tinder-wordpress/:
//   tinder.html   – kompletní blok (fonty, CSS, HTML, skript odpočtů, spodní lišty a galerie)
//   images/       – obrázky pro případ, že je chceš nahrát do Knihovny médií
//   snippet.html  – dva řádky do HTML widgetu, obsah se načte z aplikace (public/tinder/embed.html + embed.js)
// Obrázky a odkazy vedou na SITE_URL (výchozí https://getcrush.get-up.fun).
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import sharp from "sharp";

const require = createRequire(import.meta.url);
const terser = require("next/dist/compiled/terser");
const postcss = require("postcss");

const SITE = (process.env.SITE_URL || "https://getcrush.get-up.fun").replace(/\/$/, "");
const OUT = process.env.OUT_DIR || "out/tinder-wordpress";
// Volitelně: obrázky nahrané do Knihovny médií WordPressu (všechny v jedné složce), např.
// IMAGE_BASE=https://get-up.fun/wp-content/uploads/2026/10/
const IMAGE_BASE = process.env.IMAGE_BASE ? process.env.IMAGE_BASE.replace(/\/?$/, "/") : "";
const pageFile = ".next/server/app/tinder.html";
if (!existsSync(pageFile)) {
  console.error("Chybí build: nejdřív spusť `npm run build`.");
  process.exit(1);
}

const html = readFileSync(pageFile, "utf8");
const startOf = (file) => readFileSync(file, "utf8").match(/startsAt: "([^"]+)"/)[1];
// Dva odpočty v pořadí na stránce: Tinder party nahoře, Halloween dole (hotovou hlášku vykreslí skript se třídami z každé stránky)
const TIMERS = [
  { target: startOf("src/app/tinder/event.ts"), done: "font-display tp-glow text-[28px] text-accent uppercase" },
  { target: startOf("src/app/halloween/event.ts"), done: "font-metal text-[28px] text-blood hw-glow" },
];

// ---- Obrázky: hotové menší varianty v public (srcset); které jsou k dispozici, říká tahle mapa
const VARIANTS = {
  "/tinder/crowd.webp": [800],
  "/tinder/dj.webp": [800],
  "/tinder/poster.webp": [540],
  "/halloween/hero.webp": [800, 1200],
  "/halloween/title.webp": [600, 900],
  "/halloween/reaper.webp": [540],
  "/halloween/poster.webp": [540],
};
const widthOf = {};
for (const asset of Object.keys(VARIANTS)) widthOf[asset] = (await sharp(`public${asset}`).metadata()).width;

// Statické importy mají v buildu hashované jméno (poster.abc123.webp) a stejné jméno je v public/tinder i public/halloween;
// který soubor to je, poznáme podle shodné velikosti.
const MEDIA_DIRS = ["/tinder", "/halloween", "/halloween/gallery"];
const resolveMedia = (hashed, name, ext) => {
  const built = `.next/static/media/${hashed}`;
  const size = existsSync(built) ? statSync(built).size : -1;
  const candidates = MEDIA_DIRS.map((dir) => `${dir}/${name}.${ext}`).filter((asset) => existsSync(`public${asset}`));
  return candidates.find((asset) => statSync(`public${asset}`).size === size) || candidates[0] || `/${name}.${ext}`;
};
const assetName = (url) => {
  const u = decodeURIComponent(url);
  const m = u.match(/_next\/static\/media\/(([a-z0-9-]+)\.[a-z0-9_-]+\.(webp|png|jpg))/i);
  if (m) return resolveMedia(m[1], m[2], m[3]);
  const q = u.match(/_next\/image\?url=([^&]+)/);
  if (q) return q[1];
  return u;
};

// ---- HTML: jen obal .tp z těla stránky, bez skriptů Next.js
let body = html.slice(html.indexOf("<body"), html.indexOf("</body>"));
body = body.slice(body.indexOf(">") + 1);
body = body.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<script[^>]*\/>/g, "");
body = body.replace(/<div hidden=""><!--\$--><!--\/\$--><\/div>/g, "").replace(/<next-route-announcer[\s\S]*?<\/next-route-announcer>/g, "");
body = body.trim();
if (!body.startsWith('<div class="tp ')) throw new Error("Nenašel jsem obal .tp");
body = body.replace('<div class="tp ', '<div id="tp-page" class="alignfull tp ');

// Obrázky: místo optimalizovaných variant Next.js přímo soubory ze SITE
body = body.replace(/<img\b([^>]*)>/g, (tag, attrs) => {
  const get = (name) => (attrs.match(new RegExp(`\\s${name}="([^"]*)"`)) || [])[1];
  const source = get("srcSet") || get("src");
  const first = source ? source.split(",")[0].trim().split(/\s+/)[0] : null;
  const rest = attrs.replace(/\s(srcSet|sizes|src)="[^"]*"/g, "").replace(/\s*\/$/, "");
  const asset = first ? assetName(first) : "";
  const src = !first ? "" : first.startsWith("http") ? first : IMAGE_BASE ? IMAGE_BASE + path.basename(asset) : SITE + asset;
  let extra = "";
  const sizes = get("sizes") || "100vw";
  if (!IMAGE_BASE && VARIANTS[asset]) {
    const base = asset.replace(/\.webp$/, "");
    const set = [...VARIANTS[asset].map((w) => `${SITE}${base}-${w}.webp ${w}w`), `${src} ${widthOf[asset]}w`];
    extra = ` srcset="${set.join(", ")}" sizes="${sizes}"`;
  }
  const gallery = asset.match(/^\/halloween\/gallery\/(\d{3})\.webp$/);
  if (!IMAGE_BASE && gallery) extra = ` srcset="${SITE}/halloween/gallery/${gallery[1]}-800.webp 800w, ${src} 1600w" sizes="${sizes}"`;
  if (asset === "/tinder/poster.webp") extra += ' fetchpriority="high"';
  return `<img${rest}${extra} src="${src}">`;
});
// Odkazy do aplikace (připojení k akci, podmínky, plakát) absolutně
body = body.replace(/href="\/(?!\/)([^"]*)"/g, (m, p) => `href="${SITE}/${p}"`);
if (IMAGE_BASE) {
  body = body.replaceAll(`${SITE}/tinder/poster.webp`, `${IMAGE_BASE}poster.webp`).replaceAll(`${SITE}/tinder/banner.webp`, `${IMAGE_BASE}banner.webp`);
}
// Háčky pro skript
let timerIndex = 0;
body = body.replace(/role="timer"/g, () => {
  const t = TIMERS[timerIndex++] || TIMERS[0];
  return `role="timer" data-target="${t.target}" data-done="${t.done}"`;
});
body = body.replace('<div class="fixed inset-x-0 bottom-0 z-30', '<div id="tp-ticket-bar" class="fixed inset-x-0 bottom-0 z-30');

const behavior = `
  var page = document.getElementById("tp-page");
  if (!page) return;
  // Odpočty do začátku akcí (Tinder party nahoře, Halloween dole)
  var labels = [["den", "dny", "dní"], ["hodina", "hodiny", "hodin"], ["minuta", "minuty", "minut"], ["sekunda", "sekundy", "sekund"]];
  function word(n, w) { return n === 1 ? w[0] : n >= 2 && n <= 4 ? w[1] : w[2]; }
  Array.prototype.forEach.call(page.querySelectorAll("[role=timer]"), function (timer) {
    var target = new Date(timer.getAttribute("data-target")).getTime();
    var tiles = Array.prototype.slice.call(timer.children);
    function tick() {
      var left = target - Date.now();
      if (left <= 0) {
        var done = document.createElement("p");
        done.className = timer.getAttribute("data-done") || "";
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
  });
  // Mobil: lišta se vstupenkami vyjede po odscrollování úvodu a schová se nad Halloweenem
  var bar = document.getElementById("tp-ticket-bar");
  var hero = document.getElementById("top");
  var zone = document.getElementById("halloween");
  if (bar && hero && "IntersectionObserver" in window) {
    var heroVisible = true, zoneVisible = false;
    function update() {
      var shown = !heroVisible && !zoneVisible;
      bar.classList.toggle("translate-y-full", !shown);
      bar.classList.toggle("translate-y-0", shown);
      bar.setAttribute("aria-hidden", shown ? "false" : "true");
      bar.querySelector("a").tabIndex = shown ? 0 : -1;
    }
    new IntersectionObserver(function (entries) { heroVisible = entries[0].isIntersecting; update(); }, { threshold: 0.12 }).observe(hero);
    if (zone) new IntersectionObserver(function (entries) { zoneVisible = entries[0].isIntersecting; update(); }).observe(zone);
  }
`;
// ---- CSS: sloučit chunky, zrušit @layer (nevrstvené styly šablony by jinak vyhrály), vyhodit @font-face
// (fonty jdou z Google Fonts) a všechny selektory omezit na #tp-page, ať se netlučou se šablonou WordPressu.
const cssFiles = [...html.matchAll(/<link rel="stylesheet" href="\/_next\/static\/chunks\/([^"]+\.css)"/g)].map((m) => m[1]);
let css = cssFiles.map((f) => readFileSync(path.join(".next/static/chunks", f), "utf8")).join("\n");
css = css
  .replaceAll("var(--font-urbanist)", "'Urbanist'")
  .replaceAll("var(--font-anton)", "'Anton'")
  .replaceAll("var(--font-yellowtail)", "'Yellowtail'")
  .replaceAll("var(--font-metal-mania)", "'Metal Mania'");

const root = postcss.parse(css);
root.walkAtRules("layer", (at) => (at.nodes ? at.replaceWith(at.nodes) : at.remove()));
root.walkAtRules("font-face", (at) => at.remove());

// Jen pravidla pro třídy, které stránka opravdu používá (plus třídy přepínané skriptem).
const used = new Set(["translate-y-0", "translate-y-full", "hidden", "hw-lock"]);
for (const t of TIMERS) for (const c of t.done.split(/\s+/)) used.add(c);
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
  if (rule.selector.includes(":root:has(.hw)") || rule.selector.includes(":root:has(.tp)")) return rule.remove();
  rule.selectors = rule.selectors.map((sel) => {
    const s = sel.trim();
    if (/^:root(,|$)|^:host(,|$)/.test(s)) return s;
    if (s === ":root" || s === ":host") return s;
    if (/^html\b/.test(s)) return s.replace(/^html/, "#tp-page");
    if (/^body\b/.test(s)) return s.replace(/^body/, "#tp-page");
    return `#tp-page ${s}`;
  });
});
const scopedCss = root.toString();

const extraCss = `
/* Obal stránky: celá šířka i uvnitř obsahu šablony, písmo a tmavé pozadí */
#tp-page{width:100vw;max-width:100vw;margin-left:calc(50% - 50vw);margin-right:calc(50% - 50vw);overflow-x:clip;font-family:'Urbanist',system-ui,sans-serif;line-height:1.5;-webkit-font-smoothing:antialiased;color:#fff;background:#130611;scroll-behavior:smooth}
#tp-page,#tp-page *,#tp-page ::before,#tp-page ::after{box-sizing:border-box}
#tp-page img{max-width:none}
#tp-page a{text-decoration:none}
#tp-page h1,#tp-page h2,#tp-page p,#tp-page ul,#tp-page ol{margin:0;padding:0}
#tp-page ul,#tp-page ol{list-style:none}
#tp-page :where(div,span,p,a,li,ol,ul,h1,h2,nav,header,footer,section,button,svg){color:inherit;font-family:inherit;font-size:inherit;font-weight:inherit;line-height:inherit;letter-spacing:inherit;text-transform:inherit;text-shadow:inherit;text-indent:0;background:none;border:0;box-shadow:none;border-radius:0}
#tp-page :where(button){cursor:pointer;padding:0}
#tp-page :where(img){border:0;box-shadow:none;border-radius:0;max-width:none;height:auto}
html.hw-lock,body.hw-lock{overflow:hidden}
`;

// Galerie Halloweenu s překryvem: stejný skript, který v aplikaci načítá <Script src="/halloween/gallery.js">
const galleryJs = readFileSync("public/halloween/gallery.js", "utf8").replace(/^\/\/.*\n/gm, "");
const behaviorAll = behavior + "\n" + galleryJs;
// Skript musí přežít cokoli, co s ním udělá cache plugin (Seraphinite Accelerator na get-up.fun): bez atributu
// seraph-accel-crit="1" ho odloží až do první interakce, s ním ho zase může přesunout do hlavičky a spustit dřív,
// než existuje obsah bloku. Proto se blok hledá opakovaně, dokud se neobjeví.
const boot = `
  var tries = 0;
  function boot() {
    var page = document.getElementById("tp-page");
    if (!page) { if (tries++ < 120) setTimeout(boot, 250); return; }
    if (page.getAttribute("data-tp-ready")) return;
    page.setAttribute("data-tp-ready", "1");
    ${behaviorAll}
  }
  boot();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  window.addEventListener("load", boot);
`;
// Minifikace: blok se vkládá kopírováním a náhled souboru ukazuje jen prvních ~100 řádků, takže celý soubor
// musí mít řádků co nejméně.
const minify = async (code) => (await terser.minify(code, { compress: { passes: 2 }, mangle: true, format: { comments: false } })).code;
const script = `<script seraph-accel-crit="1">${await minify(`(function () {${boot}})();`)}</script>`;

const fonts = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&amp;family=Metal+Mania&amp;family=Yellowtail&amp;family=Urbanist:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet">`;

const out = `<!-- Tinder party + Halloween by GetUp – vygenerováno skriptem scripts/export-tinder-wordpress.mjs, neupravovat ručně -->
${fonts}
<style>
${scopedCss}
${extraCss}
</style>
${body}
${script}
`;

mkdirSync(OUT, { recursive: true });
writeFileSync(path.join(OUT, "tinder.html"), out);

const embedHtml = `<!-- Tinder party + Halloween by GetUp – generuje scripts/export-tinder-wordpress.mjs -->\n${fonts}\n<style>\n${scopedCss}\n${extraCss}\n</style>\n${body}\n`;
const embedJs = `// Tinder party + Halloween by GetUp – vloží stránku do <div id="tp-root"></div> (generuje scripts/export-tinder-wordpress.mjs)
(function () {
  var script = document.currentScript;
  var base = script && script.src ? new URL(".", script.src).href : "${SITE}/tinder/";
  var root = document.getElementById("tp-root");
  if (!root) return;
  fetch(base + "embed.html", { credentials: "omit" })
    .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); })
    .then(function (html) { root.innerHTML = html; init(); })
    .catch(function (err) { console.error("Tinder embed:", err); });
  function init() {${await minify(`(function () {${behaviorAll}})();`)}}
})();
`;
const EMBED_DIR = process.env.EMBED_DIR || "public/tinder";
mkdirSync(EMBED_DIR, { recursive: true });
writeFileSync(path.join(EMBED_DIR, "embed.html"), embedHtml);
writeFileSync(path.join(EMBED_DIR, "embed.js"), embedJs);
writeFileSync(path.join(OUT, "snippet.html"), `<div id="tp-root"></div>\n<script src="${SITE}/tinder/embed.js" async seraph-accel-crit="1"></script>\n`);
for (const dir of ["tinder", "halloween"]) {
  mkdirSync(path.join(OUT, "images", dir), { recursive: true });
  for (const file of readdirSync(`public/${dir}`)) {
    if (/\.(webp|png|jpg)$/.test(file)) cpSync(`public/${dir}/${file}`, path.join(OUT, "images", dir, file));
  }
}
mkdirSync(path.join(OUT, "images/halloween/gallery"), { recursive: true });
cpSync("public/halloween/gallery", path.join(OUT, "images/halloween/gallery"), { recursive: true });
console.log(`✓ ${OUT}/tinder.html (${Math.round(out.length / 1024)} kB) a snippet.html; embed v ${EMBED_DIR}; odkazy vedou na ${SITE}, obrázky na ${IMAGE_BASE || SITE}`);
