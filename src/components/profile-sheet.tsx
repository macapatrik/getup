"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { photoUrl } from "@/lib/photos";
import { Icon } from "./icons";

export type SheetPerson = {
  display_name: string;
  age: number;
  bio: string;
  photos: string[];
};

const CLOSE_DRAG = 110; // px tahu dolů, od kterých se list zavře

/** Vysouvací profil člověka (iOS "sheet"). Zavře se tlačítkem, klepnutím vedle, tahem dolů nebo Esc. */
export function ProfileSheet({
  person,
  eventName,
  onClose,
  actions,
}: {
  person: SheetPerson;
  eventName?: string | null;
  onClose: () => void;
  /** Tlačítka dole (např. ✕ / ♥ při swipování) */
  actions?: ReactNode;
}) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [dragY, setDragY] = useState(0);
  const dragStart = useRef<number | null>(null);
  const gallery = useRef<HTMLDivElement>(null);

  // Zamknout scroll stránky pod listem + Esc
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  function onGalleryScroll() {
    const el = gallery.current;
    if (el) setPhotoIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  function onGrabDown(e: PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStart.current = e.clientY;
  }
  function onGrabMove(e: PointerEvent<HTMLDivElement>) {
    if (dragStart.current === null) return;
    setDragY(Math.max(0, e.clientY - dragStart.current));
  }
  function onGrabUp() {
    if (dragStart.current === null) return;
    dragStart.current = null;
    if (dragY > CLOSE_DRAG) onClose();
    else setDragY(0);
  }

  // Portál do <body>: list musí být nad spodní lištou i když ho otevře stránka s vlastním "fixed" rozložením.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={person.display_name}>
      <button
        type="button"
        aria-label="Zavřít"
        onClick={onClose}
        className="absolute inset-0 animate-[fade-in_0.2s_ease-out] bg-black/25 backdrop-blur-[2px]"
      />

      <div
        className="relative flex max-h-[92dvh] w-full max-w-md animate-[sheet-up_0.34s_cubic-bezier(0.32,0.72,0,1)] flex-col overflow-hidden rounded-t-[32px] bg-white shadow-[0_-20px_60px_-20px_rgb(0_0_0/0.35)]"
        style={{ transform: dragY ? `translateY(${dragY}px)` : undefined, transition: dragY ? "none" : "transform 0.2s ease-out" }}
      >
        {/* Úchyt – tahem dolů se list zavře */}
        <div
          className="absolute inset-x-0 top-0 z-10 flex h-8 cursor-grab touch-none justify-center pt-2"
          onPointerDown={onGrabDown}
          onPointerMove={onGrabMove}
          onPointerUp={onGrabUp}
          onPointerCancel={onGrabUp}
        >
          <span className="h-1.5 w-10 rounded-full bg-white/80 shadow-[0_1px_4px_rgb(0_0_0/0.25)]" />
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Zavřít profil"
          className="glass-photo absolute top-4 right-4 z-10 grid size-9 place-items-center rounded-full"
        >
          <Icon name="x" className="size-5" />
        </button>

        <div className="overflow-y-auto overscroll-contain">
          {/* Fotky – posun do stran */}
          <div className="relative">
            <div
              ref={gallery}
              onScroll={onGalleryScroll}
              className="flex aspect-[4/5] max-h-[52dvh] w-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {person.photos.map((p) => (
                <img
                  key={p}
                  src={photoUrl(p)}
                  alt={person.display_name}
                  className="size-full shrink-0 snap-center object-cover"
                  draggable={false}
                />
              ))}
            </div>
            {person.photos.length > 1 && (
              <div className="absolute top-6 right-16 left-4 flex gap-1">
                {person.photos.map((p, i) => (
                  <span key={p} className={`h-1 flex-1 rounded-full shadow-sm ${i === photoIndex ? "bg-white" : "bg-white/45"}`} />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4 px-5 pt-5 pb-6">
            <div>
              <h2 className="font-display text-[30px] leading-tight font-bold tracking-tight">
                {person.display_name} <span className="font-normal text-muted">{person.age}</span>
              </h2>
              {eventName && (
                <span className="glass-inner mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[13px] font-semibold">
                  {eventName}
                </span>
              )}
            </div>

            <section className="glass-inner rounded-[20px] p-4">
              <p className="text-[13px] font-semibold tracking-wide text-muted uppercase">O mně</p>
              <p className="mt-1.5 text-[17px] leading-snug">
                {person.bio || <span className="text-muted">Zatím o sobě nic nenapsal/a.</span>}
              </p>
            </section>
          </div>
        </div>

        {actions && (
          <div className="flex shrink-0 items-center justify-center gap-6 border-t border-line bg-white/90 px-5 pt-3 pb-safe backdrop-blur">
            {actions}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
