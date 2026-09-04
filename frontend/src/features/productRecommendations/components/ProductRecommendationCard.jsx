import ProductRecommendationStatusBadge from "./ProductRecommendationStatusBadge";

const formatDate = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toLocaleDateString();
};

/**
 * Targeting is three independent optional dimensions — an unset one means
 * "no constraint," not "matches nobody" (see the backend's own model
 * comment). Rendered as a plain-language summary; "Everyone" only when
 * ALL THREE are unset.
 */
const targetingSummary = (recommendation) => {
  const parts = [];
  if (recommendation.targetRole?.name) parts.push(`${recommendation.targetRole.name.toUpperCase()} role`);
  if (recommendation.targetTeam?.user?.name) parts.push(`${recommendation.targetTeam.user.name}'s team`);
  if (recommendation.targetArea?.name) parts.push(recommendation.targetArea.name);
  return parts.length ? parts.join(" · ") : "Everyone";
};

export default function ProductRecommendationCard({ actions = null, recommendation }) {
  return (
    <li className="rounded-lg border border-forest/10 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-black text-ink">{recommendation.product?.name || "Unknown product"}</p>
          <p className="mt-1 text-xs font-semibold text-muted">{recommendation.product?.productCode}</p>
        </div>
        <ProductRecommendationStatusBadge status={recommendation.status} />
      </div>

      <p className="mt-3 text-sm text-muted">
        <span className="text-xs font-black uppercase tracking-wide text-muted">Targeted at</span>{" "}
        {targetingSummary(recommendation)}
      </p>

      <p className="mt-2 text-sm text-muted">
        <span className="text-xs font-black uppercase tracking-wide text-muted">Reason</span> {recommendation.reason}
      </p>

      <p className="mt-3 text-xs font-semibold text-muted">
        {recommendation.recommendedBy?.name ? `Recommended by ${recommendation.recommendedBy.name}` : null}
        {formatDate(recommendation.createdAt) ? ` on ${formatDate(recommendation.createdAt)}` : null}
      </p>

      {actions ? <div className="mt-4">{actions}</div> : null}
    </li>
  );
}
