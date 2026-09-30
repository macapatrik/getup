"use client";

import Link from "next/link";
import { useState } from "react";
import { IconField } from "@/components/field";
import { Icon } from "@/components/icons";
import { btnPrimary, inputWithIcon } from "@/components/ui";
import { formatDate, formatTime } from "@/lib/format";
import { photoUrl } from "@/lib/photos";
import type { MatchRow } from "@/lib/types";

/** Čas poslední zprávy: dnes jen hodina, jinak datum. */
function when(iso: string) {
  const d = new Date(iso);
  return Date.now() - d.getTime() < 20 * 3600_000 ? formatTime(iso) : formatDate(iso);
}

export function MessagesList({ meId, chats }: { meId: string; chats: MatchRow[] }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const shown = q ? chats.filter((m) => m.display_name.toLowerCase().includes(q) || (m.last_message ?? "").toLowerCase().includes(q)) : chats;

  return (
    <>
      <div className="mt-4">
        <IconField icon="search">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Hledat"
            aria-label="Hledat v chatech"
            className={inputWithIcon}
          />
        </IconField>
      </div>

      {chats.length === 0 && (
        <div className="mt-10 flex flex-col items-center text-center">
          <span className="fill-accent-soft grid size-16 place-items-center rounded-full">
            <Icon name="chat" className="size-8" />
          </span>
          <p className="mt-4 text-[22px] font-bold">Zatím žádné zprávy</p>
          <p className="mt-1 text-[15px] text-muted">Napíšeš si s každým, s kým se lajknete navzájem.</p>
          <Link href="/swipe" className={`${btnPrimary} mt-5`}>
            Swipovat
          </Link>
        </div>
      )}

      {chats.length > 0 && shown.length === 0 && <p className="mt-8 text-center text-[15px] text-muted">Nikdo takový tu není.</p>}

      <ul className="mt-4 space-y-3">
        {shown.map((m) => {
          const theirs = !!m.last_message && m.last_sender_id !== meId;
          return (
            <li key={m.match_id}>
              <Link
                href={`/matches/${m.match_id}`}
                className="surface flex items-center justify-between gap-3 rounded-[36px] p-1 pr-5 transition active:scale-[0.98]"
              >
                <span className="flex min-w-0 items-center gap-4">
                  <span className="relative shrink-0">
                    <img src={photoUrl(m.photos[0])} alt="" className="size-16 rounded-full bg-fill object-cover" />
                    {theirs && <span className="absolute top-0.5 right-0 size-[15px] rounded-full border-[3px] border-white bg-indigo" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[16px] font-bold">{m.display_name}</span>
                    <span className={`block truncate text-[14px] ${theirs ? "font-medium text-ink" : "text-muted"}`}>
                      {m.last_message ? (
                        <>
                          {!theirs && "Ty: "}
                          {m.last_message}
                        </>
                      ) : (
                        `Nový match${m.event_name ? ` z ${m.event_name}` : ""}`
                      )}
                    </span>
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className="text-[12px] font-medium text-muted">{when(m.last_message_at ?? m.matched_at)}</span>
                  {theirs && <span className="fill-accent size-2.5 rounded-full shadow-none" aria-label="Nepřečtená zpráva" />}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
