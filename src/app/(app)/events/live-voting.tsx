"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { formatNumber } from "@/lib/format";
import { photoUrl } from "@/lib/photos";
import { createClient } from "@/lib/supabase/client";
import type { CostumeResults } from "@/lib/types";

const REFRESH_MS = 8000;
const SHOWN = 5;

function votesLabel(n: number) {
  return `${formatNumber(n)} ${n === 1 ? "hlas" : n >= 2 && n <= 4 ? "hlasy" : "hlasů"}`;
}

/** Živé výsledky soutěže o kostým na hlavní stránce: pořadí s pruhy hlasů, vedoucí kostým má štítek „Vede“. */
export function LiveVoting({
  eventId,
  initial,
  showLink = true,
}: {
  eventId: string;
  initial: CostumeResults;
  showLink?: boolean;
}) {
  const [results, setResults] = useState(initial);

  // Obnova každých pár sekund, jen když je appka vidět (a hned po návratu do ní).
  useEffect(() => {
    const supabase = createClient();
    async function load() {
      if (document.visibilityState !== "visible") return;
      const { data } = await supabase.rpc("costume_results", {
        p_event_id: eventId,
      });
      if (data) setResults(data as CostumeResults);
    }
    const timer = window.setInterval(load, REFRESH_MS);
    document.addEventListener("visibilitychange", load);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", load);
    };
  }, [eventId]);

  const top = results.entries.slice(0, SHOWN);
  const max = Math.max(1, ...top.map((e) => e.votes));
  const leaderId = top[0] && top[0].votes > 0 && top[0].votes > (top[1]?.votes ?? 0) ? top[0].id : null;

  return (
    <section className="relative overflow-hidden rounded-[24px] border border-blood/40 bg-night p-4 text-bone shadow-[0_18px_40px_-20px_rgb(224_20_28/0.8)]">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-[13px] font-bold tracking-[0.14em] uppercase">
          {results.voting_open ? (
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-blood opacity-70" />
              <span className="relative inline-flex size-2.5 rounded-full bg-blood" />
            </span>
          ) : (
            <Icon name="clock" className="size-4 text-ash" />
          )}
          {results.voting_open ? "Live hlasování" : "Hlasování zatím neběží"}
        </p>
        <span className="text-[13px] font-semibold text-ash tabular-nums">{votesLabel(results.total)}</span>
      </div>
      <p className="font-metal hw-glow mt-1 text-[26px] leading-tight text-blood">Nejlepší kostým</p>

      {top.length === 0 ? (
        <p className="mt-3 text-[14px] text-ash">Zatím tu není žádný kostým. Přihlas ten svůj.</p>
      ) : (
        <ol className="mt-3 space-y-2.5">
          {top.map((entry, i) => {
            const leader = entry.id === leaderId;
            const width = Math.round((entry.votes / max) * 100);
            return (
              <li
                key={entry.id}
                className={`flex items-center gap-3 rounded-[16px] p-2 transition ${leader ? "bg-blood/15 ring-1 ring-blood/70" : "bg-white/[0.04]"}`}
              >
                <span className="w-4 shrink-0 text-center text-[14px] font-bold text-ash tabular-nums">{i + 1}</span>
                <img src={photoUrl(entry.photo)} alt="" className="size-12 shrink-0 rounded-[12px] bg-black object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="min-w-0 truncate text-[15px] font-bold">{entry.title || "Bez názvu"}</p>
                    {leader && (
                      <span className="hw-red inline-flex shrink-0 items-center gap-1 rounded-[8px] px-2 py-0.5 text-[11px] font-bold uppercase">
                        <Icon name="heart" className="size-3" /> Vede
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-white/10">
                      <span
                        className={`block h-full rounded-full transition-[width] duration-700 ${leader ? "bg-blood" : "bg-bone/60"}`}
                        style={{ width: `${width}%` }}
                      />
                    </span>
                    <span className="shrink-0 text-[12px] font-semibold text-ash tabular-nums">{entry.votes}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {showLink && (
        <Link
          href={`/e/${eventId}/kostymy`}
          className="hw-red mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[12px] py-3 text-[16px] font-bold transition active:scale-[0.97]"
        >
          <Icon name="camera" className="size-5" />
          {results.voting_open ? "Hlasovat" : "Soutěž o kostým"}
        </Link>
      )}
    </section>
  );
}
