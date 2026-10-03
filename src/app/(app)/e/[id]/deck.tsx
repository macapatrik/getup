"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { ContactButtons } from "@/components/contact-buttons";
import { Icon } from "@/components/icons";
import { ProfileSheet } from "@/components/profile-sheet";
import { btnPrimary, btnSecondary, photoBadge } from "@/components/ui";
import { errorMessage } from "@/lib/errors";
import { photoUrl } from "@/lib/photos";
import { createClient } from "@/lib/supabase/client";
import type { DeckCard, MatchRow } from "@/lib/types";
import { SwipeHint, useSwipeHint } from "./swipe-hint";

const SWIPE_THRESHOLD = 110; // px, od kdy se karta "odhodí"
const LEAVE_MS = 220;
const REFILL_BELOW = 5; // kolik karet zbývá, když dotahujeme další
const PRELOAD_AHEAD = 3; // kolika dalším kartám přednačíst hlavní fotku

type Direction = 1 | -1; // 1 = like, -1 = pass

export function Deck({
  eventId,
  eventName,
  venue,
  initialCards,
  myPhoto,
}: {
  eventId: string;
  eventName: string;
  venue?: string;
  initialCards: DeckCard[];
  myPhoto?: string;
}) {
  const [cards, setCards] = useState(initialCards);
  const [leaving, setLeaving] = useState<{ id: string; dir: Direction } | null>(null);
  const [match, setMatch] = useState<{ matchId: string; card: DeckCard } | null>(null);
  const [profile, setProfile] = useState<DeckCard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [exhausted, setExhausted] = useState(initialCards.length === 0);
  const seen = useRef(new Set(initialCards.map((c) => c.id)));
  // Návod ke swipování jen poprvé na tomhle zařízení (a jen když je co swipovat).
  const { show: hint, dismiss: closeHint } = useSwipeHint(initialCards.length > 0);

  const loadMore = useCallback(async () => {
    setLoading(true);
    const { data, error } = await createClient().rpc("get_deck", { p_event_id: eventId });
    setLoading(false);
    if (error) {
      setError(errorMessage(error));
      return;
    }
    const fresh = ((data ?? []) as DeckCard[]).filter((c) => !seen.current.has(c.id));
    fresh.forEach((c) => seen.current.add(c.id));
    setCards((current) => [...current, ...fresh]);
    setExhausted(fresh.length === 0);
  }, [eventId]);

  const decide = useCallback(
    (dir: Direction) => {
      const card = cards[0];
      if (!card || leaving) return;

      setLeaving({ id: card.id, dir });
      window.setTimeout(() => {
        setLeaving(null);
        setCards((current) => current.filter((c) => c.id !== card.id));
      }, LEAVE_MS);

      createClient()
        .rpc("swipe", { p_event_id: eventId, p_target: card.id, p_liked: dir === 1 })
        .then(({ data, error }) => {
          if (error) {
            // GU005 = člověk mezitím odešel / se skryl – tiše přeskočíme
            if (error.code !== "GU005") setError(errorMessage(error));
            return;
          }
          if (data) setMatch({ matchId: data as string, card });
        });

      if (cards.length - 1 < REFILL_BELOW && !exhausted && !loading) void loadMore();
    },
    [cards, leaving, eventId, exhausted, loading, loadMore],
  );

  // Šipky na klávesnici (desktop)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (match || profile || hint) return;
      if (e.key === "ArrowRight") decide(1);
      if (e.key === "ArrowLeft") decide(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [decide, match, profile, hint]);

  // Hlavní fotky dalších karet stáhneme dopředu, ať swipování neseká ani na slabé síti.
  useEffect(() => {
    cards.slice(1, 1 + PRELOAD_AHEAD).forEach((card) => {
      if (card.photos[0]) new Image().src = photoUrl(card.photos[0]);
    });
  }, [cards]);

  const visible = cards.slice(0, 2);
  const top = cards[0];

  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 pt-3">
      {/* Karta vyplní volné místo; tlačítka přesahují přes její spodní okraj jako u Romio. */}
      <div className="relative mb-9 min-h-0 flex-1">
        {visible.length === 0 ? (
          <EmptyState loading={loading} onRetry={loadMore} />
        ) : (
          visible
            .map((card, i) => (
              <SwipeCard
                key={card.id}
                card={card}
                venue={venue}
                isTop={i === 0}
                leaving={leaving?.id === card.id ? leaving.dir : null}
                onDecide={decide}
                onOpen={() => setProfile(card)}
              />
            ))
            .reverse()
        )}

        <div className="absolute -bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-5">
          <ActionButton kind="pass" onClick={() => decide(-1)} disabled={!top} />
          <ActionButton kind="like" onClick={() => decide(1)} disabled={!top} />
          <ActionButton kind="info" onClick={() => top && setProfile(top)} disabled={!top} />
        </div>
      </div>

      {error && (
        <p className="mt-3 shrink-0 text-center text-[14px] font-medium text-danger" role="alert">
          {error}
        </p>
      )}

      {profile && (
        <ProfileSheet
          person={profile}
          eventName={eventName}
          onClose={() => setProfile(null)}
          actions={
            profile.id === top?.id ? (
              <>
                <ActionButton
                  kind="pass"
                  onClick={() => {
                    setProfile(null);
                    decide(-1);
                  }}
                />
                <ActionButton
                  kind="like"
                  onClick={() => {
                    setProfile(null);
                    decide(1);
                  }}
                />
              </>
            ) : undefined
          }
        />
      )}

      {hint && <SwipeHint onClose={closeHint} />}
      {match && <MatchModal match={match} myPhoto={myPhoto} onClose={() => setMatch(null)} />}
    </div>
  );
}

