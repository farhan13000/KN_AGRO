import { useEffect, useRef, useState } from "react";
import { Download, Printer } from "lucide-react";
import Button from "./Button";
import { downloadDocumentPdf } from "../utils/documentPdf";

/**
 * The bar above every printable document — quotation, bill, order, DSR.
 *
 * Two different jobs, so two buttons. Print is for paper and for anyone
 * who already knows their way to "Save as PDF". Download produces the
 * file itself, named after the document, which is what someone needs
 * when they are about to attach it to an email or a WhatsApp message.
 *
 * Finds the sheet by `data-print-sheet` rather than taking a ref: the
 * sheet lives inside each feature's own print view, and threading a ref
 * out through four of them would make every one of those components
 * carry a prop that has nothing to do with what it renders. The
 * attribute is on exactly one element per page, and if it is ever
 * missing the button says so instead of failing quietly.
 */
export default function DocumentPrintActions({
  // Start the download by itself, for the links that exist only to
  // produce the file (the Download PDF button on a DSR card opens this
  // page and nothing else). Runs once, and the buttons stay usable, so
  // a failed automatic attempt is never a dead end.
  autoDownload = false,
  captureWidth,
  children,
  fileName,
  orientation,
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const startedRef = useRef(false);

  const handleDownload = async () => {
    setError("");
    setIsSaving(true);
    try {
      await downloadDocumentPdf(document.querySelector("[data-print-sheet]"), fileName, {
        captureWidth,
        orientation,
      });
    } catch (downloadError) {
      setError(
        downloadError?.message ||
          "The PDF could not be made. You can still use Print and choose “Save as PDF”."
      );
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!autoDownload || startedRef.current) return;
    startedRef.current = true;
    // A short wait so webfonts and the sheet's own layout have settled —
    // html2canvas photographs whatever is there at that instant.
    const timer = setTimeout(handleDownload, 800);
    return () => clearTimeout(timer);
    // Deliberately once, on mount: re-running would download again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoDownload]);

  return (
    <div className="mb-4 print:hidden">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        {children}
        <Button onClick={() => window.print()} variant="secondary">
          <Printer className="h-4 w-4" />
          Print
        </Button>
        <Button disabled={isSaving} onClick={handleDownload} variant="secondary">
          <Download className="h-4 w-4" />
          {isSaving ? "Preparing PDF..." : "Download PDF"}
        </Button>
      </div>
      {error ? (
        <p
          className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
