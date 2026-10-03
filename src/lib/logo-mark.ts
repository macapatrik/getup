// Logo GetCrush: srdce ze dvou průsvitných polovin, které se uprostřed překrývají
// (dva lidi, jedno srdce). Souřadnice ve viewBoxu 0 0 24 24.
export const LOGO_LEFT = "M12 20 5.08 11.93A4.5 4.5 0 1 1 12.98 9.42Z";
export const LOGO_RIGHT = "M12 20 18.92 11.93A4.5 4.5 0 1 0 11.02 9.42Z";

export const LOGO_LEFT_OPACITY = 0.96;
export const LOGO_RIGHT_OPACITY = 0.7;

/** Značka jako samostatné SVG (pro generované PNG ikony). */
export function logoMarkSvg(color = "#ffffff") {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">` +
    `<path d="${LOGO_LEFT}" fill="${color}" fill-opacity="${LOGO_LEFT_OPACITY}"/>` +
    `<path d="${LOGO_RIGHT}" fill="${color}" fill-opacity="${LOGO_RIGHT_OPACITY}"/>` +
    `</svg>`
  );
}
