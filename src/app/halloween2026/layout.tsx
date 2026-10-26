import type { Viewport } from "next";
import { metalMania } from "../halloween/fonts";

export const viewport: Viewport = {
  themeColor: "#07060a",
  viewportFit: "cover",
};

/** Halloween 2026 na hlavní doméně (get-up.fun/halloween2026): tmavý motiv plakátu. */
export default function Halloween2026Layout({ children }: LayoutProps<"/halloween2026">) {
  return <div className={`hw ${metalMania.variable} min-h-dvh bg-night text-bone`}>{children}</div>;
}
