"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { MAX_PHOTOS, MIN_AGE } from "@/lib/config";
import {
  isValidInstagram,
  isValidPhone,
  isValidSnapchat,
  normalizeInstagram,
  normalizePhone,
  normalizeSnapchat,
} from "@/lib/contacts";
import { errorMessage } from "@/lib/errors";
import { ageFromBirthdate } from "@/lib/format";
import { PHOTOS_BUCKET, photoExtension, photoUrl, randomId, resizeImage } from "@/lib/photos";
import { createClient } from "@/lib/supabase/client";
import { GENDERS, GENDER_LABELS, INTEREST_LABELS, type Gender, type Profile } from "@/lib/types";
import { IconField } from "./field";
import { Icon } from "./icons";
import { btnPrimary, chip, errorText, input, inputWithIcon, label } from "./ui";

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
  const [instagram, setInstagram] = useState(profile?.instagram ?? "");
  const [snapchat, setSnapchat] = useState(profile?.snapchat ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
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
    const ig = normalizeInstagram(instagram);
    if (ig && !isValidInstagram(ig)) return "Instagram: zadej jen jméno účtu, třeba jmeno.prijmeni.";
    const sc = normalizeSnapchat(snapchat);
    if (sc && !isValidSnapchat(sc)) return "Snapchat: zadej jen jméno účtu (3 až 15 znaků).";
    const tel = normalizePhone(phone);
    if (tel && !isValidPhone(tel)) return "Telefon: zadej číslo s předvolbou, třeba +420 777 123 456.";
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
        const path = `${userId}/${randomId()}.${photoExtension(blob)}`;
        const { error } = await storage.upload(path, blob, { contentType: blob.type, cacheControl: "31536000" });
        if (error) throw error;
        paths.push(path);
      }

      const contacts = {
        instagram: normalizeInstagram(instagram),
        snapchat: normalizeSnapchat(snapchat),
        phone: normalizePhone(phone),
      };
      const { error } = await supabase.from("profiles").upsert({
        id: userId,
        display_name: name.trim(),
        birthdate,
        gender,
        interested_in: interestedIn,
        bio: bio.trim(),
        photos: paths,
        ...contacts,
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
      setInstagram(contacts.instagram ?? "");
      setSnapchat(contacts.snapchat ?? "");
      setPhone(contacts.phone ?? "");
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
    <form onSubmit={onSubmit} className="mt-6 space-y-6">
      <section>
        <span className={label}>Fotky (první je hlavní)</span>
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo, i) => (
            <div key={photo.key} className="relative aspect-[3/4] overflow-hidden rounded-[16px] bg-fill">
              <img src={photo.preview} alt="" className="size-full object-cover" />
              {i === 0 ? (
                <span className="fill-accent absolute bottom-1.5 left-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold shadow-none">
                  HLAVNÍ
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => makeMain(photo.key)}
                  className="absolute bottom-1.5 left-1.5 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-bold text-ink"
                >
                  Hlavní
                </button>
              )}
              <button
                type="button"
                onClick={() => removePhoto(photo.key)}
                aria-label="Odebrat fotku"
                className="absolute top-1.5 right-1.5 grid size-7 place-items-center rounded-full bg-white/85 text-ink"
              >
                <Icon name="x" className="size-4" />
              </button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="fill-accent-soft grid aspect-[3/4] place-items-center rounded-[16px] transition active:scale-95"
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
        <IconField icon="user">
          <input
            id="name"
            maxLength={40}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }}
            className={inputWithIcon}
            placeholder="Jak ti máme říkat?"
          />
        </IconField>
      </div>

      <div>
        <label htmlFor="birthdate" className={label}>
          Datum narození
        </label>
        <IconField icon="calendar">
          <input
            id="birthdate"
            type="date"
            max={maxBirthdate}
            value={birthdate}
            onChange={(e) => {
              setBirthdate(e.target.value);
              setSaved(false);
            }}
            className={inputWithIcon}
            suppressHydrationWarning
          />
        </IconField>
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

      <section>
        <span className={label}>
          Kontakt pro matche <span className="text-faint normal-case">(nepovinné)</span>
        </span>
        <p className="-mt-1 mb-3 text-[14px] leading-snug text-muted">
          Uvidí ho jen lidi, se kterými se matchneš. Vyplň aspoň jeden, ať se ti dá ozvat.
        </p>
        <div className="space-y-2.5">
          <IconField icon="instagram">
            <input
              aria-label="Instagram"
              value={instagram}
              onChange={(e) => {
                setInstagram(e.target.value);
                setSaved(false);
              }}
              maxLength={80}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className={inputWithIcon}
              placeholder="Instagram, třeba @jmeno.prijmeni"
            />
          </IconField>
          <IconField icon="snapchat">
            <input
              aria-label="Snapchat"
              value={snapchat}
              onChange={(e) => {
                setSnapchat(e.target.value);
                setSaved(false);
              }}
              maxLength={80}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className={inputWithIcon}
              placeholder="Snapchat"
            />
          </IconField>
          <IconField icon="phone">
            <input
              aria-label="Telefon"
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setSaved(false);
              }}
              maxLength={25}
              className={inputWithIcon}
              placeholder="Telefon, třeba +420 777 123 456"
            />
          </IconField>
        </div>
      </section>

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
          className={`${input} resize-none rounded-[16px]`}
          placeholder="Na koho se nejvíc těšíš? Co piješ na baru?"
        />
      </div>

      {error && <p className={errorText}>{error}</p>}
      {saved && (
        <p className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-success">
          <Icon name="check" className="size-5" /> Uloženo
        </p>
      )}

      <button type="submit" disabled={saving} className={`${btnPrimary} w-full py-3.5`}>
        {saving ? "Ukládám…" : profile ? "Uložit změny" : "Hotovo, jdeme na to"}
      </button>
    </form>
  );
}
