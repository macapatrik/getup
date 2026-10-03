# GetTogether (by GetUp)

Seznamka ve stylu Tinderu napojená na akce [GetUp](https://getup.cz): lidé se seznamují **jen s ostatními ze stejného koncertu nebo party**.

1. Na akci visí QR kód (vstup, bar, vstupenka) → člověk ho naskenuje foťákem v mobilu.
2. Přihlásí se kódem z e-mailu a vyplní profil (fotky, věk, koho hledá).
3. Swipuje lidi ze stejné akce. Když se lajknou oba → **match** → uvidí na sebe kontakty (Instagram, Snapchat,
   telefon), které si každý nepovinně vyplnil v profilu, a ozvou se tam. Chat v aplikaci není.
4. Místnost akce je otevřená ještě 24 h po jejím konci. Matche zůstávají napořád.

Akce je otevřená od založení, takže se lidi připojují i týdny předem: odkaz `/j/KÓD` patří do e-mailu se vstupenkou
a na sociální sítě, QR kód u vstupu je pro ty, kdo přijdou až na místě. V aplikaci vidí odpočet do začátku,
kolik lidí už na akci je, a odkaz můžou sdílet dál.

Dvě administrace:

- **Můj účet** (`/profile`, pro každého návštěvníka): profil a fotky (včetně kontaktů), moje akce, matche, koho jsem lajknul/a
  (lajk jde zrušit, dokud z něj není match), upozornění, stažení všech mých dat (JSON) a smazání účtu (potvrzuje se
  kódem z e-mailu; databáze pustí smazání jen se session mladší než 10 minut, funkce `delete_account`).
  Každý vidí jen svoje data.
- **Administrace** (`/admin`, jen pro tým GetUp): webový portál s bočním panelem, na mobilu se záložkami nahoře.
  Přehled s čísly, akce (založení, úprava, smazání, QR kódy k tisku, statistiky), uživatelé (hledání, detail,
  blokace), nahlášení (vyřešit / zablokovat) a tým (přidání a odebrání organizátorů podle e-mailu).

Na počítači má aplikace boční panel místo spodní lišty.

## Technologie

- **Next.js 16** (App Router, TypeScript, Tailwind CSS 4) jako **PWA**: dá se „nainstalovat“ na plochu telefonu.
- Design podle šablony Romio (Envato, „Multipurpose Dating Mobile App PWA HTML Template“): bílé pozadí, karty s 2px světle
  šedou linkou, růžová (#f759f5) na hlavní tlačítka, aktivní záložku, srdíčko a logo, indigo (#3e36ed) jako přechod přes
  spodek fotek na kartách. Písmo Urbanist, spodní lišta se čtyřmi záložkami jen s ikonami, žádné emoji v rozhraní. Utility
  `surface` (karta), `fill-soft` (šedá výplň), `fill-accent` (růžová), `fill-accent-soft` (světle růžová), `photo-fade`
  (přechod přes fotku), `photo-chip` (štítek na fotce) jsou v `src/app/globals.css`, sdílené třídy v `src/components/ui.ts`.
- **Supabase**: přihlášení (e-mailový kód), Postgres s Row Level Security, Storage na fotky, Realtime na nové matche.

## Spuštění lokálně

Potřebuješ Node.js 20+ a Docker (kvůli lokálnímu Supabase).

```bash
npm install
npx supabase start          # spustí lokální Supabase, aplikuje migrace + seed
cp .env.example .env.local  # doplň URL a "Publishable key" z výpisu `npx supabase status`
npm run dev                 # http://localhost:3000
```

- E-maily s přihlašovacím kódem lokálně chytá **Mailpit**: http://127.0.0.1:54324
- Seed vytvoří demo akci s kódem **`DEMO26`** (nebo otevři http://localhost:3000/j/DEMO26).
- Swipování vyzkoušíš ve dvou prohlížečích (běžné + anonymní okno) se dvěma různými e-maily.
- Ilustrační fotky na úvodní stránce (vygenerované přes Higgsfield, model Nano Banana) jsou v `public/people/`;
  chybějící by dostáhl `npm run photos` (běží i před buildem). Bez nich úvodní stránka ukáže jen barevné karty.

### Jak se stát organizátorem

V Supabase Studiu (lokálně http://127.0.0.1:54323 → SQL Editor):

```sql
insert into public.organizers (user_id)
select id from auth.users where email = 'ty@example.cz';
```

Administrace je pak na adrese `/admin` (v zákaznické aplikaci na ni nic neodkazuje, ulož si ji do záložek). Další členy týmu už přidáš přímo v administraci (sekce Tým).

### Testování na mobilu přes Wi-Fi

`npm run dev -- -H 0.0.0.0` a v mobilu otevři `http://<IP-počítače>:3000`. Přidej tu adresu do
`additional_redirect_urls` v `supabase/config.toml`. Instalace PWA na plochu ale vyžaduje HTTPS (tedy nasazení).

## Nasazení (Supabase Cloud + Vercel)

1. Založ projekt na [supabase.com](https://supabase.com) a nahraj schéma: `npx supabase link` a `npx supabase db push`.
2. V dashboardu **Authentication → Email Templates** vlož do šablon *Magic Link* i *Confirm signup* obsah
   `supabase/templates/login.html` (kvůli 6místnému kódu, který funguje i v nainstalované PWA).
3. **Authentication → URL Configuration**: nastav *Site URL* na adresu aplikace a přidej ji i do *Redirect URLs*.
4. Pro ostrý provoz nastav vlastní SMTP (**Authentication → SMTP**). Vestavěný Supabase mailer má velmi nízký limit.
5. Na [Vercelu](https://vercel.com) importuj repozitář a nastav proměnné z `.env.example`
   (`NEXT_PUBLIC_SITE_URL` = veřejná adresa, ta se tiskne do QR kódů).

## Kontakty místo chatu

V profilu si každý nepovinně vyplní Instagram, Snapchat a telefon (sloupce `instagram`, `snapchat`, `phone` v `profiles`;
trigger `profiles_validate` je srovná: z odkazu nebo `@jména` zůstane jen jméno účtu, české číslo dostane `+420`).
Cizí kontakty vrací jen `get_matches`, tedy až po matchi; v balíčku (`get_deck`) nejsou. Na stránce matche a na obrazovce
„Je to match!“ jsou pak tlačítka Instagram, Snapchat, Zavolat a SMS (`src/components/contact-buttons.tsx`,
logika v `src/lib/contacts.ts`). Chat byl zrušen migrací `…_remove_chat.sql`; úklid starých objektů v databázi
(tabulka `messages`, funkce `*_old`) je v `supabase/cleanup_chat.sql` a spouští se ručně v SQL Editoru.

## Realtime (nové matche)

Každý přihlášený má jeden soukromý realtime kanál `user:<id>` (policy na `realtime.messages` pustí jen vlastníka).
Databáze do něj triggerem posílá nové matche (`realtime.send`), stránka se pak obnoví. Fotky se ukládají jako WebP do 1080 px.

## Push upozornění (nový match)

Web Push přes service worker (`public/sw.js`). Na iPhonu fungují jen v aplikaci přidané na plochu (iOS 16.4+),
v Androidu a na počítači i přímo v prohlížeči. Zapínají se v **Profilu** (přepínač + zkušební upozornění)
nebo z výzvy na stránce **Matche**.

Jak to funguje: po vzniku matche trigger `matches_push` (migrace `…_push_notifications.sql`) pošle přes `pg_net`
webhook na `/api/push/match` a ten upozornění zašifruje a rozešle. Dostane ho ten, kdo zrovna neswipoval.
Zařízení, která upozornění vypnula, se samy smažou.

Nastavení:

1. `npx web-push generate-vapid-keys` a na Vercelu nastav `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`,
   `VAPID_SUBJECT` (adresa aplikace) a `PUSH_WEBHOOK_SECRET` (dlouhý náhodný řetězec).
2. V Supabase (SQL Editor) ulož adresu webhooku a stejný klíč do Vaultu:
   ```sql
   select vault.create_secret('https://<domena>/api/push/match', 'push_webhook_url');
   select vault.create_secret('<PUSH_WEBHOOK_SECRET>', 'push_webhook_secret');
   ```
   Bez nich trigger nic neposílá (např. při lokálním vývoji).

## Checklist spuštění

Před ostrým spuštěním (viz také [Nasazení](#nasazení-supabase-cloud--vercel)):

1. **Právní texty**: doplň provozovatele v `src/lib/legal.ts` (název, IČO, sídlo, e-mail). Stránky `/podminky` a `/soukromi`
   jsou odkazované z úvodu a přihlášení.
2. **Doména**: aplikace běží na `https://together.get-up.fun` (na Vercelu přidaná, v DNS `together CNAME cname.vercel-dns.com`,
   `NEXT_PUBLIC_SITE_URL` i `VAPID_SUBJECT` nastavené, Vault `push_webhook_url` přepsaný). V Supabase Authentication →
   URL Configuration musí být *Site URL* `https://together.get-up.fun` a v *Redirect URLs* `https://together.get-up.fun/**`.
3. **E-maily**: vlastní SMTP (Resend, Amazon SES…) v Authentication → SMTP a limit *Rate Limits → Email* podle očekávaného
   náporu (při oznámení akce klidně 1 000/h). Vestavěný mailer Supabase pošle jen pár e-mailů za hodinu.
4. **Tarify**: Supabase Pro (500 lidí připojených naráz; bez limitu útraty 10 000), Vercel Pro (komerční provoz).
5. **Demo data**: spusť `supabase/demo/cleanup.sql` a v Storage smaž složky demo účtů.
6. **Akce**: v administraci založ skutečné akce se správným datem a časem, vytiskni QR kódy, odkaz `/j/KÓD` dej do e-mailu se
   vstupenkou a na sociální sítě.
7. **Zkouška**: dva telefony, dva účty: připojení QR kódem, swipe, match, push upozornění, tlačítka na kontakty, nahlášení,
   smazání účtu.

## Struktura

```
supabase/
  migrations/…_init.sql   schéma, RLS, RPC funkce (join_event, get_deck, swipe, get_matches…)
  migrations/…_push_notifications.sql  odběry push upozornění + webhook po matchi
  migrations/…_admin_and_account.sql   administrace (admin_*), blokace účtů, Můj účet (my_*, export)
  migrations/…_realtime_broadcast.sql  soukromé realtime kanály + triggery na zprávy a matche
  migrations/…_profile_contacts.sql    kontakty v profilu (Instagram, Snapchat, telefon)
  migrations/…_remove_chat.sql         zrušení chatu, get_matches vrací kontakty
  cleanup_chat.sql        ruční úklid po zrušení chatu (tabulka messages, staré funkce)
  templates/login.html    e-mailová šablona s kódem
  seed.sql                demo akce DEMO26
src/
  proxy.ts                obnova session + přesměrování nepřihlášených
  app/
    page.tsx              úvodní stránka
    login/                přihlášení kódem z e-mailu
    onboarding/           vytvoření profilu
    j/[code]/             cíl QR kódu: připojí k akci
    (app)/events/         moje akce + zadání kódu, history/ = historie všech proběhlých akcí (RPC past_events)
    (app)/e/[id]/         swipování (balíček karet), swipe-hint.tsx = návod při prvním swipování
    (app)/matches/        matche + stránka matche s kontakty
    (app)/profile/        Můj účet: přehled, úprava profilu, lajky, export dat, smazání účtu
    podminky/, soukromi/  podmínky užití a ochrana soukromí (údaje provozovatele v src/lib/legal.ts)
    halloween/            veřejná kampaňová stránka k Halloweenu (fakta v event.ts, grafika v public/halloween)
    opengraph-image.tsx   náhled při sdílení odkazu; error.tsx / global-error.tsx chybové stránky
    admin/                administrace týmu GetUp: přehled, akce + QR, uživatelé, nahlášení, tým
    api/push/match/       webhook z databáze → rozeslání push upozornění
  lib/                    Supabase klienti, typy, formátování, chybové hlášky
  components/             sdílené UI
```

## Kampaňová stránka /halloween

Veřejná (bez přihlášení) stránka k akci Halloween by GetUp: odpočet, line-up, kostýmová soutěž, odkaz na předprodej
a na připojení k akci v GetTogether. Všechna fakta (datum, místo, line-up, cena, odkaz na vstupenky, kód akce) jsou
v `src/app/halloween/event.ts`. Grafika v `public/halloween` vychází z plakátu (hřbitov, smrtka, titulek a dav jsou
vygenerované přes Higgsfield podle plakátu), náhled při sdílení je `src/app/halloween/opengraph-image.jpg`.

Na webu get-up.fun (WordPress + Elementor) je vložená dvěma řádky (`<div id="hw-root">` + `embed.js`), obsah se
načítá z `public/halloween/embed.html`. Po změně textů spusť `npm run build` a
`node scripts/export-halloween-wordpress.mjs`, který embed přegeneruje (a do `out/halloween-wordpress/` dá i
samostatný `halloween.html`); postup je v `scripts/halloween-wordpress-NAVOD.md`.

Skript v bloku pro WordPress má atribut `seraph-accel-crit="1"`, aby ho Seraphinite Accelerator na get-up.fun
neodkládal až do první interakce (jinak odpočet na mobilu naskočil až po scrollu); zároveň si svůj obsah hledá
opakovaně, protože plugin kritické skripty přesouvá do hlavičky.

Galerie se po klepnutí otevře v překryvu s listováním (`public/halloween/gallery.js`, prostý skript sdílený
s exportem).
Vložený blok pro WordPress má skript zminifikovaný do jednoho řádku: soubor se kopíruje ručně a náhled ukazuje
jen prvních ~100 řádků, takže delší soubor se jednou vložil uříznutý.

Fotky z minulého ročníku (`public/halloween/gallery`) vybírá `scripts/halloween-photos/select.txt` ze složky na Drive
(`files.tsv`); zpracovává je workflow `.github/workflows/halloween-photos.yml` při pushi do větve `tmp/halloween-photos`,
protože z vývojového prostředí není Drive dostupný.

## Režim „Připravujeme“

Dokud seznamka nejde na veřejnost, nastav v prostředí `COMING_SOON=1` (na Vercelu je nastaveno pro production
i preview): úvodní stránka `/` pak ukáže jen upoutávku (`src/app/coming-soon.tsx`) bez tlačítka přihlášení, odkaz na
Halloween a Instagram. Všechno ostatní běží dál: tým se přihlásí přímo přes `/login`, fungují odkazy `/j/KÓD`,
administrace i `/halloween`. Před spuštěním pro veřejnost proměnnou smaž a znovu nasaď.

## Demo data

V produkčním projektu jsou kvůli ukázkám demo data:

- 3 akce GetUp v Klubu K2: `GU2509` (proběhlá), `HALLO26` a `XMAS26` (nadcházející), plus testovací `DEMO26`.
- 12 demo uživatelů s e-maily `@demo.gettogether.test` s AI fotkami (portrét, klub, den; Natálie a Karolína pro pozvánky mají
  dvě), jejich lajky a matche; část z nich má vyplněný smyšlený Instagram nebo Snapchat, ať jdou tlačítka po matchi vidět.
- Trigger `supabase/demo/auto_like.sql`: nového návštěvníka akce rovnou lajknou demo účty (Natálie a Karolína vždy, k nim až tři
  další), ať má po swipnutí matche.

Před ostrým spuštěním je smaž podle `supabase/demo/cleanup.sql`.

## Bezpečnost a soukromí

- Cizí profily **nejdou číst přímo z tabulky**, jen přes funkce `get_deck` a `get_matches`. Ty vrací věk místo data narození
  a jen lidi ze společné akce nebo matche.
- Nikdo nevidí, kdo ho lajknul. Match vznikne až při vzájemném lajku (ošetřeno i pro současné lajky).
- Aplikace je jen pro 18+ (hlídá to databáze). Obsahuje zrušení matche, nahlášení (řeší ho tým v administraci) a smazání účtu.
- Zablokovaný účet zmizí z balíčků i z matchů ostatních a nemůže swipovat ani se připojit k akci (triggery v databázi).
- Kontakty (Instagram, Snapchat, telefon) jsou nepovinné a vidí je jen člověk, se kterým máš match, dokud match trvá.
- Každý si může stáhnout všechna svoje data (Můj účet → Stáhnout moje data).
- Fotky jsou ve veřejném bucketu pod náhodnými názvy. Pro vyšší soukromí je lze přepnout na podepsané URL.

## Další kroky (nápady)

- Ověření přes vstupenku z prodejního systému GetUp místo QR kódu.
- Moderace fotek (kontrola nových fotek před zveřejněním).
- Ledolamy podle akce (např. „Na jakou písničku se nejvíc těšíš?“).
- Generované typy databáze: `npx supabase gen types typescript --local > src/lib/database.types.ts`.
