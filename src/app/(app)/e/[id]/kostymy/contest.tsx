"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Icon } from "@/components/icons";
import { COSTUME_PRIZE } from "@/lib/config";
import { errorMessage } from "@/lib/errors";
import { ThumbImg } from "@/components/thumb-img";
import { PHOTOS_BUCKET, photoExtension, photoSrc, randomId, resizeImage, thumbPath } from "@/lib/photos";
import { createClient } from "@/lib/supabase/client";
import type { CostumeContest, CostumeResults, CostumeStatus } from "@/lib/types";
import { LiveVoting } from "../../../events/live-voting";

// Halloweenský motiv podle plakátu: noc, krvavě červená, nápis Metal Mania (font-metal).
const btnRed = "hw-red inline-flex items-center justify-center gap-2 rounded-[12px] px-5 py-3 text-[16px] font-bold transition active:scale-[0.97] disabled:opacity-50";
const btnGhost =
  "hw-outline inline-flex items-center justify-center gap-2 rounded-[12px] px-5 py-3 text-[16px] font-bold text-bone transition active:scale-[0.97] disabled:opacity-50";
const surface = "hw-surface rounded-[16px]";
const title = "font-metal text-[30px] leading-none text-blood hw-glow";
const fieldDark =
  "w-full rounded-[12px] border border-white/10 bg-white/5 px-4 py-3.5 text-[16px] text-bone placeholder:text-ash focus:border-blood focus:outline-none";
const errorDark = "text-[14px] font-semibold text-[#ff6b6b]";

/** Text pro hledání: malá písmena bez diakritiky */
const searchable = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const src = photoSrc;

const STATUS_TEXT: Record<CostumeStatus, string> = {
  pending: "Jsi v soutěži",
  approved: "Jsi v soutěži",
  rejected: "Tým tě ze soutěže vyřadil",
};

