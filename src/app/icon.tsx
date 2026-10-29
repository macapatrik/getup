import { renderAppIcon } from "@/lib/app-icon";
import { isHalloween } from "@/lib/theme";

// Favicon: stejná ikona jako na ploše telefonu (na halloweenské adrese rudá), se zaoblenými rohy.
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon() {
  return renderAppIcon(size.width, { radius: 16, halloween: await isHalloween() });
}
