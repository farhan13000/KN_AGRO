import { Link } from "react-router-dom";
import Card from "../../../shared/components/Card";

// Renders only the two revision fields the backend actually exposes on a
// quotation (`revisionNumber`, `parentQuotation`) — there is no
// `revisedBy` field in the real serializer, so nothing is invented here.
// `parentQuotation` is a bare ObjectId; `parentDetailPath` (built by the
// caller from that id) is the only "navigation between revisions" the
// backend supports — it does not expose a forward link from an old
// quotation to whatever it was later revised into.
export default function QuotationRevisionInfo({ parentDetailPath, quotation }) {
  const isRevision = Boolean(quotation.parentQuotation) || Number(quotation.revisionNumber) > 1;
  if (!isRevision) return null;

  return (
    <Card className="p-5">
      <h2 className="text-lg font-black text-ink">Revision Information</h2>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-forest/10 bg-white px-4 py-3">
          <dt className="text-xs font-black uppercase tracking-[0.12em] text-muted">Revision Number</dt>
          <dd className="mt-1 text-sm font-semibold text-ink">{quotation.revisionNumber || 1}</dd>
        </div>
        {quotation.parentQuotation ? (
          <div className="rounded-lg border border-forest/10 bg-white px-4 py-3">
            <dt className="text-xs font-black uppercase tracking-[0.12em] text-muted">Revised From</dt>
            <dd className="mt-1 text-sm font-semibold text-ink">
              {parentDetailPath ? (
                <Link className="text-forest hover:underline" to={parentDetailPath}>
                  View original quotation
                </Link>
              ) : (
                "Not accessible in your scope"
              )}
            </dd>
          </div>
        ) : null}
      </dl>
    </Card>
  );
}
