import { ImageResponse } from "next/og";
import { formatDate, formatTime } from "@/lib/format";
import { VENUE, eventHue, getPublicEvents, weekdayOf } from "@/lib/web";
import { getupMark } from "../../_og/mark";
import { ogFonts, size } from "../../opengraph-image";

// Náhled při sdílení detailu akce: barva podle názvu, název, datum a místo.
export const alt = "Akce GetUp";
export { size };
export const contentType = "image/png";

export default async function EventOpenGraphImage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const event = (await getPublicEvents()).find((e) => e.id === id);
  const name = event?.name ?? "GetUp";
  const hue = eventHue(name);
  const weekday = event ? weekdayOf(event.starts_at) : "";
  const when = event ? `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${formatDate(event.starts_at)} od ${formatTime(event.starts_at)}` : "";
  const where = event?.venue || `${VENUE.name}, ${VENUE.city}`;
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
          background: `linear-gradient(160deg, hsl(${hue} 70% 18%), hsl(${(hue + 50) % 360} 80% 42%))`,
          color: "white",
          fontFamily: "Urbanist",
        }}
      >
        <img src={`data:image/png;base64,${getupMark}`} width={190} height={110} alt="" />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: name.length > 24 ? 76 : 100, fontWeight: 800, lineHeight: 0.95, letterSpacing: -2 }}>{name}</div>
          <div style={{ marginTop: 24, fontSize: 34, fontWeight: 500, color: "rgba(255,255,255,0.8)" }}>{when}</div>
          <div style={{ display: "flex", marginTop: 8, fontSize: 30, fontWeight: 500, color: "rgba(255,255,255,0.65)" }}>
            {where}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: ogFonts() },
  );
}
