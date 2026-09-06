import { Search } from "lucide-react";
import { useState } from "react";
import Button from "../../../shared/components/Button";
import { useDebouncedValue } from "../../../shared/hooks";
// Narrow subpath imports — only the lead list hook and its badge are
// needed here, not the whole Leads feature graph. Same posture as
// OrderInvoiceSection reaching into Invoices for one badge.
import { LeadStatusBadge } from "../../leads/components/LeadBadges";
import { useLeadList } from "../../leads/hooks";

/**
 * Lead picker for taking an order.
 *
 * Deliberately NOT QuotationLeadSelector: that one filters to QUALIFIED
 * leads only, because a quotation is a formal offer made to a qualified
 * prospect. An order taken in the field is the opposite situation — the
 * customer has already said yes, and that sale IS the qualification — so
 * the backend accepts any ACTIVE lead here (see
 * OrderService.createDirectOrder). Reusing the quotation selector would
 * have silently hidden most of a field officer's own leads from them.
 */
export default function OrderLeadSelector({ locked = false, onSelect, selectedLead }) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const leadsState = useLeadList(
    { limit: 20, search: debouncedSearch, sortBy: "name", sortOrder: "asc" },
    { enabled: !selectedLead },
  );
  const leads = leadsState.data?.leads || [];

  if (selectedLead) {
    return (
      <div className="rounded-lg border border-forest/10 bg-mint/50 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-black text-ink">{selectedLead.name || "Unnamed Lead"}</p>
            <p className="mt-1 text-xs font-semibold text-muted">
              {[selectedLead.leadCode, selectedLead.companyName, selectedLead.phone].filter(Boolean).join(" | ")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <LeadStatusBadge status={selectedLead.status} />
            {!locked ? (
              <Button onClick={() => onSelect(null)} type="button" variant="secondary">
                Change
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-forest/10 bg-white p-4">
      <label>
        <span className="form-label">Customer / Lead</span>
        <span className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            className="form-field pl-10"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search lead code, name or phone"
            type="search"
            value={search}
          />
        </span>
      </label>

      {leadsState.isLoading ? <p className="mt-3 text-sm text-muted">Loading leads...</p> : null}
      {leadsState.isError ? (
        <p className="mt-3 text-sm font-semibold text-red-700">{leadsState.errorMessage}</p>
      ) : null}

      {!leadsState.isLoading && !leadsState.isError ? (
        <ul className="mt-3 max-h-72 divide-y divide-forest/10 overflow-y-auto rounded-lg border border-forest/10">
          {leads.map((lead) => (
            <li className="flex items-center justify-between gap-3 px-3 py-2.5" key={lead._id}>
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-ink">{lead.name || "Unnamed Lead"}</p>
                <p className="mt-0.5 text-xs font-semibold text-muted">
                  {[lead.leadCode, lead.companyName, lead.phone].filter(Boolean).join(" | ")}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <LeadStatusBadge status={lead.status} />
                <Button onClick={() => onSelect(lead)} type="button" variant="secondary">
                  Select
                </Button>
              </div>
            </li>
          ))}
          {!leads.length ? (
            <li className="px-3 py-4 text-center text-sm text-muted">No leads matched.</li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
