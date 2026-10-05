import type { Metadata, Viewport } from "next";
import { EVENT } from "./event";
import { metalMania } from "./fonts";

const description = `${EVENT.weekday} ${EVENT.dateLabel}, ${EVENT.venue} ${EVENT.city}. 2 stage, nejlepší kostým vyhraje ${EVENT.prize}. Start ${EVENT.doors}, předprodej na ${EVENT.ticketsLabel}.`;

export const metadata: Metadata = {
  title: { absolute: `${EVENT.name} · ${EVENT.dateLabel} · ${EVENT.venue} ${EVENT.city}` },
  description,
  openGraph: {
    title: `${EVENT.name} · ${EVENT.dateLabel}`,
    description,
    siteName: "GetUp",
    locale: "cs_CZ",
    type: "website",
    url: "/halloween",
  },
  twitter: { card: "summary_large_image", title: `${EVENT.name} · ${EVENT.dateLabel}`, description },
};

export const viewport: Viewport = {
  themeColor: "#07060a",
  viewportFit: "cover",
};

export default function HalloweenLayout({ children }: LayoutProps<"/halloween">) {
  return <div className={`hw ${metalMania.variable} min-h-dvh bg-night text-bone`}>{children}</div>;
}
