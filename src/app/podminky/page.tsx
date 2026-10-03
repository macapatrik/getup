import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { APP_NAME } from "@/lib/config";
import { LEGAL_UPDATED, OPERATOR } from "@/lib/legal";

export const metadata: Metadata = { title: "Podmínky užití" };

export default function TermsPage() {
  return (
    <LegalPage title="Podmínky užití" updated={LEGAL_UPDATED}>
      <p>
        {APP_NAME} provozuje {OPERATOR.name}, IČO {OPERATOR.id}, {OPERATOR.address}, {OPERATOR.vat}. Používáním aplikace souhlasíš s těmito
        podmínkami. Jsou krátké, přečti si je.
      </p>

      <h2>Kdo může aplikaci používat</h2>
      <ul>
        <li>Jen lidé starší 18 let.</li>
        <li>Každý má jeden účet a vystupuje pod svou skutečnou identitou. Fotky musí být tvoje a aktuální.</li>
        <li>Účet je osobní, nepřevádí se a nesmí se sdílet.</li>
      </ul>

      <h2>Jak se chovat</h2>
      <ul>
        <li>S respektem. Žádné obtěžování, výhrůžky, nenávistné nebo sexuálně explicitní zprávy, které si druhá strana nevyžádala.</li>
        <li>Žádné falešné profily, fotky jiných lidí, spam, reklama ani nabízení služeb.</li>
        <li>Žádné sdílení cizích soukromých údajů a kontaktů mimo aplikaci bez souhlasu.</li>
        <li>Nic, co porušuje zákon nebo práva jiných.</li>
      </ul>

      <h2>Bezpečnost</h2>
      <p>
        Potkáváš se s lidmi, které neznáš. Buď opatrný/á: první setkání domluv na veřejném místě na akci, dej vědět kamarádům
        a nikomu neposílej peníze. Když se ti něco nezdá, člověka nahlas (na stránce matche přes menu) nebo zruš match. Nahlášení řeší
        tým GetUp; účet, který porušuje pravidla, může být zablokován bez náhrady.
      </p>

      <h2>Co děláme my</h2>
      <ul>
        <li>Aplikaci poskytujeme zdarma návštěvníkům akcí GetUp. Můžeme ji kdykoli změnit, dočasně vypnout nebo ukončit.</li>
        <li>Neručíme za chování ostatních uživatelů ani za to, že si někoho najdeš.</li>
        <li>Neodpovídáme za škody vzniklé používáním aplikace nad rámec toho, co vyžaduje zákon.</li>
      </ul>

      <h2>Tvůj obsah</h2>
      <p>
        Fotky a texty zůstávají tvoje. Dáváš nám jen svolení je v aplikaci zobrazovat ostatním návštěvníkům stejné akce. Po
        smazání účtu je odstraníme.
      </p>

      <h2>Soukromí</h2>
      <p>
        Jak nakládáme s tvými údaji, popisují <a href="/soukromi">zásady ochrany soukromí</a>.
      </p>

      <h2>Kontakt a změny</h2>
      <p>
        Otázky, nahlášení nebo stížnosti: <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>. Podmínky můžeme upravit;
        aktuální verze je vždy na této stránce a o podstatných změnách dáme vědět v aplikaci. Řídí se právem České republiky.
      </p>
    </LegalPage>
  );
}
