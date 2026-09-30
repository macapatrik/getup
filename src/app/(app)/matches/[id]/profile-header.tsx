"use client";

import { useState } from "react";
import { ProfileSheet } from "@/components/profile-sheet";
import { pill } from "@/components/ui";
import { photoUrl } from "@/lib/photos";
import type { MatchRow } from "@/lib/types";

/** Hlavička chatu – jméno a štítek akce jako u Romio; klepnutím se otevře profil protějšku. */
export function ProfileHeader({ match }: { match: MatchRow }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Profil: ${match.display_name}`}
        className="flex min-w-0 flex-1 items-center gap-2.5 py-1 text-left transition active:opacity-70"
      >
        <img src={photoUrl(match.photos[0])} alt="" className="size-10 shrink-0 rounded-full bg-fill object-cover" />
        <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="truncate text-[18px] leading-tight font-bold">{match.display_name}</span>
          {match.event_name && <span className={`${pill} max-w-full truncate`}>{match.event_name}</span>}
        </span>
      </button>
      {open && <ProfileSheet person={match} eventName={match.event_name} onClose={() => setOpen(false)} />}
    </>
  );
}
