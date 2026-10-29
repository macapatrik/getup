import { renderAppIcon } from "@/lib/app-icon";

export const dynamicParams = false;

// 192 a 512 = původní ikona, h192 a h512 = halloweenská (manifest na halloweenské adrese)
export function generateStaticParams() {
  return [{ size: "192" }, { size: "512" }, { size: "h192" }, { size: "h512" }];
}

export async function GET(_request: Request, ctx: RouteContext<"/pwa-icon/[size]">) {
  const { size } = await ctx.params;
  const halloween = size.startsWith("h");
  return renderAppIcon(Number(halloween ? size.slice(1) : size), { halloween });
}
