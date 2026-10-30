"use client";

import { useState, type ImgHTMLAttributes } from "react";
import { photoSrc, thumbSrc } from "@/lib/photos";

/** Malý náhled fotky kostýmu; starší kostýmy bez náhledu (chyba načtení) spadnou na velkou fotku. */
export function ThumbImg({ path, alt, ...props }: { path: string; alt: string } & Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt">) {
  const [full, setFull] = useState(false);
  return <img {...props} alt={alt} src={full ? photoSrc(path) : thumbSrc(path)} onError={() => setFull(true)} />;
}
