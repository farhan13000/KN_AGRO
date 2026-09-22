import { useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Button from "../../../shared/components/Button";
import DocumentPrintActions from "../../../shared/components/DocumentPrintActions";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { useDSRDetail } from "../hooks";
import DSRPrintView from "./DSRPrintView";

/**
 * The printable DSR sheet, with the same Print / Download bar as every
 * other document. Opened with `?download=1` (the Download PDF button on
 * a DSR card) it saves the file by itself once loaded, which is all that
 * link was ever for.
 *
 * Captured landscape and wider than the others: the sheet is a ruled
 * grid whose own @page rule already says A4 landscape, and the columns
 * are the point of it.
 */
export default function DSRPrintRouteView({ backTo }) {
  const { dsrId } = useParams();
  const [searchParams] = useSearchParams();
  const state = useDSRDetail(dsrId);
  const dsr = state.data?.dsr;

  // The stored date is IST midnight expressed in UTC, so it is formatted in
  // the business timezone — toISOString() would name the previous day.
  const fileTitle = dsr
    ? `DSR-${(dsr.employee?.user?.name || "employee").replace(/\s+/g, "-")}-${new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
      }).format(new Date(dsr.date))}`
    : "DSR";

  useEffect(() => {
    if (!dsr) return undefined;
    // Still set, because Print (the browser's own dialog) names the saved
    // file after the page title. The Download button names it itself.
    const previousTitle = document.title;
    document.title = fileTitle;
    return () => {
      document.title = previousTitle;
    };
  }, [dsr, fileTitle]);

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
      <DocumentPrintActions
        autoDownload={searchParams.get("download") === "1"}
        captureWidth={1100}
        fileName={fileTitle}
        orientation="landscape"
      >
        {backTo ? (
          <Button to={backTo} variant="secondary">
            Back
          </Button>
        ) : null}
      </DocumentPrintActions>
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
