# Halloween by GetUp na webu get-up.fun

Do webu se vkládají dva řádky ze souboru `snippet.html`:

```html
<div id="hw-root"></div>
<script src="https://together.get-up.fun/halloween/embed.js" async></script>
```

Skript si stáhne stránku z aplikace GetCrush (soubory `public/halloween/embed.html` a `embed.js`),
takže po každé změně textů stačí nasadit aplikaci a web se aktualizuje sám. Styly jsou omezené na vlastní
obal, takže se netlučou se šablonou webu ani s Elementorem.

Soubor `halloween.html` je totéž v jednom kuse (bez načítání z aplikace) pro případ, že chceš stránku
mít úplně nezávislou. Vkládá se stejně, jen je ho 107 kB.

## Postup v Elementoru (5 minut)

1. **Stránky → Přidat stránku**, název „Halloween“, pak **Upravit pomocí Elementoru**.
2. Vlevo dole ozubené kolo (**Nastavení stránky**) → **Rozvržení stránky: Elementor Canvas**.
   Stránka tak nemá hlavičku ani patičku webu, má vlastní.
3. Z panelu widgetů přetáhni **HTML** (skupina Obecné). Do pole **HTML kód** vlož ty dva řádky výše.
4. Klikni na kontejner kolem widgetu: **Rozvržení → Šířka obsahu: Plná šířka**, odsazení 0.
   Není to nutné, stránka si celou šířku vezme sama, ale je to čistší.
5. **Publikovat** a zkontroluj na mobilu i na počítači.
6. Jako úvodní stránku: **Nastavení → Čtení → Úvodní stránka zobrazuje: Statickou stránku → Halloween**.
   Stránka DOMŮ zůstane, po akci ji vrátíš stejným způsobem.
7. **Accelerator (Seraphinite) → vyčistit cache**, jinak návštěvníci uvidí starou verzi.

Bez Elementoru to jde stejně: nová stránka, šablona bez hlavičky („Prázdná“, „Blank“, „Canvas“),
blok **Vlastní HTML** a do něj obsah souboru.

## Obrázky a odkazy

Obsah, obrázky i odkazy (připojení k akci, podmínky, plakát ke stažení) vedou na `https://together.get-up.fun`.
Aplikace GetCrush tedy musí mít tuhle verzi nasazenou (větev sloučená do hlavní), jinak se stránka nenačte.

Chceš mít obrázky raději ve WordPressu? Nahraj složku `images` do Knihovny médií a v `halloween.html`
nahraď `https://together.get-up.fun/halloween/` adresou, kam se obrázky nahrály
(například `https://www.get-up.fun/wp-content/uploads/2026/10/`). Totéž pro `/people/`.

## Úpravy textů

Datum, line-up, cenu, odkazy a texty se upravují v projektu GetCrush v souboru
`src/app/halloween/event.ts` (texty v `page.tsx`), pak `npm run build`,
`node scripts/export-halloween-wordpress.mjs` a commit (vygeneruje se nový `public/halloween/embed.html`).
Po nasazení aplikace se web aktualizuje sám, do WordPressu se nic znovu nevkládá.

## Když něco nesedí

- Nejčastější chyba: do widgetu se dostal jen začátek souboru. Náhled souboru v aplikaci ukazuje jen prvních
  zhruba 100 řádků, proto soubor vždy stáhni, otevři v editoru (TextEdit, VS Code) a zkopíruj celý (Ctrl/Cmd+A).
  Soubor má schválně jen pár desítek řádků; po vložení zkontroluj, že blok končí značkou `</script>`.

- Stránka je úzká uprostřed nebo má nahoře menu webu: nastav rozvržení Elementor Canvas (bod 2).
- Stránka je prázdná: aplikace na together.get-up.fun ještě nemá tuhle verzi nasazenou, nebo cache plugin
  (Accelerator) blokuje či přesouvá cizí skripty. Stránku vyjmi z optimalizace JavaScriptu.
- Odpočet ukazuje pomlčky: skript se nespustil. Vkládej jako administrátor a stránku vyjmi z optimalizace
  JavaScriptu v cache pluginu.
- Odpočet naskočí až po scrollu nebo po několika sekundách: Accelerator odkládá skripty do první interakce.
  Skript v bloku má atribut `seraph-accel-crit="1"`, který ho z odkládání vyjímá; pokud to nestačí, v Accelerator →
  Scripts → Lazy loading přidej do výjimek `hw-page`, nebo odkládání skriptů pro tuhle stránku vypni.
- Písmo titulků je obyčejné: web blokuje Google Fonts (např. plugin na GDPR). Povol `fonts.googleapis.com`,
  nebo písma Urbanist a Metal Mania nahraj do webu a uprav `<link>` na začátku souboru.
