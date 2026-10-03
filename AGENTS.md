<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Projekt GetCrush (dříve GetTogether, původně GetUp Match)

- Seznamka pro návštěvníky akcí GetUp: Next.js 16 (App Router) + Supabase. UI texty jsou česky.
- Schéma a veškerá bezpečnostní logika je v `supabase/migrations/` (RLS + RPC funkce). Cizí profily čti jen přes security definer RPC (`get_deck`, `get_matches`, `my_likes`, `admin_*`), nikdy nepřidávej select policy na cizí řádky `profiles`.
- Administrace týmu je v `src/app/admin/` (vlastní layout, `requireOrganizer()`); každá `admin_*` funkce v SQL začíná `perform public.assert_organizer()`. Zákaznická část „Můj účet“ je `src/app/(app)/profile/`.
- SQL funkce vyhazují chyby s kódy `GUxxx`; české hlášky k nim jsou v `src/lib/errors.ts` (při novém kódu doplň obojí).
- Design podle šablony Romio (Envato): bílé pozadí, karta `surface` (bílá, 2px linka `#f5f5f5`), šedá výplň `fill-soft`, růžové hlavní tlačítko `fill-accent` (#f759f5), světle růžové vedlejší `fill-accent-soft`; indigo (#3e36ed) jen jako přechod `photo-fade` přes spodek fotek a na ikonách pod kartou. Písmo Urbanist. Zaoblení: velké karty s fotkou 32 px, ostatní karty 16 px, tlačítka a pole 12 px (pole s ikonou 24 px). Spodní lišta má čtyři záložky jen s ikonami (akce, swipování, matche, účet); chat v aplikaci není, po matchi se ukážou kontakty z profilu (`src/lib/contacts.ts`). V rozhraní žádné emoji.
- Kontroly: `npx tsc --noEmit`, `npm run lint`, `npm run build`.
