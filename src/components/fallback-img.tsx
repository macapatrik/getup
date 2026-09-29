"use client";

import { useEffect, useRef, useState } from "react";

/** <img>, který se při chybě načtení schová (pod ním zůstane barevné pozadí). */
export function FallbackImg(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const ref = useRef<HTMLImageElement>(null);
  const [failed, setFailed] = useState(false);

  // Obrázek mohl selhat ještě před hydratací – onError by pak nepřišel.
  useEffect(() => {
    const img = ref.current;
    if (img?.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  if (failed) return null;
  return <img ref={ref} alt="" {...props} onError={() => setFailed(true)} />;
}
