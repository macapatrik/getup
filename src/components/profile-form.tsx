"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { MAX_PHOTOS, MIN_AGE } from "@/lib/config";
import { errorMessage } from "@/lib/errors";
import { ageFromBirthdate } from "@/lib/format";
import { PHOTOS_BUCKET, photoUrl, randomId, resizeImage } from "@/lib/photos";
import { createClient } from "@/lib/supabase/client";
import { GENDERS, GENDER_LABELS, INTEREST_LABELS, type Gender, type Profile } from "@/lib/types";
import { Icon } from "./icons";
import { btnPrimary, chip, errorText, input, label } from "./ui";

type PhotoItem = { key: string; preview: string; path?: string; file?: File };

function toItems(paths: string[]): PhotoItem[] {
  return paths.map((path) => ({ key: path, path, preview: photoUrl(path) }));
}

export function ProfileForm({
  userId,
  profile,
  redirectTo,
}: {
  userId: string;
  profile: Profile | null;
  /** Kam po uložení (onboarding). Bez něj zůstaneme na stránce. */
  redirectTo?: string;
}) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<PhotoItem[]>(() => toItems(profile?.photos ?? []));
  const [name, setName] = useState(profile?.display_name ?? "");
  const [birthdate, setBirthdate] = useState(profile?.birthdate ?? "");
  const [gender, setGender] = useState<Gender | null>(profile?.gender ?? null);
  const [interestedIn, setInterestedIn] = useState<Gender[]>(profile?.interested_in ?? []);
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function addFiles(files: FileList | null) {
    if (!files) return;
    const free = MAX_PHOTOS - photos.length;
    const items = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, free)
      .map((file) => ({ key: randomId(), file, preview: URL.createObjectURL(file) }));
    setPhotos((current) => [...current, ...items]);
    setSaved(false);
  }

  function removePhoto(key: string) {
    setPhotos((current) => current.filter((p) => p.key !== key));
    setSaved(false);
  }

  function makeMain(key: string) {
    setPhotos((current) => {
      const item = current.find((p) => p.key === key);
      return item ? [item, ...current.filter((p) => p.key !== key)] : current;
    });
    setSaved(false);
  }

  function toggleInterest(g: Gender) {
    setInterestedIn((current) => (current.includes(g) ? current.filter((x) => x !== g) : [...current, g]));
    setSaved(false);
  }

  function validate(): string | null {
    if (photos.length === 0) return "Přidej aspoň jednu fotku.";
    if (!name.trim()) return "Napiš, jak ti máme říkat.";
    if (!birthdate) return "Vyplň datum narození.";
    if (ageFromBirthdate(birthdate) < MIN_AGE) return `Musí ti být alespoň ${MIN_AGE} let.`;
    if (!gender) return "Vyber, kdo jsi.";
    if (interestedIn.length === 0) return "Vyber, koho hledáš.";
    return null;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setSaving(true);

    try {
      const supabase = createClient();
      const storage = supabase.storage.from(PHOTOS_BUCKET);

      const paths: string[] = [];
      for (const photo of photos) {
        if (photo.path) {
          paths.push(photo.path);
          continue;
        }
        const blob = await resizeImage(photo.file!);
        const path = `${userId}/${randomId()}.jpg`;
        const { error } = await storage.upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000" });
        if (error) throw error;
        paths.push(path);
      }

      const { error } = await supabase.from("profiles").upsert({
        id: userId,
        display_name: name.trim(),
        birthdate,
        gender,
        interested_in: interestedIn,
        bio: bio.trim(),
        photos: paths,
      });
      if (error) throw error;

      // Úklid fotek, které uživatel odebral.
      const removed = (profile?.photos ?? []).filter((p) => !paths.includes(p));
      if (removed.length > 0) await storage.remove(removed);

      if (redirectTo) {
        window.location.assign(redirectTo);
        return;
      }
      photos.forEach((p) => p.file && URL.revokeObjectURL(p.preview));
      setPhotos(toItems(paths));
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(errorMessage(err, "Uložení se nepovedlo. Zkus to prosím znovu."));
    } finally {
      setSaving(false);
    }
  }

  const maxBirthdate = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - MIN_AGE);
    return d.toISOString().slice(0, 10);
  })();

  return (
    <form onSubmit={onSubmit} className="mt-7 space-y-6">
      <section>
        <span className={label}>Fotky (první je hlavní)</span>
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo, i) => (
            <div key={photo.key} className="relative aspect-[3/4] overflow-hidden rounded-[20px] border-2 border-white bg-fill shadow-[0_8px_20px_-10px_rgb(60_30_10/0.4)]">
              <img src={photo.preview} alt="" className="size-full object-cover" />
              {i === 0 ? (
                <span className="gloss absolute bottom-1.5 left-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold">
                  HLAVNÍ
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => makeMain(photo.key)}
                  className="glass-photo absolute bottom-1.5 left-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                >
                  Hlavní
                </button>
              )}
              <button
                type="button"
                onClick={() => removePhoto(photo.key)}
                aria-label="Odebrat fotku"
                className="glass-photo absolute top-1.5 right-1.5 grid size-7 place-items-center rounded-full"
              >
                <Icon name="x" className="size-4" />
              </button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="glass grid aspect-[3/4] place-items-center rounded-[20px] border-dashed text-accent transition active:scale-95"
            >
              <Icon name="plus" className="size-8" />
            </button>
          )}
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </section>

      <div>
        <label htmlFor="name" className={label}>
          Jméno nebo přezdívka
        </label>
        <input
          id="name"
          maxLength={40}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setSaved(false);
          }}
          className={input}
          placeholder="Jak ti máme říkat?"
        />
      </div>

      <div>
        <label htmlFor="birthdate" className={label}>
          Datum narození
        </label>
        <input
          id="birthdate"
          type="date"
          max={maxBirthdate}
          value={birthdate}
          onChange={(e) => {
            setBirthdate(e.target.value);
            setSaved(false);
          }}
          className={input}
          suppressHydrationWarning
        />
      </div>

      <fieldset>
        <legend className={label}>Jsem</legend>
        <div className="flex flex-wrap gap-2">
          {GENDERS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => {
                setGender(g);
                setSaved(false);
              }}
              className={chip(gender === g)}
              aria-pressed={gender === g}
            >
              {GENDER_LABELS[g]}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className={label}>Chci potkat</legend>
        <div className="flex flex-wrap gap-2">
          {GENDERS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => toggleInterest(g)}
              className={chip(interestedIn.includes(g))}
              aria-pressed={interestedIn.includes(g)}
            >
              {INTEREST_LABELS[g]}
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="bio" className={label}>
          Pár slov o tobě <span className="text-faint">(nepovinné)</span>
        </label>
        <textarea
          id="bio"
          rows={3}
          maxLength={500}
          value={bio}
          onChange={(e) => {
            setBio(e.target.value);
            setSaved(false);
          }}
          className={`${input} resize-none`}
          placeholder="Na koho se nejvíc těšíš? Co piješ na baru?"
        />
      </div>

      {error && <p className={errorText}>{error}</p>}
      {saved && <p className="ml-1 text-[15px] font-semibold text-success">✓ Uloženo</p>}

      <button type="submit" disabled={saving} className={`${btnPrimary} w-full py-4`}>
        {saving ? "Ukládám…" : profile ? "Uložit změny" : "Hotovo, jdeme na to"}
      </button>
    </form>
  );
}
