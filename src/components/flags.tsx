// Small flag drawings for the language switch (inline SVG: no image files, sharp everywhere, also on
// Windows, which does not draw flag emojis). Decorative: the link around them carries the language name.
// Both fill the same small box; `slice` trims the edges instead of stretching the different shapes.

const box = "h-3.5 w-5 shrink-0 rounded-[2px] ring-1 ring-black/15";

// Nigeria: green, white, green vertical stripes (1:2).
export function NigeriaFlag() {
  return (
    <svg viewBox="0 0 6 3" preserveAspectRatio="xMidYMid slice" aria-hidden className={box}>
      <rect width="6" height="3" fill="#008751" />
      <rect x="2" width="2" height="3" fill="#ffffff" />
    </svg>
  );
}

// Qatar: maroon with a white band at the hoist and a 9-point serrated edge (11:28).
// Each point is 11/18 high; the white part runs from x=0 to x=8, the teeth reach x=11.
// The box is much shorter than the real flag, so the view shows x 3–20 (white band, teeth, maroon in
// about the real proportions) instead of cutting off most of the maroon.
const t = 11 / 18;
const teeth = Array.from({ length: 19 }, (_, i) => `${i % 2 ? 11 : 8},${(i * t).toFixed(3)}`).join(" ");

export function QatarFlag() {
  return (
    <svg viewBox="3 0 17 11" preserveAspectRatio="xMidYMid slice" aria-hidden className={box}>
      <rect width="28" height="11" fill="#8A1538" />
      <polygon points={`0,0 ${teeth} 0,11`} fill="#ffffff" />
    </svg>
  );
}
