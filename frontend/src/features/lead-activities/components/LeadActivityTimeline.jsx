import { Clock } from "lucide-react";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { formatBusinessDateTime } from "../../../shared/utils";
import { formatLeadActivityType } from "../utils";

export default function LeadActivityTimeline({
  activities = [],
  errorMessage = "",
  isError = false,
  isLoading = false,
}) {
  if (isLoading) return <PageLoader message="Loading activity timeline..." />;
  if (isError) return <ErrorState message={errorMessage} title="Unable to load activity timeline" />;
  if (!activities.length) {
    return (
      <EmptyState
        description="No activity has been recorded for this lead yet."
        title="No activity history"
      />
    );
  }

  return (
    <ol className="space-y-4" aria-label="Lead activity timeline">
      {activities.map((activity) => (
        <li className="rounded-lg border border-forest/10 bg-white p-4 shadow-sm" key={activity._id}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-agriculture">
                {formatLeadActivityType(activity.type)}
              </p>
              <h3 className="mt-1 text-base font-black text-ink">{activity.title || "Activity"}</h3>
            </div>
            <p className="inline-flex items-center gap-2 text-xs font-bold text-muted">
              <Clock className="h-4 w-4" />
              {formatBusinessDateTime(activity.createdAt)}
            </p>
          </div>
          {activity.description ? (
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted">{activity.description}</p>
          ) : null}
          {activity.followUpAt ? (
            <p className="mt-3 text-sm font-semibold text-forest">
              Follow-up discussed: {formatBusinessDateTime(activity.followUpAt)}
            </p>
          ) : null}
          {activity.oldValue || activity.newValue ? (
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-md bg-mint/60 px-3 py-2">
                <dt className="text-xs font-black uppercase tracking-[0.12em] text-muted">Previous</dt>
                <dd className="mt-1 break-words text-sm font-semibold text-ink">
                  {JSON.stringify(activity.oldValue ?? "Not Set")}
                </dd>
              </div>
              <div className="rounded-md bg-mint/60 px-3 py-2">
                <dt className="text-xs font-black uppercase tracking-[0.12em] text-muted">New</dt>
                <dd className="mt-1 break-words text-sm font-semibold text-ink">
                  {JSON.stringify(activity.newValue ?? "Not Set")}
                </dd>
              </div>
            </dl>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
