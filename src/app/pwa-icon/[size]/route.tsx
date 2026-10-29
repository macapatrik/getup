import { renderAppIcon } from "@/lib/app-icon";

export const dynamicParams = false;

// 192 a 512 = původní ikona (manifest), h… = halloweenská (manifest, favicon a ikona pro iPhone na halloweenské adrese)
export function generateStaticParams() {
  return [{ size: "192" }, { size: "512" }, { size: "h64" }, { size: "h180" }, { size: "h192" }, { size: "h512" }];
}

export async function GET(_request: Request, ctx: RouteContext<"/pwa-icon/[size]">) {
  const { size } = await ctx.params;
  const halloween = size.startsWith("h");
  const px = Number(halloween ? size.slice(1) : size);
  return renderAppIcon(px, { halloween, radius: px === 64 ? 16 : 0 });
}
