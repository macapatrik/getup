"use client";

import { useRef, useState } from "react";
import { photoUrl } from "@/lib/photos";

/** Fotky vedle sebe s posunem do stran a proužky nahoře (rám 32 px jako u Romio). */
export function PhotoGallery({
  photos,
  alt,
  className = "",
  dotsClassName = "inset-x-4 top-3",
}: {
  photos: string[];
  alt: string;
  className?: string;
  /** Umístění proužků, když nahoře překáží třeba tlačítko zavřít */
  dotsClassName?: string;
}) {
  const [index, setIndex] = useState(0);
  const strip = useRef<HTMLDivElement>(null);

  function onScroll() {
    const el = strip.current;
    if (el) setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  return (
    <div className={`relative overflow-hidden rounded-[32px] bg-fill ${className}`}>
      {/* Pás fotek je absolutně přes celý rám: výška 100 % uvnitř aspect-ratio boxu s max-h se v Safari počítá bez ořezu a fotka přetékala přes jméno. */}
      <div ref={strip} onScroll={onScroll} className="no-scrollbar absolute inset-0 flex snap-x snap-mandatory overflow-x-auto">
        {photos.map((p) => (
          <img key={p} src={photoUrl(p)} alt={alt} className="size-full shrink-0 snap-center object-cover" draggable={false} />
        ))}
      </div>
      {photos.length > 1 && (
        <div className={`absolute flex gap-1 ${dotsClassName}`}>
          {photos.map((p, i) => (
            <span key={p} className={`h-1 flex-1 rounded-full shadow-sm ${i === index ? "bg-white" : "bg-white/45"}`} />
          ))}
        </div>
      )}
    </div>
  );
}
