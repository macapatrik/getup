"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Icon } from "@/components/icons";
import { COSTUME_PRIZE } from "@/lib/config";
import { errorMessage } from "@/lib/errors";
import { PHOTOS_BUCKET, photoExtension, photoUrl, randomId, resizeImage } from "@/lib/photos";
import { createClient } from "@/lib/supabase/client";
import type { CostumeContest, CostumeStatus } from "@/lib/types";

// Halloweenský motiv podle plakátu: noc, krvavě červená, nápis Metal Mania (font-metal).
const btnRed = "hw-red inline-flex items-center justify-center gap-2 rounded-[12px] px-5 py-3 text-[16px] font-bold transition active:scale-[0.97] disabled:opacity-50";
const btnGhost =
  "hw-outline inline-flex items-center justify-center gap-2 rounded-[12px] px-5 py-3 text-[16px] font-bold text-bone transition active:scale-[0.97] disabled:opacity-50";
const surface = "hw-surface rounded-[16px]";
const title = "font-metal text-[30px] leading-none text-blood hw-glow";
const fieldDark =
  "w-full rounded-[12px] border border-white/10 bg-white/5 px-4 py-3.5 text-[16px] text-bone placeholder:text-ash focus:border-blood focus:outline-none";
const errorDark = "text-[14px] font-semibold text-[#ff6b6b]";

const STATUS_TEXT: Record<CostumeStatus, string> = {
  pending: "Čeká na schválení týmem",
  approved: "Jsi v soutěži",
  rejected: "Tým přihlášku neschválil",
};

