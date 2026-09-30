import { ImageResponse } from "next/og";
import { APP_NAME, APP_TAGLINE } from "@/lib/config";
import { logoMarkSvg } from "@/lib/logo-mark";

// Náhled při sdílení odkazu (WhatsApp, Instagram, Messenger, iMessage).
export const alt = `${APP_NAME} – ${APP_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const MARK_SVG = "data:image/svg+xml;utf8," + encodeURIComponent(logoMarkSvg());

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f5f7",
          color: "#1d1d1f",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 168,
            height: 168,
            borderRadius: 44,
            background: "#ff6a15",
            boxShadow: "0 30px 60px -30px rgba(255,106,21,0.6)",
          }}
        >
          <img src={MARK_SVG} width={116} height={116} alt="" />
        </div>
        <div style={{ display: "flex", marginTop: 44, fontSize: 96, fontWeight: 800, letterSpacing: -3 }}>
          <span>Get</span>
          <span style={{ color: "#ff6a15" }}>Together</span>
        </div>
        <div style={{ marginTop: 10, fontSize: 40, color: "#6e6e73" }}>{APP_TAGLINE}</div>
        <div style={{ marginTop: 56, fontSize: 26, letterSpacing: 6, color: "#aeaeb2", textTransform: "uppercase" }}>by GetUp</div>
      </div>
    ),
    size,
  );
}