export function CostumeContestView({
  userId,
  event,
  contest,
  demo = false,
  results = null,
  home = false,
}: {
  userId: string;
  event: { id: string; name: string; venue: string };
  contest: CostumeContest;
  /** Živé pořadí (nahoře na stránce) */
  results?: CostumeResults | null;
  /** Stránka je hlavní stránkou appky (halloweenská adresa): bez šipky zpět */
  home?: boolean;
  /** Veřejná ukázka bez přihlášení: nic se neodesílá, hlas se jen přepne na stránce. */
  demo?: boolean;
}) {
  const router = useRouter();
  // Až 3 hlasy, každý pro jiný kostým; jde je odebírat a dávat jinam, dokud hlasování běží (hlídá to i databáze).
  const maxVotes = contest.votes_max ?? 3;
  const [myVotes, setMyVotes] = useState<string[]>(contest.my_votes ?? (contest.my_vote ? [contest.my_vote] : []));
  const left = Math.max(0, maxVotes - myVotes.length);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggleVote(entryId: string) {
    setError(null);
    const previous = myVotes;
    const remove = myVotes.includes(entryId);
    if (!remove && left === 0) return setError(`Máš už všechny ${maxVotes} hlasy. Odeber jeden a dej ho tomuhle kostýmu.`);
    setMyVotes(remove ? myVotes.filter((id) => id !== entryId) : [...myVotes, entryId]);
    if (demo) return;
    startTransition(async () => {
      const { error } = await createClient().rpc(remove ? "remove_costume_vote" : "cast_costume_vote", {
        p_event_id: event.id,
        p_entry_id: entryId,
      });
      if (error) {
        setMyVotes(previous);
        setError(errorMessage(error));
      }
    });
  }

  const votesLeft = left === 0 ? "Všechny hlasy máš rozdané" : `Zbývá ti ${left} ${left === 1 ? "hlas" : "hlasy"} ze ${maxVotes}`;

  const state = !contest.enabled
    ? "Soutěž o kostým na téhle akci neběží."
    : contest.voting_open
      ? `Hlasování běží. Máš ${maxVotes} hlasy pro ${maxVotes} různé kostýmy a do konce hlasování je můžeš přehazovat.`
      : contest.entries_open
        ? "Nahraj fotku svého kostýmu. Hned se objeví v galerii a lidi z party o něm budou hlasovat."
        : "Hlasování otevřeme během večera. Vítěze vyhlásíme na stagi.";
  const badge = !contest.enabled ? null : contest.voting_open ? "Hlasování běží" : contest.entries_open ? "Přihlášky otevřené" : "Brzy hlasování";
  const ordered = [...contest.entries.filter((e) => !e.mine), ...contest.entries.filter((e) => e.mine)];
  // Hledání podle názvu kostýmu nebo jména (bez diakritiky a velikosti písmen): „upir“ najde „Upír z K2“
  const needle = searchable(query);
  const shown = needle ? ordered.filter((e) => searchable(`${e.title} ${e.name ?? ""}`).includes(needle)) : ordered;

  return (
    <>
      {/* Hlavička jako plakát: hřbitov se smrtkou, nápis HALLOWEEN, mlha */}
      <section className="relative h-[280px] overflow-hidden">
        <img src="/halloween/hero-800.webp" alt="" className="absolute inset-0 size-full object-cover object-[72%_center]" />
        <div className="hw-fog-top absolute inset-x-0 top-0 h-24" />
        <div className="hw-fog-bottom absolute inset-x-0 bottom-0 h-40" />
        {!home && (
          <Link
            href={demo ? "/halloween" : `/e/${event.id}`}
            aria-label="Zpět"
            className="absolute top-3 left-3 grid size-10 place-items-center rounded-full bg-black/45 text-bone backdrop-blur transition active:scale-90"
            style={{ marginTop: "env(safe-area-inset-top)" }}
          >
            <Icon name="back" className="size-6" />
          </Link>
        )}
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

        {demo && (
          <p className="hw-outline rounded-[12px] px-4 py-3 text-center text-[14px] font-semibold">
            Ukázka soutěže. Kostýmy jsou ilustrační a nic se neodesílá.
          </p>
        )}

        {contest.enabled && results && <LiveVoting eventId={event.id} initial={results} showLink={false} />}

        {contest.enabled && (
          <MyEntry userId={userId} eventId={event.id} contest={contest} demo={demo} onChange={() => router.refresh()} />
        )}

        {contest.enabled && (
          <section>
            <h2 className={`${title} mb-4`}>{contest.voting_open ? "Hlasuj" : "Kostýmy v soutěži"}</h2>
            {/* Počítadlo hlasů a hledání zůstávají při scrollování galerií nahoře */}
            {(contest.voting_open || ordered.length > 0) && (
              <div className="sticky top-2 z-10 mb-4 space-y-2 rounded-[18px] bg-night/90 backdrop-blur">
                {contest.voting_open && (
                  <div className="hw-outline flex items-center gap-3 rounded-[16px] p-3.5">
                    <span className="flex shrink-0 gap-1.5" aria-hidden>
                      {Array.from({ length: maxVotes }, (_, i) => (
                        <span key={i} className={`size-3.5 rounded-full ${i < myVotes.length ? "bg-blood" : "border-2 border-blood/70"}`} />
                      ))}
                    </span>
                    <span className="min-w-0 text-[14px] leading-snug">
                      <span className="block font-bold">{votesLeft}</span>
                      <span className="block text-[12px] text-ash">Hlas odebereš klepnutím na „Tvůj hlas“. Podvodné účty mažeme.</span>
                    </span>
                  </div>
                )}
                {ordered.length > 0 && (
                  <label className="relative block">
                    <Icon name="search" className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ash" />
                    <input
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Hledej podle jména nebo kostýmu"
                      aria-label="Hledat kostým"
                      className={`${fieldDark} pl-12`}
                    />
                  </label>
                )}
              </div>
            )}
            {error && <p className={`${errorDark} mb-3`}>{error}</p>}
            {ordered.length === 0 ? (
              <p className={`${surface} p-5 text-center text-[15px] text-ash`}>Zatím tu žádný kostým není.</p>
            ) : shown.length === 0 ? (
              <p className={`${surface} p-5 text-center text-[15px] text-ash`}>Nic takového tu není. Zkus jiný název nebo jméno.</p>
            ) : (
              <ul className="grid grid-cols-2 gap-3">
                {shown.map((entry) => {
                  const voted = myVotes.includes(entry.id);
                  return (
                    <li
                      key={entry.id}
                      className={`${surface} overflow-hidden transition ${voted ? "border-blood shadow-[0_0_28px_rgb(224_20_28/0.45)]" : ""}`}
                    >
                      <div className="relative aspect-[3/4] bg-black">
                        <ThumbImg path={entry.photo} alt={entry.title || "Kostým"} className="size-full object-cover" loading="lazy" />
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
                        {contest.voting_open && !entry.mine ? (
                          <button
                            type="button"
                            onClick={() => toggleVote(entry.id)}
                            disabled={pending || (!voted && left === 0)}
                            aria-pressed={voted}
                            className={`${voted ? btnRed : btnGhost} mt-2 w-full !px-2 !py-2 text-[14px] disabled:opacity-40`}
                          >
                            {voted ? (
                              <>
                                <Icon name="check" className="size-4" /> Tvůj hlas
                              </>
                            ) : (
                              "Hlasovat"
                            )}
                          </button>
                        ) : (
                          voted && <p className={`${btnRed} mt-2 w-full !px-2 !py-2 text-[14px]`}>Tvůj hlas</p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}

        <p className="text-center text-[12px] text-ash/80">
          Každý účet má 3 hlasy pro 3 různé kostýmy a do konce hlasování je může přehazovat. Pro svůj kostým hlasovat nejde.
          Fotku kostýmu nahráváš jen jednou;
          kdo na ní není v kostýmu nebo podvádí, je vyřazen a vzdává se výhry. Živé pořadí je na hlavní stránce appky, vítěze
          vyhlásíme na stagi.
        </p>
      </div>
    </>
  );
}

/** Moje přihláška: jednorázové nahrání fotky kostýmu (pak už jen stav, vyřazení dělá tým). */
function MyEntry({
  userId,
  eventId,
  contest,
  demo,
  onChange,
}: {
  userId: string;
  eventId: string;
  contest: CostumeContest;
  demo: boolean;
  onChange: () => void;
}) {
  const entry = contest.my_entry;
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Přihláška je jednou provždy: kostým se ukáže hned v galerii a fotku už nejde vyměnit ani stáhnout.
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!file) return setError("Vyber fotku kostýmu.");
    if (!agreed) return setError("Potvrď pravidla soutěže.");
    if (demo) return setError("V ukázce se fotka nenahrává. V appce se kostým po odeslání hned objeví v galerii.");
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const blob = await resizeImage(file, 1080, 0.8); // menší fotky = rychlejší galerie na přetížené síti v klubu
      const path = `${userId}/costume-${randomId()}.${photoExtension(blob)}`;
      const { error: uploadError } = await supabase.storage
        .from(PHOTOS_BUCKET)
        .upload(path, blob, { contentType: blob.type, cacheControl: "31536000" });
      if (uploadError) throw uploadError;
      // Malý náhled do galerie a pořadí (stovky lidí listují galerií); když se nepovede, ukáže se velká fotka.
      const thumb = await resizeImage(file, 360, 0.68); // dlaždice v galerii je ~180 px, na retině tedy 360 px
      if (thumb.type === blob.type) {
        await supabase.storage.from(PHOTOS_BUCKET).upload(thumbPath(path), thumb, { contentType: thumb.type, cacheControl: "31536000" });
      }
      const { error } = await supabase.rpc("submit_costume_entry", { p_event_id: eventId, p_photo: path, p_title: name });
      if (error) {
        await supabase.storage.from(PHOTOS_BUCKET).remove([path]);
        throw error;
      }
      setFile(null);
      onChange();
    } catch (err) {
      setError(errorMessage(err, "Fotku se nepodařilo nahrát, zkus to znovu."));
    } finally {
      setBusy(false);
    }
  }

  if (!entry && !contest.entries_open) return null;

  if (entry) {
    return (
      <section>
        <h2 className={`${title} mb-4`}>Tvůj kostým</h2>
        <div className={`${surface} flex gap-4 p-4`}>
          <img src={src(entry.photo)} alt="" className="h-32 w-24 shrink-0 rounded-[12px] bg-black object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[18px] font-bold">{entry.title || "Bez názvu"}</p>
            <p className={`mt-1 text-[14px] font-semibold ${entry.status === "rejected" ? "text-[#ff6b6b]" : "text-blood"}`}>
              {STATUS_TEXT[entry.status]}
            </p>
            {entry.status !== "rejected" && (
              <p className="mt-2 text-[13px] leading-snug text-ash">
                {contest.voting_open ? "Teď dej svůj hlas nejlepšímu kostýmu níž." : "Hlasování otevřeme během večera."}
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className={`${title} mb-4`}>Přihlas kostým</h2>
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
        <p className="text-[12px] text-ash">Na fotce musíš být ty v kostýmu. Jde přihlásit i dvojici nebo partu, napiš to do názvu.</p>
        <label className="flex cursor-pointer items-start gap-3 rounded-[12px] border border-blood/50 bg-blood/10 p-3">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-[#e0141c]" />
          <span className="text-[13px] leading-snug">
            <span className="font-bold">Fotku nahráváš jen jednou a pak už nejde změnit.</span> Pokud na ní nebudeš ty v kostýmu,
            budeš ze soutěže vyřazen/a a vzdáváš se výhry.
          </span>
        </label>
        {error && <p className={errorDark}>{error}</p>}
        <button type="submit" className={`${btnRed} w-full`} disabled={busy}>
          {busy ? "Nahrávám…" : "Přihlásit do soutěže"}
        </button>
      </form>
    </section>
  );
}
