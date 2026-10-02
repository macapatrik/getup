# Halloween by GetUp na webu get-up.fun

Soubor `halloween.html` je celá stránka v jednom bloku: písma (Google Fonts), styly, obsah i skript odpočtu
a spodní lišty se vstupenkami. Styly jsou omezené na vlastní obal, takže se netlučou se šablonou webu
ani s Elementorem.

## Postup v Elementoru (10 minut)

1. **Stránky → Přidat stránku**, název „Halloween“, pak **Upravit pomocí Elementoru**.
2. Vlevo dole ozubené kolo (**Nastavení stránky**) → **Rozvržení stránky: Elementor Canvas**.
   Stránka tak nemá hlavičku ani patičku webu, má vlastní.
3. Z panelu widgetů přetáhni **HTML** (skupina Obecné). Do pole **HTML kód** vlož celý obsah souboru
   `halloween.html` (otevři ho v TextEditu nebo Poznámkovém bloku, Cmd+A, Cmd+C, do pole Cmd+V).
4. Klikni na kontejner kolem widgetu: **Rozvržení → Šířka obsahu: Plná šířka**, odsazení 0.
   Není to nutné, stránka si celou šířku vezme sama, ale je to čistší.
5. **Publikovat** a zkontroluj na mobilu i na počítači.
6. Jako úvodní stránku: **Nastavení → Čtení → Úvodní stránka zobrazuje: Statickou stránku → Halloween**.
   Stránka DOMŮ zůstane, po akci ji vrátíš stejným způsobem.
7. **Accelerator (Seraphinite) → vyčistit cache**, jinak návštěvníci uvidí starou verzi.

Bez Elementoru to jde stejně: nová stránka, šablona bez hlavičky („Prázdná“, „Blank“, „Canvas“),
blok **Vlastní HTML** a do něj obsah souboru.

## Obrázky a odkazy

Obrázky a odkazy (připojení k akci, podmínky, plakát ke stažení) vedou na `https://together.get-up.fun`.
Aplikace GetTogether tedy musí mít tuhle verzi nasazenou (větev sloučená do hlavní), jinak obrázky chybí.

Chceš mít obrázky raději ve WordPressu? Nahraj složku `images` do Knihovny médií a v `halloween.html`
nahraď `https://together.get-up.fun/halloween/` adresou, kam se obrázky nahrály
(například `https://www.get-up.fun/wp-content/uploads/2026/10/`). Totéž pro `/people/`.

## Úpravy textů

Datum, line-up, cenu, odkazy a texty neuprav v HTML, ale v projektu GetTogether v souboru
`src/app/halloween/event.ts` (texty v `page.tsx`), pak `npm run build` a
`node scripts/export-halloween-wordpress.mjs`. Vznikne nový `halloween.html`, který do widgetu vložíš znovu.
Ruční úprava HTML jde taky, jen se při dalším exportu přepíše.

## Když něco nesedí

- Stránka je úzká uprostřed nebo má nahoře menu webu: nastav rozvržení Elementor Canvas (bod 2).
- Elementor blok neuloží (hosting omezuje velikost požadavku): rozděl obsah do tří HTML widgetů pod sebou:
  první `<link …>` a `<style>…</style>`, druhý zbytek HTML, třetí `<script>…</script>`.
- Odpočet ukazuje pomlčky: skript se nespustil. Vkládej jako administrátor a stránku vyjmi z optimalizace
  JavaScriptu v cache pluginu.
- Písmo titulků je obyčejné: web blokuje Google Fonts (např. plugin na GDPR). Povol `fonts.googleapis.com`,
  nebo písma Urbanist a Metal Mania nahraj do webu a uprav `<link>` na začátku souboru.
