import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

/**
 * The filter strip above a list.
 *
 * On a desktop screen six filters sit in one or two tidy rows and cost
 * nothing. On a phone the same six stack into a column roughly two
 * screens tall, so the list they filter begins below the fold — on the
 * Leads screen the first record started 1,281px down. People open a list
 * to read the list; they reach for the filters second.
 *
 * So below `md` the fields collapse behind a Filters button, and from
 * `md` up they are simply always there, with no button at all.
 *
 * The button reports how many filters are actually narrowing the list, so
 * a collapsed panel can never hide the reason a list looks empty. That
 * count is read from the fields themselves — a text or date box counts
 * when it has anything in it, and a dropdown counts when it is not on its
 * first option, which is by convention the "All …" or default choice.
 * Reading the rendered fields means no screen has to declare its filters
 * twice, and a filter added later is counted without anyone remembering
 * to update this.
 */
const narrowingFieldCount = (root) => {
  if (!root) return 0;

  const fields = Array.from(root.querySelectorAll("input, select, textarea"));
  return fields.filter((field) => {
    // A combobox displays a label and keeps its real value here, so an
    // unpicked one reading "All states" is not mistaken for a filter.
    const declared = field.dataset?.filterValue;
    if (declared !== undefined) return declared.trim() !== "";
    if (field.type === "checkbox" || field.type === "radio") return field.checked;
    if (field.tagName === "SELECT") return field.selectedIndex > 0;
    return String(field.value || "").trim() !== "";
  }).length;
};

export default function FilterPanel({ children, label = "Filters" }) {
  const [open, setOpen] = useState(false);
  const [activeCount, setActiveCount] = useState(0);
  const fieldsRef = useRef(null);

  const recount = useCallback(() => {
    setActiveCount(narrowingFieldCount(fieldsRef.current));
  }, []);

  // After every render, because the fields are controlled by the page
  // above and can change without this component being told. Setting the
  // same number is a no-op in React, so this settles immediately.
  useEffect(recount);

  return (
    <section className="rounded-lg border border-forest/10 bg-white p-4 shadow-sm">
      <button
        aria-controls="filter-panel-fields"
        aria-expanded={open}
        className="flex min-h-11 w-full items-center justify-between gap-2 text-sm font-black text-forest md:hidden"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          {label}
          {activeCount ? (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-forest px-1.5 text-[11px] font-black text-white">
              {activeCount}
            </span>
          ) : null}
        </span>
        <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
      </button>

      <div
        className={open ? "mt-3" : "hidden md:block"}
        id="filter-panel-fields"
        ref={fieldsRef}
      >
        {children}
      </div>
    </section>
  );
}
