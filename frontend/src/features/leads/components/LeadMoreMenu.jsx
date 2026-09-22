import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Everything that is not the next step.
 *
 * Grouped, because the ungrouped version was the problem: ten buttons of
 * equal weight, four of which only edited the lead and four of which
 * only moved its stage. A heading over each group says which question
 * the items under it answer, so someone can find "change the stage"
 * without reading all of them.
 *
 * Items are passed in already filtered — an action nobody can take never
 * reaches this component, so there is no disabled row to explain. Empty
 * groups drop out by themselves, and the whole menu hides when nothing
 * is left.
 *
 * Closes on Escape and on a click outside, both of which people try
 * before they look for a close button.
 */
export default function LeadMoreMenu({ groups = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const visibleGroups = groups
    .map((group) => ({ ...group, items: (group.items || []).filter(Boolean) }))
    .filter((group) => group.items.length);

  useEffect(() => {
    if (!isOpen) return undefined;

    const onPointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setIsOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  if (!visibleGroups.length) return null;

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-bold text-forest ring-1 ring-forest/20 transition hover:bg-mint sm:w-auto"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        More
        <ChevronDown aria-hidden="true" className={`h-4 w-4 transition ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen ? (
        // Full width on a phone, anchored to the button from `sm` up —
        // the same shape the notification panel settled on, and for the
        // same reason: a right-anchored dropdown on a narrow screen ends
        // up half off the edge.
        <div
          className="absolute right-0 z-30 mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-forest/15 bg-white p-2 shadow-card"
          role="menu"
        >
          {visibleGroups.map((group, groupIndex) => (
            <div key={group.label || groupIndex}>
              {groupIndex ? <div className="mx-3 my-2 h-px bg-forest/10" /> : null}
              {group.label ? (
                <p className="px-3 pb-1 pt-2 text-[10px] font-black uppercase tracking-[0.1em] text-muted">
                  {group.label}
                </p>
              ) : null}
              {group.items.map((item) => (
                <button
                  className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold transition hover:bg-mint ${
                    item.tone === "danger" ? "font-bold text-red-800" : "text-ink"
                  }`}
                  key={item.id}
                  onClick={() => {
                    setIsOpen(false);
                    item.onSelect();
                  }}
                  role="menuitem"
                  type="button"
                >
                  {item.icon ? (
                    <item.icon
                      aria-hidden="true"
                      className={`h-4 w-4 shrink-0 ${item.tone === "danger" ? "text-red-700" : "text-forest"}`}
                    />
                  ) : null}
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
