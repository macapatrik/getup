import { renderAppIcon } from "@/lib/app-icon";
import { isHalloween } from "@/lib/theme";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  return renderAppIcon(size.width, { halloween: await isHalloween() });
}
