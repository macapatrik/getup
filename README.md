# GetTogether (by GetUp)

Seznamka ve stylu Tinderu napojená na akce [GetUp](https://getup.cz): lidé se seznamují **jen s ostatními ze stejného koncertu nebo party**.

1. Na akci visí QR kód (vstup, bar, vstupenka) → člověk ho naskenuje foťákem v mobilu.
2. Přihlásí se kódem z e-mailu a vyplní profil (fotky, věk, koho hledá).
3. Swipuje lidi ze stejné akce. Když se lajknou oba → **match** → chat v reálném čase.
4. Místnost akce je otevřená ještě 24 h po jejím konci. Matche a chat zůstávají napořád.

Akce je otevřená od založení, takže se lidi připojují i týdny předem: odkaz `/j/KÓD` patří do e-mailu se vstupenkou
a na sociální sítě, QR kód u vstupu je pro ty, kdo přijdou až na místě. V aplikaci vidí odpočet do začátku,
kolik lidí už na akci je, a odkaz můžou sdílet dál.

Dvě administrace:

- **Můj účet** (`/profile`, pro každého návštěvníka): profil a fotky, moje akce, matche, koho jsem lajknul/a
  (lajk jde zrušit, dokud z něj není match), upozornění, stažení všech mých dat (JSON) a smazání účtu.
  Každý vidí jen svoje data.
- **Administrace** (`/admin`, jen pro tým GetUp): webový portál s bočním panelem, na mobilu se záložkami nahoře.
  Přehled s čísly, akce (založení, úprava, smazání, QR kódy k tisku, statistiky), uživatelé (hledání, detail,
  blokace), nahlášení (vyřešit / zablokovat) a tým (přidání a odebrání organizátorů podle e-mailu).
  Zprávy z chatů organizátoři nevidí.

Na počítači má aplikace boční panel místo spodní lišty.

## Technologie

- **Next.js 16** (App Router, TypeScript, Tailwind CSS 4) jako **PWA**: dá se „nainstalovat“ na plochu telefonu.
- Design ve stylu iOS 26 „Liquid Glass“: čistě bílé pozadí, bílé matné sklo se světlou hranou a jemným stínem, lesklá tlačítka, plovoucí lišta. Utility `glass`, `glass-tint`, `glass-inner`, `glass-photo`,
  `gloss` a `aurora` jsou v `src/app/globals.css`, sdílené třídy v `src/components/ui.ts`.
- **Supabase**: přihlášení (e-mailový kód), Postgres s Row Level Security, Storage na fotky, Realtime na chat.

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
- Ilustrační fotky na úvodní stránce (vygenerované přes Higgsfield, model Nano Banana) stáhneš příkazem `npm run photos`
  do `public/people/`. Bez nich úvodní stránka ukáže jen barevné karty.

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

## Realtime (chat a nové matche)

Každý přihlášený má jeden soukromý realtime kanál `user:<id>` (policy na `realtime.messages` pustí jen vlastníka).
Databáze do něj triggerem posílá nové zprávy v jeho matchích a nové matche (`realtime.send`). Klient tak nesleduje
změny tabulek a Realtime nemusí při každé zprávě ověřovat RLS pro každé připojení – škáluje to na stovky lidí
na akci. Po probuzení telefonu se zprávy dotáhnou dotazem. Fotky se ukládají jako WebP do 1080 px.

## Push upozornění (nový match, nová zpráva)

Web Push přes service worker (`public/sw.js`). Na iPhonu fungují jen v aplikaci přidané na plochu (iOS 16.4+),
v Androidu a na počítači i přímo v prohlížeči. Zapínají se v **Profilu** (přepínač + zkušební upozornění)
nebo z výzvy na stránce **Matche**.

Jak to funguje: po vzniku matche trigger `matches_push` (migrace `…_push_notifications.sql`) pošle přes `pg_net`
webhook na `/api/push/match` a ten upozornění zašifruje a rozešle. Dostane ho ten, kdo zrovna neswipoval.
Nová zpráva jde stejně přes `messages_push` na `/api/push/message` (service worker ji neukáže, když má příjemce
ten chat otevřený v popředí). Zařízení, která upozornění vypnula, se samy smažou.

Nastavení:

1. `npx web-push generate-vapid-keys` a na Vercelu nastav `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`,
   `VAPID_SUBJECT` (adresa aplikace) a `PUSH_WEBHOOK_SECRET` (dlouhý náhodný řetězec).
2. V Supabase (SQL Editor) ulož adresu webhooku a stejný klíč do Vaultu:
   ```sql
   select vault.create_secret('https://<domena>/api/push/match', 'push_webhook_url');
   select vault.create_secret('<PUSH_WEBHOOK_SECRET>', 'push_webhook_secret');
   ```
   Bez nich trigger nic neposílá (např. při lokálním vývoji).

## Struktura

```
supabase/
  migrations/…_init.sql   schéma, RLS, RPC funkce (join_event, get_deck, swipe, get_matches…)
  migrations/…_push_notifications.sql  odběry push upozornění + webhook po matchi
  migrations/…_admin_and_account.sql   administrace (admin_*), blokace účtů, Můj účet (my_*, export)
  migrations/…_realtime_broadcast.sql  soukromé realtime kanály + triggery na zprávy a matche
  templates/login.html    e-mailová šablona s kódem
  seed.sql                demo akce DEMO26
src/
  proxy.ts                obnova session + přesměrování nepřihlášených
  app/
    page.tsx              úvodní stránka
    login/                přihlášení kódem z e-mailu
    onboarding/           vytvoření profilu
    j/[code]/             cíl QR kódu: připojí k akci
    (app)/events/         moje akce + zadání kódu
    (app)/e/[id]/         swipování (balíček karet)
    (app)/matches/        matche + chat
    (app)/profile/        Můj účet: přehled, úprava profilu, lajky, export dat, smazání účtu
    admin/                administrace týmu GetUp: přehled, akce + QR, uživatelé, nahlášení, tým
    api/push/match/       webhook z databáze → rozeslání push upozornění
  lib/                    Supabase klienti, typy, formátování, chybové hlášky
  components/             sdílené UI
```

## Demo data

V produkčním projektu jsou kvůli ukázkám demo data:

- 3 akce GetUp v Klubu K2: `GU2509` (proběhlá), `HALLO26` a `XMAS26` (nadcházející), plus testovací `DEMO26`.
- 10 demo uživatelů s e-maily `@demo.gettogether.test` a AI fotkami, jejich lajky, matche a konverzace.
- Trigger `supabase/demo/greeting.sql`: po matchi s demo účtem pošle demo účet první zprávu.

Před ostrým spuštěním je smaž podle `supabase/demo/cleanup.sql`.

## Bezpečnost a soukromí

- Cizí profily **nejdou číst přímo z tabulky**, jen přes funkce `get_deck` a `get_matches`. Ty vrací věk místo data narození
  a jen lidi ze společné akce nebo matche.
- Nikdo nevidí, kdo ho lajknul. Match vznikne až při vzájemném lajku (ošetřeno i pro současné lajky).
- Aplikace je jen pro 18+ (hlídá to databáze). Obsahuje zrušení matche, nahlášení (řeší ho tým v administraci) a smazání účtu.
- Zablokovaný účet zmizí z balíčků i z matchů ostatních a nemůže swipovat, psát ani se připojit k akci (triggery v databázi).
- Každý si může stáhnout všechna svoje data (Můj účet → Stáhnout moje data).
- Fotky jsou ve veřejném bucketu pod náhodnými názvy. Pro vyšší soukromí je lze přepnout na podepsané URL.

## Další kroky (nápady)

- Push upozornění i na nové zprávy (stejný mechanismus jako u matchů).
- Ověření přes vstupenku z prodejního systému GetUp místo QR kódu.
- Moderace fotek (kontrola nových fotek před zveřejněním).
- Ledolamy podle akce (např. „Na jakou písničku se nejvíc těšíš?“).
- Generované typy databáze: `npx supabase gen types typescript --local > src/lib/database.types.ts`.
