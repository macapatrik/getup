"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Icon } from "@/components/icons";
import { btnPrimary, btnSecondary, card, errorText, input, sectionTitle } from "@/components/ui";
import { COSTUME_PRIZE } from "@/lib/config";
import { errorMessage } from "@/lib/errors";
import { PHOTOS_BUCKET, photoExtension, photoUrl, randomId, resizeImage } from "@/lib/photos";
import { createClient } from "@/lib/supabase/client";
import type { CostumeContest, CostumeStatus } from "@/lib/types";

const STATUS_TEXT: Record<CostumeStatus, string> = {
  pending: "Čeká na schválení týmem",
  approved: "Jsi v soutěži",
  rejected: "Tým přihlášku neschválil",
};

export function CostumeContestView({ userId, eventId, contest }: { userId: string; eventId: string; contest: CostumeContest }) {
  const router = useRouter();
  const [myVote, setMyVote] = useState(contest.my_vote);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!contest.enabled) {
    return (
      <div className="px-4 pt-6">
        <div className={`${card} text-center`}>
          <p className="text-[20px] font-bold">Soutěž o kostým tu neběží</p>
          <p className="mt-1 text-[15px] text-muted">Na téhle akci se o kostýmy nesoutěží.</p>
        </div>
      </div>
    );
  }

  function vote(entryId: string) {
    setError(null);
    const previous = myVote;
    setMyVote(entryId);
    startTransition(async () => {
      const { error } = await createClient().rpc("cast_costume_vote", { p_event_id: eventId, p_entry_id: entryId });
      if (error) {
        setMyVote(previous);
        setError(errorMessage(error));
      }
    });
  }

  const others = contest.entries.filter((e) => !e.mine);

  return (
    <div className="space-y-6 px-4 pt-4">
      <section className="fill-accent rounded-[16px] p-5 text-white shadow-[0_18px_40px_-18px_rgb(247_89_245/0.9)]">
        <p className="text-[13px] font-bold tracking-wide uppercase opacity-90">Nejlepší kostým večera</p>
        <p className="mt-1 text-[28px] leading-tight font-bold">Výhra {COSTUME_PRIZE}</p>
        <p className="mt-2 text-[14px] leading-snug text-white/90">
          {contest.voting_open
            ? "Hlasování běží. Vyber jeden kostým, hlas můžeš do konce hlasování změnit."
            : contest.entries_open
              ? "Nahraj fotku svého kostýmu. Po schválení se objeví v galerii a lidi z akce o něm budou hlasovat."
              : "Hlasování se otevře během večera. Vítěze vyhlásíme na pódiu."}
        </p>
      </section>

      <MyEntry userId={userId} eventId={eventId} contest={contest} onChange={() => router.refresh()} />

      <section>
        <h2 className={sectionTitle}>{contest.voting_open ? "Hlasuj" : "Kostýmy v soutěži"}</h2>
        {error && <p className={`${errorText} mb-3`}>{error}</p>}
        {contest.entries.length === 0 ? (
          <p className={`${card} text-center text-[15px] text-muted`}>Zatím tu žádný schválený kostým není.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-3">
            {[...others, ...contest.entries.filter((e) => e.mine)].map((entry) => {
              const voted = myVote === entry.id;
              return (
                <li key={entry.id} className={`surface overflow-hidden rounded-[16px] ${voted ? "ring-2 ring-accent" : ""}`}>
                  <div className="relative aspect-[3/4] bg-fill">
                    <img src={photoUrl(entry.photo)} alt={entry.title || "Kostým"} className="size-full object-cover" loading="lazy" />
                    {entry.mine && (
                      <span className="absolute top-2 left-2 rounded-[10px] bg-white/90 px-2 py-0.5 text-[11px] font-bold">Tvůj kostým</span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="truncate text-[15px] font-bold">{entry.title || "Bez názvu"}</p>
                    <p className="truncate text-[12px] text-muted">{entry.name ?? "Účastník akce"}</p>
                    {contest.voting_open && !entry.mine && (
                      <button
                        type="button"
                        onClick={() => vote(entry.id)}
                        disabled={pending || voted}
                        className={`${voted ? btnPrimary : btnSecondary} mt-2 w-full !py-2 text-[14px]`}
                      >
                        {voted ? (
                          <>
                            <Icon name="check" className="size-4" /> Tvůj hlas
                          </>
                        ) : (
                          "Hlasovat"
                        )}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

/** Moje přihláška: nahrání fotky kostýmu, stav schválení, výměna nebo stažení. */
function MyEntry({ userId, eventId, contest, onChange }: { userId: string; eventId: string; contest: CostumeContest; onChange: () => void }) {
  const entry = contest.my_entry;
  const [editing, setEditing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState(entry?.title ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!file) return setError("Vyber fotku kostýmu.");
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const blob = await resizeImage(file, 1440, 0.82);
      const path = `${userId}/costume-${randomId()}.${photoExtension(blob)}`;
      const { error: uploadError } = await supabase.storage
        .from(PHOTOS_BUCKET)
        .upload(path, blob, { contentType: blob.type, cacheControl: "31536000" });
      if (uploadError) throw uploadError;
      const { error } = await supabase.rpc("submit_costume_entry", { p_event_id: eventId, p_photo: path, p_title: title });
      if (error) {
        await supabase.storage.from(PHOTOS_BUCKET).remove([path]);
        throw error;
      }
      if (entry?.photo) await supabase.storage.from(PHOTOS_BUCKET).remove([entry.photo]);
      setEditing(false);
      setFile(null);
      onChange();
    } catch (err) {
      setError(errorMessage(err, "Fotku se nepodařilo nahrát, zkus to znovu."));
    } finally {
      setBusy(false);
    }
  }

  async function withdraw() {
    if (!entry || !window.confirm("Opravdu stáhnout kostým ze soutěže?")) return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("withdraw_costume_entry", { p_event_id: eventId });
    if (!error) await supabase.storage.from(PHOTOS_BUCKET).remove([entry.photo]);
    setBusy(false);
    if (error) setError(errorMessage(error));
    else onChange();
  }

  if (!entry && !contest.entries_open) return null;

  if (entry && !editing) {
    return (
      <section>
        <h2 className={sectionTitle}>Tvůj kostým</h2>
        <div className={`${card} flex gap-4`}>
          <img src={photoUrl(entry.photo)} alt="" className="h-28 w-20 shrink-0 rounded-[12px] bg-fill object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[17px] font-bold">{entry.title || "Bez názvu"}</p>
            <p className={`mt-1 text-[14px] font-semibold ${entry.status === "rejected" ? "text-danger" : entry.status === "approved" ? "text-accent" : "text-muted"}`}>
              {STATUS_TEXT[entry.status]}
            </p>
            {contest.entries_open && (
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => setEditing(true)} className={`${btnSecondary} !px-3 !py-2 text-[14px]`} disabled={busy}>
                  Vyměnit fotku
                </button>
                <button type="button" onClick={withdraw} className="px-2 text-[14px] font-semibold text-danger" disabled={busy}>
                  Stáhnout
                </button>
              </div>
            )}
          </div>
        </div>
        {error && <p className={`${errorText} mt-2`}>{error}</p>}
      </section>
    );
  }

  return (
    <section>
      <h2 className={sectionTitle}>{entry ? "Nová fotka kostýmu" : "Přihlas svůj kostým"}</h2>
      <form onSubmit={submit} className={`${card} space-y-3`}>
        <label className="fill-soft flex cursor-pointer items-center gap-3 rounded-[12px] p-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white">
            <Icon name="cameraPlus" className="size-6" />
          </span>
          <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">{file ? file.name : "Vyfoť nebo vyber fotku kostýmu"}</span>
          <input type="file" accept="image/*" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={60}
          placeholder="Název kostýmu, třeba Upír z K2"
          className={input}
        />
        <p className="text-[12px] text-muted">Na fotce musí být tvůj kostým. Jde přihlásit i dvojici nebo partu, napiš to do názvu.</p>
        {error && <p className={errorText}>{error}</p>}
        <div className="flex gap-2">
          <button type="submit" className={`${btnPrimary} flex-1`} disabled={busy}>
            {busy ? "Nahrávám…" : "Přihlásit do soutěže"}
          </button>
          {entry && (
            <button type="button" onClick={() => setEditing(false)} className={btnSecondary} disabled={busy}>
              Zrušit
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
