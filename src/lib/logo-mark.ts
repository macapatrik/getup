// Logo GetCrush: plné srdce lehce nakloněné, v pravém laloku záblesk (crush) a nad ním malá jiskra,
// na levém laloku lesk. Souřadnice ve viewBoxu 0 0 24 24, barva z currentColor.
export const LOGO_ROTATE = "rotate(-10 12 12)";
// Srdce se zábleskem vyříznutým uvnitř (fill-rule evenodd)
export const LOGO_HEART =
  "M12 21.2C7.2 16.9 3 13.6 3 9.3 3 6.5 5.1 4.4 7.7 4.4c1.8 0 3.3 1 4.3 2.5 1-1.5 2.5-2.5 4.3-2.5 2.6 0 4.7 2.1 4.7 4.9 0 4.3-4.2 7.6-9 11.9Z" +
  "M16.4 6.2l.65 1.75 1.75.65-1.75.65-.65 1.75-.65-1.75-1.75-.65 1.75-.65Z";
// Malá jiskra vpravo nahoře
export const LOGO_SPARK = "M20.6 1.9l.45 1.15 1.15.45-1.15.45-.45 1.15-.45-1.15-1.15-.45 1.15-.45Z";
// Lesk na levém laloku
export const LOGO_SHINE = "M6.2 8.6c.3-1.3 1.2-2.2 2.4-2.5.5-.1.8.4.4.8-.8.6-1.4 1.3-1.8 2.1-.3.5-1.1.3-1-.4Z";

/** Značka jako samostatné SVG (pro generované PNG ikony). */
export function logoMarkSvg(color = "#ffffff") {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">` +
    `<g transform="${LOGO_ROTATE}">` +
    `<path d="${LOGO_HEART}" fill="${color}" fill-rule="evenodd"/>` +
    `<path d="${LOGO_SPARK}" fill="${color}"/>` +
    `<path d="${LOGO_SHINE}" fill="#fff" fill-opacity="0.45"/>` +
    `</g></svg>`
  );
}
