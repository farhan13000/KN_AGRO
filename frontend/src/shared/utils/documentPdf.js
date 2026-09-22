/**
 * Turning a printable document on screen into an actual PDF file.
 *
 * WHY A LIBRARY AT ALL. `window.print()` already reaches every browser's
 * own "Save as PDF", and that was the right call while printing was the
 * only need. It stops being enough the moment someone has to SEND the
 * document — a bill to a customer, a quotation to a buyer on WhatsApp.
 * The print dialog cannot produce a file in one press, it cannot name
 * that file, and on a phone it is several taps through a menu most
 * people never find. A Download button is a different job from a Print
 * button, so it gets its own implementation rather than a second button
 * wired to the same call.
 *
 * WHY A RENDERED IMAGE, NOT DRAWN TEXT. jsPDF can draw real vector text,
 * which would give smaller files and selectable content — but only by
 * re-describing every document's layout a second time, in a second
 * language, beside the JSX that already describes it. Those two copies
 * drift: a column added to the invoice on screen is silently missing
 * from the invoice the customer receives, and nothing fails to tell
 * anyone. Capturing what is actually on the page means the PDF is the
 * document, by construction, for all four of them and for whatever is
 * added next.
 *
 * Both libraries are imported only when someone presses Download, so
 * they never enter the bundle everybody else loads.
 */

// Captured at a fixed desktop width, whatever the device is. The
// printable sheets reflow below 768px (see `.doc-table` in index.css),
// which is right for reading on a phone and wrong for a document that
// will be opened on someone else's computer or printed. html2canvas
// lays the clone out in its own window, so `windowWidth` here decides
// which side of that media query the PDF lands on — and it is always
// the paper side.
const DEFAULT_CAPTURE_WIDTH = 920;

// A4 at 72dpi, which is jsPDF's "pt" unit.
const A4 = Object.freeze({ width: 595.28, height: 841.89 });

const pageSize = (orientation) =>
  orientation === "landscape"
    ? { width: A4.height, height: A4.width }
    : { width: A4.width, height: A4.height };

/** `Quotation QUO000012.pdf` → a filename every filesystem accepts. */
const toSafeFileName = (name) =>
  `${String(name || "document")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, " ")
    .trim()}.pdf`;

/**
 * Renders `element` and saves it as an A4 PDF, splitting across pages
 * when it is taller than one sheet.
 *
 * Throws on failure rather than failing quietly — the caller shows the
 * message, because a Download button that does nothing is worse than one
 * that says why.
 */
export const downloadDocumentPdf = async (
  element,
  fileName,
  // A DSR is a wide ruled grid printed sideways (its own @page rule says
  // A4 landscape); a quotation, bill or order is an upright sheet. The
  // PDF follows whichever the document already is on paper.
  { captureWidth = DEFAULT_CAPTURE_WIDTH, orientation = "portrait" } = {}
) => {
  if (!element) throw new Error("There is nothing on this page to save.");

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const canvas = await html2canvas(element, {
    backgroundColor: "#ffffff",
    // 2x so text stays sharp when the capture is scaled down to A4
    // width; higher multiplies the file size for no visible gain.
    scale: 2,
    useCORS: true,
    windowWidth: captureWidth,
    onclone: (_document, clone) => {
      // The sheet centres itself inside whatever it is given. Pin it to
      // the capture width so the clone cannot inherit a phone's.
      clone.style.width = `${captureWidth}px`;
      clone.style.maxWidth = "none";
      clone.style.margin = "0";
    },
  });

  const pdf = new jsPDF({ format: "a4", orientation, unit: "pt" });
  const page = pageSize(orientation);
  const imageHeight = (canvas.height * page.width) / canvas.width;

  // JPEG, not PNG: a full-page PNG of a document runs to megabytes,
  // which is the difference between a bill that sends over WhatsApp and
  // one that does not. At this quality the artefacts are invisible.
  const image = canvas.toDataURL("image/jpeg", 0.95);

  // One tall image, shifted up a page at a time. Anything smarter would
  // have to understand where the document's own rows end, which it
  // cannot — so page breaks land where A4 puts them, exactly as they do
  // when the same sheet is printed.
  let remaining = imageHeight;
  let offset = 0;
  pdf.addImage(image, "JPEG", 0, offset, page.width, imageHeight);
  remaining -= page.height;

  while (remaining > 0) {
    offset -= page.height;
    pdf.addPage();
    pdf.addImage(image, "JPEG", 0, offset, page.width, imageHeight);
    remaining -= page.height;
  }

  pdf.save(toSafeFileName(fileName));
};
