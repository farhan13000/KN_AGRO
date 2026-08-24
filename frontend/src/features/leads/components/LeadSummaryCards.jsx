import Card from "../../../shared/components/Card";
import { formatPipelineValue } from "../utils";

const getSummaryCards = (summary = {}) => [
  { label: "New Leads", value: summary.newLeads ?? 0 },
  { label: "Follow-Ups Due", value: summary.followUpsDue ?? 0 },
  { label: "Qualified Leads", value: summary.qualifiedLeads ?? 0 },
  { label: "Lost Leads", value: summary.lostLeads ?? 0 },
  {
    label: "Pipeline Value",
    value: formatPipelineValue(summary.expectedPipelineValue ?? summary.pipelineValue ?? 0),
  },
];

export default function LeadSummaryCards({ summary }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {getSummaryCards(summary).map((card) => (
        <Card className="p-5" key={card.label}>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-muted">{card.label}</p>
          <p className="mt-2 text-2xl font-black text-ink">{card.value}</p>
        </Card>
      ))}
    </div>
  );
}
