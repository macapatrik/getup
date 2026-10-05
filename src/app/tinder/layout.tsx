import type { Metadata, Viewport } from "next";
import { APP_NAME } from "@/lib/config";
import { EVENT } from "./event";
import { anton, yellowtail } from "./fonts";

const description = `${EVENT.weekday} ${EVENT.dateLabel}, ${EVENT.venue} ${EVENT.city}. ${EVENT.claim}: ${APP_NAME} by GetUp. Start ${EVENT.doors}, předprodej na ${EVENT.ticketsLabel}.`;

export const metadata: Metadata = {
  title: { absolute: `${EVENT.name} · ${EVENT.dateLabel} · ${EVENT.venue} ${EVENT.city}` },
  description,
  openGraph: {
    title: `${EVENT.name} · ${EVENT.dateLabel}`,
    description,
    siteName: "GetUp",
    locale: "cs_CZ",
    type: "website",
    url: "/tinder",
  },
  twitter: { card: "summary_large_image", title: `${EVENT.name} · ${EVENT.dateLabel}`, description },
};

export const viewport: Viewport = {
  themeColor: "#130611",
  viewportFit: "cover",
};

export default function TinderLayout({ children }: LayoutProps<"/tinder">) {
  return <div className={`tp ${anton.variable} ${yellowtail.variable} min-h-dvh bg-plum text-white`}>{children}</div>;
}
