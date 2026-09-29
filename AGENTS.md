<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Projekt GetTogether (dříve GetUp Match)

- Seznamka pro návštěvníky akcí GetUp: Next.js 16 (App Router) + Supabase. UI texty jsou česky.
- Schéma a veškerá bezpečnostní logika je v `supabase/migrations/` (RLS + RPC funkce). Cizí profily čti jen přes security definer RPC (`get_deck`, `get_matches`, `my_likes`, `admin_*`), nikdy nepřidávej select policy na cizí řádky `profiles`.
- Administrace týmu je v `src/app/admin/` (vlastní layout, `requireOrganizer()`); každá `admin_*` funkce v SQL začíná `perform public.assert_organizer()`. Zákaznická část „Můj účet“ je `src/app/(app)/profile/`.
- SQL funkce vyhazují chyby s kódy `GUxxx`; české hlášky k nim jsou v `src/lib/errors.ts` (při novém kódu doplň obojí).
- Design: bílá karta `glass`, šedá výplň `glass-inner`, černé hlavní tlačítko `gloss-ink`; oranžová (`gloss`, `bg-accent`) jen srdíčko, logo a stavová tečka. Zaoblení karet 20 px, vnitřních prvků 14 px. V rozhraní žádné emoji.
- Kontroly: `npx tsc --noEmit`, `npm run lint`, `npm run build`.
