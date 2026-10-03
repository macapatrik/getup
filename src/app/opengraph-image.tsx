import { ImageResponse } from "next/og";
import { APP_NAME, APP_TAGLINE } from "@/lib/config";
import { logoMarkSvg } from "@/lib/logo-mark";
import * as assets from "./_og/assets";

// Náhled při sdílení odkazu (WhatsApp, Messenger, iMessage, Instagram): karta z balíčku s fotkou,
// štítek „Je to match!“ a slogan. Písmo a fotky jsou přibalené jako base64 v src/app/_og/assets.ts.
export const alt = `${APP_NAME} – ${APP_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PINK = "#f759f5";
const INK = "#12151c";
const MUTED = "#616568";
const MARK_SVG = "data:image/svg+xml;utf8," + encodeURIComponent(logoMarkSvg(PINK));

function font(b64: string): ArrayBuffer {
  const buf = Buffer.from(b64, "base64");
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

const jpeg = (b64: string) => `data:image/jpeg;base64,${b64}`;

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "8px 16px",
        borderRadius: 999,
        border: "2px solid rgba(255,255,255,0.45)",
        color: "white",
        fontSize: 18,
        fontWeight: 500,
      }}
    >
      {children}
    </div>
  );
}

function ActionButton({ size, color, children }: { size: number; color: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: 999,
        background: "white",
        color,
        boxShadow: "0 18px 24px -12px rgba(62,54,237,0.35)",
        fontSize: size * 0.5,
        fontWeight: 800,
      }}
    >
      {children}
    </div>
  );
}

export default function OpenGraphImage() {
  const [medium, bold, extraBold] = [font(assets.fontMedium), font(assets.fontBold), font(assets.fontExtraBold)];
  const [tereza, veronika, jakub, me, klara] = [assets.tereza, assets.veronika, assets.jakub, assets.meAvatar, assets.klaraAvatar].map(jpeg);

  const backCard = (src: string, rotate: string, translate: string) => (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 300,
        height: 430,
        display: "flex",
        borderRadius: 32,
        overflow: "hidden",
        transform: `${translate} ${rotate} scale(0.9)`,
        boxShadow: "0 30px 50px -24px rgba(62,54,237,0.35)",
      }}
    >
      <img src={src} width={300} height={430} style={{ objectFit: "cover" }} alt="" />
    </div>
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "#ffffff",
          color: INK,
          fontFamily: "Urbanist",
        }}
      >
        {/* Jemné barevné plochy v pozadí */}
        <div style={{ position: "absolute", left: -180, top: -200, width: 560, height: 560, borderRadius: 999, background: "#fae8f9" }} />
        <div style={{ position: "absolute", right: -160, bottom: -260, width: 620, height: 620, borderRadius: 999, background: "rgba(62,54,237,0.08)" }} />

        {/* Levý sloupec: logo, titulek, popis, adresa */}
        <div style={{ position: "absolute", left: 80, top: 0, height: "100%", width: 600, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <img src={MARK_SVG} width={48} height={48} alt="" />
            <div style={{ display: "flex", marginLeft: 12, fontSize: 36, fontWeight: 700, color: PINK }}>{APP_NAME}</div>
            <div style={{ display: "flex", marginLeft: 14, fontSize: 16, fontWeight: 700, letterSpacing: 4, color: "#9a9ea3" }}>BY GETUP</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", marginTop: 40, fontSize: 84, fontWeight: 800, lineHeight: 1, letterSpacing: -2 }}>
            <div style={{ display: "flex" }}>Potkej lidi</div>
            <div style={{ display: "flex", color: PINK }}>z koncertu.</div>
          </div>

          <div style={{ display: "flex", marginTop: 28, fontSize: 28, lineHeight: 1.35, color: MUTED, fontWeight: 500, maxWidth: 580 }}>
            Seznamka jen pro lidi ze stejné akce GetUp. Naskenuj QR kód, swipuj a po matchi se ozvi.
          </div>

          <div style={{ display: "flex", marginTop: 40, alignItems: "center" }}>
            <div style={{ display: "flex", padding: "14px 26px", borderRadius: 14, background: PINK, color: "white", fontSize: 24, fontWeight: 700 }}>
              together.get-up.fun
            </div>
            <div style={{ display: "flex", marginLeft: 16, padding: "14px 22px", borderRadius: 14, background: "#f5f5f5", color: INK, fontSize: 22, fontWeight: 700 }}>
              Klub K2 · České Budějovice
            </div>
          </div>
        </div>

        {/* Pravá část: balíček karet */}
        <div style={{ position: "absolute", left: 800, top: 80, width: 300, height: 430, display: "flex" }}>
          {backCard(veronika, "rotate(-12deg)", "translate(-70px, 24px)")}
          {backCard(jakub, "rotate(12deg)", "translate(70px, 24px)")}

          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 300,
              height: 430,
              display: "flex",
              borderRadius: 32,
              overflow: "hidden",
              boxShadow: "0 40px 60px -28px rgba(62,54,237,0.55)",
            }}
          >
            <img src={tereza} width={300} height={430} style={{ objectFit: "cover" }} alt="" />
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: 220,
                display: "flex",
                backgroundImage: "linear-gradient(180deg, rgba(62,54,237,0) 0%, #3e36ed 100%)",
              }}
            />
            <div style={{ position: "absolute", left: 20, right: 20, top: 14, display: "flex" }}>
              <div style={{ display: "flex", flex: 1, height: 4, borderRadius: 2, background: "white" }} />
              <div style={{ display: "flex", flex: 1, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.4)", marginLeft: 4 }} />
              <div style={{ display: "flex", flex: 1, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.4)", marginLeft: 4 }} />
            </div>
            <div style={{ position: "absolute", left: 22, bottom: 64, display: "flex", flexDirection: "column", color: "white" }}>
              <div style={{ display: "flex", fontSize: 34, fontWeight: 700 }}>Tereza</div>
              <div style={{ display: "flex", marginTop: 10 }}>
                <Chip>24 let</Chip>
                <div style={{ display: "flex", marginLeft: 8 }}>
                  <Chip>Klub K2</Chip>
                </div>
              </div>
            </div>
          </div>

          {/* Tlačítka přes spodní okraj karty */}
          <div style={{ position: "absolute", left: 0, width: 300, top: 398, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <ActionButton size={56} color="#3e36ed">
              ×
            </ActionButton>
            <div style={{ display: "flex", margin: "0 16px" }}>
              <ActionButton size={72} color={PINK}>
                <img src={"data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${PINK}"><path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z"/></svg>`)} width={36} height={36} alt="" />
              </ActionButton>
            </div>
            <ActionButton size={56} color="#3e36ed">
              i
            </ActionButton>
          </div>

          {/* Štítek „Je to match!“ */}
          <div
            style={{
              position: "absolute",
              left: 150,
              top: -34,
              display: "flex",
              alignItems: "center",
              padding: "8px 20px 8px 8px",
              borderRadius: 999,
              background: "white",
              boxShadow: "0 20px 40px -18px rgba(0,0,0,0.3)",
              transform: "rotate(6deg)",
            }}
          >
            <img src={me} width={44} height={44} style={{ borderRadius: 999, border: "3px solid white" }} alt="" />
            <img src={klara} width={44} height={44} style={{ borderRadius: 999, border: "3px solid white", marginLeft: -14 }} alt="" />
            <div style={{ display: "flex", marginLeft: 10, fontSize: 22, fontWeight: 700, color: INK }}>Je to match!</div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Urbanist", data: medium, weight: 500, style: "normal" },
        { name: "Urbanist", data: bold, weight: 700, style: "normal" },
        { name: "Urbanist", data: extraBold, weight: 800, style: "normal" },
      ],
    },
  );
}
