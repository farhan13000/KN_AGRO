import { Link } from "react-router-dom";
import Card from "../../../shared/components/Card";

const DetailRow = ({ label, value }) => (
  <div className="rounded-lg border border-forest/10 bg-white px-4 py-3">
    <dt className="text-xs font-black uppercase tracking-[0.12em] text-muted">{label}</dt>
    <dd className="mt-1 break-words text-sm font-semibold leading-6 text-ink">{value || "Not Set"}</dd>
  </div>
);

// Renders only what the quotation response already embeds for its Lead
// (leadCode/name/companyName/phone/email/status) — deliberately does not
// fetch the full Lead record just to show extra fields like Location,
// which would be exactly the "over-fetch unrelated CRM data" this section
// is told to avoid. A link to the full Lead detail page covers that need.
export default function QuotationLeadContextSection({ lead, leadDetailPath }) {
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-black text-ink">Lead</h2>
        {leadDetailPath && lead?._id ? (
          <Link className="text-sm font-bold text-forest hover:underline" to={leadDetailPath}>
            View Lead
          </Link>
        ) : null}
      </div>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <DetailRow label="Lead Code" value={lead?.leadCode} />
        <DetailRow label="Name" value={lead?.name} />
        <DetailRow label="Company" value={lead?.companyName} />
        <DetailRow label="Phone" value={lead?.phone} />
        <DetailRow label="Email" value={lead?.email} />
      </dl>
    </Card>
  );
}
