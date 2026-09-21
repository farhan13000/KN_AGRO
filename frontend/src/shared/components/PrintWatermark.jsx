import logo from "../../assets/KN_AGRO_LOGO.png";

/**
 * The company logo, faint, behind a printable document.
 *
 * Drawn as an `<img>` rather than a CSS background on purpose: browsers
 * drop background images from printouts by default, and nobody printing an
 * invoice should have to find the "Background graphics" checkbox first. An
 * `<img>` prints like any other picture, and `print-color-adjust: exact`
 * stops the browser lightening it further — so the mark looks the same on
 * screen and on paper.
 *
 * On screen it is absolutely placed in the middle of the sheet. When
 * printing it switches to `fixed`, which browsers repeat on every printed
 * page — so a three-page invoice carries the mark on all three, not just
 * the first.
 *
 * The parent must be positioned (`relative`), and the document's own
 * content must sit in a `relative` wrapper after this, so text stacks
 * above the mark.
 */
export default function PrintWatermark({ className = "" }) {
  return (
    <img
      alt=""
      aria-hidden="true"
      className={`pointer-events-none absolute left-1/2 top-1/2 z-0 w-[55%] max-w-[420px] -translate-x-1/2 -translate-y-1/2 select-none opacity-[0.06] print:fixed ${className}`}
      src={logo}
      style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}
    />
  );
}
