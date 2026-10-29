import { renderAppIcon } from "@/lib/app-icon";

// Favicon: stejná ikona jako na ploše telefonu, se zaoblenými rohy. Halloweenskou verzi nastavuje themeMetadata.
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return renderAppIcon(size.width, { radius: 16 });
}