export function CostumeContestView({
  userId,
  event,
  contest,
}: {
  userId: string;
  event: { id: string; name: string; venue: string };
  contest: CostumeContest;
}) {
  const router = useRouter();
  const [myVote, setMyVote] = useState(contest.my_vote);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function vote(entryId: string) {
    setError(null);
    const previous = myVote;
    setMyVote(entryId);
    startTransition(async () => {
      const { error } = await createClient().rpc("cast_costume_vote", { p_event_id: event.id, p_entry_id: entryId });
      if (error) {
        setMyVote(previous);
        setError(errorMessage(error));
      }
    });
  }

  const state = !contest.enabled
    ? "Soutěž o kostým na téhle akci neběží."
    : contest.voting_open
      ? "Hlasování běží. Vyber jeden kostým, hlas můžeš do konce hlasování změnit."
      : contest.entries_open
        ? "Nahraj fotku svého kostýmu. Po schválení se objeví v galerii a lidi z party o něm budou hlasovat."
        : "Hlasování otevřeme během večera. Vítěze vyhlásíme na stagi.";
  const badge = !contest.enabled ? null : contest.voting_open ? "Hlasování běží" : contest.entries_open ? "Přihlášky otevřené" : "Brzy hlasování";
  const ordered = [...contest.entries.filter((e) => !e.mine), ...contest.entries.filter((e) => e.mine)];

  return (
    <>
      {/* Hlavička jako plakát: hřbitov se smrtkou, nápis HALLOWEEN, mlha */}
      <section className="relative h-[280px] overflow-hidden">
        <img src="/halloween/hero-800.webp" alt="" className="absolute inset-0 size-full object-cover object-[72%_center]" />
        <div className="hw-fog-top absolute inset-x-0 top-0 h-24" />
        <div className="hw-fog-bottom absolute inset-x-0 bottom-0 h-40" />
        <Link
          href={`/e/${event.id}`}
          aria-label="Zpět"
          className="absolute top-3 left-3 grid size-10 place-items-center rounded-full bg-black/45 text-bone backdrop-blur transition active:scale-90"
          style={{ marginTop: "env(safe-area-inset-top)" }}
        >
          <Icon name="back" className="size-6" />
        </Link>
        <div className="absolute inset-x-0 bottom-3 px-6 text-center">
          <img src="/halloween/title-600.webp" alt="Halloween" className="mx-auto w-[86%] drop-shadow-[0_8px_24px_rgb(224_20_28/0.45)]" />
          <p className="mt-1 text-[12px] font-bold tracking-[0.22em] text-bone/80 uppercase">{event.venue || event.name}</p>
        </div>
      </section>

      <div className="space-y-8 px-4 pb-6">
        {/* Výhra stejně jako na plakátu */}
        <section className="pt-2 text-center">
          <p className="text-[13px] font-extrabold tracking-wide text-blood uppercase">+ dárky od sponzorů</p>
          <p className="mt-1 text-[56px] leading-none font-black tracking-tight text-blood uppercase hw-glow">{COSTUME_PRIZE.replace(" ", "")}</p>
          <p className="mt-2 text-[20px] leading-tight font-black uppercase">v hotovosti</p>
          <p className="mt-0.5 text-[24px] leading-tight font-black uppercase">
            za <span className="underline decoration-blood decoration-4 underline-offset-4">nejlepší</span> kostým
          </p>
          {badge && (
            <span className="hw-outline mt-4 inline-flex items-center gap-2 rounded-[12px] px-4 py-1.5 text-[13px] font-bold tracking-[0.14em] uppercase">
              {contest.voting_open && <span className="size-2 animate-[hw-pulse_1.6s_ease-in-out_infinite] rounded-full bg-blood" />}
              {badge}
            </span>
          )}
          <p className="mx-auto mt-3 max-w-xs text-[15px] leading-snug text-ash">{state}</p>
        </section>

        {contest.enabled && <MyEntry userId={userId} eventId={event.id} contest={contest} onChange={() => router.refresh()} />}

        {contest.enabled && (
          <section>
            <h2 className={`${title} mb-4`}>{contest.voting_open ? "Hlasuj" : "Kostýmy v soutěži"}</h2>
            {error && <p className={`${errorDark} mb-3`}>{error}</p>}
            {ordered.length === 0 ? (
              <p className={`${surface} p-5 text-center text-[15px] text-ash`}>Zatím tu žádný schválený kostým není.</p>
            ) : (
              <ul className="grid grid-cols-2 gap-3">
                {ordered.map((entry) => {
                  const voted = myVote === entry.id;
                  return (
                    <li
                      key={entry.id}
                      className={`${surface} overflow-hidden transition ${voted ? "border-blood shadow-[0_0_28px_rgb(224_20_28/0.45)]" : ""}`}
                    >
                      <div className="relative aspect-[3/4] bg-black">
                        <img src={photoUrl(entry.photo)} alt={entry.title || "Kostým"} className="size-full object-cover" loading="lazy" />
                        <div className="hw-fog-bottom absolute inset-x-0 bottom-0 h-1/3" />
                        {entry.mine && (
                          <span className="hw-red absolute top-2 left-2 rounded-[10px] px-2 py-0.5 text-[11px] font-bold">Tvůj kostým</span>
                        )}
                        {voted && (
                          <span className="hw-red absolute top-2 right-2 grid size-8 place-items-center rounded-full">
                            <Icon name="check" className="size-5" />
                          </span>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="truncate text-[15px] font-bold">{entry.title || "Bez názvu"}</p>
                        <p className="truncate text-[12px] text-ash">{entry.name ?? "Účastník akce"}</p>
                        {contest.voting_open && !entry.mine &&
                          (voted ? (
                            <p className={`${btnRed} mt-2 w-full !px-2 !py-2 text-[14px]`}>Tvůj hlas</p>
                          ) : (
                            <button
                              type="button"
                              onClick={() => vote(entry.id)}
                              disabled={pending}
                              className={`${btnGhost} mt-2 w-full !px-2 !py-2 text-[14px]`}
                            >
                              Hlasovat
                            </button>
                          ))}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}

        <p className="text-center text-[12px] text-ash/80">
          Jeden hlas na člověka. Pro svůj kostým hlasovat nejde. Pořadí zná jen tým GetUp a vítěze vyhlásí na stagi.
        </p>
      </div>
    </>
  );
}

/** Moje přihláška: nahrání fotky kostýmu, stav schválení, výměna nebo stažení. */
function MyEntry({ userId, eventId, contest, onChange }: { userId: string; eventId: string; contest: CostumeContest; onChange: () => void }) {
  const entry = contest.my_entry;
  const [editing, setEditing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState(entry?.title ?? "");
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
      const { error } = await supabase.rpc("submit_costume_entry", { p_event_id: eventId, p_photo: path, p_title: name });
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
        <h2 className={`${title} mb-4`}>Tvůj kostým</h2>
        <div className={`${surface} flex gap-4 p-4`}>
          <img src={photoUrl(entry.photo)} alt="" className="h-32 w-24 shrink-0 rounded-[12px] bg-black object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[18px] font-bold">{entry.title || "Bez názvu"}</p>
            <p className={`mt-1 text-[14px] font-semibold ${entry.status === "approved" ? "text-blood" : entry.status === "rejected" ? "text-[#ff6b6b]" : "text-ash"}`}>
              {STATUS_TEXT[entry.status]}
            </p>
            {contest.entries_open && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => setEditing(true)} className={`${btnGhost} !px-3 !py-2 text-[14px]`} disabled={busy}>
                  Vyměnit fotku
                </button>
                <button type="button" onClick={withdraw} className="px-2 text-[14px] font-semibold text-ash underline" disabled={busy}>
                  Stáhnout
                </button>
              </div>
            )}
          </div>
        </div>
        {error && <p className={`${errorDark} mt-2`}>{error}</p>}
      </section>
    );
  }

  return (
    <section>
      <h2 className={`${title} mb-4`}>{entry ? "Nová fotka" : "Přihlas kostým"}</h2>
      <form onSubmit={submit} className={`${surface} space-y-3 p-4`}>
        <label className="flex cursor-pointer items-center gap-3 rounded-[12px] border-2 border-dashed border-blood/60 bg-blood/5 p-4">
          <span className="hw-red grid size-12 shrink-0 place-items-center rounded-full">
            <Icon name="cameraPlus" className="size-6" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[16px] font-bold">{file ? file.name : "Vyfoť svůj kostým"}</span>
            <span className="block text-[12px] text-ash">{file ? "Klepni pro jinou fotku" : "Nebo vyber fotku z galerie"}</span>
          </span>
          <input type="file" accept="image/*" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="Název kostýmu, třeba Upír z K2" className={fieldDark} />
        <p className="text-[12px] text-ash">Na fotce musí být tvůj kostým. Jde přihlásit i dvojici nebo partu, napiš to do názvu.</p>
        {error && <p className={errorDark}>{error}</p>}
        <div className="flex gap-2">
          <button type="submit" className={`${btnRed} flex-1`} disabled={busy}>
            {busy ? "Nahrávám…" : "Přihlásit do soutěže"}
          </button>
          {entry && (
            <button type="button" onClick={() => setEditing(false)} className={btnGhost} disabled={busy}>
              Zrušit
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
