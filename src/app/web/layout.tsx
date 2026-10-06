import type { Metadata, Viewport } from "next";
import { WEB_URL } from "@/lib/config";
import { eventHref, getPublicEvents, splitEvents } from "@/lib/web";
import { anton } from "../tinder/fonts";
import { WebFooter } from "./footer";
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

export const viewport: Viewport = { themeColor: "#07060a", viewportFit: "cover" };

export default async function WebLayout({ children }: LayoutProps<"/web">) {
  const { upcoming } = splitEvents(await getPublicEvents());
  const next = upcoming[0];
  return (
    <div className={`gu ${anton.variable} flex min-h-dvh flex-col bg-night text-white`}>
      <WebHeader cta={next ? { href: eventHref(next), label: "Nejbližší akce" } : null} />
      <div className="flex-1">{children}</div>
      <WebFooter />
    </div>
  );
}
