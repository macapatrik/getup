import type { Metadata, Viewport } from "next";
import { WEB_URL } from "@/lib/config";
import { eventHref, getPublicEvents, splitEvents } from "@/lib/web";
import { yellowtail } from "../tinder/fonts";
import { WebFooter } from "./footer";
import { unbounded } from "./fonts";
import { WebHeader } from "./header";

// Web GetUp (get-up.fun). Stránky jsou ve složce /web, na doménu je mapuje src/proxy.ts podle hostitele.

export const WEB_TITLE = "GetUp · Párty v Českých Budějovicích";
export const WEB_DESCRIPTION =
  "GetUp pořádá párty v Českých Budějovicích: tematické akce v Klubu K2, předprodej na Eventlooku a seznamka GetCrush jen pro lidi z akce.";

export const metadata: Metadata = {
  metadataBase: new URL(WEB_URL),
  // absolute: šablona kořenového layoutu („· GetCrush“) se na web nevztahuje; template platí pro podstránky
  title: { absolute: WEB_TITLE, template: "%s · GetUp" },
  description: WEB_DESCRIPTION,
  applicationName: "GetUp",
  appleWebApp: { capable: false, title: "GetUp" },
  openGraph: { title: WEB_TITLE, description: WEB_DESCRIPTION, siteName: "GetUp", locale: "cs_CZ", type: "website", url: "/" },
  twitter: { card: "summary_large_image", title: WEB_TITLE, description: WEB_DESCRIPTION },
};

export const viewport: Viewport = { themeColor: "#140a2e", viewportFit: "cover" };

export default async function WebLayout({ children }: LayoutProps<"/web">) {
  const { upcoming } = splitEvents(await getPublicEvents());
  const next = upcoming[0];
  return (
    <div className={`gu ${unbounded.variable} ${yellowtail.variable} relative flex min-h-dvh flex-col overflow-x-clip bg-party text-white`}>
      {/* Živé pozadí: plující barevné skvrny a zrno přes celý web */}
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
        <span className="blob-drift absolute top-[-10%] left-[-10%] size-[60vw] rounded-full bg-[#7a3ff0]/40 blur-3xl" />
        <span className="blob-drift absolute top-[30%] right-[-15%] size-[55vw] rounded-full bg-accent/25 blur-3xl [--drift-delay:-8s]" />
        <span className="blob-drift absolute bottom-[-20%] left-[20%] size-[50vw] rounded-full bg-cyan/15 blur-3xl [--drift-delay:-14s]" />
        <span className="gu-grain absolute inset-0" />
      </div>
      <WebHeader cta={next ? { href: eventHref(next), label: "Nejbližší akce" } : null} />
      <div className="flex-1">{children}</div>
      <WebFooter />
    </div>
  );
}
