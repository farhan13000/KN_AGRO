import { LEAD_STATUS } from "../constants";
import { PIPELINE_STAGES, getPipelinePosition } from "../utils/leadNextStep.js";

/**
 * Where the lead has got to, in one line.
 *
 * Its job is orientation, not navigation — nothing here is clickable.
 * Someone opening a lead they have never seen needs to know how far
 * along it is before they read a single button, and a status badge alone
 * does not say that ("Qualified" means nothing until you know what comes
 * before and after it).
 *
 * A lost or closed lead is not on the ladder at all, so it gets a plain
 * line instead of a strip with a dot parked somewhere misleading.
 */
const OFF_PIPELINE = {
  [LEAD_STATUS.LOST]: "Lost",
  [LEAD_STATUS.CLOSED]: "Closed",
};

export default function LeadPipelineStrip({ status }) {
  const offPipeline = OFF_PIPELINE[status];
  if (offPipeline) {
    return (
      <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-muted">
        <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-muted" />
        {offPipeline}
      </p>
    );
  }

  const position = getPipelinePosition(status);

  return (
    <ol className="flex items-center gap-1.5 overflow-hidden">
      {PIPELINE_STAGES.map((stage, index) => {
        const isDone = index < position;
        const isCurrent = index === position;
        return (
          <li className="flex min-w-0 items-center gap-1.5" key={stage.status}>
            {index ? (
              <span
                aria-hidden="true"
                className={`h-0.5 w-4 shrink-0 rounded-full sm:w-6 ${
                  isDone || isCurrent ? "bg-leaf" : "bg-forest/15"
                }`}
              />
            ) : null}
            {isCurrent ? (
              <span className="flex shrink-0 items-center gap-1.5">
                <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-forest" />
                <span className="text-xs font-black text-forest">{stage.label}</span>
                <span className="sr-only">(current stage)</span>
              </span>
            ) : (
              <span
                className={`shrink-0 text-xs ${
                  isDone ? "font-bold text-agriculture" : "font-semibold text-soft"
                }`}
              >
                {stage.label}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