/** Bílá kulatá tlačítka pod kartou: ✕ (48 px), ♥ (64 px), i (48 px) */
function ActionButton({
  kind,
  onClick,
  disabled,
}: {
  kind: "pass" | "like" | "info";
  onClick: () => void;
  disabled?: boolean;
}) {
  const labels = { pass: "Nezajímá mě", like: "Líbí se mi", info: "Zobrazit profil" } as const;
  const like = kind === "like";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={labels[kind]}
      className={`shadow-indigo grid place-items-center rounded-full bg-white transition active:scale-90 disabled:opacity-40 ${
        like ? "size-16 text-accent" : "size-12 text-indigo"
      }`}
    >
      {kind === "pass" && <Icon name="x" className="size-6" />}
      {kind === "like" && <Icon name="heart" className="size-8" />}
      {kind === "info" && <Icon name="info" className="size-6" />}
    </button>
  );
}

function SwipeCard({
  card,
  venue,
  isTop,
  leaving,
  onDecide,
  onOpen,
}: {
  card: DeckCard;
  venue?: string;
  isTop: boolean;
  leaving: Direction | null;
  onDecide: (dir: Direction) => void;
  onOpen: () => void;
}) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const start = useRef<{ x: number; y: number } | null>(null);
  const moved = useRef(false);

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (!isTop || leaving) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY };
    moved.current = false;
    setDragging(true);
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!start.current) return;
    const x = e.clientX - start.current.x;
    const y = e.clientY - start.current.y;
    if (Math.abs(x) + Math.abs(y) > 8) moved.current = true;
    setDrag({ x, y });
  }

  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    if (!start.current) return;
    start.current = null;
    setDragging(false);

    if (drag.x > SWIPE_THRESHOLD) onDecide(1);
    else if (drag.x < -SWIPE_THRESHOLD) onDecide(-1);
    else if (!moved.current) {
      // Klepnutí: okraje (čtvrtina karty) přepínají fotky, jinak se otevře profil
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      if (card.photos.length > 1 && x < 0.25) setPhotoIndex((i) => Math.max(0, i - 1));
      else if (card.photos.length > 1 && x > 0.75) setPhotoIndex((i) => Math.min(card.photos.length - 1, i + 1));
      else onOpen();
    }
    setDrag({ x: 0, y: 0 });
  }

  function onPointerCancel() {
    start.current = null;
    setDragging(false);
    setDrag({ x: 0, y: 0 });
  }

  let transform = "none";
  if (leaving) transform = `translate(${leaving * 140}%, ${drag.y}px) rotate(${leaving * 24}deg)`;
  else if (dragging) transform = `translate(${drag.x}px, ${drag.y * 0.4}px) rotate(${drag.x / 16}deg)`;
  else if (!isTop) transform = "scale(0.97) translateY(10px)";

  const likeOpacity = leaving === 1 ? 1 : Math.max(0, Math.min(1, drag.x / SWIPE_THRESHOLD));
  const nopeOpacity = leaving === -1 ? 1 : Math.max(0, Math.min(1, -drag.x / SWIPE_THRESHOLD));

  return (
    <div
      className="absolute inset-0 touch-none overflow-hidden rounded-[32px] bg-fill select-none"
      style={{
        transform,
        transition: dragging ? "none" : `transform ${LEAVE_MS}ms ease-out`,
        cursor: isTop ? "grab" : "default",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      <img
        src={photoUrl(card.photos[photoIndex] ?? card.photos[0])}
        alt={card.display_name}
        draggable={false}
        className="pointer-events-none size-full object-cover"
      />
      <div className="photo-fade pointer-events-none absolute inset-x-0 bottom-0 h-1/2" />

      {card.photos.length > 1 && (
        <div className="absolute inset-x-4 top-3 flex gap-1">
          {card.photos.map((p, i) => (
            <span key={p} className={`h-1 flex-1 rounded-full shadow-sm ${i === photoIndex ? "bg-white" : "bg-white/40"}`} />
          ))}
        </div>
      )}

      {/* Růžové kolečko uprostřed karty při tahu: ♥ = líbí, ✕ = ne */}
      <span
        className="fill-accent absolute top-1/2 left-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
        style={{ opacity: likeOpacity }}
        aria-hidden
      >
        <Icon name="heart" className="size-8" />
      </span>
      <span
        className="fill-accent absolute top-1/2 left-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
        style={{ opacity: nopeOpacity }}
        aria-hidden
      >
        <Icon name="x" className="size-8" />
      </span>

      <div className="absolute inset-x-0 bottom-0 p-4 pb-14 text-white">
        <p className="text-[24px] leading-8 font-semibold">{card.display_name}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className={photoBadge}>
            <Icon name="gender" className="size-[18px]" /> {card.age} let
          </span>
          {venue && (
            <span className={`${photoBadge} min-w-0`}>
              <Icon name="pin" className="size-[18px] shrink-0" /> <span className="truncate">{venue}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ loading, onRetry }: { loading: boolean; onRetry: () => void }) {
  return (
    <div className="surface flex h-full flex-col items-center justify-center rounded-[32px] p-8 text-center">
      <span className="fill-accent-soft grid size-16 place-items-center rounded-full">
        <Icon name="users" className="size-8" />
      </span>
      <p className="mt-4 text-[22px] font-bold">Zatím jsi viděl/a všechny</p>
      <p className="mt-2 text-[15px] text-muted">
        Další lidi se připojují až do začátku akce i během ní. Zkus to později, nebo se mrkni na své matche.
      </p>
      <div className="mt-6 flex gap-3">
        <button type="button" onClick={onRetry} disabled={loading} className={btnSecondary}>
          <Icon name="refresh" className="size-5" />
          {loading ? "Hledám…" : "Zkusit znovu"}
        </button>
        <Link href="/matches" className={btnSecondary}>
          Matche
        </Link>
      </div>
    </div>
  );
}

/** Obrazovka „Je to match!“ jako u Romio: světle růžové pozadí, velké srdce, obě fotky a rovnou kontakty protějšku. */
function MatchModal({
  match,
  myPhoto,
  onClose,
}: {
  match: { matchId: string; card: DeckCard };
  myPhoto?: string;
  onClose: () => void;
}) {
  // Kontakty jsou vidět až po matchi, takže je dotáhneme z get_matches.
  const [other, setOther] = useState<MatchRow | null | undefined>(undefined);
  useEffect(() => {
    let cancelled = false;
    createClient()
      .rpc("get_matches", { p_match_id: match.matchId })
      .then(({ data }) => {
        if (!cancelled) setOther(((data ?? []) as MatchRow[])[0] ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, [match.matchId]);

  const name = match.card.display_name;
  const avatar = "size-24 rounded-full border-4 border-white bg-fill object-cover shadow-[0_18px_40px_-14px_rgb(62_54_237/0.45)]";
  return createPortal(
    <div
      className="match-bg fixed inset-0 z-50 flex flex-col items-center overflow-y-auto px-6 pt-safe pb-safe text-center"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex flex-1 flex-col items-center justify-center py-6">
        <span className="grid size-40 animate-[pop-in_0.4s_cubic-bezier(0.34,1.56,0.64,1)] place-items-center rounded-full bg-gradient-to-b from-[#ff9be9] to-accent shadow-[0_40px_70px_-30px_rgb(247_89_245/0.75)]">
          <Icon name="heart" className="size-20 text-white drop-shadow-[0_6px_12px_rgb(0_0_0/0.15)]" />
        </span>
        <div className="-mt-7 flex items-center justify-center">
          {myPhoto && <img src={photoUrl(myPhoto)} alt="" className={`${avatar} -mr-4`} />}
          <img src={photoUrl(match.card.photos[0])} alt={name} className={avatar} />
        </div>
        <p className="mt-7 text-[32px] leading-tight font-bold">Je to match!</p>
        <p className="mt-2 text-[16px] text-muted">
          Ty a {name} jste se lajkli.
          <br />
          Ozvi se.
        </p>
        <div className="mt-6 w-full max-w-sm text-left">
          {other === undefined ? (
            <p className="text-center text-[14px] text-muted">Načítám kontakt…</p>
          ) : (
            <ContactButtons person={other ?? { instagram: null, snapchat: null, phone: null }} name={name} />
          )}
        </div>
      </div>
      <div className="w-full max-w-sm space-y-3 pb-3">
        <Link href={`/matches/${match.matchId}`} className={`${btnPrimary} w-full py-3.5`}>
          Zobrazit profil
        </Link>
        <button type="button" onClick={onClose} className={`${btnSecondary} w-full py-3.5`}>
          Swipovat dál
        </button>
      </div>
    </div>,
    document.body,
  );
}
