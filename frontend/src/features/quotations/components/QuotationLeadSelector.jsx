import { Search } from "lucide-react";
import { useState } from "react";
import Button from "../../../shared/components/Button";
import { useDebouncedValue } from "../../../shared/hooks";
import { LEAD_STATUS, LeadStatusBadge, formatPipelineValue, useLeadList } from "../../leads";

// Only QUALIFIED leads are shown — Phase 5 create is only ever eligible
// against a QUALIFIED lead (see PHASE5_FRONTEND_API_CONTRACT.md), so
// surfacing other statuses here would just guarantee a 400 on submit.
// The backend re-validates eligibility regardless of what this list shows.
// `locked` hides "Change" entirely for the edit flow — the update schema
// has no `leadId` field at all, so an existing quotation's Lead can never
// be changed, not even by resubmitting the same value.
export default function QuotationLeadSelector({ locked = false, onSelect, selectedLead }) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const leadsState = useLeadList(
    { limit: 20, search: debouncedSearch, sortBy: "name", sortOrder: "asc", status: LEAD_STATUS.QUALIFIED },
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
            {locked ? null : (
              <Button onClick={() => onSelect(null)} type="button" variant="secondary">
                Change
              </Button>
            )}
          </div>
        </div>
        {selectedLead.expectedValue ? (
          <p className="mt-2 text-xs font-semibold text-muted">
            Expected Value: {formatPipelineValue(selectedLead.expectedValue)}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-forest/10 bg-white p-4">
      <label>
        <span className="form-label">Qualified Lead</span>
        <span className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            className="form-field pl-10"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search lead code, name, or company"
            type="search"
            value={search}
          />
        </span>
      </label>

      {leadsState.isLoading ? <p className="mt-3 text-sm text-muted">Loading qualified leads...</p> : null}
      {leadsState.isError ? (
        <p className="mt-3 text-sm font-semibold text-red-700">{leadsState.errorMessage}</p>
      ) : null}

      {!leadsState.isLoading && !leadsState.isError ? (
        <ul className="mt-3 max-h-72 divide-y divide-forest/10 overflow-y-auto rounded-lg border border-forest/10">
          {leads.map((lead) => (
            <li className="flex items-center justify-between gap-3 px-3 py-2.5" key={lead._id}>
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-ink">{lead.name || "Unnamed Lead"}</p>
                <p className="mt-0.5 truncate text-xs font-semibold text-muted">
                  {[lead.leadCode, lead.companyName, lead.phone].filter(Boolean).join(" | ")}
                  {lead.expectedValue ? ` · ${formatPipelineValue(lead.expectedValue)}` : ""}
                </p>
              </div>
              <Button onClick={() => onSelect(lead)} type="button" variant="secondary">
                Select
              </Button>
            </li>
          ))}
          {!leads.length ? (
            <li className="px-3 py-4 text-center text-sm text-muted">No qualified leads matched.</li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
