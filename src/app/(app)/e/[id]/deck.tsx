"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/icons";
import { ProfileSheet } from "@/components/profile-sheet";
import { btnPrimary, btnSecondary } from "@/components/ui";
import { errorMessage } from "@/lib/errors";
import { photoUrl } from "@/lib/photos";
import { createClient } from "@/lib/supabase/client";
import type { DeckCard } from "@/lib/types";

const SWIPE_THRESHOLD = 110; // px, od kdy se karta "odhodí"
const LEAVE_MS = 220;
const REFILL_BELOW = 5; // kolik karet zbývá, když dotahujeme další
const PRELOAD_AHEAD = 3; // kolika dalším kartám přednačíst hlavní fotku

type Direction = 1 | -1; // 1 = like, -1 = pass

export function Deck({
  eventId,
  eventName,
  initialCards,
  myPhoto,
}: {
  eventId: string;
  eventName: string;
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
      if (match || profile) return;
      if (e.key === "ArrowRight") decide(1);
      if (e.key === "ArrowLeft") decide(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [decide, match, profile]);

  // Hlavní fotky dalších karet stáhneme dopředu, ať swipování neseká ani na slabé síti.
  useEffect(() => {
    cards.slice(1, 1 + PRELOAD_AHEAD).forEach((card) => {
      if (card.photos[0]) new Image().src = photoUrl(card.photos[0]);
    });
  }, [cards]);

  const visible = cards.slice(0, 2);
  const top = cards[0];

  return (
    <div className="flex min-h-0 flex-1 flex-col pt-3">
      {/* Karta vyplní jen volné místo – tlačítka tak zůstanou vždy nad spodní lištou */}
      <div className="relative min-h-0 flex-1">
        {visible.length === 0 ? (
          <EmptyState loading={loading} onRetry={loadMore} />
        ) : (
          visible
            .map((card, i) => (
              <SwipeCard
                key={card.id}
                card={card}
                isTop={i === 0}
                leaving={leaving?.id === card.id ? leaving.dir : null}
                onDecide={decide}
                onOpen={() => setProfile(card)}
              />
            ))
            .reverse()
        )}
      </div>

      {error && (
        <p className="mt-2 shrink-0 text-center text-[15px] font-medium text-danger" role="alert">
          {error}
        </p>
      )}

      <div className="flex shrink-0 items-center justify-center gap-6 pt-4 pb-1">
        <ActionButton kind="pass" onClick={() => decide(-1)} disabled={!top} />
        <button
          type="button"
          onClick={() => top && setProfile(top)}
          disabled={!top}
          aria-label="Zobrazit profil"
          className="glass grid size-12 place-items-center rounded-full text-ink/70 transition active:scale-90 disabled:opacity-40"
        >
          <Icon name="info" className="size-6" />
        </button>
        <ActionButton kind="like" onClick={() => decide(1)} disabled={!top} />
      </div>

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

      {match && <MatchModal match={match} myPhoto={myPhoto} onClose={() => setMatch(null)} />}
    </div>
  );
}

/** Symetrická kulatá tlačítka ✕ / ♥ (stejná velikost) */
function ActionButton({ kind, onClick, disabled }: { kind: "pass" | "like"; onClick: () => void; disabled?: boolean }) {
  const like = kind === "like";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={like ? "Líbí se mi" : "Nezajímá mě"}
      className={`grid size-16 place-items-center rounded-full transition active:scale-90 disabled:opacity-40 ${
        like ? "gloss" : "glass text-danger"
      }`}
    >
      <Icon name={like ? "heart" : "x"} className={like ? "size-8 drop-shadow-sm" : "size-7"} />
    </button>
  );
}

