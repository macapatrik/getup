import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { APP_NAME } from "@/lib/config";
import { LEGAL_UPDATED, OPERATOR } from "@/lib/legal";

export const metadata: Metadata = { title: "Ochrana soukromí" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Ochrana soukromí" updated={LEGAL_UPDATED}>
      <p>
        {APP_NAME} je seznamka pro návštěvníky akcí GetUp. Tady se dozvíš, jaké údaje o tobě zpracováváme, proč, jak dlouho
        a jaká máš práva. Píšeme to srozumitelně, ale platí to stejně jako právní text.
      </p>

      <h2>Kdo údaje zpracovává</h2>
      <p>
        Správcem tvých osobních údajů je {OPERATOR.name}, IČO {OPERATOR.id}, {OPERATOR.address}. Ozvat se nám můžeš na{" "}
        <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>.
      </p>

      <h2>Jaké údaje zpracováváme</h2>
      <ul>
        <li>
          <strong>Účet:</strong> e-mailová adresa, čas registrace a přihlášení.
        </li>
        <li>
          <strong>Profil:</strong> jméno, datum narození (ostatním ukazujeme jen věk), pohlaví, koho chceš potkat, text o tobě
          a fotky, které nahraješ.
        </li>
        <li>
          <strong>Kontakty (nepovinné):</strong> Instagram, Snapchat a telefonní číslo, pokud si je vyplníš. Ukazujeme je jen lidem,
          se kterými máš match.
        </li>
        <li>
          <strong>Používání aplikace:</strong> ke kterým akcím ses připojil/a, komu jsi dal/a lajk nebo ne, tvoje matche, nahlášení,
          která odešleš nebo obdržíš.
        </li>
        <li>
          <strong>Upozornění:</strong> pokud si zapneš push upozornění, uložíme technický identifikátor tvého zařízení pro jejich
          doručování.
        </li>
        <li>
          <strong>Technické údaje:</strong> IP adresa a údaje o prohlížeči v provozních záznamech serverů (nejdéle 30 dní).
        </li>
      </ul>

      <h2>Proč a na jakém základě</h2>
      <ul>
        <li>
          <strong>Aby aplikace fungovala</strong> (plnění smlouvy): profil ukazujeme jen lidem ze stejné akce, kteří odpovídají
          tvým preferencím; match vznikne jen při vzájemném lajku; tvoje kontakty vidí jen lidi, se kterými máš match.
        </li>
        <li>
          <strong>Bezpečnost a férovost</strong> (oprávněný zájem): řešení nahlášení, blokace účtů, které porušují pravidla,
          ochrana před zneužitím.
        </li>
        <li>
          <strong>Upozornění na match</strong> (souhlas): jen když si je zapneš; kdykoli je vypneš v nastavení účtu
          nebo telefonu.
        </li>
      </ul>
      <p>Údaje nepoužíváme k reklamě, neprodáváme je a neprofilujeme tě pro jiné účely.</p>

      <h2>Kdo tvoje údaje vidí</h2>
      <ul>
        <li>
          <strong>Ostatní návštěvníci stejné akce</strong> vidí tvoje jméno, věk, text o tobě a fotky. Tvoje kontakty uvidí jen
          člověk, se kterým máš match, a jen dokud match trvá. Nikdo nevidí, komu jsi dal/a lajk, dokud nevznikne match. Můžeš se před ostatními skrýt v nastavení akce.
        </li>
        <li>
          <strong>Tým GetUp</strong> má přístup k profilům (včetně vyplněných kontaktů) a nahlášením kvůli moderaci.
        </li>
        <li>
          <strong>Zpracovatelé</strong>, kteří pro nás aplikaci provozují: Supabase (databáze a úložiště, datové centrum ve
          Frankfurtu, EU), Vercel (hosting aplikace, region Frankfurt, EU), poskytovatel e-mailů pro zasílání přihlašovacích
          kódů a Apple/Google/Mozilla pro doručování push upozornění. Se zpracovateli máme uzavřené smlouvy o zpracování údajů.
        </li>
      </ul>

      <h2>Jak dlouho údaje držíme</h2>
      <p>
        Dokud máš účet. Když si účet smažeš (Účet → Smazat účet), smažeme profil, fotky, kontakty, lajky i matche. Provozní záznamy
        serverů mažeme nejdéle po 30 dnech. Nahlášení a záznamy o blokaci můžeme uchovat po dobu nezbytnou k ochraně ostatních
        uživatelů.
      </p>

      <h2>Tvoje práva</h2>
      <ul>
        <li>Přístup k údajům a jejich přenos: v aplikaci Účet → Stáhnout moje data (soubor JSON).</li>
        <li>Oprava: profil si kdykoli upravíš sám/sama.</li>
        <li>Výmaz: Účet → Smazat účet, nebo nám napiš.</li>
        <li>Odvolání souhlasu s upozorněními: vypnutím v nastavení účtu nebo telefonu.</li>
        <li>Námitka proti zpracování z oprávněného zájmu a právo podat stížnost u Úřadu pro ochranu osobních údajů (uoou.gov.cz).</li>
      </ul>

      <h2>Cookies</h2>
      <p>
        Používáme jen nezbytné cookies pro přihlášení. Žádné sledovací ani reklamní cookies, žádná analytika třetích stran.
      </p>

      <h2>Věk</h2>
      <p>Aplikace je jen pro osoby starší 18 let. Údaje mladších osob vědomě nezpracováváme; pokud na takový účet narazíme, smažeme ho.</p>

      <h2>Změny</h2>
      <p>Tyhle zásady můžeme upravit. O podstatných změnách dáme vědět v aplikaci. Aktuální verze je vždy na této stránce.</p>
    </LegalPage>
  );
}
