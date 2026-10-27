import Link from "next/link";
import { SubmitButton } from "@/components/submit-button";
import { btnPrimary, btnSecondary, card, sectionTitle } from "@/components/ui";
import { COSTUME_PRIZE } from "@/lib/config";
import { photoUrl } from "@/lib/photos";
import type { AdminCostumeEntry } from "@/lib/types";
import { setCostumeContestAction, setCostumeEntryStatusAction } from "../../actions";
import { Badge, Empty } from "../../ui";

const STATUS = {
  pending: { label: "Čeká", tone: "accent" },
  approved: { label: "V soutěži", tone: "success" },
  rejected: { label: "Odmítnuto", tone: "danger" },
} as const;

/** Soutěž o kostým v detailu akce: přepínače, schvalování přihlášek a pořadí podle hlasů (vidí jen tým). */
export function CostumeAdmin({
  eventId,
  settings,
  entries,
}: {
  eventId: string;
  settings: { costume_contest: boolean; costume_entries_open: boolean; costume_voting_open: boolean };
  entries: AdminCostumeEntry[];
}) {
  const approved = entries.filter((e) => e.status === "approved");
  const totalVotes = approved.reduce((sum, e) => sum + Number(e.votes), 0);
  const rank = new Map(approved.map((e, i) => [e.id, i + 1]));
  const pending = entries.filter((e) => e.status === "pending");
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
          V appce je soutěž na stránce akce pod tlačítkem „Soutěž o kostým“. Pořadí vidí jen tým.
        </p>
      </form>

      <div className={`${card} mt-3`}>
        <p className="text-[15px] font-bold">Kód z klubu</p>
        <p className="mt-1 text-[13px] leading-snug text-muted">
          Hlasovat můžou jen lidi, kteří v klubu opíšou kód z obrazovky nebo naskenují QR kód vedle něj. Kód se mění každých 5
          minut a z jednoho telefonu se odemkne jen jeden účet. Obrazovku pusť na projektoru, televizi nebo tabletu u stage, kód
          může říct i moderátor.
        </p>
        <Link href={`/admin/events/${eventId}/kod`} target="_blank" className={`${btnSecondary} mt-3 w-full`}>
          Otevřít obrazovku s kódem
        </Link>
      </div>

      {pending.length > 0 && (
        <p className="mt-4 text-[14px] font-semibold text-accent">Ke schválení: {pending.length}</p>
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
                      {entry.status !== "approved" && (
                        <form action={setCostumeEntryStatusAction.bind(null, eventId, entry.id, "approved")}>
                          <SubmitButton className={`${btnPrimary} !px-3 !py-1.5 text-[13px]`} pendingText="…">
                            Schválit
                          </SubmitButton>
                        </form>
                      )}
                      {entry.status !== "rejected" && (
                        <form action={setCostumeEntryStatusAction.bind(null, eventId, entry.id, "rejected")}>
                          <SubmitButton className={`${btnSecondary} !px-3 !py-1.5 text-[13px]`} pendingText="…">
                            Odmítnout
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
        Odmítnutím kostýmu se smažou i jeho hlasy. Hlasy „z nových účtů“ přišly z účtů založených méně než den před hlasováním.
      </p>
    </section>
  );
}
