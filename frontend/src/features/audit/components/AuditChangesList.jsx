import { ArrowRight } from "lucide-react";
import { titleCaseAuditValue } from "../constants";

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

// Only scalar (or short-object) metadata keys are shown — this is the
// doc's own "falls back gracefully... showing whatever metadata scalars
// exist" path, deliberately not a raw JSON dump of the whole metadata
// blob.
const scalarMetadataEntries = (metadata) =>
  Object.entries(metadata || {}).filter(([, value]) => value !== null && typeof value !== "object");

/**
 * Renders a bounded audit diff — Phase 16's `changes: [{field, before,
 * after}]` array when present (the primary, intended shape), or a
 * scalar-only `metadata` fallback for older entries that predate
 * `changes` (per this phase's own acceptance criteria). Never dumps
 * `before`/`after` as raw JSON here — see AuditLogDetailModal for the
 * opt-in full-record view.
 */
export default function AuditChangesList({ changes, metadata }) {
  if (changes?.length) {
    return (
      <ul className="space-y-1.5">
        {changes.map((change, index) => (
          <li className="flex flex-wrap items-center gap-2 text-sm" key={`${change.field}-${index}`}>
            <span className="font-semibold text-ink">{titleCaseAuditValue(change.field)}:</span>
            <span className="text-muted">{formatValue(change.before)}</span>
            <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 text-agriculture" />
            <span className="font-semibold text-forest">{formatValue(change.after)}</span>
          </li>
        ))}
      </ul>
    );
  }

  const metadataEntries = scalarMetadataEntries(metadata);
  if (metadataEntries.length) {
    return (
      <ul className="space-y-1.5">
        {metadataEntries.map(([key, value]) => (
          <li className="flex flex-wrap items-center gap-2 text-sm" key={key}>
            <span className="font-semibold text-ink">{titleCaseAuditValue(key)}:</span>
            <span className="text-muted">{formatValue(value)}</span>
          </li>
        ))}
      </ul>
    );
  }

  return <p className="text-sm text-muted">No detailed change data recorded for this entry.</p>;
}
