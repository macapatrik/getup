import Link from "next/link";
import { SubmitButton } from "@/components/submit-button";
import { btnPrimary, btnSecondary, card, sectionTitle } from "@/components/ui";
import { COSTUME_PRIZE } from "@/lib/config";
import { photoUrl } from "@/lib/photos";
import { formatTime } from "@/lib/format";
import type { AdminCostumeEntry, AdminCostumeVoter } from "@/lib/types";
import { setCostumeContestAction, setCostumeEntryStatusAction } from "../../actions";
import { Badge, Empty } from "../../ui";

const STATUS = {
  pending: { label: "V soutěži", tone: "success" },
  approved: { label: "V soutěži", tone: "success" },
  rejected: { label: "Vyřazeno", tone: "danger" },
} as const;

/** Soutěž o kostým v detailu akce: přepínače, pořadí podle hlasů, vyřazení kostýmů a kontrola hlasujících. */
export function CostumeAdmin({
  eventId,
  settings,
  entries,
  voters,
  contestUrl,
  contestQr,
}: {
  eventId: string;
  settings: { costume_contest: boolean; costume_entries_open: boolean; costume_voting_open: boolean };
  entries: AdminCostumeEntry[];
  voters: AdminCostumeVoter[];
  contestUrl: string;
  contestQr: string | null;
}) {
  const approved = entries.filter((e) => e.status === "approved");
  const totalVotes = approved.reduce((sum, e) => sum + Number(e.votes), 0);
  const rank = new Map(approved.map((e, i) => [e.id, i + 1]));
  const checkbox = "size-5 accent-[#f759f5]";

  return (
    <section>
      <h2 className={sectionTitle}>Soutěž o kostým · {COSTUME_PRIZE}</h2>
      <form action={setCostumeContestAction.bind(null, eventId)} className={`${card} space-y-3`}>
        <label className="flex items-center gap-3 text-[15px] font-semibold">
          <input type="checkbox" name="enabled" defaultChecked={settings.costume_contest} className={checkbox} />
          Soutěž na této akci je zapnutá
        </label>
        <label className="flex items-center gap-3 text-[15px]">
          <input type="checkbox" name="entries_open" defaultChecked={settings.costume_entries_open} className={checkbox} />
          Přihlášky otevřené (lidi nahrávají fotky)
        </label>
        <label className="flex items-center gap-3 text-[15px]">
          <input type="checkbox" name="voting_open" defaultChecked={settings.costume_voting_open} className={checkbox} />
          Hlasování otevřené
        </label>
        <SubmitButton className={`${btnPrimary} w-full`} pendingText="Ukládám…">
          Uložit nastavení soutěže
        </SubmitButton>
        <p className="text-[12px] text-muted">
          V appce je soutěž na stránce akce pod tlačítkem „Soutěž o kostým“. Živé pořadí schválených kostýmů vidí lidi z akce na hlavní stránce appky.
        </p>
      </form>

      {contestQr && (
        <div className={`${card} mt-3 flex flex-col items-center gap-4 sm:flex-row sm:items-start`}>
          <img src={contestQr} alt="QR kód soutěže" className="size-40 shrink-0 rounded-[12px] border-2 border-fill" />
          <div className="min-w-0">
            <p className="text-[15px] font-bold">QR kód soutěže na Instagram a plakáty</p>
            <p className="mt-1 text-[13px] leading-snug text-muted">
              Přihlásí, připojí k akci a otevře rovnou soutěž o kostým. Každý účet má 3 hlasy pro 3 různé kostýmy a může je přehazovat, dokud hlasování běží.
            </p>
            <p className="mt-1 truncate text-[12px] text-muted">{contestUrl}</p>
            <a href={contestQr} download="soutez-o-kostym-qr.png" className={`${btnSecondary} mt-3 !py-2 text-[14px]`}>
              Stáhnout QR kód
            </a>
          </div>
        </div>
      )}


      <div className="mt-3">
        {entries.length === 0 ? (
          <Empty>Zatím se nikdo nepřihlásil.</Empty>
        ) : (
          <ul className="surface divide-y divide-line overflow-hidden rounded-[16px]">
            {entries.map((entry) => {
              const place = rank.get(entry.id);
              const share = totalVotes > 0 ? Math.round((Number(entry.votes) / totalVotes) * 100) : 0;
              return (
                <li key={entry.id} className="flex gap-3 p-3">
                  <a href={photoUrl(entry.photo)} target="_blank" rel="noopener" className="shrink-0">
                    <img src={photoUrl(entry.photo)} alt="" className="h-24 w-18 rounded-[12px] bg-fill object-cover" />
                  </a>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {place && place <= 3 && <Badge tone="accent">{place}. místo</Badge>}
                      <Badge tone={STATUS[entry.status].tone}>{STATUS[entry.status].label}</Badge>
                    </div>
                    <p className="mt-1 truncate text-[16px] font-bold">{entry.title || "Bez názvu"}</p>
                    <Link href={`/admin/users/${entry.user_id}`} className="block truncate text-[13px] text-muted hover:underline">
                      {entry.display_name ?? "Bez profilu"}
                    </Link>
                    {entry.status === "approved" && (
                      <p className="mt-1 text-[14px]">
                        <span className="font-bold">{entry.votes}</span> hlasů · {share} %
                        {Number(entry.fresh_votes) > 0 && (
                          <span className="ml-1 font-semibold text-danger">· {entry.fresh_votes} z nových účtů</span>
                        )}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {entry.status === "rejected" ? (
                        <form action={setCostumeEntryStatusAction.bind(null, eventId, entry.id, "approved")}>
                          <SubmitButton className={`${btnSecondary} !px-3 !py-1.5 text-[13px]`} pendingText="…">
                            Vrátit do soutěže
                          </SubmitButton>
                        </form>
                      ) : (
                        <form action={setCostumeEntryStatusAction.bind(null, eventId, entry.id, "rejected")}>
                          <SubmitButton className={`${btnSecondary} !px-3 !py-1.5 text-[13px]`} pendingText="…">
                            Vyřadit
                          </SubmitButton>
                        </form>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <p className="mt-2 text-[12px] text-muted">
        Kostýmy se v galerii ukážou hned po nahrání, fotku nejde měnit. Vyřazením kostýmu se smažou i jeho hlasy (ti lidé můžou hlasovat znovu). Hlasy „z nových účtů“ přišly z účtů založených méně než den před hlasováním.
      </p>

      {/* Kontrola hlasujících: každý musí mít v profilu svoji fotku v kostýmu, jinak účet smaž (hlas zmizí s ním) */}
      <h3 className="mt-6 mb-2 text-[16px] font-bold">Hlasující ({voters.length})</h3>
      {voters.length === 0 ? (
        <Empty>Zatím nikdo nehlasoval.</Empty>
      ) : (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {voters.map((voter) => {
            const fresh = new Date(voter.voted_at).getTime() - new Date(voter.account_created_at).getTime() < 86_400_000;
            return (
              <li key={voter.user_id}>
                <Link
                  href={`/admin/users/${voter.user_id}`}
                  className="surface block overflow-hidden rounded-[12px] transition hover:border-accent"
                >
                  {voter.photo ? (
                    <img src={photoUrl(voter.photo)} alt="" className="aspect-[3/4] w-full bg-fill object-cover" loading="lazy" />
                  ) : (
                    <span className="grid aspect-[3/4] w-full place-items-center bg-fill text-[12px] text-muted">Bez fotky</span>
                  )}
                  <span className="block p-2">
                    <span className="block truncate text-[13px] font-bold">{voter.display_name ?? "Bez profilu"}</span>
                    <span className="block truncate text-[12px] text-muted">
                      {formatTime(voter.voted_at)} · pro „{voter.voted_for}“
                    </span>
                    {fresh && <span className="block text-[11px] font-semibold text-danger">nový účet</span>}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-2 text-[12px] text-muted">
        Každý účet má až 3 hlasy (u každého vidíš, komu je dal). Podvodný účet otevři a smaž, jeho hlasy tím zmizí.
      </p>
    </section>
  );
}
