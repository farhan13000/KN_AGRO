import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../core/auth";
import EmptyState from "./EmptyState";

/**
 * One screen holding several related queues or views, chosen by a tab.
 *
 * Extracted from the Approvals screen once a second and third page needed
 * the same shape. Three behaviours are the reason this is shared rather
 * than copied:
 *
 *  - THE CHOICE LIVES IN THE URL (`?tab=…`), not component state, so a
 *    tab can be linked to, survives a refresh, and lets a retired
 *    per-view route keep working as a redirect into the right tab. That
 *    last one matters wherever notifications deep-link to old paths.
 *
 *  - EACH TAB IS GATED ON ITS OWN PERMISSION and is simply absent
 *    otherwise, so a viewer sees only the tabs they can actually open
 *    rather than tabs that 403. A tab with no `permission` is always
 *    shown.
 *
 *  - EACH PANEL IS KEYED on the tab id, so switching remounts it.
 *    Without that, the previous view's filters and pagination linger in
 *    the URL and in state behind the next view's data.
 */
export default function TabbedWorkspace({
  description,
  eyebrow,
  emptyDescription = "You do not have permission to view anything on this page.",
  emptyTitle = "Nothing to show",
  paramName = "tab",
  tabs = [],
  title,
}) {
  const { hasPermission } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const available = tabs.filter((tab) => !tab.permission || hasPermission(tab.permission));
  const requested = searchParams.get(paramName);
  const active = available.find((tab) => tab.id === requested) || available[0];

  const selectTab = (id) => {
    const next = new URLSearchParams(searchParams);
    next.set(paramName, id);
    // Filters belong to the view that set them. Carrying a status filter
    // or page number into a different view either applies nothing or
    // silently lands the reader on an empty page 4.
    ["status", "page", "search", "sortBy", "sortOrder"].forEach((key) => next.delete(key));
    setSearchParams(next);
  };

  return (
    <div className="space-y-6">
      <div>
        {eyebrow ? (
          <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">{eyebrow}</p>
        ) : null}
        <h1 className="mt-2 text-3xl font-black text-ink">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p>
        ) : null}
      </div>

      {available.length ? (
        <>
          <div className="flex flex-wrap gap-2" role="tablist">
            {available.map((tab) => {
              const isActive = tab.id === active.id;
              return (
                <button
                  aria-selected={isActive}
                  className={`inline-flex min-h-10 items-center rounded-lg px-4 py-2 text-sm font-bold transition ${
                    isActive
                      ? "bg-forest text-white shadow-sm"
                      : "bg-white text-forest ring-1 ring-forest/15 hover:bg-mint"
                  }`}
                  key={tab.id}
                  onClick={() => selectTab(tab.id)}
                  role="tab"
                  type="button"
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {active.blurb ? (
            <p className="max-w-3xl text-sm leading-6 text-muted">{active.blurb}</p>
          ) : null}

          <div key={active.id} role="tabpanel">
            {active.render()}
          </div>
        </>
      ) : (
        <EmptyState description={emptyDescription} title={emptyTitle} />
      )}
    </div>
  );
}
