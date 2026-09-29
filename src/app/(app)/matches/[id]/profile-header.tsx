"use client";

import { useState } from "react";
import { ProfileSheet } from "@/components/profile-sheet";
import { photoUrl } from "@/lib/photos";
import type { MatchRow } from "@/lib/types";

/** Hlavička chatu – klepnutím se otevře profil protějšku. */
export function ProfileHeader({ match }: { match: MatchRow }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Profil: ${match.display_name}`}
        className="glass flex min-w-0 flex-1 items-center gap-2.5 rounded-full py-1 pr-4 pl-1 text-left transition active:scale-[0.98]"
      >
        <img src={photoUrl(match.photos[0])} alt="" className="size-9 rounded-full object-cover" />
        <span className="min-w-0">
          <span className="block truncate text-[15px] leading-tight font-semibold">
            {match.display_name}, {match.age}
          </span>
          {match.event_name && (
            <span className="block truncate text-[12px] leading-tight text-muted">{match.event_name}</span>
          )}
        </span>
      </button>
      {open && <ProfileSheet person={match} eventName={match.event_name} onClose={() => setOpen(false)} />}
    </>
  );
}
