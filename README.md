# GetTogether (by GetUp)

Seznamka ve stylu Tinderu napojená na akce [GetUp](https://getup.cz): lidé se seznamují **jen s ostatními ze stejného koncertu nebo party**.

1. Na akci visí QR kód (vstup, bar, vstupenka) → člověk ho naskenuje foťákem v mobilu.
2. Přihlásí se kódem z e-mailu a vyplní profil (fotky, věk, koho hledá).
3. Swipuje lidi ze stejné akce. Když se lajknou oba → **match** → chat v reálném čase.
4. Místnost akce je otevřená ještě 24 h po jejím konci. Matche a chat zůstávají napořád.

Organizátoři (tým GetUp) mají v aplikaci sekci **GetUp**, kde zakládají akce, stahují nebo tisknou QR kódy a sledují statistiky (lidé, swipy, matche, zprávy).

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

V navigaci se pak objeví záložka **GetUp**.

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

## Struktura

```
supabase/
  migrations/…_init.sql   schéma, RLS, RPC funkce (join_event, get_deck, swipe, get_matches…)
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
    (app)/profile/        úprava profilu, odhlášení, smazání účtu
    (app)/admin/          organizátoři: akce, QR kódy, statistiky
  lib/                    Supabase klienti, typy, formátování, chybové hlášky
  components/             sdílené UI
```

## Bezpečnost a soukromí

- Cizí profily **nejdou číst přímo z tabulky**, jen přes funkce `get_deck` a `get_matches`. Ty vrací věk místo data narození
  a jen lidi ze společné akce nebo matche.
- Nikdo nevidí, kdo ho lajknul. Match vznikne až při vzájemném lajku (ošetřeno i pro současné lajky).
- Aplikace je jen pro 18+ (hlídá to databáze). Obsahuje zrušení matche, nahlášení (vidí ho organizátoři) a smazání účtu.
- Fotky jsou ve veřejném bucketu pod náhodnými názvy. Pro vyšší soukromí je lze přepnout na podepsané URL.

## Další kroky (nápady)

- Push notifikace na nový match nebo zprávu (Web Push + service worker).
- Ověření přes vstupenku z prodejního systému GetUp místo QR kódu.
- Moderace fotek a přehled nahlášení pro organizátory.
- Ledolamy podle akce (např. „Na jakou písničku se nejvíc těšíš?“).
- Generované typy databáze: `npx supabase gen types typescript --local > src/lib/database.types.ts`.
