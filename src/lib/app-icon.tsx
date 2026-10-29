import { ImageResponse } from "next/og";
import { logoMarkSvg } from "./logo-mark";

const MARK_SVG = "data:image/svg+xml;utf8," + encodeURIComponent(logoMarkSvg());

// Pozadí ikony: růžovo-indigový přechod, v halloweenské verzi krvavě červená do noci jako na plakátu.
const BACKGROUND = {
  default: "linear-gradient(135deg, #f759f5, #3e36ed)",
  halloween: "linear-gradient(135deg, #ff3b3b 0%, #c0121a 42%, #2a0508 100%)",
};

/** Ikona aplikace jako PNG (pro PWA manifest a iOS). Značka má kolem sebe rezervu pro "maskable" ořez. */
export function renderAppIcon(size: number, { radius = 0, halloween = false }: { radius?: number; halloween?: boolean } = {}) {
  const mark = Math.round(size * 0.74);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: halloween ? BACKGROUND.halloween : BACKGROUND.default,
          borderRadius: radius,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background: "linear-gradient(180deg, rgba(255,255,255,0.28), rgba(255,255,255,0) 55%)",
          }}
        />
        <img src={MARK_SVG} width={mark} height={mark} alt="" />
      </div>
    ),
    { width: size, height: size },
  );
}
