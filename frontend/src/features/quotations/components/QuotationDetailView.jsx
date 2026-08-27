import { Printer } from "lucide-react";
import Button from "../../../shared/components/Button";
import Card from "../../../shared/components/Card";
import QuotationAmountSummary from "./QuotationAmountSummary";
import QuotationHeader from "./QuotationHeader";
import QuotationItemTable from "./QuotationItemTable";
import QuotationLeadContextSection from "./QuotationLeadContextSection";
import QuotationLifecycleActions from "./QuotationLifecycleActions";
import QuotationRevisionInfo from "./QuotationRevisionInfo";

// The shared detail composition (Prompt 21): Header (incl. Status, Prompt
// 22), Lifecycle Actions (Prompts 27-30, 33), Revision Information (Prompt
// 34, only renders for an actual revision), Lead Context (Prompt 23),
// Items, Commercial Summary, Notes/Terms.
//
// Every field rendered here comes straight from the backend `quotation`
// response — items are rendered via QuotationItemTable, which only reads
// each item's own saved snapshot fields (productCode/productName/unit/
// rate/tax/...), never a fresh Product lookup (Prompt 24 audit: already
// compliant, no fix needed — see phase5_frontend_progress.md).
export default function QuotationDetailView({
  editPath = "",
  leadDetailPath = "",
  onMutationSuccess,
  onOrderCreated,
  onRevised,
  orderDetailPath = "",
  parentDetailPath = "",
  printPath = "",
  quotation,
  roleLabel = "CRM",
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <QuotationHeader orderDetailPath={orderDetailPath} quotation={quotation} roleLabel={roleLabel} />
        {printPath ? (
          <Button className="shrink-0" to={printPath} variant="secondary">
            <Printer className="h-4 w-4" />
            Print
          </Button>
        ) : null}
      </div>

      <QuotationLifecycleActions
        editPath={editPath}
        onOrderCreated={onOrderCreated}
        onRevised={onRevised}
        onSuccess={onMutationSuccess}
        quotation={quotation}
      />

      <QuotationRevisionInfo parentDetailPath={parentDetailPath} quotation={quotation} />

      <QuotationLeadContextSection lead={quotation.lead} leadDetailPath={leadDetailPath} />

      <Card className="p-5">
        <h2 className="text-lg font-black text-ink">Items</h2>
        <div className="mt-4">
          <QuotationItemTable items={quotation.items || []} />
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="p-5">
          <h2 className="text-lg font-black text-ink">Notes &amp; Terms</h2>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-muted">Notes</p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-ink">{quotation.notes || "Not Set"}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-muted">Terms &amp; Conditions</p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-ink">
                {quotation.termsAndConditions || "Not Set"}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="text-lg font-black text-ink">Commercial Summary</h2>
          <div className="mt-4">
            <QuotationAmountSummary quotation={quotation} />
          </div>
        </Card>
      </div>
    </div>
  );
}