function SwipeCard({
  card,
  isTop,
  leaving,
  onDecide,
  onOpen,
}: {
  card: DeckCard;
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
  else if (!isTop) transform = "scale(0.95) translateY(12px)";

  const likeOpacity = leaving === 1 ? 1 : Math.max(0, Math.min(1, drag.x / SWIPE_THRESHOLD));
  const nopeOpacity = leaving === -1 ? 1 : Math.max(0, Math.min(1, -drag.x / SWIPE_THRESHOLD));

  return (
    <div
      className="absolute inset-0 touch-none overflow-hidden rounded-[32px] border-[3px] border-white bg-gradient-to-br from-orange-200 to-amber-50 shadow-[0_28px_60px_-24px_rgb(60_30_10/0.55)] select-none"
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

      {card.photos.length > 1 && (
        <div className="absolute inset-x-4 top-3 flex gap-1">
          {card.photos.map((p, i) => (
            <span key={p} className={`h-1 flex-1 rounded-full shadow-sm ${i === photoIndex ? "bg-white" : "bg-white/40"}`} />
          ))}
        </div>
      )}

      <span
        className="absolute top-10 left-5 -rotate-12 rounded-full bg-white/90 px-5 py-2 font-display text-2xl font-bold text-success [text-shadow:none] shadow-lg backdrop-blur"
        style={{ opacity: likeOpacity }}
      >
        LÍBÍ
      </span>
      <span
        className="absolute top-10 right-5 rotate-12 rounded-full bg-white/90 px-5 py-2 font-display text-2xl font-bold text-danger-strong [text-shadow:none] shadow-lg backdrop-blur"
        style={{ opacity: nopeOpacity }}
      >
        NE
      </span>

      <div className="glass-photo absolute inset-x-3 bottom-3 rounded-[24px] px-4 py-3.5">
        <div className="flex items-start justify-between gap-3">
          <p className="font-display text-[28px] leading-tight font-bold">
            {card.display_name} <span className="font-normal">{card.age}</span>
          </p>
          <span className="mt-1.5 grid size-7 shrink-0 place-items-center rounded-full bg-white/25" aria-hidden>
            <Icon name="info" className="size-5" />
          </span>
        </div>
        {card.bio && <p className="mt-0.5 line-clamp-2 text-[15px] leading-snug text-white/90">{card.bio}</p>}
      </div>
    </div>
  );
}

function EmptyState({ loading, onRetry }: { loading: boolean; onRetry: () => void }) {
  return (
    <div className="glass flex h-full flex-col items-center justify-center rounded-[32px] p-8 text-center">
      <p className="text-5xl">🎶</p>
      <p className="mt-4 font-display text-[22px] font-bold">Zatím jsi viděl/a všechny</p>
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

function MatchModal({
  match,
  myPhoto,
  onClose,
}: {
  match: { matchId: string; card: DeckCard };
  myPhoto?: string;
  onClose: () => void;
}) {
  const avatar = "size-32 rounded-full border-4 border-white object-cover shadow-[0_18px_40px_-12px_rgb(60_30_10/0.5)]";
  return createPortal(
    <div
      className="aurora fixed inset-0 z-50 flex flex-col items-center justify-center px-8 text-center"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative flex items-center">
        {myPhoto && <img src={photoUrl(myPhoto)} alt="" className={`${avatar} -mr-6 -rotate-6`} />}
        <img src={photoUrl(match.card.photos[0])} alt={match.card.display_name} className={`${avatar} rotate-6`} />
        <span className="gloss absolute -bottom-3 left-1/2 grid size-14 -translate-x-1/2 place-items-center rounded-full border-4 border-white">
          <Icon name="heart" className="size-7" />
        </span>
      </div>
      <p className="mt-10 font-display text-[44px] leading-none font-bold tracking-tight text-gradient">Je to match!</p>
      <p className="mt-3 text-[17px] text-muted">Ty a {match.card.display_name} jste se lajkli. Napiš první!</p>
      <Link href={`/matches/${match.matchId}`} className={`${btnPrimary} mt-10 w-full max-w-xs py-4`}>
        Napsat zprávu
      </Link>
      <button type="button" onClick={onClose} className="mt-3 py-2 text-[17px] font-semibold text-accent">
        Swipovat dál
      </button>
    </div>,
    document.body,
  );
}
