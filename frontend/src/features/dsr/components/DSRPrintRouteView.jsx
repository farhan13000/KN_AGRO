import { useEffect, useRef } from "react";
import { Download } from "lucide-react";
import { useParams, useSearchParams } from "react-router-dom";
import Button from "../../../shared/components/Button";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { useDSRDetail } from "../hooks";
import DSRPrintView from "./DSRPrintView";

/**
 * The printable DSR sheet. Same PDF decision as invoices and quotations:
 * window.print() with the browser's "Save as PDF" destination produces
 * the file, no PDF dependency. Opened with `?download=1` (the Download
 * PDF button on a DSR card) it opens that dialog by itself once loaded.
 */
export default function DSRPrintRouteView({ backTo }) {
  const { dsrId } = useParams();
  const [searchParams] = useSearchParams();
  const state = useDSRDetail(dsrId);
  const dsr = state.data?.dsr;
  const printedRef = useRef(false);

  // The stored date is IST midnight expressed in UTC, so it is formatted in
  // the business timezone — toISOString() would name the previous day.
  const fileTitle = dsr
    ? `DSR-${(dsr.employee?.user?.name || "employee").replace(/\s+/g, "-")}-${new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
      }).format(new Date(dsr.date))}`
    : "DSR";

  useEffect(() => {
    if (!dsr) return undefined;
    // The browser names the saved PDF after the page title.
    const previousTitle = document.title;
    document.title = fileTitle;
    let timer;
    if (searchParams.get("download") === "1" && !printedRef.current) {
      printedRef.current = true;
      // Let the logo and fonts paint before the dialog snapshots the page.
      timer = setTimeout(() => window.print(), 600);
    }
    return () => {
      clearTimeout(timer);
      document.title = previousTitle;
    };
  }, [dsr, fileTitle, searchParams]);

  if (state.isLoading) return <PageLoader message="Loading DSR..." />;
  if (state.isError) return <ErrorState message={state.errorMessage} title="Unable to load DSR" />;
  if (!dsr) {
    return (
      <EmptyState
        actionLabel="Back To DSRs"
        actionTo={backTo}
        description="The selected DSR could not be found or is outside your allowed scope."
        title="DSR not found"
      />
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="text-sm text-muted">
          Choose <b>Save as PDF</b> as the printer to download.
        </p>
        <div className="flex gap-3">
          {backTo ? (
            <Button to={backTo} variant="secondary">
              Back
            </Button>
          ) : null}
          <Button onClick={() => window.print()}>
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>
      {/* The sheet is held at its A4-landscape width from `md` up, where
          the ruled grid is the point of it. On a phone that 1,000px floor
          was what pushed half the columns past the edge, so below `md`
          the sheet takes the screen width and its rows stack instead —
          see `.doc-table` in index.css. Printing is unaffected either
          way. */}
      <div className="md:overflow-x-auto">
        <div className="md:min-w-[1000px] print:min-w-0">
          <DSRPrintView dsr={dsr} />
        </div>
      </div>
    </div>
  );
}
