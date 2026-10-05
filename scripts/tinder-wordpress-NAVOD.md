# Tinder party + Halloween na webu get-up.fun

Jedna stránka: nahoře Tinder party (16. 10. 2026), pod ní celý Halloween (30. 10. 2026), v hlavičce odkaz
„Halloween“, který na něj skočí. Do webu se vkládají dva řádky ze souboru `snippet.html`:

```html
<div id="tp-root"></div>
<script src="https://getcrush.get-up.fun/tinder/embed.js" async></script>
```

Skript si stáhne stránku z aplikace GetCrush (soubory `public/tinder/embed.html` a `embed.js`), takže po každé
změně textů stačí nasadit aplikaci a web se aktualizuje sám. Styly jsou omezené na vlastní obal, takže se netlučou
se šablonou webu ani s Elementorem. Starý blok Halloweenu (`hw-root` + `halloween/embed.js`) tímhle nahraď,
Halloween je v nové stránce celý.

Soubor `tinder.html` je totéž v jednom kuse (bez načítání z aplikace) pro případ, že chceš stránku mít úplně
nezávislou. Vkládá se stejně, jen je větší.

## Postup v Elementoru (5 minut)

1. **Stránky → Přidat stránku**, název „Tinder party“, pak **Upravit pomocí Elementoru**.
2. Vlevo dole ozubené kolo (**Nastavení stránky**) → **Rozvržení stránky: Elementor Canvas**.
   Stránka tak nemá hlavičku ani patičku webu, má vlastní.
3. Z panelu widgetů přetáhni **HTML** (skupina Obecné). Do pole **HTML kód** vlož ty dva řádky výše.
4. Klikni na kontejner kolem widgetu: **Rozvržení → Šířka obsahu: Plná šířka**, odsazení 0.
5. **Publikovat** a zkontroluj na mobilu i na počítači.
6. Jako úvodní stránku: **Nastavení → Čtení → Úvodní stránka zobrazuje: Statickou stránku → Tinder party**.
7. **Accelerator (Seraphinite) → vyčistit cache**, jinak návštěvníci uvidí starou verzi.

Bez Elementoru to jde stejně: nová stránka, šablona bez hlavičky („Prázdná“, „Blank“, „Canvas“),
blok **Vlastní HTML** a do něj obsah souboru.

## Obrázky a odkazy

Obsah, obrázky i odkazy (připojení k akci, podmínky, plakát ke stažení) vedou na `https://getcrush.get-up.fun`.
Chceš mít obrázky raději ve WordPressu? Nahraj složku `images` do Knihovny médií a spusť export s
`IMAGE_BASE=https://www.get-up.fun/wp-content/uploads/2026/10/ node scripts/export-tinder-wordpress.mjs`.

## Úpravy textů

Datum, místo, odkazy a kód akce se upravují v projektu GetCrush v `src/app/tinder/event.ts` (Halloween
v `src/app/halloween/event.ts`, texty v `page.tsx` a `content.tsx`), pak `npm run build`,
`node scripts/export-tinder-wordpress.mjs` a commit (vygeneruje se nový `public/tinder/embed.html`).
Po nasazení aplikace se web aktualizuje sám, do WordPressu se nic znovu nevkládá.

## Když něco nesedí

- Do widgetu se dostal jen začátek souboru: náhled souboru ukazuje jen prvních zhruba 100 řádků, proto soubor
  vždy stáhni, otevři v editoru a zkopíruj celý (Ctrl/Cmd+A). Po vložení zkontroluj, že blok končí `</script>`.
- Stránka je úzká uprostřed nebo má nahoře menu webu: nastav rozvržení Elementor Canvas (bod 2).
- Stránka je prázdná: aplikace na getcrush.get-up.fun ještě nemá tuhle verzi nasazenou, nebo cache plugin
  (Accelerator) blokuje či přesouvá cizí skripty. Stránku vyjmi z optimalizace JavaScriptu.
- Odpočet ukazuje pomlčky nebo naskočí až po scrollu: skript v bloku má atribut `seraph-accel-crit="1"`;
  pokud to nestačí, v Accelerator → Scripts → Lazy loading přidej do výjimek `tp-page`.
- Písma jsou obyčejná: web blokuje Google Fonts (např. plugin na GDPR). Povol `fonts.googleapis.com`,
  nebo písma Urbanist, Anton, Yellowtail a Metal Mania nahraj do webu a uprav `<link>` na začátku souboru.
