import { readFileSync } from "node:fs";
import path from "node:path";
import { COSTUME_PRIZE } from "@/lib/config";

// Náhled při sdílení halloweenské adresy (soutěž o kostým): smrtka z plakátu, rudý nápis HALLOWEEN a výhra.
// Obrázky se čtou při buildu (náhled je statický), zdroj je public/halloween (hero.webp, title-900.webp).
const file = (name: string, type: string) =>
  `data:${type};base64,${readFileSync(path.join(process.cwd(), "src/app/_og", name)).toString("base64")}`;

const BLOOD = "#e0141c";
const BONE = "#f3ede6";
const ASH = "#a59d96";

export function HalloweenOg() {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#07060a", fontFamily: "Urbanist", color: BONE }}>
      <img src={file("halloween-hero.jpg", "image/jpeg")} width={1200} height={630} style={{ position: "absolute", inset: 0, objectFit: "cover" }} alt="" />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          backgroundImage: "linear-gradient(90deg, rgba(7,6,10,0.96) 0%, rgba(7,6,10,0.85) 42%, rgba(7,6,10,0.1) 75%)",
        }}
      />
      <div style={{ position: "absolute", left: 72, top: 0, height: "100%", width: 640, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 26, fontWeight: 800, letterSpacing: 5, color: BONE }}>SOUTĚŽ O KOSTÝM</div>
          <div style={{ display: "flex", marginLeft: 14, fontSize: 16, fontWeight: 700, letterSpacing: 4, color: ASH }}>BY GETUP</div>
        </div>
        <img src={file("halloween-title.png", "image/png")} width={560} height={187} style={{ marginTop: 26, marginLeft: -8 }} alt="" />
        <div style={{ display: "flex", marginTop: 18, fontSize: 52, fontWeight: 800, lineHeight: 1.05, letterSpacing: -1 }}>Hlasuj o nejlepší kostým.</div>
        <div style={{ display: "flex", marginTop: 18, fontSize: 25, lineHeight: 1.35, color: ASH, fontWeight: 500, maxWidth: 600 }}>
          {`Nahraj svůj kostým, rozdej 3 hlasy a sleduj živé pořadí. Vítěz bere ${COSTUME_PRIZE} v hotovosti.`}
        </div>
        <div style={{ display: "flex", marginTop: 30, alignItems: "center" }}>
          <div style={{ display: "flex", padding: "13px 24px", borderRadius: 14, background: BLOOD, color: "white", fontSize: 23, fontWeight: 700 }}>
            halloween.get-up.fun
          </div>
          <div style={{ display: "flex", marginLeft: 14, padding: "13px 20px", borderRadius: 14, border: "2px solid rgba(224,20,28,0.8)", fontSize: 21, fontWeight: 700 }}>
            30. 10. 2026 · Klub K2
          </div>
        </div>
      </div>
    </div>
  );
}
