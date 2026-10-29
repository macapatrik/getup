import { ImageResponse } from "next/og";
import * as assets from "../../_og/assets";
import { HalloweenOg } from "../../_og/halloween";

// Náhled při sdílení halloweenské verze seznamky (halloween.get-up.fun), statický PNG 1200×630.
export const dynamic = "force-static";

function font(b64: string): ArrayBuffer {
  const buf = Buffer.from(b64, "base64");
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

export function GET() {
  return new ImageResponse(<HalloweenOg />, {
    width: 1200,
    height: 630,
    fonts: [
      { name: "Urbanist", data: font(assets.fontMedium), weight: 500, style: "normal" },
      { name: "Urbanist", data: font(assets.fontBold), weight: 700, style: "normal" },
      { name: "Urbanist", data: font(assets.fontExtraBold), weight: 800, style: "normal" },
    ],
  });
}
