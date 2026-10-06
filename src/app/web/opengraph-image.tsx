import { ImageResponse } from "next/og";
import * as assets from "../_og/assets";
import { getupMark } from "./_og/mark";

// Náhled při sdílení webu get-up.fun: černá, značka GetUp a slogan.
export const alt = "GetUp · Párty v Českých Budějovicích";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function font(b64: string): ArrayBuffer {
  const buf = Buffer.from(b64, "base64");
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

export function ogFonts() {
  return [
    { name: "Urbanist", data: font(assets.fontExtraBold), weight: 800 as const, style: "normal" as const },
    { name: "Urbanist", data: font(assets.fontMedium), weight: 500 as const, style: "normal" as const },
  ];
}

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #07060a 0%, #14102a 60%, #1d1850 100%)",
          color: "white",
          fontFamily: "Urbanist",
        }}
      >
        <img src={`data:image/png;base64,${getupMark}`} width={240} height={140} alt="" />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 104, fontWeight: 800, lineHeight: 0.95, letterSpacing: -3 }}>Párty v Českých Budějovicích.</div>
          <div style={{ marginTop: 28, fontSize: 34, fontWeight: 500, color: "rgba(255,255,255,0.7)" }}>
            Klub K2 · předprodej na Eventlooku · seznamka GetCrush jen pro lidi z akce
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: ogFonts() },
  );
}
