// Dýně s vyřezaným obličejem: značka halloweenské verze (soutěž o kostým) místo srdce seznamky.
// Obličej je vyříznutý (fill-rule evenodd), takže prosvítá pozadí ikony.
const STEM = "M11.3 6.9c-.1-1.9.5-3.5 1.9-4.6l1.4 1.2c-1 .8-1.5 2-1.5 3.4z";
const BODY =
  "M12 6.7c-1.3-.8-3.1-1-4.7-.5C4.3 7.1 2.6 9.9 2.6 13.3c0 3.9 2.5 7 5.8 7.2 1.3.1 2.5-.2 3.6-.9 1.1.7 2.3 1 3.6.9 3.3-.2 5.8-3.3 5.8-7.2 0-3.4-1.7-6.2-4.7-7.1-1.6-.5-3.4-.3-4.7.5zM6.9 12.6l3-.6-1.1 2.6zm10.2 0-3-.6 1.1 2.6zM6.6 15.4c1.6 1 3.4 1.5 5.4 1.5s3.8-.5 5.4-1.5c-.3 1.9-1.5 3.1-3 3.4l-.6-1.1-.9 1.3h-1.8l-.9-1.3-.6 1.1c-1.5-.3-2.7-1.5-3-3.4z";

/** Dýně jako samostatné SVG (pro generované PNG ikony). */
export function pumpkinSvg(color = "#ffffff") {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">` +
    `<path d="${STEM}" fill="${color}"/>` +
    `<path d="${BODY}" fill="${color}" fill-rule="evenodd"/>` +
    `</svg>`
  );
}
