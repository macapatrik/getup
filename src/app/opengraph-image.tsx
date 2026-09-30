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
          background: "#ffffff",
          color: "#12151c",
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
            background: "linear-gradient(135deg, #f759f5, #3e36ed)",
            boxShadow: "0 30px 60px -30px rgba(247,89,245,0.6)",
          }}
        >
          <img src={MARK_SVG} width={116} height={116} alt="" />
        </div>
        <div style={{ display: "flex", marginTop: 44, fontSize: 96, fontWeight: 800, letterSpacing: -3 }}>
          <span style={{ color: "#f759f5" }}>GetTogether</span>
        </div>
        <div style={{ marginTop: 10, fontSize: 40, color: "#616568" }}>{APP_TAGLINE}</div>
        <div style={{ marginTop: 56, fontSize: 26, letterSpacing: 6, color: "#9a9ea3", textTransform: "uppercase" }}>by GetUp</div>
      </div>
    ),
    size,
  );
}
